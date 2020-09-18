import { LooseObject } from '@typings';
import { Model, DeleteResult } from '@storage';

export interface Writer {
  /**
   * method to save a record in the database
   */
  save: <T extends Model.BaseModel>(
    entity: T,
    modelFactory?: Model.ModelFactory<T>,
  ) => Promise<T>;

  /**
   * method to update a record based on the specified conditions
   */
  update: <T extends Model.BaseModel>(
    filter: LooseObject,
    dataToUpdate: LooseObject,
    modelFactory?: Model.ModelFactory<T>,
  ) => Promise<T>;

  /**
   * method to create multiple records in the database
   */
  saveMany: <T extends Model.BaseModel>(
    entities: T[],
    modelFactory?: Model.ModelFactory<T>,
  ) => Promise<T[]>;

  /**
   * method to create multiple records in the database
   */
  deleteMany: <T extends Model.BaseModel>(
    filter: LooseObject,
    modelFactory?: Model.ModelFactory<T>,
  ) => Promise<DeleteResult>;
}
