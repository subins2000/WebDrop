import { makeShare } from "../utils";
import DragDrop from "./DragDrop";

const FilesDropAcceptor = () => {
  const addFiles = (files) => {
    for (const key in files) {
      makeShare(files[key])
    }
  }

  const handleFilesDropped = (e) => {
    e.stopPropagation()
    e.preventDefault()

    function getFilesDataTransferItems(dataTransferItems) {
      const files = []

      function traverseFileTreePromise(item, path = '') {
        return new Promise(resolve => {
          if (item.isFile) {
            item.file(file => {
              file.filepath = path + file.name // save full path
              files.push(file)
              resolve(file)
            })
          } else if (item.isDirectory) {
            const dirReader = item.createReader()
            dirReader.readEntries(entries => {
              const entriesPromises = []
              for (const entr of entries) { entriesPromises.push(traverseFileTreePromise(entr, path + item.name + '/')) }
              resolve(Promise.all(entriesPromises))
            })
          }
        })
      }

      return new Promise((resolve, reject) => {
        const entriesPromises = []
        for (const it of dataTransferItems) {
          entriesPromises.push(traverseFileTreePromise(it.webkitGetAsEntry ? it.webkitGetAsEntry() : it.getAsEntry()))
        }
        Promise.all(entriesPromises)
          .then(() => {
            resolve(files)
          }).catch(reject)
      })
    }

    getFilesDataTransferItems(e.dataTransfer.items).then(files => {
      if (files) {
        addFiles(files)
      }
    }).catch(() => {
      const files = Array.from(e.dataTransfer.files) // Array of all files

      if (files) {
        addFiles(files)
      }
    })
  }

  return (
    <DragDrop onDrop={handleFilesDropped} />
  )
}

export default FilesDropAcceptor;