/**
 * AuthorSchema.js
 */
const {
  _getAuthor,
  _addAuthor,
  _updateAuthor,
  _deleteAuthor,
} = require('../helpers/AuthorHelper');
const { _getBook } = require('../helpers/BookHelper');

module.exports = {
  typeDefs: {
    types: `
       # model=Author
       type Author {
         # Unique identifier (Primary key in database for this model entity)
         id: Int!
         # Name
         name: String!
         # Country
         country: String
         # Books
         books: [Book]
       }

       input AuthorInput {
         name: String
         country: String
       }

       # define unions
       union AuthorResponse = Author | ErrorResponse

     `, // end of types

    queries: `
       getAuthors(filter: String): [AuthorResponse]
       getAuthor(id: Int!): AuthorResponse
     `, // end of queries

    mutations: `
       addAuthor(data: AuthorInput!): AuthorResponse
       updateAuthor(id: Int!, data: AuthorInput!): AuthorResponse
       deleteAuthor(id: Int!): AuthorResponse
     `, // end of mutations
  }, // end of typeDefs

  resolvers: {
    queries: {
      getAuthors: async (parent, args, context) => {
        const result = await _getAuthor({ where: args.filter });
        if (!(result instanceof Array)) {
          return [result];
        }
        if (result.length === 0) {
          return [
            {
              errors: [
                {
                  code: 'I_INFO',
                  message: 'No data matched your selection criteria',
                },
              ],
            },
          ];
        }
        return result;
      },
      getAuthor: async (parent, args, context) => {
        return await _getAuthor(args);
      },
    },

    mutations: {
      addAuthor: async (parent, args, context) => {
        return await _addAuthor(args.data);
      },
      updateAuthor: async (parent, args, context) => {
        return await _updateAuthor(args.id, args.data);
      },
      deleteAuthor: async (parent, args, context) => {
        return await _deleteAuthor(args.id);
      },
    },

    references: {
      Author: {
        books: async (author, _, context) => {
          if (author === null) {
            return null;
          }
          const args = {
            where: {
              author: author.id,
            },
          };
          const result = await _getBook(args);
          if (!(result instanceof Array)) {
            return [result];
          }
          return result;
        },
      },

      AuthorResponse: {
        __resolveType(obj, context, info) {
          if (obj.errors) {
            return 'ErrorResponse';
          } else {
            return 'Author';
          }
        },
      },
    }, // end of references
  }, // end of resolvers
};
