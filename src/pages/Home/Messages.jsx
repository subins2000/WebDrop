import React, { useState } from 'react'
import { useLocalStorageStore, useMainStore } from '../../store'

const Messages = () => {
  const mainStore = useMainStore()
  const persistentStore = useLocalStorageStore()

  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    const msgData = {
      type: 'msg',
      msg: message,
      time: new Date().toLocaleTimeString(),
      name: persistentStore.name,
      color: persistentStore.color
    }

    mainStore.addMessage(msgData)

    Object.entries(mainStore.users).forEach(([_, user]) => {
      mainStore.p2pt.send(user.conn, msgData)
    })

    setMessage('')
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full"
          rows="5"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
        ></textarea>
        <div className="flex justify-between w-full">
          <button type="submit">Send</button>
          <button className='bg-red'>🧹</button>
        </div>
      </form>
      <div>
        {mainStore.msgs.map((msg) => (
          <div key={msg.time}>
            <p>{msg.name}</p>
            <p>{msg.msg}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Messages