const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      const requestPayload = {
        title: 'title',
        body: 'body',
      };
      const server = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken();

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(typeof responseJson.data).toEqual('object');
      expect(typeof responseJson.data.addedThread).toEqual('object');
      expect(typeof responseJson.data.addedThread.id).toEqual('string');
      expect(responseJson.data.addedThread.id).not.toEqual('');
      expect(typeof responseJson.data.addedThread.title).toEqual('string');
      expect(responseJson.data.addedThread.title).not.toEqual('');
      expect(typeof responseJson.data.addedThread.owner).toEqual('string');
      expect(responseJson.data.addedThread.owner).not.toEqual('');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = {
        title: 'title',
      };
      const server = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken();

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('harus mengirimkan title dan body');
    });

    it('should response 400 when request payload does not meet data type specification', async () => {
      const requestPayload = {
        title: 'title',
        body: 123,
      };
      const server = await createServer(container);
      const accessToken = await ServerTestHelper.getAccessToken();

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('title dan body harus string');
    });

    it('should response 401 when request header does not have access token', async () => {
      const requestPayload = {
        title: 'title',
        body: 'body',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return the correct datas', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken);
      const commentId1 = await ServerTestHelper.createCommentAndGetId(accessToken, threadId);
      const commentId2 = await ServerTestHelper.createCommentAndGetId(accessToken, threadId);
      const replyId1 = await ServerTestHelper
        .createReplyAndGetId(accessToken, threadId, commentId1);
      const replyId2 = await ServerTestHelper
        .createReplyAndGetId(accessToken, threadId, commentId1);
      const server = await createServer(container);
      await ServerTestHelper.deleteComment(accessToken, threadId, commentId2);
      await ServerTestHelper.deleteReply(accessToken, threadId, commentId1, replyId2);

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(typeof responseJson.data).toEqual('object');
      const { thread } = responseJson.data;
      expect(typeof thread).toEqual('object');
      expect(thread.id).toEqual(threadId);
      expect(thread.title).toEqual('title');
      expect(thread.body).toEqual('body');
      expect(typeof thread.date).toEqual('string');
      expect(thread.date).not.toEqual('');
      expect(thread.username).toEqual('dicoding');

      const { comments } = thread;
      expect(Array.isArray(comments)).toEqual(true);
      expect(comments.length).toEqual(2);
      const comment1 = comments[0];
      expect(comment1.id).toEqual(commentId1);
      expect(comment1.username).toEqual('dicoding');
      expect(typeof comment1.date).toEqual('string');
      expect(comment1.date).not.toEqual('');
      expect(comment1.content).toEqual('content');
      expect(comment1.likeCount).toEqual(0);

      const comment2 = comments[1];
      expect(comment2.id).toEqual(commentId2);
      expect(comment2.username).toEqual('dicoding');
      expect(typeof comment2.date).toEqual('string');
      expect(comment2.date).not.toEqual('');
      expect(comment2.content).toEqual('**komentar telah dihapus**');
      expect(comment2.likeCount).toEqual(0);

      const { replies } = comment1;
      expect(Array.isArray(replies)).toEqual(true);
      expect(replies.length).toEqual(2);
      const reply1 = replies[0];
      expect(reply1.id).toEqual(replyId1);
      expect(reply1.content).toEqual('content');
      expect(typeof reply1.date).toEqual('string');
      expect(reply1.date).not.toEqual('');
      expect(reply1.username).toEqual('dicoding');

      const reply2 = replies[1];
      expect(reply2.id).toEqual(replyId2);
      expect(reply2.content).toEqual('**balasan telah dihapus**');
      expect(typeof reply2.date).toEqual('string');
      expect(reply2.date).not.toEqual('');
      expect(reply2.username).toEqual('dicoding');
    });

    it('should response 404 when the thread does not exist', async () => {
      const server = await createServer(container);
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-321',
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ada');
    });
  });
});
