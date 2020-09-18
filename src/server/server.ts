// tslint:disable-next-line: no-var-requires
require('module-alias/register');
import i18n from 'i18n';
import { App, logger } from '@server';
import { Mongoose, Repositories } from '@storage';
import { AppContext } from '@typings';
import { Mail, Messenger } from '@services';

logger.info('www - Initializing HTTP server...');
logger.info('www - Initializing connection to Mongo Store...');

const mongoStore = new Mongoose.MongoStore();
const mailer = new Mail.SendGridMailProvider();
const messenger = new Messenger.TwilioMessenger();

const respositoryContext = {
  logger,
  mailer,
  messenger,
  store: mongoStore,
  translate: i18n.__,
};

const appContext: AppContext = {
  logger,
  accountRepository: new Repositories.AccountRepository(respositoryContext),
};

mongoStore
  .connect()
  .then(() => {
    logger.info('www - Connection to Mongo Store succeeded...');
    const app = new App(appContext);
    const server = app.listen();
    appContext.logger.info('www - Server started...');
    process.on('SIGINT', () => {
      appContext.logger.info(
        'www - sigint event received, attempting to shut down application...',
      );
      server.close((err) => {
        if (err) {
          appContext.logger.error(
            `www - encountered error while shutting down server - ${err.message}`,
          );
          process.exit(1);
        } else {
          appContext.logger.info(
            'www - server was closed gracefully, shutting down...',
          );
          process.exit(0);
        }
      });
    });
  })
  .catch((err) => {
    logger.error(`Error starting HTTP server: ${err.message}`);
  });
