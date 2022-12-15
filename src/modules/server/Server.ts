import http from 'http';
import express from 'express';
import { ApolloServer, ExpressContext } from 'apollo-server-express';
import loggerMiddleware from './middlewares/logger.js';
import router from './middlewares/router.js';
import errorHandler from './middlewares/error-handler.js';
import cors from './middlewares/cors.js';
import notFound from './middlewares/not-found.js';
import logger from '../../logger.js';
import graphql from '../graphql/index.js';

class Server {
  public readonly expressApp = express();

  private httpServer = http.createServer();

  private graphqlServer: ApolloServer<ExpressContext>;

  public static async create(port: string | undefined): Promise<Server> {
    const server = new Server();
    await server.init(port);
    return server;
  }

  public listen(): void {
    let uri = '';
    const addr = this.httpServer.address();
    if (addr && typeof addr !== 'string') {
      let host: string;
      if (addr.family === 'IPv6') {
        host = `[${addr.address}]:${addr.port}`;
      } else {
        host = `${addr.address}:${addr.port}`;
      }

      uri = `http://${host}`;
      logger.info(`Serving at ${uri}"`);
    }

    this.httpServer.on('request', this.expressApp);
    logger.info(`Graphql server ready at ${uri}${this.graphqlServer.graphqlPath}`);
  }

  private async init(port: string | undefined) {
    const app = this.expressApp;
    this.httpServer = await this.getHttpServer(port);

    app.disable('x-powered-by');
    app.set('trust proxy', true);

    app.use(loggerMiddleware);
    app.use(cors);

    this.graphqlServer = await graphql(this.httpServer, this.expressApp);

    app.use(router);
    app.use(notFound);
    app.use(errorHandler);
  }

  // eslint-disable-next-line class-methods-use-this
  private getHttpServer(port: string | undefined): Promise<http.Server> {
    const httpServer = http.createServer();

    return new Promise((resolve) => {
      const listenCb = (): void => {
        resolve(httpServer);
      };

      httpServer.listen(
        {
          port,
        },
        listenCb
      );
    });
  }
}

export default Server;
