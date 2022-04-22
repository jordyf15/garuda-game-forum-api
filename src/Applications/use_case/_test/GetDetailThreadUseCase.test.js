const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
  it('should orchestrating the get detail thread action correctly', async () => {
    const queriedDetailReply = [new DetailReply({
      id: 'reply-123',
      content: 'content',
      date: 'date',
      username: 'username',
      isDelete: false,
    }), 'comment-123'];
    const queriedDetailReply2 = [new DetailReply({
      id: 'reply-333',
      content: 'content',
      date: 'date',
      username: 'username',
      isDelete: false,
    }), 'comment-999'];
    const queriedDetailComment1 = new DetailComment({
      id: 'comment-123',
      username: 'username',
      date: 'date',
      replies: [],
      content: 'content',
      isDelete: false,
    });
    const queriedDetailComment2 = new DetailComment({
      id: 'comment-321',
      username: 'username',
      date: 'date',
      replies: [],
      content: 'content',
      isDelete: false,
    });
    const queriedDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'title',
      body: 'body',
      date: 'date',
      username: 'username',
      comments: [],
    });
    const expectedDetailComment1 = new DetailComment({
      id: 'comment-123',
      username: 'username',
      date: 'date',
      replies: [queriedDetailReply[0]],
      content: 'content',
      isDelete: false,
    });
    const expectedDetailComment2 = new DetailComment({
      id: 'comment-321',
      username: 'username',
      date: 'date',
      replies: [],
      content: 'content',
      isDelete: false,
    });
    const expectedDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'title',
      body: 'body',
      date: 'date',
      username: 'username',
      comments: [expectedDetailComment1, expectedDetailComment2],
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadExist = jest.fn(() => Promise.resolve());
    mockThreadRepository.getThreadDetail = jest.fn(() => Promise.resolve(queriedDetailThread));
    mockCommentRepository.getThreadComments = jest
      .fn(() => Promise.resolve([queriedDetailComment1, queriedDetailComment2]));
    mockReplyRepository.getCommentReplies = jest
      .fn(() => Promise.resolve([queriedDetailReply, queriedDetailReply2]));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const detailThread = await getDetailThreadUseCase.execute('thread-123');

    expect(detailThread).toStrictEqual(expectedDetailThread);
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith('thread-123');
    expect(mockThreadRepository.getThreadDetail).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getThreadComments).toBeCalledWith('thread-123');
    expect(mockReplyRepository.getCommentReplies).toBeCalledWith(['comment-123', 'comment-321']);
  });
});
