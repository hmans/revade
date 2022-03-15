import { useFrame } from "@react-three/fiber"
import { createContext, FC, useContext, useEffect, useState } from "react"

/*

A Ticker for react-three-fiber.

- sits on top of useFrame (with priority configurable)
- provides structured ticking stages "update", "lateUpdate", "fixed", "lateFixed", "render"
- fixed/lateFixed are invoked with fixed-step delta times (useful for physics etc.)
- supports time scaling
- context-based, so sections of your game can use different time scaling

TODO:

- Fixed steps

*/

export type TickerStage = "update" | "lateUpdate" | "fixed" | "lateFixed" | "render"

const TickerContext = createContext<TickerImpl>(null!)

type TickerCallback = (dt: number) => void

class TickerImpl {
  timeScale: number = 1

  private callbacks: Map<TickerStage, TickerCallback[]> = new Map()

  on(stage: TickerStage, callback: TickerCallback) {
    if (!this.callbacks.has(stage)) this.callbacks.set(stage, [])
    this.callbacks.get(stage)!.push(callback)
  }

  off(stage: TickerStage, callback: TickerCallback) {
    const callbacks = this.callbacks.get(stage)!
    const pos = callbacks.indexOf(callback)
    callbacks.splice(pos, 1)
  }

  tick(dt: number) {
    this.execute("update", dt * this.timeScale)
    this.execute("lateUpdate", dt * this.timeScale)
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
