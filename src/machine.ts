import { assign, createMachine } from 'xstate'

type Context = {
  frameIndex: number
  throws: number[]
}

type ThrowEvent = {
  type: 'THROW'
  throw: number
}

type ResetEvent = { type: 'RESET' }
type Event = ThrowEvent | ResetEvent

const updateFrameCount = assign<Context>((context) => ({
  frameIndex: context.frameIndex + 1,
}))

const resetThrows = assign<Context, Event>(() => ({ throws: [] }))

const updateThrows = assign<Context, Event>((context, event) => ({
  throws: [...context.throws, (event as ThrowEvent).throw],
}))

const isStrikeOrSpareInLastFrame = (context: Context, event: Event) =>
  (event as ThrowEvent).throw + (context.throws?.[0] ?? 0) >= 10

const isStrikeAndRegularFrame = (context: Context, event: Event) =>
  (event as ThrowEvent).throw === 10 && context.throws.length === 0 && context.frameIndex < 9

const isStrikeAndLastFrameNext = (context: Context, event: Event) =>
  (event as ThrowEvent).throw === 10 && context.throws.length === 0 && context.frameIndex === 9

const isLastFrameNext = (context: Context) => context.frameIndex === 9

export const bowlingMachine = createMachine<Context, Event>(
  {
    id: 'bowling',
    predictableActionArguments: true,
    context: {
      frameIndex: 1,
      throws: [],
    },
    on: {
      RESET: {
        target: '.frame first throw',
        actions: assign(() => {
          return {
            frameIndex: 1,
            throws: [],
          }
        }),
      },
    },
    initial: 'frame first throw',
    states: {
      'frame first throw': {
        on: {
          THROW: [
            {
              target: 'frame first throw',
              cond: 'isStrikeAndRegularFrame',
              actions: ['updateFrameCount', 'resetThrows'],
            },
            {
              target: 'last frame first throw',
              cond: 'isStrikeAndLastFrameNext',
              actions: ['updateFrameCount', 'resetThrows'],
            },
            {
              target: 'frame second throw',
              actions: ['updateThrows'],
            },
          ],
        },
      },
      'frame second throw': {
        on: {
          THROW: [
            {
              target: 'last frame first throw',
              cond: 'isLastFrameNext',
              actions: ['updateFrameCount', 'resetThrows'],
            },
            {
              target: 'frame first throw',
              actions: ['updateFrameCount', 'resetThrows'],
            },
          ],
        },
      },
      'last frame first throw': {
        on: {
          THROW: [
            {
              target: 'last frame second throw',
              actions: ['updateThrows'],
            },
          ],
        },
      },
      'last frame second throw': {
        on: {
          THROW: [
            {
              target: 'last frame third throw',
              cond: 'isStrikeOrSpareInLastFrame',
              actions: ['updateThrows'],
            },
            {
              target: 'completed',
            },
          ],
        },
      },
      'last frame third throw': {
        on: {
          THROW: [
            {
              target: 'completed',
            },
          ],
        },
      },
      completed: {},
    },
  },
  {
    actions: { updateFrameCount, resetThrows, updateThrows },
    guards: {
      isStrikeAndRegularFrame,
      isStrikeAndLastFrameNext,
      isStrikeOrSpareInLastFrame,
      isLastFrameNext,
    },
  }
)
