import http from 'http';
import { Express } from 'express';
import { Account } from '@prisma/client';
import { mergeSchemas } from '@graphql-tools/schema';
import { IResolvers } from '@graphql-tools/utils';
import { ApolloServer, ExpressContext } from 'apollo-server-express';
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground,
  PluginDefinition,
} from 'apollo-server-core';

import Mutation from './mutations/index.js';
import Query from './queries/index.js';

import typesSchema from './types/schema.js';
import types from './types/index.js';
import scalars from './scalars/index.js';

import schema from './schema.js';
import is from '@sindresorhus/is';

// import DataSource from './DataSource';

interface DS {
  // main: DataSource;
}

const getServer = async (
  httpServer: http.Server,
  app: Express
): Promise<ApolloServer<ExpressContext>> => {
  const resolvers: IResolvers<DS> = {
    Event: {
      __resolveType(obj: any, context: any, info: any) {
        return obj.__type;
      }
    },

    SearchResult: {
      __resolveType(obj: any, context: any, info: any) {
        return obj.__type;

        console.log('>>>', obj, context, info);
        // // Only Author has a name field
        // if(obj.name){
        //   return 'Author';
        // }
  
        // // Only Book has a title field
        // if(obj.title){
        //   return 'Book';
        // }
  
        return null; // GraphQLError is thrown
      },
    },
    Query,
    // Mutation,

    ...scalars,
    ...types,
  };

  const plugins: PluginDefinition[] = [
    ApolloServerPluginLandingPageDisabled,
    ApolloServerPluginLandingPageGraphQLPlayground,
  ];

  if (process.env.NODE_ENV === 'production') {
    plugins.push(ApolloServerPluginDrainHttpServer({ httpServer }));
  }

  const server = new ApolloServer({
    schema: mergeSchemas({
      typeDefs: [...typesSchema, schema],
      resolvers,
    }),
    introspection: true,
    plugins,
    dataSources: () => ({}),
    formatError: (err) => {
      console.error(err);
      console.error(err.extensions.exception);
      // return new Error('Internal server error');
      return err;
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  return server;
};

export default getServer;
