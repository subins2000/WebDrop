import React from 'react'
import { usePersistentStore } from '../store';

const Settings = () => {
  const { setValue } = usePersistentStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    setValue('name', e.target.name.value);
  }

  return (
    <div>
      <h2>Settings</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" placeholder="Name" />
        </div>
        <div>
          <button>Save</button>
        </div>
      </form>
    </div>
  )
}

export default Settings;