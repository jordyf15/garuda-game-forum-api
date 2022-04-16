const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted replies', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken);
      const commentId = await ServerTestHelper.createCommentAndGetId(accessToken, threadId);
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
      expect(response.statusCode).toEqual(201);
      expect(typeof responseJson).toEqual('object');
      expect(responseJson.status).toEqual('success');
      expect(typeof responseJson.data).toEqual('object');
      expect(typeof responseJson.data.addedReply).toEqual('object');
      expect(typeof responseJson.data.addedReply.id).toEqual('string');
      expect(responseJson.data.addedReply.id).not.toEqual('');
      expect(responseJson.data.addedReply.content).toEqual('content');
      expect(typeof responseJson.data.addedReply.owner).toEqual('string');
      expect(responseJson.data.addedReply.owner).not.toEqual('');
    });

    it('should response 401 when request header does not have access token', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken);
      const commentId = await ServerTestHelper.createCommentAndGetId(accessToken, threadId);
      const requestPayload = {
        content: 'content',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when replied thread does not exist', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken);
      const commentId = await ServerTestHelper.createCommentAndGetId(accessToken, threadId);
      const requestPayload = {
        content: 'content',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/thread-123/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ada');
    });

    it('should response 404 when replied comment does not exist', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken);
      const requestPayload = {
        content: 'content',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/comment-123/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ada');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken);
      const commentId = await ServerTestHelper.createCommentAndGetId(accessToken, threadId);
      const requestPayload = {};
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
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('harus mengirim content');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken);
      const commentId = await ServerTestHelper.createCommentAndGetId(accessToken, threadId);
      const requestPayload = {
        content: 123,
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
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('content harus string');
    });
  });
});
