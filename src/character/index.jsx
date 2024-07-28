/* @refresh reload */
import { render } from 'solid-js/web'

import './index.css'
import CharacterSheet from './App'

const root = document.getElementById('root')

render(() => <CharacterSheet />, root)
