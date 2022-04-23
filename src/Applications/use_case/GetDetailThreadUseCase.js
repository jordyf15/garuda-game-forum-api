class GetDetailThreadUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
    likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadExist(threadId);
    const detailThread = await this._threadRepository.getThreadDetail(threadId);
    detailThread.comments = await this._commentRepository.getThreadComments(threadId);
    const commentIds = detailThread.comments.map((comment) => comment.id);
    const replies = await this._replyRepository.getCommentReplies(commentIds);
    const likes = await this._likeRepository.getCommentsLikes(commentIds);
    likes.forEach((like) => {
      const idx = detailThread.comments.findIndex((comment) => comment.id === like.comment);
      if (idx !== -1) {
        detailThread.comments[idx].likeCount += 1;
      }
    });
    replies.forEach((reply) => {
      const idx = detailThread.comments.findIndex((comment) => comment.id === reply[1]);
      if (idx !== -1) {
        detailThread.comments[idx].replies.push(reply[0]);
      }
    });
    return detailThread;
  }
}

module.exports = GetDetailThreadUseCase;
