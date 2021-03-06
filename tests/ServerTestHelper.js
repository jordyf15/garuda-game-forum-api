const container = require('../src/Infrastructures/container');
const createServer = require('../src/Infrastructures/http/createServer');

const ServerTestHelper = {
  async getAccessToken(username = 'dicoding') {
    const requestRegisterPayload = {
      username,
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
      username,
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

  async createCommentAndGetId(accessToken, threadId) {
    const requestPayload = {
      content: 'content',
    };
    const server = await createServer(container);

    const response = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: requestPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseJson = JSON.parse(response.payload);
    return responseJson.data.addedComment.id;
  },

  async createReplyAndGetId(accessToken, threadId, commentId) {
    const requestPayload = {
      content: 'content',
    };
    const server = await createServer(container);

    const response = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments/${commentId}/replies`,
      payload: requestPayload,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseJson = JSON.parse(response.payload);
    return responseJson.data.addedReply.id;
  },

  async deleteComment(accessToken, threadId, commentId) {
    const server = await createServer(container);

    await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  async deleteReply(accessToken, threadId, commentId, replyId) {
    const server = await createServer(container);

    await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};

module.exports = ServerTestHelper;
