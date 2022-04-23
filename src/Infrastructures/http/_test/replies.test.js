const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
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

  describe('when DELETE /threads{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response with 200 when delete reply successfully', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken);
      const commentId = await ServerTestHelper.createCommentAndGetId(accessToken, threadId);
      const replyId = await ServerTestHelper.createReplyAndGetId(accessToken, threadId, commentId);
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response with 401 when request header does not contain access token', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken);
      const commentId = await ServerTestHelper.createCommentAndGetId(accessToken, threadId);
      const replyId = await ServerTestHelper.createReplyAndGetId(accessToken, threadId, commentId);
      const server = await createServer(container);
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response with 403 when user is not authorized to delete the reply', async () => {
      const accessToken1 = await ServerTestHelper.getAccessToken();
      const accessToken2 = await ServerTestHelper.getAccessToken('jojo');
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken1);
      const commentId = await ServerTestHelper.createCommentAndGetId(accessToken1, threadId);
      const replyId = await ServerTestHelper.createReplyAndGetId(accessToken1, threadId, commentId);
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken2}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('anda tidak berhak menghapus reply ini');
    });

    it('should response with 404 when the thread does not exist', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ada');
    });

    it('should response with 404 when the comment does not exist', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken);
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-123/replies/reply-123`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ada');
    });

    it('should response with 404 when the reply does not exist', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken);
      const commentId = await ServerTestHelper.createCommentAndGetId(accessToken, threadId);
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/reply-123`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('reply tidak ada');
    });
  });
});
