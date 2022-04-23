const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });
  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when PUT /threads{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 when success', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken);
      const commentId = await ServerTestHelper.createCommentAndGetId(accessToken, threadId);
      const server = await createServer(container);

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(typeof responseJson).toEqual('object');
      expect(responseJson.status).toEqual('success');
    });
    it('should response 401 when request header does not have access token', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken);
      const commentId = await ServerTestHelper.createCommentAndGetId(accessToken, threadId);
      const server = await createServer(container);

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
    it('should response 404 when like comment on a thread that does not exist', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken);
      const commentId = await ServerTestHelper.createCommentAndGetId(accessToken, threadId);
      const server = await createServer(container);

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/thread-123/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ada');
    });
    it('should response 404 when like comment that does not exist', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const threadId = await ServerTestHelper.createThreadAndGetId(accessToken);
      const server = await createServer(container);

      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/comment-123/likes`,
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
