const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({});
    await ThreadsTableTestHelper.addThread({});
    await CommentsTableTestHelper.addComment({});
  });
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });
  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add reply and return added reply correctly', async () => {
      const addReply = new AddReply({
        content: 'content',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      const addedReply = await replyRepositoryPostgres.addReply('user-123', 'comment-123', addReply);

      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toHaveLength(1);

      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'content',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyReplyExist function', () => {
    it('should throw NotFoundError when reply does not exist', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyExist('reply-321')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply exist', async () => {
      await RepliesTableTestHelper.addReply({});
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyExist('reply-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    beforeEach(async () => {
      await RepliesTableTestHelper.addReply({});
    });
    it('should throw AuthorizationError when owner does not match user id', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-321')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when owner does match user id', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReplyById function', () => {
    it('should soft delete the reply properly', async () => {
      await RepliesTableTestHelper.addReply({});
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await replyRepositoryPostgres.deleteReplyById('reply-123');

      const reply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(reply[0].is_delete).toEqual(true);
    });
  });

  describe('getCommentReplies function', () => {
    it('should get all comment replies', async () => {
      await RepliesTableTestHelper.addReply({});
      await RepliesTableTestHelper.addReply({ id: 'reply-321' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      const commentReplies = await replyRepositoryPostgres.getCommentReplies(['comment-123']);
      const commentReply1 = commentReplies[0];
      const commentReply2 = commentReplies[1];
      expect(commentReply1[0].id).toEqual('reply-123');
      expect(commentReply1[0].content).toEqual('content');
      expect(commentReply1[0].username).toEqual('dicoding');
      expect(typeof commentReply1[0].date).toEqual('string');
      expect(commentReply1[0].date).not.toEqual('');
      expect(commentReply1[1]).toEqual('comment-123');
      expect(commentReply2[0].id).toEqual('reply-321');
      expect(commentReply2[0].content).toEqual('content');
      expect(commentReply2[0].username).toEqual('dicoding');
      expect(typeof commentReply2[0].date).toEqual('string');
      expect(commentReply2[0].date).not.toEqual('');
      expect(commentReply2[1]).toEqual('comment-123');
    });
  });
});
