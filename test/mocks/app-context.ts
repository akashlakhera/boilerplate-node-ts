import { Repositories } from '@storage';
import { AppContext } from '@typings';
import { MockLogger } from './mock-logger';
import { MockMailer } from './mock-mailer';
import { MockMessenger } from './mock-messenger';
import { InMemoryMongoStore } from './in-memory-mongo-store';

const mockStore = new InMemoryMongoStore();
const mockLogger = new MockLogger();
const mockMailer = new MockMailer();
const mockMessenger = new MockMessenger();

export const respositoryContext = {
  logger: mockLogger,
  mailer: mockMailer,
  messenger: mockMessenger,
  store: mockStore,
  translate: (value: string) => value,
};

export const testAppContext: AppContext = {
  logger: mockLogger,
  accountRepository: new Repositories.AccountRepository(respositoryContext),
};
