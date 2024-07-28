import { createSignal } from 'solid-js'
import * as rxf from '@metagov/rxf'

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
