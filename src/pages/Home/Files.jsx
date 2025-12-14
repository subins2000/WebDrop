import React, { useState } from 'react'
import { useMainStore } from '../../store'
import { formatBytes, makeShare } from '../../utils'

const Files = () => {
  const { shares } = useMainStore()

  const [selectedShares, setSelectedShares] = useState([])

  const handleSelectAll = (e) => {
    setSelectedShares(e.target.checked ? Object.keys(shares) : [])
  }

  const handleSelectShare = (shareID) => (e) => {
    setSelectedShares(e.target.checked ? [...selectedShares, shareID] : selectedShares.filter(id => id !== shareID))
  }

  const handleAddFile = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.multiple = true
    fileInput.onchange = (e) => {
      const files = Array.from(e.target.files)
      files.forEach(file => makeShare(file))
    }
    fileInput.click()
  }

  return (
    <div>
      <div className='flex mb-2 justify-between'>
        <div className='flex gap-2'>
          <button className="btn btn-secondary" onClick={handleAddFile}>⬆️ Add File</button>
          {selectedShares.length > 0 && (
            <button className="btn btn-danger">🗑️ Delete</button>
          )}
        </div>
        <span className="tag tag-black">🏎️ 0 B/s</span>
      </div>
      {Object.keys(shares).length === 0 ? (
        <center>
          <div>Open <a href="https://WebDrop.Space" target="_blank">WebDrop.Space</a> on your devices to join this room. Devices under the same WiFi/network will auto join the same room.</div>
        </center>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th><input type="checkbox" checked={selectedShares.length === Object.keys(shares).length} onChange={handleSelectAll} /></th>
                <th>Name</th>
                <th>Size</th>
                <th>Stats</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(shares).map(([shareID, share]) => (
                <tr key={shareID}>
                  <td style={{ width: '5%' }}><input type="checkbox" checked={selectedShares.includes(shareID)} onChange={handleSelectShare(shareID)} /></td>
                  <td style={{ width: '40%' }}>{share.name}</td>
                  <td style={{ width: '10%' }}>{formatBytes(share.size)}</td>
                  <td style={{ width: '50%' }}>
                    {!share.mine && (
                      share.done ? (
                        <button className="btn btn-primary">Download</button>
                      ) : (
                        <progress value={share.progress} max="100"></progress>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

export default Files