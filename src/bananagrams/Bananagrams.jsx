import { onCleanup } from 'solid-js'
import * as rxf from '@metagov/rxf'
import { $ } from '@metagov/rxf'
import { startGraph } from '../rxf-solid.js'
import './Bananagrams.css'

const Bananagrams = () => {
  const { runningGraph, set, get } = startGraph(rxf.graph({
    nodes: {},
    links: []
  }))

  onCleanup(() => {
    runningGraph //.stop() TODO: uncomment when implemented
  })

  return (
    <>
      <h1>Bananagrams</h1>
      <div class="card">
      </div>
    </>
  )
}

export default Bananagrams
