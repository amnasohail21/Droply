import { useEffect, useState } from "react";
import {
  getDrops,
  createDrop,
  getPostsByDrop,
  createPost,
  votePost,
} from "./services/api";
import './App.css';

function App() {
  const [dropImage, setDropImage] = useState(null);
  const [postImage, setPostImage] = useState(null);

  const [drops, setDrops] = useState([]);
  const [newDropTitle, setNewDropTitle] = useState("");
  const [selectedDrop, setSelectedDrop] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");

  // Load votes from localStorage: { postId: voteValue }
  const [votes, setVotes] = useState(() => {
    const saved = localStorage.getItem("votes");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    fetchDrops();
  }, []);

  useEffect(() => {
    if (selectedDrop) fetchPosts(selectedDrop._id);
  }, [selectedDrop]);

  const fetchDrops = async () => {
    try {
      const res = await getDrops();
      setDrops(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPosts = async (dropId) => {
    try {
      const res = await getPostsByDrop(dropId);
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDrop = async () => {
    if (!newDropTitle) return;

    const formData = new FormData();
    formData.append("title", newDropTitle);
    if (dropImage) formData.append("image", dropImage);

    try {
      await fetch("http://localhost:3001/drops", {
        method: "POST",
        body: formData,
      });
      setNewDropTitle("");
      setDropImage(null);
      fetchDrops();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent || !selectedDrop) return;

    const formData = new FormData();
    formData.append("dropId", selectedDrop._id);
    formData.append("content", newPostContent);
    if (postImage) formData.append("image", postImage);

    try {
      await fetch("http://localhost:3001/posts", {
        method: "POST",
        body: formData,
      });
      setNewPostContent("");
      setPostImage(null);
      fetchPosts(selectedDrop._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = async (postId, voteValue) => {
    if (votes[postId]) {
      alert("You already voted on this post.");
      return;
    }
    try {
      await votePost(postId, voteValue);

      // Save vote locally
      const updatedVotes = { ...votes, [postId]: voteValue };
      setVotes(updatedVotes);
      localStorage.setItem("votes", JSON.stringify(updatedVotes));

      fetchPosts(selectedDrop._id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Droply</h1>

      <h3>Create New Drop</h3>
      <input
        placeholder="Drop title"
        value={newDropTitle}
        onChange={(e) => setNewDropTitle(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setDropImage(e.target.files[0])}
      />
      {dropImage && (
        <img
          src={URL.createObjectURL(dropImage)}
          alt="Preview"
          style={{ height: 100, marginTop: 10 }}
        />
      )}
      <button onClick={handleCreateDrop}>Create Drop</button>

      <hr />

      <ul>
        {drops.map((drop) => (
          <li
            key={drop._id}
            onClick={() => setSelectedDrop(drop)}
            style={{
              cursor: "pointer",
              fontWeight: selectedDrop?._id === drop._id ? "bold" : "normal",
            }}
          >
            {drop.image && (
              <img
                src={`http://localhost:3001${drop.image}`}
                alt="drop"
                style={{ height: 60, marginBottom: 6, borderRadius: 6 }}
              />
            )}
            <p>{drop.title}</p>
          </li>
        ))}
      </ul>

      {selectedDrop && (
        <>
          <hr />
          <h2>Posts for: {selectedDrop.title}</h2>

          <input
            placeholder="Write your post"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPostImage(e.target.files[0])}
          />
          {postImage && (
            <img
              src={URL.createObjectURL(postImage)}
              alt="Preview"
              style={{ height: 100, marginTop: 10 }}
            />
          )}
          <button onClick={handleCreatePost}>Add Post</button>

          <ul>
            {posts.map((post) => (
              <li key={post._id} style={{ marginBottom: 10 }}>
                {post.image && (
                  <img
                    src={`http://localhost:3001${post.image}`}
                    alt="post"
                    style={{ height: 100, marginBottom: 8, borderRadius: 6 }}
                  />
                )}

                <p>{post.content}</p>
                <p>Votes: {post.votes || 0}</p>

                <button
                  onClick={() => handleVote(post._id, 1)}
                  disabled={votes[post._id]}
                >
                  Upvote +1
                </button>
                <button
                  onClick={() => handleVote(post._id, -1)}
                  disabled={votes[post._id]}
                >
                  Downvote -1
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
