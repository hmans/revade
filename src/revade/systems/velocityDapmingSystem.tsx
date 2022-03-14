import { ecs } from "../state"

const { entities } = ecs.world.archetype("velocity", "velocityDamping")

export function velocityDapmingSystem() {
  for (const { velocity, velocityDamping } of entities) {
    velocity.multiplyScalar(velocityDamping)
  }
}
