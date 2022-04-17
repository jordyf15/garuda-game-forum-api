const DetailReply = require('../DetailReply');

describe('a DetailReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {};

    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });
  it('should throw error when payload did not meet data type speicification', () => {
    const payload = {
      id: 123,
      content: 123,
      date: 123,
      username: 123,
      isDelete: 123,
    };

    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailReply object correctly if isDelete is false', () => {
    const payload = {
      id: 'id',
      content: 'content',
      date: 'date',
      username: 'username',
      isDelete: false,
    };

    const detailReply = new DetailReply(payload);

    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.content).toEqual(payload.content);
    expect(detailReply.date).toEqual(payload.date);
    expect(detailReply.username).toEqual(payload.username);
  });

  it('should create detailReply object correctly if isDelete is true', () => {
    const payload = {
      id: 'id',
      content: 'content',
      date: 'date',
      username: 'username',
      isDelete: true,
    };

    const detailReply = new DetailReply(payload);

    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.content).toEqual('**balasan telah dihapus**');
    expect(detailReply.date).toEqual(payload.date);
    expect(detailReply.username).toEqual(payload.username);
  });
});
