class LikeCommentUseCase {
  constructor({ likeRepository, commentRepository, threadRepository }) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, threadId, commentId) {
    await this._threadRepository.verifyThreadExist(threadId);
    await this._commentRepository.verifyCommentExist(commentId);
    const isLikeExist = await this._likeRepository.checkLikeExist(userId, commentId);
    if (isLikeExist) {
      await this._likeRepository.deleteLike(userId, commentId);
    } else {
      await this._likeRepository.addLike(userId, commentId);
    }
  }
}

module.exports = LikeCommentUseCase;
