/* @refresh reload */
import { render } from 'solid-js/web'

import './index.css'
import Bananagrams from './Bananagrams'

const root = document.getElementById('root')

render(() => <Bananagrams />, root)
