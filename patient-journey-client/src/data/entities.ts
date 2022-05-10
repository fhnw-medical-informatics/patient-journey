enum EntityIdBrand {}

export type EntityId = EntityIdBrand & string
export const EntityIdNone = 'n/a' as EntityId

export interface Entity {
  readonly uid: EntityId // Unique identifier of the entity
  readonly values: ReadonlyArray<string>
}

export interface DataEntity<T extends Entity, C> {
  readonly columns: ReadonlyArray<C>
  readonly allEntities: ReadonlyArray<T>
}

export type EntityType = 'patients' | 'events'
