const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist added comment and return it correctly', async () => {
      const addComment = new AddComment({
        content: 'content',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const addedComment = await commentRepositoryPostgres.addComment('user-123', 'thread-123', addComment);

      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'content',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyCommentExist function', () => {
    it('should throw error NotFoundError when comment not exist', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentExist('comment-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment exist', async () => {
      await CommentsTableTestHelper.addComment({});

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentExist('comment-123'))
        .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    beforeEach(async () => {
      await CommentsTableTestHelper.addComment({});
    });
    it('should throw error AuthorizationError when user id does not match comment owner', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-321'))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when user id does match comment owner', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123'))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteCommentById function', () => {
    it('should soft delete by comment properly', async () => {
      await CommentsTableTestHelper.addComment({});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await commentRepositoryPostgres.deleteCommentById('comment-123');

      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment[0].is_delete).toEqual(true);
    });
  });
});
