import { useFrame } from "@react-three/fiber"
import { createContext, FC, useContext, useEffect, useState } from "react"

/*

A Ticker for react-three-fiber.

- sits on top of useFrame (with priority configurable)
- provides structured ticking stages "update", "lateUpdate", "fixed", "lateFixed", "render"
- fixed/lateFixed are invoked with fixed-step delta times (useful for physics etc.)
- supports time scaling
- context-based, so sections of your game can use different time scaling

*/

export type TickerStage = "update" | "lateUpdate" | "fixed" | "lateFixed" | "render"

const TickerContext = createContext<TickerImpl>(null!)

type TickerCallback = (dt: number) => void

class TickerImpl {
  timeScale = 1
  fixedStep = 1 / 60

  private callbacks: Map<TickerStage, TickerCallback[]> = new Map()
  private acc: number = 0

  on(stage: TickerStage, callback: TickerCallback) {
    if (!this.callbacks.has(stage)) this.callbacks.set(stage, [])
    this.callbacks.get(stage)!.push(callback)
  }

  off(stage: TickerStage, callback: TickerCallback) {
    const callbacks = this.callbacks.get(stage)!
    const pos = callbacks.indexOf(callback)
    callbacks.splice(pos, 1)
  }

  tick(frameDelta: number) {
    /* Clamp the deltatime to prevent situations where thousands of frames are executed after
    the user returns from another tab. */
    const dt = Math.max(0, Math.min(frameDelta, 1))

    /* Run the normale update callbacks. */
    this.execute("update", dt * this.timeScale)
    this.execute("lateUpdate", dt * this.timeScale)

    /* Run fixed-steps callbacks, based on our internal accumulator. */
    this.acc += dt * this.timeScale
    while (this.acc >= this.fixedStep) {
      this.execute("fixed", this.fixedStep)
      this.execute("lateFixed", this.fixedStep)
      this.acc -= this.fixedStep
    }

    /* Run any registered render callbacks. */
    this.execute("render", dt * this.timeScale)
  }

  private execute(stage: TickerStage, dt: number) {
    const callbacks = this.callbacks.get(stage)
    if (callbacks) {
      for (const callback of callbacks) callback(dt)
    }
  }
}

export const Ticker: FC<{ priority?: number; timeScale?: number }> = ({
  children,
  timeScale = 1,
  priority = -100
}) => {
  const [ticker] = useState(() => new TickerImpl())

  useEffect(() => {
    ticker.timeScale = timeScale

    return () => {
      ticker.timeScale = 1
    }
  }, [ticker, timeScale])

  useFrame((_, dt) => ticker.tick(dt), priority)

  return <TickerContext.Provider value={ticker}>{children}</TickerContext.Provider>
}

export const useTicker = (stage: TickerStage, callback: TickerCallback) => {
  const ticker = useContext(TickerContext)

  useEffect(() => {
    ticker.on(stage, callback)
    return () => ticker.off(stage, callback)
  })
}

export const useTimeScale = (scale: number) => {
  const ticker = useContext(TickerContext)

  useEffect(() => {
    const previousTimeScale = ticker.timeScale
    ticker.timeScale = scale

    return () => {
      ticker.timeScale = previousTimeScale
    }
  }, [ticker, scale])
}
