const AddedThread = require('../AddedThread');

describe('a AddedThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'id',
      title: 'title',
    };

    expect(() => new AddedThread(payload)).toThrowError('ADDED_USER.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      title: 'title',
      owner: 'owner',
    };

    expect(() => new AddedThread(payload)).toThrowError('ADDED_USER.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addedThread object properly', () => {
    const payload = {
      id: 'id',
      title: 'title',
      owner: 'owner',
    };

    const { id, title, owner } = new AddedThread(payload);
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(owner).toEqual(payload.owner);
  });
});
