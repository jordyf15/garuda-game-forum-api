class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id,
      username,
      date,
      replies,
      content,
      isDelete,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.replies = replies;
    this.content = isDelete ? '**komentar telah dihapus**' : content;
  }

  _verifyPayload({
    id,
    username,
    date,
    replies,
    content,
    isDelete,
  }) {
    if (!id || !username || !date || !replies || !content || isDelete === undefined) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string'
    || typeof username !== 'string'
    || typeof date !== 'string'
    || !Array.isArray(replies)
    || typeof content !== 'string'
    || typeof isDelete !== 'boolean') {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailComment;
