const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const DetailThread = require('../../Domains/threads/entities/DetailThread');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(userId, addThread) {
    const { title, body } = addThread;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES ($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, new Date(), userId],
    };

    const result = await this._pool.query(query);
    return new AddedThread({ ...result.rows[0] });
  }

  async verifyThreadExist(threadId) {
    const query = {
      text: 'SELECT id FROM threads where id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ada');
    }
  }

  async getThreadDetail(threadId) {
    const query = {
      text: `SELECT threads.id, threads.title, threads.body, threads.date, users.username
      FROM threads
      INNER JOIN users ON threads.owner = users.id
      WHERE threads.id = $1
      `,
      values: [threadId],
    };
    const result = await this._pool.query(query);
    const detailThread = new DetailThread({
      ...result.rows[0],
      date: result.rows[0].date.toISOString(),
      comments: [],
    });

    return detailThread;
  }
}

module.exports = ThreadRepositoryPostgres;
