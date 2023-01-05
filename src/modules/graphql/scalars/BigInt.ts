import { GraphQLScalarType, Kind } from 'graphql';
import BN from 'bn.js';
import is from '@sindresorhus/is';

const bigIntScalar = new GraphQLScalarType({
  name: 'BigInt',

  description: 'BigInt custom scalar type',

  serialize(value) {
    if (value !== null && value !== undefined && typeof value.toString === 'function') {
      return value.toString();
    }
    return value;
  },

  parseValue(value) {
    if (is.string(value) || is.number(value)) {
      return new BN(value);
    }
    return value;
  },

  parseLiteral(ast) {
    if (ast.kind === Kind.INT || ast.kind === Kind.STRING) {
      return new BN(ast.value);
    }
    return null;
  },
});

export default bigIntScalar;
