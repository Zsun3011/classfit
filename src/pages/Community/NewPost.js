import React, { useEffect, useState } from "react";


const NewPost = ({onClose, onSubmit, editPost = null }) => {
    const [title, setTitle] = useState(editPost ? editPost.title : "");
    const [content, setContent] = useState(editPost ? editPost.content : "");

    useEffect(() => {
        setTitle(editPost?.title ?? "");
        setContent(editPost?.content ?? "");
    }, [editPost]);

    const handleSubmit = () => {
        if (!title.trim() || !content.trim()) {
            alert("제목과 본문을 모두 입력해주세요.");
            return;
        }

        onSubmit({
            title: title.trim(),
            content: content.trim()
        });

        // 폼 초기화
        setTitle("");
        setContent("");
    };

    return (
        <div className="NewPost-container">
            <div className="NewPost-title">
                {editPost ? "게시글 수정" : "새 글쓰기"}
                <button className="modal-close" onClick={onClose}>×</button>
            </div>
            <div className="NewPost-section">
                <div className="NewPost-inputContainer">
                    제목
                    <input
                    type="text"
                    className="NewPost-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="NewPost-inputContainer">
                    본문
                    <textarea
                        className="NewPost-input2"
                        rows={10}   
                        value={content}
                        onChange={(e) => setContent(e.target.value)}  
                    />
                </div>
            </div>
            <div className="NewPost-button-section">
                <button className="NewPost-button" onClick={handleSubmit}>
                    {editPost ? "수정완료" : "등록하기"}
                </button>
            </div>
        </div>
    )
}

export default NewPost;