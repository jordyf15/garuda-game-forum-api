const pool = require('../../database/postgres/pool');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comments', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken);

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
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(typeof responseJson.data).toEqual('object');
      expect(typeof responseJson.data.addedComment).toEqual('object');
      expect(typeof responseJson.data.addedComment.id).toEqual('string');
      expect(responseJson.data.addedComment.id).not.toEqual('');
      expect(responseJson.data.addedComment.content).toEqual('content');
      expect(typeof responseJson.data.addedComment.owner).toEqual('string');
      expect(responseJson.data.addedComment.owner).not.toEqual('');
    });

    it('should response 401 when request header does not have access token', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken);
      const requestPayload = {
        content: 'content',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when commented thread does not exist', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const requestPayload = {
        content: 'content',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-404/comments',
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

    it('should response 400 when request payload not contain needed property', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken);
      const requestPayload = {};
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
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('harus mengirimkan content');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken);
      const requestPayload = {
        content: 123,
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
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('content harus string');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should repsonse with 200 and delete comment', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken);
      const commentId = await ServerTestHelper.createCommentAndGetId(accessToken, threadId);
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(typeof responseJson).toEqual('object');
      expect(responseJson.status).toEqual('success');
    });

    it('should response with 401 when user is not authenticated', async () => {
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response with 403 when user is not authorized to delete the comment', async () => {
      const server = await createServer(container);
      const accessToken1 = await ServerTestHelper.getAccessToken();
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken1);
      const commentId = await ServerTestHelper.createCommentAndGetId(accessToken1, threadId);
      const accessToken2 = await ServerTestHelper.getAccessToken('jojo');
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken2}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('anda tidak berhak menghapus comment ini');
    });

    it('should response with 404 when thread does not exist', async () => {
      const server = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken();

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ada');
    });

    it('should response with 404 when comment does not exist', async () => {
      const server = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken();
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-123`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ada');
    });
  });
});
