const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(userId, commentId, addReply) {
    const { content } = addReply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, userId, commentId, new Date(), false],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async verifyReplyExist(replyId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1 AND is_delete = $2',
      values: [replyId, false],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('reply tidak ada');
    }
  }

  async verifyReplyOwner(replyId, userId) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    const reply = result.rows[0];
    if (reply.owner !== userId) {
      throw new AuthorizationError('anda tidak berhak menghapus reply ini');
    }
  }

  async deleteReplyById(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = $1 WHERE id = $2',
      values: [true, replyId],
    };

    await this._pool.query(query);
  }
}

module.exports = ReplyRepositoryPostgres;
