import { BoundlessGrid } from "@hmans/ingrid"
import { Archetype, IEntity, Tag } from "miniplex"
import { createECS } from "miniplex/react"
import { Object3D, Vector3 } from "three"

export type RevadeEntity = Partial<{
  /* Tags */
  player: Tag
  enemy: Tag

  /* Components */
  transform: Object3D
  spatialHashing: BoundlessGrid
  velocity: Vector3
  velocityLimit: number
  velocityDamping: number
  attractors: RevadeEntity[]
  avoidance: {
    range: number
    neighbors: RevadeEntity[]
    archetype: Archetype<RevadeEntity>
  }
  autorotate: {
    speed: number
  }
  autosqueeze: {
    t: number
    speed: number
  }
}> &
  IEntity

export const ecs = createECS<RevadeEntity>()
