const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(userId, threadId, addComment) {
    const { content } = addComment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, userId, threadId, new Date(), false],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async verifyCommentExist(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND is_delete = $2',
      values: [commentId, false],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ada');
    }
  }

  async verifyCommentOwner(commentId, userId) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    const comment = result.rows[0];
    if (comment.owner !== userId) {
      throw new AuthorizationError('anda tidak berhak menghapus comment ini');
    }
  }

  async deleteCommentById(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = $1 WHERE id = $2',
      values: [true, commentId],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;
