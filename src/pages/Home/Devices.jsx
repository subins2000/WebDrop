import React from 'react'
import { useMainStore, usePersistentStore } from '../../store'

const Devices = () => {
  const { users, p2pt } = useMainStore()
  const { name } = usePersistentStore()

  const ping = (id) => {
    const user = users[id]
    if (user) {
      p2pt.send(user.conn, { type: 'ping' })
    }
  }

  return (
    <div>
      <div>
        <span className="tag tag-grouped">
          <span className="tag tag-gray">{name}</span>
          <span className="tag tag-yellow">Me</span>
        </span>
      </div>
      <div className="my-4" style={{ position: 'relative', borderBottom: '2px dashed rgb(219, 219, 219)' }}>
        <span style={{ position: 'absolute', bottom: '-11px' }}>Devices</span>
      </div>
      <div className="flex flex-col">
        {Object.values(users).map((user) => (
          <div className="tag tag-grouped" key={user.id}>
            <span className="tag tag-gray">{user.name}</span>
            <span className="tag tag-yellow">
              <a onClick={() => ping(user.id)}>Ping!</a>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Devices