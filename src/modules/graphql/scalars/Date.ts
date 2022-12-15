import { GraphQLScalarType, Kind } from 'graphql';
import is from '@sindresorhus/is';

const dateScalar = new GraphQLScalarType({
  name: 'Date',

  description: 'Date custom scalar type',

  serialize(value) {
    if (is.directInstanceOf(value, Date)) {
      return value.toISOString();
    }
    return value;
  },

  parseValue(value) {
    if (is.string(value) || is.number(value)) {
      return new Date(value);
    }
    return value;
  },

  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.INT:
        return new Date(parseInt(ast.value, 10));
      case Kind.STRING:
        return new Date(ast.value);
      default:
        return null;
    }
  },
});

export default dateScalar;
