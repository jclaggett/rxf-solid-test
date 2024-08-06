import { onCleanup } from 'solid-js'
import * as rxf from '@metagov/rxf'
import { $ } from '@metagov/rxf'
import { startGraph } from '../rxf-solid.js'
import './Bananagrams.css'

//
// Bananagrams Graph (logic)
//
const tileHistogram = {
	A: 13, B: 3, C: 3, D: 6, E: 18, F: 3, G: 4,
	H: 3, I: 12, J: 2, K: 2, L: 5, M: 3, N: 8,
	O: 11, P: 3, Q: 2, R: 9, S: 6, T: 9, U: 6,
	V: 3, W: 3, X: 2, Y: 3, Z: 2
}

const shuffle = (rng, array) => {
	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(rng() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]]
	}
	return array
}

const createPile = ({ rng }) =>
	shuffle(rng, Object
		.entries(tileHistogram)
		.flatMap(([value, count]) => Array(count).fill(value)))
		.map((value, id) => ({
			value,
			id,
			down: rng() < 0.5,
			x: rng() * 800,
			y: rng() * 500
		}))

const bananagramsGraph = rxf.graph({
	nodes: {
		init: rxf.source('with', ['rng'], 'init'),
		tileClicked: rxf.source('set'),

		tileMoved: rxf.source('set'),
		tileMovedDown: rxf.remove(event => event.pressure < 0.5),

		newPile: rxf.chain(
			rxf.map(createPile)
		),

		tabletop: rxf.graph({
			nodes: {
				in: rxf.multiplex(['pileCreated', 'tileFlipped', 'tileMoved']),

				// Multiplex generates closing variants when a channel ends.
				// Ignore them for now.
				in2: rxf.remove(variant => variant.length === 1),

				state: rxf.scan((state, [type, value]) => {
					if (type === 'pileCreated') {
						state.pile = value
					} else if (type === 'tileMoved') {
						const tile = state.pile[value.srcElement.id]
						tile.x += value.movementX
						tile.y += value.movementY
					} else if (type === 'tileFlipped') {
						const tile = state.pile[value.srcElement.id]
						tile.down = !tile.down
					}

					return state
				}, () => ({ pile: [] })),

				// Drop initial state from scan
				state2: rxf.drop(1),

				// Have to make a copy for Signals & Effects to work?!
				pile: rxf.map(state => [...state.pile])
			},
			links: [
				[$.in, $.in2, $.state, $.state2, $.pile],
			]
		}),

		pile: rxf.sink('get', []),
		log: rxf.sink('log')
	},
	// Design note: this mess of links is hard to read and is far from the nodes
	// they connect. Think of ways to improve this situation.
	links: [
		[$.init, $.newPile, $.tabletop.in.pileCreated],
		[$.tileMoved, $.tileMovedDown, $.tabletop.in.tileMoved],
		[$.tileClicked, $.tabletop.in.tileFlipped],
		[$.tabletop.pile, $.pile],
		[$.tileMovedDown, $.log]
	]
})


//
// Bananagrams React (UI)
//
const positionStyle = (x, y) => ({
	position: 'absolute',
	left: `${x}px`,
	top: `${y}px`
})

const renderTitleTile = (value) =>
	<div class="tile">
		{value}
	</div>

const renderTile = (tile, set) => {
	const { id, x, y, down, value } = tile()
	const style = positionStyle(x, y)
	return (
		<div class="tile"
			id={id}
			onPointerMove={set.tileMoved}
			onDblClick={set.tileClicked}
			style={style}>
			{down ? '' : value}
		</div>
	)
}

const Bananagrams = () => {
	const { runningGraph, set, get } = startGraph(bananagramsGraph)

	onCleanup(() => {
		runningGraph //.stop() TODO: uncomment when implemented
	})

	// Tried and failed to use For or Index tags when rendering the pile :-(
	// I need a deeper understanding of Solid runtime expectations.
	return (
		<>
			<div class="title">
				{Array.from('Bananagrams™').map(renderTitleTile)}
			</div>
			<div class="pile">
				{get.pile().map(tile => renderTile(() => tile, set))}
			</div>
		</>
	)
}

export default Bananagrams
