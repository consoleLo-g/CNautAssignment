import React, { useState } from "react";

interface Props {
  onClose: () => void;
  onSubmit: (data: { username: string; age: string; hobbies: string[] }) => Promise<void>;
}

const UserForm: React.FC<Props> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    username: "",
    age: "",
    hobbies: [] as string[],
    hobbyInput: ""
  });
  const [loading, setLoading] = useState(false);

  const addHobby = () => {
    const trimmed = formData.hobbyInput.trim();
    if (trimmed && !formData.hobbies.includes(trimmed)) {
      setFormData({ ...formData, hobbies: [...formData.hobbies, trimmed], hobbyInput: "" });
    }
  };

  const removeHobby = (h: string) => {
    setFormData({ ...formData, hobbies: formData.hobbies.filter(x => x !== h) });
  };

  const handleSubmit = async () => {
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div style={overlayStyle}>
      <div style={formBox}>
        <button style={closeBtn} onClick={onClose}>✖</button>
        <h2 style={formTitleStyle}>Add New User</h2>

        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={e => setFormData({ ...formData, username: e.target.value })}
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Age"
          value={formData.age}
          onChange={e => setFormData({ ...formData, age: e.target.value })}
          style={inputStyle}
        />

        <div style={hobbyInputContainer}>
          <input
            type="text"
            placeholder="Add hobby"
            value={formData.hobbyInput}
            onChange={e => setFormData({ ...formData, hobbyInput: e.target.value })}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button type="button" onClick={addHobby} style={addHobbyBtn}>Add</button>
        </div>

        <div style={hobbyListContainer}>
          {formData.hobbies.map(h => (
            <span key={h} style={hobbyTag}>
              {h} <button onClick={() => removeHobby(h)} style={removeHobbyBtn}>x</button>
            </span>
          ))}
        </div>

        <button onClick={handleSubmit} disabled={loading} style={submitBtn}>
          {loading ? "Adding..." : "Add User"}
        </button>
      </div>
    </div>
  );
};

export default UserForm;

// --- Styles ---
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backdropFilter: "blur(6px)",
  backgroundColor: "rgba(0,0,0,0.25)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  padding: "10px", // ensures mobile spacing
  boxSizing: "border-box",
};

const formBox: React.CSSProperties = {
  background: "#fff",
  padding: "20px",
  borderRadius: 12,
  width: "100%",
  maxWidth: 400,
  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  display: "flex",
  flexDirection: "column",
  gap: 10,
  position: "relative",
  boxSizing: "border-box",
};

const formTitleStyle: React.CSSProperties = {
  marginBottom: 12,
  textAlign: "center",
  fontSize: 20,
};

const closeBtn: React.CSSProperties = {
  position: "absolute",
  top: 12,
  right: 12,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: 18,
};

const inputStyle: React.CSSProperties = {
  padding: "10px",
  borderRadius: 6,
  border: "1px solid #ccc",
  width: "100%",
  fontSize: 14,
  boxSizing: "border-box",
};

const hobbyInputContainer: React.CSSProperties = {
  display: "flex",
  gap: 6,
  marginBottom: 10,
  flexWrap: "wrap", // ensures mobile-friendly stacking
};

const addHobbyBtn: React.CSSProperties = {
  padding: "6px 12px",
  backgroundColor: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  flexShrink: 0,
};

const hobbyListContainer: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  marginBottom: 10,
};

const hobbyTag: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  background: "#e5e7eb",
  padding: "4px 8px",
  borderRadius: 6,
  fontSize: 13,
};

const removeHobbyBtn: React.CSSProperties = {
  marginLeft: 6,
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: "#ef4444",
};

const submitBtn: React.CSSProperties = {
  padding: "10px 0",
  backgroundColor: "#10b981",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontWeight: 500,
  cursor: "pointer",
  marginTop: 10,
  width: "100%",
  fontSize: 16,
};
