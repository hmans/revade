import { BoundlessGrid } from "@hmans/ingrid"
import { between } from "randomish"
import { Quaternion } from "three"
import { makeInstanceComponents } from "../lib/Instances"
import { ecs, RevadeEntity } from "./state"

const grid = new BoundlessGrid<RevadeEntity>(50)

const Enemy = makeInstanceComponents()

export const Enemies = () => (
  <>
    <Enemy.Root>
      <dodecahedronGeometry />
      <meshStandardMaterial color="white" wireframe emissive={"white"} emissiveIntensity={1} />
    </Enemy.Root>

    <ecs.Collection tag="enemy" initial={1} memoize>
      {() => (
        <>
          <ecs.Component name="transform">
            <Enemy.Instance
              position={[between(-50, 50), between(-50, 50), 0]}
              quaternion={new Quaternion().random()}
            ></Enemy.Instance>
          </ecs.Component>
          <ecs.Component name="velocity">
            <vector3 />
          </ecs.Component>
          <ecs.Component name="velocityLimit" data={5} />
          <ecs.Component name="velocityDamping" data={0.9} />
          <ecs.Component name="attractors" data={[]} />
          <ecs.Component
            name="avoidance"
            data={{
              range: 1.5,
              neighbors: [],
              archetype: ecs.world.archetype("enemy") as any
            }}
          />
          <ecs.Component name="spatialHashing" data={grid} />
          <ecs.Component name="autorotate" data={{ speed: 1 }} />
        </>
      )}
    </ecs.Collection>
  </>
)
