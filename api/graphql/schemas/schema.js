/**
 * schema.js
 */
const { makeExecutableSchema } = require('@graphql-tools/schema');
// const { shield, rule, and, inputRule, deny } = require('graphql-shield');
const { applyMiddleware } = require('graphql-middleware');
// const { SchemaDirectiveVisitor } = require('@graphql-tools/utils');
// const { _authenticate, _authorize } = require('../policies/auth');
const book = require('./BookSchema');
const author = require('./AuthorSchema');
const { permissions } = require('./shieldSchema');

// Construct a schema using the GraphQL schema language
// directive @authenticate on FIELD_DEFINITION | FIELD
// directive @authorize(scope: String!) on FIELD_DEFINITION | FIELD
const typeDefs = `
   type Error {
     code: String!
     message: String!
     attrName: String
     row: Int
     moduleError: ModuleError
   }

   type ModuleError {
     code: String!
     message: String!
     attrNames: [String]
   }

   type ErrorResponse {
     errors: [Error]
   }

   ${book.typeDefs.types}
   ${author.typeDefs.types}

   type Query {
     ${book.typeDefs.queries}
     ${author.typeDefs.queries}
   }

   type Mutation {
     ${book.typeDefs.mutations}
     ${author.typeDefs.mutations}
   }
 `;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    ...book.resolvers.queries,
    ...author.resolvers.queries,
  },

  Mutation: {
    ...book.resolvers.mutations,
    ...author.resolvers.mutations,
  },
  ...book.resolvers.references,
  ...author.resolvers.references,
};

/*
const isAuthenticated = rule()(async (parent, args, ctx, info) => {
  return !!ctx.req.headers['user-id'];
});

const isAdmin = rule()(async (parent, args, ctx, info) => {
  const user = users.find(({ id }) => id === ctx.req.headers['user-id']);

  return user && user.role === 'ADMIN';
});

const isNotAlreadyRegistered = inputRule()((yup) =>
  yup.object({
    input: yup.object({
      name: yup.string().required(),
      email: yup
        .string()
        .email()
        .required()
        .notOneOf(
          users.map(({ email }) => email),
          'A user exists with this email. Choose another.'
        ),
    }),
  })
);
*/

// Definimos los permisos para las rutas
/*const permissions = shield({
  Query: {
    '*': deny,
    getBooks: and(isAuthenticated, isAdmin),
    getBook: isAuthenticated,
  },
  Mutation: {
    addBook: isNotAlreadyRegistered,
  },
});*/

/*const directiveResolvers = {
  // Will be called when a @authenticate directive is applied to a field or field definition.
  async authenticate(resolve, parent, directiveArgs, context, info) {
    console.log('authenticate');
    if (context.user === undefined) {
      user = await _authenticate(context);
      if (user.errors !== undefined) {
        return user; // user authentication failed
      }
    }
    return resolve();
  },

  // Will be called when a @authorize directive is applied to a field or field definition.
  async authorize(resolve, parent, directiveArgs, context, info) {
    console.log('authorized');
    if (!(await _authorize(context.user, directiveArgs.scope))) {
      return {
        errors: [
          {
            code: 'E_NO_PERMISSION',
            message: 'Expected resource Authorization: ' + directiveArgs.scope,
          },
        ],
      };
    }
    return resolve();
  },
};*/
/*module.exports.schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  directiveResolvers,
});*/

// Get a GraphQL.js Schema object
const schema = makeExecutableSchema({ typeDefs, resolvers });
module.exports.schemaWithPermissions = applyMiddleware(schema, permissions);
