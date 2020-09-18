import { Logger } from '@typings';
import { Mail, Messenger } from '@services';
import { IDataStore } from '@storage';

export type RepositoryContext = {
  logger: Logger;
  mailer: Mail.Mailer;
  messenger: Messenger.Messenger;
  store: IDataStore;
  translate: (key: string) => string;
};
