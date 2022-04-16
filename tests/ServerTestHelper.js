const container = require('../src/Infrastructures/container');
const createServer = require('../src/Infrastructures/http/createServer');

const ServerTestHelper = {
  async getAccessToken() {
    const requestRegisterPayload = {
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    };
    const server = await createServer(container);
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: requestRegisterPayload,
    });

    const requestLoginPayload = {
      username: 'dicoding',
      password: 'secret',
    };
    const response = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: requestLoginPayload,
    });

    const responseJson = JSON.parse(response.payload);
    return responseJson.data.accessToken;
  },

  async createThreadAndGetId(accessToken) {
    const requestPayload = {
      title: 'title',
      body: 'body',
    };
    const server = await createServer(container);

    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: requestPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseJson = JSON.parse(response.payload);
    return responseJson.data.addedThread.id;
  },
};

module.exports = ServerTestHelper;
