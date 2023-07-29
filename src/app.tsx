import { useMachine } from '@xstate/react'
import { bowlingMachine } from '@/machine'
import { useState } from 'react'

type Frame = {
  throws: number[]
}

const initialFrames = Array.from({ length: 10 }, () => ({ throws: [] }) as Frame)

export const App = () => {
  const [state, send] = useMachine(bowlingMachine)

  const [pins, setPins] = useState(0)
  const [frames, setFrames] = useState(initialFrames)

  const handleThrow = () => {
    if (state.matches('completed')) {
      return
    }
    const updatedFrames = frames.map((frame, index) =>
      index === state.context.frameIndex - 1 && frame ? { throws: [...frame.throws, pins] } : frame
    )
    setFrames(updatedFrames)
    send({ type: 'THROW', throw: pins })
  }

  const restart = () => {
    send('RESET')
    setFrames(initialFrames)
  }

  return (
    <main className="flex h-screen items-center justify-center">
      <div className="flex flex-col gap-4">
        <h1 className=" text-3xl font-bold underline">Bowling</h1>
        <ul className=" list-inside list-disc">
          <li>frame {state.context.frameIndex}</li>
          <li>
            throws {'['}
            {state.context.throws.join(', ')}
            {']'}
          </li>
          {state.matches('frame first throw') && <li>first throw</li>}
          {state.matches('frame second throw') && <li>second throw</li>}
          {state.matches('last frame first throw') && <li>last frame first throw</li>}
          {state.matches('last frame second throw') && <li>last frame second throw</li>}
          {state.matches('last frame third throw') && <li>last frame third throw</li>}
          {state.matches('completed') && (
            <li>
              <span className="font-bold">finished</span>{' '}
              <button className="rounded border border-slate-300 px-4 py-1" onClick={restart}>
                restart
              </button>
            </li>
          )}
        </ul>
        <input
          className="rounded border border-slate-400"
          type="text"
          value={pins}
          placeholder="5"
          onChange={(event) => setPins(Number(event.target.value))}
        />{' '}
        <button className="rounded bg-slate-300 px-4 py-1" onClick={handleThrow}>
          throw
        </button>
        <div className="">
          <h2 className="text-2xl">frames</h2>
          <ol className="list-inside list-decimal">
            {frames.map((frame, index) => {
              return (
                frame.throws.length > 0 && (
                  <li key={index}>
                    {'['}
                    {frame.throws.join(', ')}
                    {']'}
                  </li>
                )
              )
            })}
          </ol>
        </div>
      </div>
    </main>
  )
}
