import { useEffect, useState } from "react";
import {
  getDrops,
  createDrop,
  getPostsByDrop,
  createPost,
  votePost,
} from "./services/api";

function App() {
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
    await createDrop({ title: newDropTitle });
    setNewDropTitle("");
    fetchDrops();
  };

  const handleCreatePost = async () => {
    if (!newPostContent || !selectedDrop) return;
    await createPost({ dropId: selectedDrop._id, content: newPostContent });
    setNewPostContent("");
    fetchPosts(selectedDrop._id);
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

      <input
        placeholder="New drop title"
        value={newDropTitle}
        onChange={(e) => setNewDropTitle(e.target.value)}
      />
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
            {drop.title}
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
          <button onClick={handleCreatePost}>Add Post</button>

          <ul>
            {posts.map((post) => (
              <li key={post._id} style={{ marginBottom: 10 }}>
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
