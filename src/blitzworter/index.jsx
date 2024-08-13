import * as rxf from '@metagov/rxf'
import { renderGraph, handle } from '../rxf-solid.js'


// Application
const $ = rxf.$

const app = (x) => (
  <>
    hello {x.event}
    <div id="title">
      Blitzwörter
      <div id="subtitle" onClick={handle(x.initValue, $.click)}>
        hello world
      </div>
    </div>
  </>
)

const g = rxf.graph({
  nodes: {
    init: rxf.source('with', ['rng', 'initValue'], 'init'),
    timer: rxf.source('with', ['initValue'], 'timer', 10000),
    click: rxf.source('with', ['initValue'], 'dom'),
    app: rxf.map(app),
    render: rxf.sink('dom'),
  },
  links: [
    [$.init, $.app],
    [$.timer, $.app],
    [$.click, $.app],
    [$.app, $.render]
  ]
})

const root = document.getElementById('root')
renderGraph(g, root)

