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

    // 게시글 등록/수정 공용 핸들러
const handleAddPost = async (newPost) => {
    const isEdit = Boolean(editingPost); // 등록/수정인지 알려주는 플래그 
    try {
      if (isEdit) {
        const target = posts.find((p) => p.id === editingPost.id);
        const isTemp =
          String(editingPost.id).startsWith("temp-") || target?.__unsynced === true;
  
        if (isTemp) {
          // 임시글: 로컬만 수정
          setPosts((prev) =>
            prev.map((p) =>
              p.id === editingPost.id
                ? {
                    ...p,
                    title: newPost.title.trim(),
                    content: newPost.content.trim(),
                  }
                : p
            )
          );
          if (selectedPost?.id === editingPost.id) {
            setSelectedPost((prev) => ({
              ...prev,
              title: newPost.title.trim(),
              content: newPost.content.trim(),
            }));
          }
          setEditingPost(null);
          setIsModalOpen(false);
        } else {
          // 서버 수정
          const res = await put(
            config.COMMUNITY.UPDATE(editingPost.id),
            {
              title: newPost.title.trim(),
              content: newPost.content.trim(),
              type: "GENERAL", // 필요 시 postType: "GENERAL"로 교체 테스트
            }
          );
          const updated = res.data;
  
          setPosts((prev) =>
            prev.map((p) =>
              p.id === editingPost.id
                ? { ...p, title: updated.title, content: updated.content }
                : p
            )
          );
          if (selectedPost?.id === editingPost.id) {
            setSelectedPost((prev) => ({
              ...prev,
              title: updated.title,
              content: updated.content,
            }));
          }
          setEditingPost(null);
          setIsModalOpen(false);
        }
        return; // 수정 플로우 종료
      }
  
      // 등록
      const tempId = `temp-${Date.now()}`;
      const tempPost = {
        id: tempId,
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        createdAt: new Date(),
        comments: [],
        commentCount: 0,
        __unsynced: true, // 임시글 플래그
      };
      setPosts((prev) => [tempPost, ...prev]);
      setIsModalOpen(false); // UX: 일단 닫아줌
  
      // 서버 POST 시도
      try {
        const res = await post(config.COMMUNITY.CREATE, {
          title: newPost.title.trim(),
          content: newPost.content.trim(),
          type: "GENERAL", // 서버 스펙에 맞춰 필요 시 type↔postType 확인
        });
        const created = res.data;
  
        // 임시글 → 실제로 치환
        setPosts((prev) =>
          prev.map((p) =>
            p.id === tempId
              ? {
                  id: created.id,
                  title: created.title ?? tempPost.title,
                  content: created.content ?? tempPost.content,
                  createdAt: new Date(created.createdAt || tempPost.createdAt),
                  comments: [],
                  commentCount: created.commentCount ?? 0,
                  __unsynced: false,
                }
              : p
          )
        );
      } catch (err) {
        console.error("서버 등록 실패(임시글 유지):", err);
        alert("서버 등록은 실패했지만, 화면에는 임시로 추가해두었어요.");
        // 임시글은 그대로 남아서 수정/삭제 테스트 가능
      }
    } catch (e) {
      console.error(isEdit ? "게시글 수정 실패:" : "게시글 등록 실패:", e);
      alert(isEdit ? "게시글 수정에 실패했습니다." : "게시글 등록에 실패했습니다.");
    }
  };
  


    // 게시글 삭제
    const handleDeletePost = async (postId) => {
        const target = posts.find(p => p.id === postId);
        const isTemp = String(postId).startsWith("temp-") || target?.__unsynced;

        if (isTemp) {
            // 로컬만 삭제
            setPosts(prev => prev.filter(p => p.id !== postId));
            if (selectedPost?.id === postId) {
              setIsDetailOpen(false);
              setSelectedPost(null);
            }
            return;
        }

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