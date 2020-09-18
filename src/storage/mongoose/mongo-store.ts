import account from './account';
import config from 'config';
import {
  connect,
  ConnectionOptions,
  Document,
  Model as MongoosModel,
  Mongoose,
  Types,
} from 'mongoose';
import { IDataStore, Model, QueryOptions, DeleteResult } from '@storage';
import { LooseObject } from '@typings';

export class MongoStore implements IDataStore {
  public connect(): Promise<Mongoose> {
    const MONGODB_URI: string = config.get('mongoDb.uri');
    const options: ConnectionOptions = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    };
    return connect(MONGODB_URI, options);
  }

  public getAll<T extends Model.BaseModel>(
    data?: LooseObject,
    options?: QueryOptions,
    modelFactory?: Model.ModelFactory<T>,
  ): Promise<T[]> {
    let result = this.getModel<T>(modelFactory).find(data);

    if (options && options.sortFields) {
      result = result.sort(options.sortFields);
    }

    if (options && options.skip) {
      result = result.skip(options.skip);
    }

    if (options && options.limit) {
      result = result.limit(options.limit);
    }

    if (options && options.fieldsToSelect) {
      result = result.select(options.fieldsToSelect);
    }

    if (options && options.fieldsToPopulate) {
      for (const field of options.fieldsToPopulate) {
        result = result.populate(field);
      }
    }

    return result
      .lean()
      .exec()
      .then((results: []) => {
        return results.map((r: any) => {
          return modelFactory.create(r);
        });
      });
  }

  public findById<T extends Model.BaseModel>(
    id: string,
    options?: QueryOptions,
    modelFactory?: Model.ModelFactory<T>,
  ): Promise<T> {
    let result = this.getModel<T>(modelFactory).findById(id);

    if (options && options.fieldsToSelect) {
      result = result.select(options.fieldsToSelect);
    }

    if (options && options.fieldsToPopulate) {
      for (const field of options.fieldsToPopulate) {
        result = result.populate(field);
      }
    }
    return result
      .lean()
      .exec()
      .then((r) => {
        return modelFactory.create(r);
      });
  }

  public findOne<T extends Model.BaseModel>(
    data?: LooseObject,
    options?: QueryOptions,
    modelFactory?: Model.ModelFactory<T>,
  ): Promise<T> {
    let result = this.getModel<T>(modelFactory).findOne(data);

    if (options && options.fieldsToSelect) {
      result = result.select(options.fieldsToSelect);
    }

    if (options && options.fieldsToPopulate) {
      for (const field of options.fieldsToPopulate) {
        result = result.populate(field);
      }
    }
    return result
      .lean()
      .exec()
      .then((r: LooseObject) => {
        return modelFactory.create(r);
      });
  }

  public save<T extends Model.BaseModel>(
    entity: T,
    modelFactory?: Model.ModelFactory<T>,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const newEntity = new (this.getModel<T>(modelFactory))(entity);
      newEntity.save((err, saveResult) => {
        if (err) {
          reject(err);
        } else {
          const result = saveResult.toObject();
          delete result.password;
          delete result.searchText;
          resolve(modelFactory.create(result));
        }
      });
    });
  }

  public saveMany<T extends Model.BaseModel>(
    entities: T[],
    modelFactory?: Model.ModelFactory<T>,
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.getModel<T>(modelFactory).insertMany(entities, (err, saveResult) => {
        if (err) {
          reject(err);
        } else {
          const result = saveResult.map((sr) => {
            const temp = sr.toObject();
            delete temp.password;
            delete temp.searchText;
            return modelFactory.create(temp);
          });
          resolve(result);
        }
      });
    });
  }

  public update<T extends Model.BaseModel>(
    filter: LooseObject,
    dataToUpdate: LooseObject,
    modelFactory?: Model.ModelFactory<T>,
  ): Promise<T> {
    const result = this.getModel<T>(modelFactory).findOneAndUpdate(
      filter,
      dataToUpdate,
      { new: true },
    );

    return result
      .lean()
      .exec()
      .then((r) => {
        return modelFactory.create(r);
      });
  }

  public toObjectId(id: string): Types.ObjectId {
    return Types.ObjectId(id);
  }

  public count<T extends Model.BaseModel>(
    data?: LooseObject,
    modelFactory?: Model.ModelFactory<T>,
  ): Promise<number> {
    return this.getModel<T>(modelFactory).countDocuments(data).exec();
  }

  public deleteMany<T extends Model.BaseModel>(
    filter: LooseObject,
    modelFactory?: Model.ModelFactory<T>,
  ): Promise<DeleteResult> {
    return this.getModel<T>(modelFactory)
      .deleteMany(filter)
      .exec()
      .then((result) => {
        return { success: true, deletedCount: result.deletedCount };
      });
  }

  private getModel<T extends Model.BaseModel>(
    modelFactory: Model.ModelFactory<T>,
  ): MongoosModel<Document> {
    if (modelFactory.getType() === typeof Model.Account) {
      return account;
    }
    return null;
  }
}
