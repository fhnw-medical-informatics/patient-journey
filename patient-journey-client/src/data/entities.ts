enum EntityIdBrand {}

export type EntityId = EntityIdBrand & string
export const EntityIdNone = 'n/a' as EntityId

export interface Entity {
  readonly uid: EntityId // Unique identifier of the entity
  readonly type: EntityType
  readonly values: ReadonlyArray<string>
}

export type EntityType = 'patients' | 'events'

export interface DataEntity<T extends Entity, C> {
  readonly type: T['type']
  readonly columns: ReadonlyArray<C>
  readonly allEntities: ReadonlyArray<T>
  readonly selectedEntity: EntityId
  readonly hoveredEntity: EntityId
}