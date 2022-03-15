import { useFrame } from "@react-three/fiber"
import { createContext, FC, useContext, useEffect, useState } from "react"

export type TickerStage = "update" | "lateUpdate" | "fixed" | "lateFixed" | "render"

const TickerContext = createContext<TickerImpl>(null!)

type TickerCallback = (dt: number) => void

class TickerImpl {
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
    this.execute("update", dt)
    this.execute("lateUpdate", dt)
    this.execute("render", dt)
  }

  private execute(stage: TickerStage, dt: number) {
    const callbacks = this.callbacks.get(stage)
    if (callbacks) {
      for (const callback of callbacks) callback(dt)
    }
  }
}

export const Ticker: FC<{ priority?: number }> = ({ children, priority = -100 }) => {
  const [ticker] = useState(() => new TickerImpl())

  useFrame((_, dt) => {
    ticker.tick(dt)
  }, priority)

  return <TickerContext.Provider value={ticker}>{children}</TickerContext.Provider>
}

export const useTicker = (stage: TickerStage, callback: TickerCallback) => {
  const ticker = useContext(TickerContext)

  useEffect(() => {
    ticker.on(stage, callback)
    return () => ticker.off(stage, callback)
  })
}
