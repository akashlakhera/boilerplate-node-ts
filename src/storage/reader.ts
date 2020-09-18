import { LooseObject } from '@typings';
import { Model, QueryOptions } from '@storage';

export interface Reader {
  /**
   * method to get all records from the database
   */
  getAll: <T extends Model.BaseModel>(
    data?: LooseObject,
    options?: QueryOptions,
    modelFactory?: Model.ModelFactory<T>,
  ) => Promise<T[]>;

  /**
   * method to get record by unique id
   * @param {string} id - id of the record to retreive
   */
  findById: <T extends Model.BaseModel>(
    id: string,
    options?: QueryOptions,
    modelFactory?: Model.ModelFactory<T>,
  ) => Promise<T>;

  /**
   * method to get one record matching the provided condition(s)
   * @param {Object} data - conditions to check when retreiving data. eg: { foo: 'bar' }
   */
  findOne: <T extends Model.BaseModel>(
    data?: LooseObject,
    options?: QueryOptions,
    modelFactory?: Model.ModelFactory<T>,
  ) => Promise<T>;

  /**
   * method to count records in a collection based on the provided condition(s)
   * @param {Object} data - conditions to check when retreiving data. eg: { foo: 'bar' }
   */
  count: <T extends Model.BaseModel>(
    data?: LooseObject,
    modelFactory?: Model.ModelFactory<T>,
  ) => Promise<number>;
}
