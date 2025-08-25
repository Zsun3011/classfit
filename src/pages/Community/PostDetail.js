import React, { useState } from "react";
import "../../styles/CourseList.css";

const PostDetail = ({ post, onClose, onDelete, onEdit, onCommentAdd, canEdit, canDelete }) => {
  const [commentInput, setCommentInput] = useState("");

  const handleCommentSubmit = () => {
    const content = commentInput.trim();
    if (!content) return;
    onCommentAdd(post.id, content);
    setCommentInput("");
  };

  // 시간 차이 계산
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = Math.max(0, Math.floor((now - timestamp) / 1000));
    if (diff < 60) return `${diff}초전`;
    if (diff < 3600) return `${Math.floor(diff / 60)}분전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간전`;
    return `${Math.floor(diff / 86400)}일전`;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleCommentSubmit();
  };

  const handleDelete = () => {
    if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      onDelete(post.id);
      onClose();
    }
  };

  const handleEdit = () => {
    onEdit(post);
    onClose();
  };

  const formatPostTime = (createdAt) => {
    const date = new Date(createdAt);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${month}/${day} ${hours}:${minutes}`;
  };

  return (
    <div className="PostDetail-container">
      <div className="PostDetail-topsection">
        <div className="NewPost-title">
          <button type="button" className="PostDetail-Button" onClick={onClose}>
            <img src={"/icons/back.png"} alt="전송" className="back-icon" />
          </button>
          <div className="PostDetail-buttons">
            {canEdit && (
              <button type="button" className="modify-button" onClick={handleEdit}>
                수정
              </button>
            )}
            {canDelete && (
              <button type="button" className="remove-button" onClick={handleDelete}>
                삭제
              </button>
            )}
          </div>
        </div>
        <div className="PostDetail-textbody">
          <div className="NewPost-title">{post.title}</div>
          <div className="PostDetail-time">{formatPostTime(post.createdAt)}</div>
          <div className="PostDetail-text">{post.content}</div>
        </div>
      </div>

      <div className="comments-section">
        {(post.comments || []).map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="comment-text">
              <div className="comment-first">
                <span className="comment-nickname">{comment.nickname}</span>
                <div className="comment-content">{comment.content}</div>
              </div>
              <span className="comment-time">{getTimeAgo(comment.timestamp)}</span>
            </div>
          </div>
        ))}
        {(!post.comments || post.comments.length === 0) && (
          <div className="no-comments">첫 번째 댓글을 작성해보세요!</div>
        )}
      </div>

      <div className="PostDetail-submit">
        <input
          type="text"
          className="PostDetail-input"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="댓글을 입력하세요."
        />
        <button className="PostDetail-Button" onClick={handleCommentSubmit}>
          <img src={"/icons/send.png"} alt="전송" className="submit-icon" />
        </button>
      </div>
    </div>
  );
};

export default PostDetail;
