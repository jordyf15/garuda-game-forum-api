const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const DetailComment = require('../../Domains/comments/entities/DetailComment');

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

  async getThreadComments(threadId) {
    const query = {
      text: `SELECT comments.id, users.username, comments.date, comments.content, comments.is_delete
      FROM comments
      INNER JOIN users ON comments.owner = users.id
      WHERE comments.thread = $1
      ORDER BY comments.date ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    const queryResult = [];
    result.rows.forEach((row) => {
      queryResult.push(new DetailComment({
        ...row,
        isDelete: row.is_delete,
        date: row.date.toISOString(),
        replies: [],
      }));
    });
    return queryResult;
  }
}

module.exports = CommentRepositoryPostgres;
