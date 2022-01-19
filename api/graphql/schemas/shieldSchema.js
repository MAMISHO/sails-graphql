const { shield, rule, and, inputRule, deny } = require('graphql-shield');
const { _authenticate, _authorize } = require('../policies/auth');

/*const isAuthenticated = rule()(async (parent, args, ctx, info) => {
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
);*/

const shieldRules = {
  isAuthenticated: rule()(async (parent, args, ctx, info) => {
    // return !!ctx.req.headers['user-id'];
    console.log('authenticate');
    let userAuth = false;
    if (ctx.user === undefined) {
      var result = await _authenticate(ctx);
      if (result !== undefined && result.errors === undefined) {
        userAuth = true;
      }
    } else {
      userAuth = true;
    }
    return userAuth;
  }),

  isAdmin: rule()(async (parent, args, ctx, info) => {
    const user = users.find(({ id }) => id === ctx.req.headers['user-id']);
    return user && user.role === 'ADMIN';
  }),

  isNotAlreadyRegistered: inputRule()((yup) =>
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
  ),
};

const permissions = shield({
  Query: {
    '*': deny,
    getBooks: and(shieldRules.isAuthenticated, shieldRules.isAdmin),
    getBook: shieldRules.isAuthenticated,
  },
  Mutation: {
    addBook: shieldRules.isNotAlreadyRegistered,
  },
});

module.exports.permissions = permissions;
