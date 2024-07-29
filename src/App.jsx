import * as rxf from '@metagov/rxf'
import { $ } from '@metagov/rxf'
import solidLogo from './assets/solid.svg'
import viteLogo from '/vite.svg'
import { startGraph } from './rxf-solid.js'
import './App.css'

const AppGraph = rxf.graph({
  nodes: {
    click: rxf.source('set'),
    timer: rxf.source('timer', 1000),

    inc: rxf.reductions((a, _) => a + 1, () => 0),

    count: rxf.sink('get', 0),
    log: rxf.sink('log')
  },
  links: [
    [$.click, $.inc, $.count],
    [$.timer, $.inc],
    [$.inc, $.log]
  ]
})

function App() {
  const { set: { click }, get: { count } } = startGraph(AppGraph)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} class="logo" alt="Vite logo" />
        </a>
        <a href="https://solidjs.com" target="_blank">
          <img src={solidLogo} class="logo solid" alt="Solid logo" />
        </a>
      </div>
      <h1>Vite + Solid</h1>
      <div class="card">
        <button onClick={click}>
          count is {count()}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p class="read-the-docs">
        Click on the Vite and Solid logos to learn more
      </p>
    </>
  )
}

export default App
