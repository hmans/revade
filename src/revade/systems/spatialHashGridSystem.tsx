import { ecs } from "../state"

const { entities } = ecs.world.archetype("transform", "spatialHashing")

export function spatialHashGridSystem() {
  for (const entity of entities) {
    const { transform, spatialHashing } = entity
    spatialHashing.placeEntity(entity, transform.position)
  }
}
