import React from 'react'
import { useMainStore } from '../../store'

const Devices = () => {
  const { users } = useMainStore()
  console.log(users)

  return (
    <div>
      {Object.values(users).map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}

export default Devices