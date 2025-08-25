import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header";
import "../../styles/CommunityBoard.css";
import NewPost from "./NewPost";
import PostDetail from "./PostDetail";
import RecommendationBanner from "./RecommendationBanner";
import { get, post, put, del } from "../../api";
import config from "../../config";

// 서버 날짜 설정
export const parseServerDate = (v) => {
  if (!v) return null;

  // 숫자면 epoch (초/밀리초) 모두 처리
  if (typeof v === "number") {
    return new Date(v > 1e12 ? v : v * 1000);
  }

  if (typeof v === "string") {
    // "YYYY-MM-DDTHH:mm:ss" 또는 ".SSS"까지 있고 Z/오프셋이 없는 경우 → UTC로 간주해 Z 붙임
    const noZone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(v);
    return new Date(noZone ? v + "Z" : v);
  }

  // 이미 Date면 그대로
  if (v instanceof Date) return v;

  return new Date(v);
};

// 컴포넌트 밖으로 빼서 안정화 (게시글)
const normalizePost = (it) => {
  if (!it || typeof it !== "object") return null;

  const id =
    it.id ?? it.postId ?? it.postID ?? it.seq ?? it.uuid ?? it._id ?? null;
  if (!id) return null;

  return {
    id,
    title: it.title ?? it.subject ?? "(제목 없음)",
    content: it.content ?? it.body ?? "",
    createdAt:
      parseServerDate(
        it.createdAt ??
          it.createAt ??
          it.created_at ??
          it.createdDate ??
          it.timestamp
      ) || new Date(),
    commentCount: it.commentCount ?? it.commentsCount ?? 0,
    type: it.postType ?? it.type ?? "GENERAL",
    authorId:
      it.authorId ?? it.userId ?? it.writerId ?? it.author?.id ?? null,
    comments: [],
  };
};

// 컴포넌트 밖으로 빼서 안정화 (댓글)
const normalizeComment = (it) => {
  if (!it || typeof it !== "object") return null;
  const id = it.id ?? it.commentId ?? it.seq ?? it.id ?? null;
  if (!id) return null; 

  return {
    id,
    nickname: asAnon(it.author ?? it.nickname ?? it.writer),
    content: it.content ?? "",
    timestamp: parseServerDate(it.createdAt ??it.createAt ?? it.timestamp) || new Date(),
  };
};

// 댓글 생성 무조건 익명으로 (익명1~)
const asAnon = (name) => {
  if(!name || typeof name !== "string") return "익명";
  return name.includes("@") ? "익명" : name;
};

// 익명 번호 매기기
const numberAnonymous = (comments) => {
  const sorted = [...comments].sort((a, b) => a.timestamp - b.timestamp);
  let n = 1;
  return sorted.map((c) => {
    if (!c.nickname || c.nickname === "익명" || /^익명\d+$/.test(c.nickname)) {
      return { ...c, nickname: `익명${n++}` };
    }
    return c
  });
};

