const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({});
    await ThreadsTableTestHelper.addThread({});
    await CommentsTableTestHelper.addComment({});
  });
  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('checkLikeExist function', () => {
    it('should return true if like exist', async () => {
      await LikesTableTestHelper.addLike({});

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      const isLikeExist = await likeRepositoryPostgres.checkLikeExist('user-123', 'comment-123');
      expect(isLikeExist).toEqual(true);
    });

    it('should return false if like does not exist', async () => {
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      const isLikeExist = await likeRepositoryPostgres.checkLikeExist('user-123', 'comment-123');
      expect(isLikeExist).toEqual(false);
    });
  });

  describe('getCommentsLikes function', () => {
    it('should return all likes of included comments', async () => {
      await UsersTableTestHelper.addUser({id: 'user-111', username: 'user1'});
      await UsersTableTestHelper.addUser({id: 'user-222', username: 'user2'});
      await UsersTableTestHelper.addUser({id: 'user-333', username: 'user3'});
      await UsersTableTestHelper.addUser({id: 'user-444', username: 'user4'});
      await CommentsTableTestHelper.addComment({id: 'comment-111', content: 'comment1'});
      await CommentsTableTestHelper.addComment({id: 'comment-222', content: 'comment2'});
      await CommentsTableTestHelper.addComment({id: 'comment-333', content: 'comment3'});

      await LikesTableTestHelper.addLike({id: 'like-111', owner: 'user-111', comment: 'comment-111'});
      await LikesTableTestHelper.addLike({id: 'like-222', owner: 'user-222', comment: 'comment-222'});
      await LikesTableTestHelper.addLike({id: 'like-333', owner: 'user-333', comment: 'comment-222'});
      await LikesTableTestHelper.addLike({id: 'like-444', owner: 'user-444', comment: 'comment-333'});

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});
      const commentsLikes = await likeRepositoryPostgres.getCommentsLikes(['comment-111', 'comment-222']);

      expect(commentsLikes.length).toEqual(3);
      const commentsLike1 = commentsLikes[0];
      expect(commentsLike1.comment).toEqual('comment-111');

      const commentsLike2 = commentsLikes[1];
      expect(commentsLike2.comment).toEqual('comment-222');

      const commentsLike3 = commentsLikes[2];
      expect(commentsLike3.comment).toEqual('comment-222');
    });
  });

  describe('addLike function', () => {
    it('should persist added like', async () => {
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      await likeRepositoryPostgres.addLike('user-123', 'comment-123');

      const likes = await LikesTableTestHelper.findLikesById('like-123');
      expect(likes).toHaveLength(1);
    });
  });

  describe('deleteLike function', () => {
    it('should properly delete like', async () => {
      await LikesTableTestHelper.addLike({});

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});
      await likeRepositoryPostgres.deleteLike('user-123', 'comment-123');

      const likes = await LikesTableTestHelper.findLikesById('like-123');
      expect(likes).toHaveLength(0);
    });
  });
});
