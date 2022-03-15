import { PerspectiveCamera } from "@react-three/drei"
import { Ticker } from "../lib/Ticker"
import { Effects } from "./Effects"
import { Enemies } from "./Enemies"
import { Player } from "./Player"
import { Systems } from "./Systems"

export const Game = () => {
  return (
    <Ticker priority={2}>
      <Effects priority={1} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 10]} intensity={0.4} />
      <color attach="background" args={["#111"]} />
      <fog attach="fog" args={["#111", 64, 512]} />
      <PerspectiveCamera position={[0, 0, 50]} makeDefault />

      <Systems />

      <Player />
      <Enemies />
    </Ticker>
  )
}
