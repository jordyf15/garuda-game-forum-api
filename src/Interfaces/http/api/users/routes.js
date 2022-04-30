const routes = (handler) => ([
  {
    method: 'POST',
    path: '/users',
    handler: handler.postUserHandler,
    options: {
      plugins: {
        'hapi-rate-limit': {
          enabled: false,
        },
      },
    },
  },
]);

module.exports = routes;
