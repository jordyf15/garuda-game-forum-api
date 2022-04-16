const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await deleteCommentUseCase.execute('user-123', 'thread-123', 'comment-123');

    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith('thread-123');
    expect(mockCommentRepository.verifyCommentExist).toBeCalledWith('comment-123');
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith('comment-123', 'user-123');
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith('comment-123');
  });
});