const CommunityBoard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [, setPage] = useState(0); // unused warning 제거
  const [, setHasMore] = useState(true); // unused warning 제거
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [me, setMe] = useState(null);
  const location = useLocation();

  const unwrap = useCallback(
    (r) => r?.data?.result ?? r?.result ?? r?.data ?? r,
    []
  );

  // 내 정보
  useEffect(() => {
    (async () => {
      try {
        const res = await get(config.USER.ME);
        const mePayload = res?.result ?? res;
        setMe(mePayload);
        console.log("내 정보", mePayload);
      } catch (e) {
        console.warn("내 정보 조회 실패", e);
        setMe(null);
      }
    })();
  }, []);

  // 내 id / 내가 쓴 글인지 확인
  const myId = useMemo(() => me?.id ?? me?.userId ?? me?.user?.id, [me]);
  const isMine = useCallback(
    (p) => !!(p && p.authorId && myId && p.authorId === myId),
    [myId]
  );

  // 라우팅으로 모달 열기
  useEffect(() => {
    if (location.state?.openModal) {
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // 게시글 목록 조회
  const loadPosts = useCallback(
    async (nextPage = 0, reset = false) => {
      const query = {
        page: nextPage,
        size: 20,
        sort: "createdAt,desc",
        type: "EVENT",
      };
      try {
        const res = await get(config.COMMUNITY.LIST, query);
        console.log("전체 게시글 조회 성공", { query, res });

        const pagePayload = unwrap(res);
        const rawRows = Array.isArray(pagePayload?.content)
          ? pagePayload.content
          : [];
        const mapped = rawRows.map(normalizePost).filter(Boolean);
        if (mapped.length !== rawRows.length) {
          console.warn("malformed post rows skipped", {
            total: rawRows.length,
            skipped: rawRows.length - mapped.length,
            samples: rawRows.filter((x) => !x || !x.id).slice(0, 3),
          });
        }

        setPosts((prev) => (reset ? mapped : [...prev, ...mapped]));
        setPage(pagePayload?.number ?? nextPage);

        const last = pagePayload?.last;
        const totalPages = pagePayload?.totalPages;
        setHasMore(
          last === false ||
            (typeof totalPages === "number" && nextPage + 1 < totalPages)
        );
      } catch (e) {
        console.error("게시글 목록 불러오기 실패:", {
          query,
          status: e.response?.status,
          data: e.response?.data,
          error: e,
        });
      }
    },
    [unwrap]
  );

  // 댓글 목록 조회
  const loadComments = useCallback(
    async (postId) => {
      try {
        const res = await get(config.COMMENT.LIST(postId));
        const arr = unwrap(res);
        const rows = Array.isArray(arr) ? arr : [];
        const comments = rows.map(normalizeComment).filter(Boolean);

        const numbered = numberAnonymous(comments);

        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, comments: numbered, commentCount: numbered.length }
              : p
          )
        );
        setSelectedPost((prev) =>
          prev && prev.id === postId
            ? { ...prev, comments: numbered, commentCount: numbered.length }
            : prev
        );
      } catch (e) {
        console.error("댓글 목록 불러오기 실패:", e.response?.data || e);
      }
    },
    [unwrap]
  );

  useEffect(() => {
    loadPosts(0, true);
  }, [loadPosts]);

  const handleRecommendationButtonClick = () => setIsModalOpen(true);

  // 게시글 등록 / 수정 공통
  const handleAddPost = async (newPost) => {
    const isEdit = !!editingPost;

    try {
      if (isEdit) {
        if (!isMine(editingPost)) {
          alert("본인이 작성한 글만 수정할 수 있습니다.");
          return;
        }

        const res = await put(config.COMMUNITY.UPDATE(editingPost.id), {
          title: newPost.title.trim(),
          content: newPost.content.trim(),
          type: "EVENT",
        });
        const updated = res?.data ?? res;
        console.log("게시글 수정 성공", updated);

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
        return;
      }

      // 게시글 등록
      const res = await post(config.COMMUNITY.CREATE, {
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        type: "EVENT",
      });
      const created = res?.result ?? res;
      console.log("게시글 등록 성공", created);

      await loadPosts(0, true);
      setIsModalOpen(false);
    } catch (err) {
      const s = err.response?.status;
      if (isEdit && s === 403) {
        console.error("게시글 수정 실패(권한없음):", err.response?.data || err);
        alert("게시글 수정 권한이 없습니다.");
      } else {
        console.error(
          isEdit ? "게시글 수정 실패:" : "게시글 등록 실패:",
          err.response?.data || err
        );
        alert(isEdit ? "게시글 수정에 실패했습니다." : "게시글 등록에 실패했습니다.");
      }
    }
  };

  // 게시글 삭제
  const handleDeletePost = async (postId) => {
    const target = posts.find((p) => p.id === postId);
    if (!isMine(target)) {
      alert("본인이 작성한 글만 삭제할 수 있습니다.");
      return;
    }

    try {
      await del(config.COMMUNITY.DELETE(postId));
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      if (selectedPost?.id === postId) {
        setIsDetailOpen(false);
        setSelectedPost(null);
      }
      console.log("게시글 삭제 성공");
    } catch (e) {
      const s = e.response?.status;
      if (s === 403) {
        console.error("게시글 삭제 실패(권한없음):", e.response?.data || e);
        alert("삭제 권한이 없습니다.");
        return;
      }
      console.error("게시글 삭제 실패:", e);
      alert("게시글 삭제에 실패했습니다.");
    }
  };

  // 댓글 생성
  const handleCommentAdd = async (postId, raw) => {
    const content =
      (typeof raw === "string" ? raw : raw?.content || "").trim();
    if (!content) return;

    const target = posts.find((p) => p.id === postId);
    if (!target) return;

    const tempCommentId = `ctemp-${postId}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    const tempComment = {
      id: tempCommentId,
      nickname: `익명${(target.comments?.length || 0) + 1}`,
      content,
      timestamp: new Date(),
    };

    // 임시 추가
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [...(p.comments || []), tempComment],
              commentCount:
                (p.commentCount ?? p.comments?.length ?? 0) + 1,
            }
          : p
      )
    );
    if (selectedPost?.id === postId) {
      setSelectedPost((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), tempComment],
        commentCount:
          (prev.commentCount ?? prev.comments?.length ?? 0) + 1,
      }));
    }

    try {
      const created = await post(config.COMMENT.CREATE, { postId, content });
      console.log("댓글 등록 성공", created);

      const serverAuthor = created?.author;
      const anonFromServer = asAnon(serverAuthor);
      const finalNickname =
        anonFromServer === "익명" ? tempComment.nickname : anonFromServer;


      const serverComment = {
        id: created.id,
        nickname: finalNickname,
        content: created.content ?? tempComment.content,
        timestamp:
          parseServerDate(created.createdAt) || tempComment.timestamp,
      };

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: (p.comments || []).map((c) =>
                  c.id === tempCommentId ? serverComment : c
                ),
              }
            : p
        )
      );
      if (selectedPost?.id === postId) {
        setSelectedPost((prev) => ({
          ...prev,
          comments: (prev.comments || []).map((c) =>
            c.id === tempCommentId ? serverComment : c
          ),
        }));
      }
    } catch (e) {
      console.error("댓글 등록 실패:", e.response?.data || e);
      // 롤백
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: (p.comments || []).filter(
                  (c) => c.id !== tempCommentId
                ),
                commentCount: Math.max(
                  0,
                  (p.commentCount ?? p.comments?.length ?? 1) - 1
                ),
              }
            : p
        )
      );
      if (selectedPost?.id === postId) {
        setSelectedPost((prev) => ({
          ...prev,
          comments: (prev.comments || []).filter(
            (c) => c.id !== tempCommentId
          ),
          commentCount: Math.max(
            0,
            (prev.commentCount ?? prev.comments?.length ?? 1) - 1
          ),
        }));
      }
      const s = e.response?.status;
      alert(s === 401 ? "로그인이 필요합니다." : "댓글 등록에 실패했습니다.");
    }
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setIsDetailOpen(true);
    loadComments(post.id); // 서버 댓글 가져옴
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedPost(null);
  };

  const handleEditPost = (post) => {
    if (!isMine(post)) {
      alert("본인이 작성한 글만 수정할 수 있습니다.");
      return;
    }
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  const getTimeAgo = (createdAt) => {
    const now = new Date();
    const diffInMinutes = Math.max(0, Math.floor((now - createdAt) / 60000));
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
            <div className="CommunityBoard-ButtonText">
              택시 · 카페 · 식당 등, 함께할 친구를 찾아보세요!
            </div>
            <button
              className="CommunityBoard-Button"
              onClick={() => setIsModalOpen(true)}
            >
              <img src={"/icons/plus.png"} alt="추가" className="Plus-icon" />
            </button>
          </div>
        </div>

        <div className="CommunityBoard-posts">
          {posts.filter(Boolean).map((post) => (
            <div
              key={post.id ?? `post-${Math.random().toString(36).slice(2, 8)}`}
              className="CommunityBoard-post-item"
              onClick={() => handlePostClick(post)}
            >
              <div className="post-content">
                <div className="post-title">{post.title}</div>
                <div className="post-meta">
                  <span className="post-time">
                    {getTimeAgo(post.createdAt)}
                  </span>
                  <span className="post-comments">
                    <img
                      src="/icons/message.png"
                      alt="댓글"
                      className="comment-icon"
                    />
                    {post.commentCount ?? post.comments?.length ?? 0}개
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
              canEdit={isMine(selectedPost)}
              canDelete={isMine(selectedPost)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityBoard;
