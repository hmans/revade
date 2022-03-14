import { VectorControl } from "@hmans/controlfreak"
import { Vector3 } from "three"
import { controller } from "../controller"
import { ecs } from "../state"
import { tmpvec3 } from "../Systems"

const { entities } = ecs.world.archetype("player", "transform", "velocity")

const THRUST = 1

export function playerInputSystem() {
  controller.update()
  const move = controller.controls.move as VectorControl

  for (const entity of entities) {
    entity.velocity.add(tmpvec3.set(move.value.x, move.value.y, 0).multiplyScalar(THRUST))
    entity.transform.quaternion.setFromUnitVectors(
      new Vector3(0, 1, 0),
      entity.velocity.clone().normalize()
    )
  }
}
