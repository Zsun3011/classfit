import React, {useState, useEffect} from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header";
import "../../styles/CommunityBoard.css";
import NewPost from "./NewPost";
import PostDetail from "./PostDetail";
import RecommendationBanner from "./RecommendationBanner";
import { post, put, del } from "../../api";
import config from "../../config";

const CommunityBoard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null); 
    const [isDetailOpen, setIsDetailOpen] = useState(false); 
    const [editingPost, setEditingPost] = useState(null);

    const location = useLocation();
    
    useEffect(() => {
        if (location.state?.openModal) {
            setIsModalOpen(true);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleRecommendationButtonClick = () => {
        setIsModalOpen(true);
    };

    // 게시글 생성/수정 공용 핸들러
    const handleAddPost = async (newPost) => {
        try {
            if (editingPost) {
                const res = await put(config.COMMUNITY.UPDATE(editingPost.id),
                {
                    title: newPost.title.trim(),
                    content: newPost.content.trim(),
                    type: "GENERAL",
                }
            );

            const updated = res.data;

            setPosts((prev) =>
                prev.map((p) =>
                    p.id === editingPost.id
                        ? {...p, title: updated.title, content: updated.content}
                        : p
                    )
            );

            if (selectedPost?.id === editingPost.id) {
                setSelectedPost((prev) => ({ ...prev, title: updated.title, content: updated.content}));
            }
            setEditingPost(null);
            setIsModalOpen(false);
            } else {
            // 새로운 게시글 생성
            const res = await post(config.COMMUNITY.CREATE, {
                title: newPost.title.trim(),
                content: newPost.content.trim(),
                postType: "GENERAL",
            });

            const created = res.data;

            const createPost = {
                id: created.id,
                title: created.title,
                content: created.content,
                createdAt: new Date(created.createdAt || Date.now()),
                comments: [], 
                commentCount: created.commentCount ?? 0,
            };
            setPosts(posts => [createPost, ...posts]);
            console.log("게시글 등록 성공");
            }
        }catch(e) {
            console.error("게시글 수정 실패:", e);
            alert("게시글 수정에 실패했습니다.");
            console.error("게시글 생성 실패:", e);
            alert("게시글 등록에 실패했습니다."); 
        }
    };

    // 게시글 삭제
    const handleDeletePost = async (postId) => {
        try { 
            await del(config.COMMUNITY.DELETE(postId));
            setPosts((prev) => prev.filter((p) => p.id !== postId));
            if(selectedPost?.id === postId) {
                setIsDetailOpen(false);
                setSelectedPost(null);
            }
        } catch(e) {
            console.error("게시글 삭제 실패:", e);
            alert("게시글 삭제에 실패했습니다.");
        }
    };

    // 댓글 생성
    const handleCommentAdd = (postId, newComment) => {
        const updatedPosts = posts.map(post => 
            post.id === postId 
                ? { ...post, comments: [...(post.comments || []), newComment] }
                : post
        );
        setPosts(updatedPosts);
        
        if (selectedPost && selectedPost.id === postId) {
            setSelectedPost({ ...selectedPost, comments: [...(selectedPost.comments || []), newComment] });
        }
    };

    const handlePostClick = (post) => {
        setSelectedPost(post);
        setIsDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setIsDetailOpen(false);
        setSelectedPost(null);
    };

    const handleEditPost = (post) => {
        setEditingPost(post);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPost(null);
    };

    const getTimeAgo = (createdAt) => {
        const now = new Date();
        const diffInMinutes = Math.floor((now - createdAt) / (1000 * 60));
        
        if (diffInMinutes < 1) return "방금 전";
        if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
        return `${Math.floor(diffInMinutes / 1440)}일 전`;
    };

    return (
        <div className="CommunityBoard">
            <Header />
            <RecommendationBanner
                onButtonClick={handleRecommendationButtonClick}
                isOnCommunityBoard={true}
            />
            <div className="CommunityBoard-container">
                <div className="CommunityBoard-section-first">
                    <div className="CommunityBoard-title">게시판</div>
                        <div className="CommunityBoard-Plus">
                            <div className="CommunityBoard-ButtonText">택시 · 카페 · 식당 등, 함께할 친구를 찾아보세요!</div>
                            <button className="CommunityBoard-Button" onClick={() => setIsModalOpen(true)}>
                                <img
                                    src={"/icons/plus.png"}
                                    alt="추가"
                                    className="Plus-icon"
                                />
                            </button>
                        </div>
                </div>
                <div className="CommunityBoard-posts">
                    {posts.map((post) => (
                        <div 
                            key={post.id} 
                            className="CommunityBoard-post-item"
                            onClick={() => handlePostClick(post)}
                        >
                            <div className="post-content">
                                <div className="post-title">{post.title}</div>
                                <div className="post-meta">
                                    <span className="post-time">{getTimeAgo(post.createdAt)}</span>
                                    <span className="post-comments">
                                        <img src="/icons/message.png" alt="댓글" className="comment-icon" />
                                        {(post.comments || []).length}개
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {posts.length === 0 && (
                        <div className="no-posts">아직 작성된 게시글이 없습니다.</div>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div onClick={(e) => e.stopPropagation()}>
                        <NewPost 
                            onClose={handleCloseModal}
                            onSubmit={handleAddPost} 
                            editPost={editingPost}
                        />
                    </div>
                </div>
            )} 

            {isDetailOpen && selectedPost && (
                <div className="modal-overlay" onClick={handleCloseDetail}>
                    <div onClick={(e) => e.stopPropagation()}>
                        <PostDetail 
                            post={selectedPost}
                            onClose={handleCloseDetail}
                            onDelete={handleDeletePost}
                            onEdit={handleEditPost}
                            onCommentAdd={handleCommentAdd}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityBoard;