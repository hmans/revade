import { Vector3 } from "three"
import { ecs } from "../state"

const { entities } = ecs.world.archetype(
  "avoidance",
  "velocity",
  "transform",
  "spatialHashing"
)

const tmpvec3 = new Vector3()

export function avoidanceSystem() {
  for (const { avoidance, velocity, transform, spatialHashing } of entities) {
    /* Find neighbors */
    avoidance.neighbors = spatialHashing
      .getNearbyEntities(transform.position, avoidance.range, 10)
      .filter(
        (candidate) =>
          candidate.transform?.position.distanceTo(transform!.position) <= avoidance.range
      )

    /* Avoid neighbors */
    if (avoidance.neighbors.length) {
      const acceleration = avoidance.neighbors
        .reduce(
          (acc, neighbor) => acc.add(neighbor.transform!.position).sub(transform.position),
          tmpvec3.setScalar(0)
        )
        .divideScalar(-avoidance!.neighbors.length)
        .normalize()
        .multiplyScalar(2)

      velocity.add(acceleration)
    }
  }
}
