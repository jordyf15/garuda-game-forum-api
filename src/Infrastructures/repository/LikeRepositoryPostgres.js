const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(userId, commentId) {
    const id = `like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3)',
      values: [id, commentId, userId],
    };

    await this._pool.query(query);
  }

  async checkLikeExist(userId, commentId) {
    const query = {
      text: 'SELECT id FROM likes WHERE owner = $1 AND comment = $2',
      values: [userId, commentId],
    };

    const result = await this._pool.query(query);

    // eslint-disable-next-line no-unneeded-ternary
    return result.rowCount ? true : false;
  }

  async deleteLike(userId, commentId) {
    const query = {
      text: 'DELETE FROM likes WHERE owner = $1 AND comment = $2',
      values: [userId, commentId],
    };

    await this._pool.query(query);
  }

  async getCommentsLikes(commentIds) {
    const query = {
      text: `SELECT comment
      FROM likes
      WHERE comment = ANY($1::text[])`,
      values: [commentIds],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = LikeRepositoryPostgres;
