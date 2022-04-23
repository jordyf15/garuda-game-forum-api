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
