import { useThree } from "@react-three/fiber"
import { Archetype, IEntity, QueriedEntity, Query, Tag } from "miniplex"
import { Vector3 } from "three"
import { system } from "../lib/systems"
import { useTicker } from "../lib/Ticker"
import { ecs, RevadeEntity } from "./state"
import { avoidanceSystem } from "./systems/avoidanceSystem"
import { playerInputSystem } from "./systems/playerInputSystem"
import { spatialHashGridSystem } from "./systems/spatialHashGridSystem"
import { velocityDapmingSystem } from "./systems/velocityDapmingSystem"
import { velocityLimitSystem } from "./systems/velocityLimitSystem"
import { velocitySystem } from "./systems/velocitySystem"

export const tmpvec3 = new Vector3()

export const Systems = () => {
  useTicker("update", (dt) => {
    spawnNewEnemiesSystem()
    playerInputSystem()
    findAttractorsForEnemies()
    followAttractors()
    avoidanceSystem()

    velocityLimitSystem()
    velocitySystem(dt)
    velocityDapmingSystem()
    spatialHashGridSystem()

    autoRotateSystem(dt)
    autoSqueezeSystem(dt)
  })

  return null
}

const spawnNewEnemies = () => {
  ecs.world.createEntity({ enemy: Tag })
}

const spawnNewEnemiesSystem = withInterval(spawnNewEnemies, 1)

const findAttractorsForEnemies = system(
  ecs.world.archetype("enemy", "attractors"),
  (entities) => {
    /* For enemies, attractors are... mostly the player. :P */
    const players = ecs.world.archetype("player")

    for (const entity of entities) {
      entity.attractors = players.entities
    }
  }
)

const followAttractors = system(
  ecs.world.archetype("transform", "velocity", "attractors"),
  (entities) => {
    for (const { transform, velocity, attractors } of entities) {
      if (attractors.length) {
        const acceleration = attractors
          .reduce(
            (acc, attractor) => acc.add(attractor.transform!.position).sub(transform.position),
            tmpvec3.setScalar(0)
          )
          .divideScalar(attractors.length)
          .multiplyScalar(0.5)

        velocity?.add(acceleration)
      }
    }
  }
)

const autoSqueezeSystem = system(
  ecs.world.archetype("transform", "autosqueeze"),
  (entities, dt: number) => {
    for (const { transform, autosqueeze } of entities) {
      autosqueeze.t += dt * autosqueeze.speed
      transform.scale.x = 1 + Math.cos(autosqueeze.t) * 0.2
      transform.scale.y = 1 + Math.sin(autosqueeze.t) * 0.2
    }
  }
)

/*
EXPERIMENTS!
*/

function withArchetype<
  TEntity extends IEntity,
  TQuery extends Query<TEntity>,
  TArgs extends any[]
>(
  system: (entities: QueriedEntity<TEntity, TQuery>[], ...args: TArgs) => void,
  archetype: Archetype<TEntity, TQuery>
) {
  const { entities } = archetype

  return (...args: TArgs) => {
    system(entities, ...args)
  }
}

function withInterval<TArgs extends any[]>(
  system: (...args: TArgs) => void,
  interval: number
) {
  let lastTime = performance.now()
  const intervalMs = interval * 1000

  return (...args: TArgs) => {
    if (performance.now() >= lastTime + intervalMs) {
      lastTime += intervalMs
      system(...args)
    }
  }
}

/* Write a standalone system that accepts a list of entities and extra args. Easy to test! */
const autoRotateSystemNaked = (
  entities: QueriedEntity<RevadeEntity, ["transform", "autorotate"]>[],
  dt: number
) => {
  for (const { transform, autorotate } of entities) {
    transform.rotation.x = transform.rotation.y += dt * autorotate.speed
  }
}

/* Compose some behavior into this sytem, eg. invoking it with a specific archetype, or configuring an interval: */
const autoRotateSystem = withArchetype(
  autoRotateSystemNaked,
  ecs.world.archetype("transform", "autorotate")
)
