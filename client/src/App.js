import { useEffect, useState } from "react";
import { getDrops, createDrop } from "./services/api";

function App() {
  const [drops, setDrops] = useState([]);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    fetchDrops();
  }, []);

  const fetchDrops = async () => {
    try {
      const res = await getDrops();
      setDrops(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDrop = async () => {
    if (!newTitle) return;
    try {
      await createDrop({ title: newTitle });
      setNewTitle("");
      fetchDrops();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Droply</h1>

      <input
        placeholder="New drop title"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
      />
      <button onClick={handleCreateDrop}>Create Drop</button>

      <ul>
        {drops.map((drop) => (
          <li key={drop._id}>{drop.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
