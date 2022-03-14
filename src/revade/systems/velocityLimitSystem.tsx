import { ecs } from "../state"

const { entities } = ecs.world.archetype("velocity", "velocityLimit")

export function velocityLimitSystem() {
  for (const { velocity, velocityLimit } of entities) {
    velocity.clampLength(0, velocityLimit)
  }
}
