import React, { useState } from 'react'
import { usePersistentStore, useMainStore } from '../../store'

// Utility function to copy text to clipboard
const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy text: ', err)
    return false
  }
}

const Messages = () => {
  const { msgs, addMessage, users, p2pt } = useMainStore(state => state)
  const persistentStore = usePersistentStore()

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

    addMessage(msgData)

    Object.entries(users).forEach(([_, user]) => {
      p2pt.send(user.conn, msgData)
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
      <div className="mt-4">
        {msgs.slice().reverse().map((msg, index) => (
          <div key={msg.time || index} className="card">
            <div className="card-header flex justify-between">
              <div className="flex gap-2">
                <div className="tag tag-teal">{msg.time}</div>
                <div className="tag tag-gray">{msg.name}</div>
              </div>
              <button
                onClick={() => copyText(msg.msg)}
                title="Copy message"
              >
                Copy
              </button>
            </div>
            <div className="card-content">
              <p>{msg.msg}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Messages