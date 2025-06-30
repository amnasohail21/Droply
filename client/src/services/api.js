import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:3001",
});

export const getDrops = () => API.get("/drops");
export const createDrop = (data) => API.post("/drops", data);
export const getPostsByDrop = (dropId) => API.get(`/posts/${dropId}`);
export const createPost = (data) => API.post("/posts", data);
export const votePost = (postId) => API.post(`/posts/${postId}/vote`);
