import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { updateUser, deleteUser, addFriend, removeFriend, type User } from "../store/userSlice";
import { toast } from "react-toastify";

interface Props {
  user: User | null;
  onClose: () => void;
}

const UserDetailSidebar: React.FC<Props> = ({ user, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { users } = useSelector((state: RootState) => state.users);
  const [overlayMode, setOverlayMode] = useState<"edit" | "delete" | null>(null);
  const [friendToRemove, setFriendToRemove] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    age: "",
    hobbies: [] as string[],
    hobbyInput: "",
  });
  const [friendToAdd, setFriendToAdd] = useState<string>("");

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (user && overlayMode === "edit") {
      setFormData({
        username: user.username,
        age: String(user.age),
        hobbies: [...user.hobbies],
        hobbyInput: "",
      });
    }
  }, [overlayMode, user]);

  const addHobby = () => {
    const trimmed = formData.hobbyInput.trim();
    if (trimmed && !formData.hobbies.includes(trimmed)) {
      setFormData({ ...formData, hobbies: [...formData.hobbies, trimmed], hobbyInput: "" });
    }
  };
  const removeHobby = (h: string) =>
    setFormData({ ...formData, hobbies: formData.hobbies.filter(x => x !== h) });

  const handleUpdateUser = async () => {
    if (!user) return;
    const { username, age, hobbies } = formData;
    if (!username.trim()) return toast.error("Username is required");
    if (!age || isNaN(Number(age)) || Number(age) <= 0) return toast.error("Valid age required");

    try {
      await dispatch(updateUser({ id: user.id, patch: { username, age: Number(age), hobbies } })).unwrap();
      toast.success("User updated successfully!");
      setOverlayMode(null);
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    if (user.friends?.length) return toast.error("Unlink all friends before deleting the user");
    try {
      await dispatch(deleteUser(user.id)).unwrap();
      toast.success("User deleted successfully!");
      setOverlayMode(null);
      onClose();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleAddFriend = async () => {
    if (!user || !friendToAdd) return;
    try {
      await dispatch(addFriend({ sourceId: user.id, targetId: friendToAdd })).unwrap();
      toast.success("Added friend successfully!");
      setFriendToAdd("");
    } catch (err: any) {
      toast.error(err.message || "Failed to add friend");
    }
  };

  const handleConfirmRemoveFriend = async () => {
    if (!user || !friendToRemove) return;
    try {
      await dispatch(removeFriend({ id: user.id, friendId: friendToRemove })).unwrap();
      toast.success("Friend removed successfully!");
      setFriendToRemove(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to remove friend");
    }
  };

  const availableFriends = users.filter(
    u => u.id !== user?.id && !(user?.friends || []).includes(u.id)
  );
  const displayScore = users.find(u => u.id === user?.id)?.popularityScore ?? 0;

  // Dynamic sidebar width based on screen size
  const sidebarResponsiveStyle: React.CSSProperties = {
    width: windowWidth < 425 ? "100%" : 300,
    padding: 20,
    borderLeft: "1px solid #ddd",
    background: "#f9fafb",
    height: "100vh",
    position: "relative",
    fontFamily: "'Segoe UI', sans-serif",
    overflowY: "auto",
    boxSizing: "border-box",
  };

  return (
    <div style={sidebarResponsiveStyle}>
      <button onClick={onClose} style={closeBtn}>✖</button>

      {user && overlayMode === null && (
        <>
          <h2 style={{ marginBottom: 12 }}>{user.username}</h2>
          <p><b>Age:</b> {user.age}</p>
          <p><b>Popularity:</b> {displayScore}</p>
          <p><b>Hobbies:</b> {user.hobbies.join(", ") || "None"}</p>

          <div style={{ marginTop: 10 }}>
            <p><b>Friends:</b></p>
            {user.friends?.length ? (
              user.friends.map(fid => {
                const friend = users.find(u => u.id === fid);
                return (
                  <div key={fid} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span>{friend?.username || "Unknown"}</span>
                    <button style={removeFriendBtn} onClick={() => setFriendToRemove(fid)}>Remove</button>
                  </div>
                );
              })
            ) : <p>None</p>}
          </div>

          <div style={{ marginTop: 10 }}>
            <select
              value={friendToAdd}
              onChange={e => setFriendToAdd(e.target.value)}
              style={{ width: "100%", padding: 8, borderRadius: 6, marginBottom: 8 }}
            >
              <option value="">Select a friend to add</option>
              {availableFriends.map(f => <option key={f.id} value={f.id}>{f.username}</option>)}
            </select>
            <button onClick={handleAddFriend} disabled={!friendToAdd} style={{ ...editBtn, marginTop: 0 }}>Add Friend</button>
          </div>

          <button style={editBtn} onClick={() => setOverlayMode("edit")}>✏️ Edit User</button>
          <button
            style={{ ...deleteBtn, opacity: user.friends?.length ? 0.6 : 1, cursor: user.friends?.length ? "not-allowed" : "pointer" }}
            onClick={handleDeleteUser}
            disabled={!!user.friends?.length}
          >
            🗑️ Delete User
          </button>
        </>
      )}

      {user && overlayMode === "edit" && (
        <div style={overlayStyle}>
          <div style={overlayBox}>
            <button onClick={() => setOverlayMode(null)} style={overlayCloseBtn}>✖</button>
            <h3>Edit User</h3>
            <input type="text" placeholder="Username" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} style={inputStyle} />
            <input type="number" placeholder="Age" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} style={inputStyle} />
            <div>
              <input type="text" placeholder="Add hobby" value={formData.hobbyInput} onChange={e => setFormData({ ...formData, hobbyInput: e.target.value })} style={inputStyle} />
              <button type="button" onClick={addHobby} style={addHobbyBtn}>Add</button>
              <div style={{ marginTop: 8 }}>
                {formData.hobbies.map(h => (
                  <span key={h} style={hobbyTag}>
                    {h} <button onClick={() => removeHobby(h)} style={removeHobbyBtn}>x</button>
                  </span>
                ))}
              </div>
            </div>
            <button onClick={handleUpdateUser} style={updateBtn}>Update</button>
          </div>
        </div>
      )}

      {friendToRemove && (
        <div style={overlayStyle}>
          <div style={overlayBox}>
            <h3>Remove Friend</h3>
            <p>Are you sure you want to remove <b>{users.find(u => u.id === friendToRemove)?.username}</b> from your friends?</p>
            <div style={{ display: "flex", gap: 12, marginTop: 15 }}>
              <button onClick={handleConfirmRemoveFriend} style={deleteBtn}>Remove</button>
              <button onClick={() => setFriendToRemove(null)} style={cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Styles ---
const closeBtn: React.CSSProperties = { position: "absolute", top: 12, right: 12, border: "none", background: "transparent", cursor: "pointer", fontSize: 18 };
const editBtn: React.CSSProperties = { padding: "10px 0", width: "100%", marginTop: 10, backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 500 };
const deleteBtn: React.CSSProperties = { padding: "10px 0", width: "100%", marginTop: 8, backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: 6, fontWeight: 500 };
const removeFriendBtn: React.CSSProperties = { backgroundColor: "#ef4444", color: "#fff", border: "none", borderRadius: 6, padding: "2px 6px", cursor: "pointer" };
const overlayStyle: React.CSSProperties = { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.25)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const overlayBox: React.CSSProperties = { background: "#fff", padding: 24, borderRadius: 12, width: 400, maxWidth: "90%", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", position: "relative", display: "flex", flexDirection: "column", gap: 10 };
const overlayCloseBtn: React.CSSProperties = { position: "absolute", top: 8, right: 8, border: "none", background: "transparent", cursor: "pointer", fontSize: 18 };
const inputStyle: React.CSSProperties = { padding: "10px 12px", borderRadius: 6, border: "1px solid #ccc", width: "100%", marginBottom: 10, fontSize: 14 };
const addHobbyBtn: React.CSSProperties = { marginLeft: 6, padding: "6px 12px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" };
const hobbyTag: React.CSSProperties = { display: "inline-flex", alignItems: "center", background: "#e5e7eb", padding: "4px 8px", borderRadius: 6, marginRight: 5, marginTop: 5, fontSize: 13 };
const removeHobbyBtn: React.CSSProperties = { marginLeft: 6, background: "transparent", border: "none", cursor: "pointer", color: "#ef4444" };
const updateBtn: React.CSSProperties = { padding: "10px 0", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: 6, fontWeight: 500, marginTop: 10, cursor: "pointer" };
const cancelBtn: React.CSSProperties = { padding: "10px 0", width: "100%", backgroundColor: "#ccc", color: "#000", border: "none", borderRadius: 6, cursor: "pointer" };

export default UserDetailSidebar;
