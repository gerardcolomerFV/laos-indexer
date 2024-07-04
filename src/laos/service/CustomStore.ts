import { EntityManager } from 'typeorm'
import { LaosAsset } from '../../model';
    
export class CustomStore {
  private entityManager: EntityManager;

  constructor(em: EntityManager) {
    this.entityManager = em;
  }

  async evolve(entities: LaosAsset[]): Promise<void> {
    for (const entity of entities) {
      const { id, ...attributes } = entity;
      await this.entityManager.update(LaosAsset, id, attributes);
    }
  }
}