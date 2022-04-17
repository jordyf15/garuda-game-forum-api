const DetailThread = require('../DetailThread');

describe('a DetailThread entities', () => {
  it('should throw error when payload did not contain needed property', async () => {
    const payload = {};

    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', async () => {
    const payload = {
      id: 123,
      title: 123,
      body: 123,
      date: 123,
      username: 123,
      comments: 123,
    };

    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailThread object correctly', () => {
    const payload = {
      id: 'id',
      title: 'title',
      body: 'body',
      date: 'date',
      username: 'username',
      comments: [],
    };

    const detailThread = new DetailThread(payload);

    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.date).toEqual(payload.date);
    expect(detailThread.username).toEqual(payload.username);
    expect(detailThread.comments).toEqual(payload.comments);
  });
});
