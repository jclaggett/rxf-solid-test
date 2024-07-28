import * as rxf from '@metagov/rxf'
import { $ } from '@metagov/rxf'
import { startGraph } from '../rxf-solid.js'
import './App.css'

const d6 = (rng) => Math.floor(rng() * 6 + 1)
const dice2Text = (dice) => dice.map(d => '⚀⚁⚂⚃⚄⚅'[d - 1])

const statSubgraph = (statName) => {
  return {
    [statName]: rxf.graph({
      nodes: {
        roll: rxf.source('with', ['rng'], 'set'),
        rollDice: rxf.chain(
          rxf.map(({ rng }) => [d6(rng), d6(rng), d6(rng), d6(rng), d6(rng)]),
          rxf.map(dice => dice.sort()),
          rxf.map(dice => dice.slice(2)),
          rxf.map(dice => dice.reduce((acc, val) => acc + val, 0))
        ),
        value: rxf.sink('get', '0'),

        diceAsText: rxf.map(dice2Text),
        dice: rxf.sink('get', 'click me!'),

        calcDroppedDice: rxf.map(dice => dice.slice(0, 2)),
        droppedDiceAsText: rxf.map(dice2Text),
        droppedDice: rxf.sink('get', '')
      },
      links: [
        [$.roll, $.rollDice, $.value],
        [$.rollDice[2], $.diceAsText, $.dice],
        [$.rollDice[1], $.calcDroppedDice, $.droppedDiceAsText, $.droppedDice]
      ]
    })
  }
}

const AppGraph = rxf.graph({
  nodes: {
    ...statSubgraph('str'),
    ...statSubgraph('dex'),
    ...statSubgraph('int'),
    ...statSubgraph('wis'),
    ...statSubgraph('con'),
    ...statSubgraph('chr')
  }
})

const CharacterSheet = () => {
  const { set, get } = startGraph(AppGraph)

  return (
    <>
      <h1>RPG Character Generator</h1>
      <p class="read-the-docs">
        Character stats are:
      </p>
      <div class="card">
        <div>
          <button onClick={set.str.roll}> {get.str.droppedDice()},{get.str.dice()} </button>
          Str: <input value={get.str.value()}></input>
        </div>
        <div>
          <button onClick={set.dex.roll}>{get.dex.droppedDice()},{get.dex.dice()}</button>
          Dex: <input value={get.dex.value()}></input>
        </div>
        <div>
          <button onClick={set.int.roll}>{get.int.droppedDice()},{get.int.dice()}</button>
          Int: <input value={get.int.value()}></input>
        </div>
        <div>
          <button onClick={set.wis.roll}>{get.wis.droppedDice()},{get.wis.dice()}</button>
          Wis: <input value={get.wis.value()}></input>
        </div>
        <div>
          <button onClick={set.con.roll}>{get.con.droppedDice()},{get.con.dice()}</button>
          Con: <input value={get.con.value()}></input>
        </div>
        <div>
          <button onClick={set.chr.roll}>{get.chr.droppedDice()},{get.chr.dice()}</button>
          Chr: <input value={get.chr.value()}></input>
        </div>
      </div>
    </>
  )
}

export default CharacterSheet
