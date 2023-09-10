import { useMachine } from '@xstate/react'
import { bowlingMachine } from '@/machine'
import { useState } from 'react'
import { InputPayload, inputValidator } from './input-validator'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

type Frame = {
  throws: number[]
}

const initialFrames = Array.from({ length: 10 }, (): Frame => ({ throws: [] }))

export const App = () => {
  const [state, send] = useMachine(bowlingMachine)

  const [frames, setFrames] = useState(initialFrames)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InputPayload>({
    mode: 'all',
    defaultValues: {},
    resolver: zodResolver(
      inputValidator.refine(
        (data) => {
          return (state.context.throws.reduce((total, current) => total + current, 0) % 10) + data.input <= 10
        },
        () => {
          const pinsLeft = 10 - (state.context.throws.reduce((total, current) => total + current, 0) % 10)
          return {
            message: `only ${pinsLeft} pins left`,
            path: ['input'], // path of error
          }
        }
      )
    ),
  })

  const handleThrow: SubmitHandler<InputPayload> = (data) => {
    if (state.matches('completed')) {
      return
    }

    const updatedFrames = frames.map((frame, index) =>
      index === state.context.frameIndex - 1 ? { throws: [...frame.throws, data.input] } : frame
    )
    setFrames(updatedFrames)
    send({ type: 'THROW', throw: data.input })
  }

  const restart = () => {
    send('RESET')
    setFrames(initialFrames)
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold underline">Bowling</h1>
        <ul className="list-inside list-disc">
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
        <form className="flex flex-col gap-2" onSubmit={handleSubmit(handleThrow)}>
          <input className="rounded border border-slate-400 p-1" {...register('input', { valueAsNumber: true })} />
          {errors?.input && <p className="text-sm text-red-500">{errors.input.message}</p>}
          <button type="submit" className="rounded bg-slate-300 px-4 py-1">
            throw
          </button>
        </form>

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
