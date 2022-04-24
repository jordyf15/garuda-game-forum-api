const routes = (handler) => ([
  {
    method: 'POST',
    path: '/authentications',
    handler: handler.postAuthenticationHandler,
    options: {
      plugins: {
        'hapi-rate-limit': {
          pathLimit: false,
        },
      },
    },
  },
  {
    method: 'PUT',
    path: '/authentications',
    handler: handler.putAuthenticationHandler,
    options: {
      plugins: {
        'hapi-rate-limit': {
          pathLimit: false,
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: '/authentications',
    handler: handler.deleteAuthenticationHandler,
    options: {
      plugins: {
        'hapi-rate-limit': {
          pathLimit: false,
        },
      },
    },
  },
]);

module.exports = routes;
