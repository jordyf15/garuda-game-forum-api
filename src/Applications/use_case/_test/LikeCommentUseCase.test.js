const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeCommentUseCase = require('../LikeCommentUseCase');

describe('LikeCommentUseCase', () => {
  it('should orchestrating the like comment action correctly (like comment) ', async () => {
    const mockLikeRepository = new LikeRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockLikeRepository.checkLikeExist = jest.fn(() => Promise.resolve(false));
    mockThreadRepository.verifyThreadExist = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExist = jest.fn(() => Promise.resolve());
    mockLikeRepository.addLike = jest.fn(() => Promise.resolve());

    const likeCommentUseCase = new LikeCommentUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await likeCommentUseCase.execute('user-123', 'thread-123', 'comment-123');
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith('thread-123');
    expect(mockCommentRepository.verifyCommentExist).toBeCalledWith('comment-123');
    expect(mockLikeRepository.checkLikeExist).toBeCalledWith('user-123', 'comment-123');
    expect(mockLikeRepository.addLike).toBeCalledWith('user-123', 'comment-123');
  });

  it('should orchestrating the like comment action correctly (unlike comment)', async () => {
    const mockLikeRepository = new LikeRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockLikeRepository.checkLikeExist = jest.fn(() => Promise.resolve(true));
    mockThreadRepository.verifyThreadExist = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExist = jest.fn(() => Promise.resolve());
    mockLikeRepository.deleteLike = jest.fn(() => Promise.resolve());

    const likeCommentUseCase = new LikeCommentUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await likeCommentUseCase.execute('user-123', 'thread-123', 'comment-123');
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith('thread-123');
    expect(mockCommentRepository.verifyCommentExist).toBeCalledWith('comment-123');
    expect(mockLikeRepository.checkLikeExist).toBeCalledWith('user-123', 'comment-123');
    expect(mockLikeRepository.deleteLike).toBeCalledWith('user-123', 'comment-123');
  });
});
