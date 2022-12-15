import { GraphQLScalarType, Kind } from 'graphql';
// import is from '@sindresorhus/is';

export type GQLCoordinates = [number, number];

const coordinatesScalar = new GraphQLScalarType({
  name: 'Coordinates',

  description: 'Geographic coordinates in a form of latitude/longitude',

  serialize(value) {
    return value;
  },

  parseValue(value) {
    return value;
  },

  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.LIST:
        return ast.values;
      // case Kind.INT:
      //   return new Date(parseInt(ast.value, 10));
      // case Kind.STRING:
      //   return new Date(ast.value);
      default:
        return null;
    }
  },
});

export default coordinatesScalar;
