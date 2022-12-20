import { GraphQLScalarType, Kind } from 'graphql';
import is from '@sindresorhus/is';

const bytesScalar = new GraphQLScalarType({
  name: 'Bytes',

  description: 'Bytes custom scalar type',

  serialize(value) {
    if (Buffer.isBuffer(value)) {
      return value.toString('hex');
    }
    return value;
  },

  parseValue(value) {
    if (is.string(value)) {
      return Buffer.from(value, 'hex');
    }
    return value;
  },

  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      const { value } = ast;
      return Buffer.from(value, 'hex');
    }
    return null;
  },
});

export default bytesScalar;
