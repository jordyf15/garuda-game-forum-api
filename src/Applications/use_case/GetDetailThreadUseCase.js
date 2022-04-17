class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadExist(threadId);
    const detailThread = await this._threadRepository.getThreadDetail(threadId);
    detailThread.comments = await this._commentRepository.getThreadComments(threadId);
    await Promise.all(detailThread.comments.map(async (comment, idx) => {
      const replies = await this._replyRepository.getCommentReplies(comment.id);
      detailThread.comments[idx].replies = replies;
    }));
    return detailThread;
  }
}

module.exports = GetDetailThreadUseCase;
