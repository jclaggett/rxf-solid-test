import { createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import * as rxf from '@metagov/rxf'

const getIn = (obj, path, defaultValue) =>
  path.length === 0
    ? obj
    : obj[path[0]] === undefined
      ? defaultValue
      : getIn(obj[path[0]], path.slice(1), defaultValue)

const assignIn = (obj, path, value) =>
  path.length === 1
    ? obj[path[0]] = value
    : assignIn(obj[path[0]] ?? (obj[path[0]] = {}), path.slice(1), value)

// Reactive/rxf integration
export const startGraph = (graph) => {
  const set = {}
  const get = {}

  const edges = {
    set: {
      source: (path) => {
        // Publish placebo setter (possibly replaced below)
        assignIn(set, path, (_) => null)
        return [
          rxf.transducer(r => ({
            [rxf.STEP]: async (a, _x) => {
              await new Promise((resolve) => {
                const close = () => {
                  assignIn(set, path, (_) => null)
                  resolve()
                }
                const send = (x) => {
                  if (rxf.isReduced(r[rxf.STEP](a, x))) {
                    close()
                  }
                }
                // Publish working setter when input is connected.
                assignIn(set, path, (x) => Promise.resolve().then(() => send(x)))
              })
              return a
            }
          }))
        ]
      }
    },

    get: {
      sink: (path, initialValue) => {
        const [getter, setter] = createSignal(initialValue)
        // Publish get
        assignIn(get, path, getter)
        return [
          rxf.transducer(_r => ({
            [rxf.STEP]: (a, x) => {
              setter(() => x)
              return a
            }
          }))
        ]
      }
    }
  }

  return {
    runningGraph: rxf.run(graph, { initialValue: null, edges }),
    set,
    get
  }
}

// Integration attempt 2

export const renderGraph = (g, e) => {
  // First, create a signal
  const [getDom, setDom] = createSignal(null)

  const domSources = {}

  // Second, create a 'dom' edge (source & sink)
  const edges = {
    dom: {
      source: (path) => {
        // Publish placebo setter (possibly replaced below)
        assignIn(domSources, path, (_) => null)
        return [
          rxf.transducer(r => ({
            [rxf.STEP]: async (a, _x) => {
              await new Promise((resolve) => {
                const close = () => {
                  assignIn(domSources, path, (_) => null)
                  resolve()
                }
                const send = (x) => {
                  if (rxf.isReduced(r[rxf.STEP](a, x))) {
                    close()
                  }
                }
                // Publish working setter when input is connected.
                assignIn(domSources, path, (x) => Promise.resolve().then(() => send(x)))
              })
              return a
            }
          }))
        ]
      },

      sink: (_path) =>
        rxf.transducer(_r => ({
          [rxf.STEP]: (a, x) => {
            // transform dom in `x` by replacing special 'source' objects with
            // actual domSource calls
            console.log('dom sink', x)

            // Set the signal
            setDom(() => x)
            return a
          }
        }))
    }
  }

  // Third, a component that runs the graph (with the dom edge)
  // and returns a component that reads the signal.
  const dom = () => {
    // run the graph
    rxf.run(g, { edges, initValue: domSources })

    // Return a component that reads the signal
    return (_props) => getDom()
  }

  // Finally, render the component
  render(dom, e)
}

export const handle = (domSources, pathRef) => {
  return getIn(
    domSources,
    rxf.pathRefToArray(pathRef),
    (_) => null)
}
