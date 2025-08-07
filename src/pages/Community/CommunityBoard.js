import React, {useState, useEffect} from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header";
import "../../styles/CommunityBoard.css";
import NewPost from "./NewPost";
import PostDetail from "./PostDetail";
import RecommendationBanner from "./RecommendationBanner";

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

    
    const handleAddPost = (newPost) => {
        if (editingPost) {
            const updatedPosts = posts.map(post => 
                post.id === editingPost.id 
                    ? { ...post, title: newPost.title, content: newPost.content }
                    : post
            );
            setPosts(updatedPosts);
            if (selectedPost && selectedPost.id === editingPost.id) {
                setSelectedPost({ ...selectedPost, title: newPost.title, content: newPost.content });
            }
            
            setEditingPost(null);
        } else {
            const post = {
                id: Date.now(),
                title: newPost.title,
                content: newPost.content,
                createdAt: new Date(),
                comments: [], 
                commentCount: 0 
            };
            setPosts([post, ...posts]);
        }
        setIsModalOpen(false);
    };

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

    const handleDeletePost = (postId) => {
        const updatedPosts = posts.filter(post => post.id !== postId);
        setPosts(updatedPosts);
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