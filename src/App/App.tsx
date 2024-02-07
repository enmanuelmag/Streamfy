import { useState } from 'react'

import './App.css'
import reactLogo from './react.svg'

const App = () => {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <div className="flex">
        <a href="https://vitejs.dev" rel="noreferrer" target="_blank">
          <img alt="Vite logo" className="logo" src="/icons/favicon.svg" />
        </a>
        <a href="https://reactjs.org" rel="noreferrer" target="_blank">
          <img alt="React logo" className="logo react" src={reactLogo} />
        </a>
        <a href="https://eruptionjs.dev" rel="noreferrer" target="_blank">
          <span className="logo eruption">🌋</span>
        </a>
      </div>
      <h1>Vite + React/TS = EruptionJS</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vitkd sk skf ks kf kf skdf sdfk sdkfs dfk sdkf fks fks fksfksd fe, React and
        Eruption logos to learn more
      </p>
    </div>
  )
}

export { App }
