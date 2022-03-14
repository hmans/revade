import { Vector3 } from "three"
import { ecs } from "../state"

const { entities } = ecs.world.archetype("velocity", "transform")
const tmpvec3 = new Vector3()

export function velocitySystem(dt: number) {
  for (const { velocity, transform } of entities) {
    transform.position.add(tmpvec3.copy(velocity).multiplyScalar(dt))
  }
}
