const DetailComment = require('../DetailComment');

describe('a DetailComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {};

    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      username: 123,
      date: 123,
      replies: 123,
      content: 123,
      isDelete: 123,
      likeCount: '123',
    };

    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailComment object correctly when isDelete is true ', () => {
    const payload = {
      id: 'id',
      username: 'username',
      date: 'date',
      replies: [],
      content: 'content',
      isDelete: true,
      likeCount: 1,
    };

    const detailComment = new DetailComment(payload);

    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.replies).toEqual(payload.replies);
    expect(detailComment.content).toEqual('**komentar telah dihapus**');
    expect(detailComment.likeCount).toEqual(payload.likeCount);
  });

  it('should create detailComment object correctly when isDelete is false', () => {
    const payload = {
      id: 'id',
      username: 'username',
      date: 'date',
      replies: [],
      content: 'content',
      isDelete: false,
      likeCount: 1,
    };

    const detailComment = new DetailComment(payload);

    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.replies).toEqual(payload.replies);
    expect(detailComment.content).toEqual(payload.content);
  });
});
