import React, { useRef, useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import { useDrop } from "react-dnd";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "../store/userSlice";

interface UserNodeProps {
  data: {
    user: User;
    onAddHobby: (hobby: string) => Promise<User>;
    onNodeClick?: () => void;
  };
}

const UserNode: React.FC<UserNodeProps> = ({ data }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { user, onAddHobby } = data;
  const [showScore, setShowScore] = useState(false);
  const [displayScore, setDisplayScore] = useState(user.popularityScore);

  // Scale node size based on popularity
  const size = 120 + Math.min(user.popularityScore * 8, 60); // min 120px, max 180px

  // Color intensity based on popularity
  const baseColor = user.popularityScore > 5 ? [239, 68, 68] : [37, 99, 235]; // red or blue
  const alpha = 0.2 + Math.min(user.popularityScore / 10, 0.7); // 0.2 to 0.9
  const bgColor = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${alpha})`;

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "HOBBY",
    drop: async (item: { hobby: string }) => {
      const updatedUser = await onAddHobby(item.hobby);
      setDisplayScore(updatedUser.popularityScore);
      setShowScore(true);
      setTimeout(() => setShowScore(false), 1500);
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));
  drop(ref);

  useEffect(() => {
    setDisplayScore(user.popularityScore);
    setShowScore(true);
    const timeout = setTimeout(() => setShowScore(false), 1500);
    return () => clearTimeout(timeout);
  }, [user.popularityScore]);

  return (
    <motion.div
      ref={ref}
      layout
      transition={{ layout: { type: "spring", stiffness: 200, damping: 25 } }}
      onClick={() => data.onNodeClick?.()}
      style={{
        padding: 10,
        border: "2px solid #333",
        borderRadius: 8,
        background: isOver ? "#f3f4f6" : bgColor,
        textAlign: "center",
        width: size,
        minWidth: 120,
        maxWidth: 180,
        position: "relative",
        pointerEvents: "all",
        userSelect: "none",
      }}
    >
      <strong>{user.username}</strong>
      <div>Age: {user.age}</div>

      <AnimatePresence>
        {showScore && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              top: 5,
              right: 5,
              background: "#111",
              color: "#fff",
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: 12,
            }}
          >
            Popularity: {displayScore}
          </motion.div>
        )}
      </AnimatePresence>

      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
    </motion.div>
  );
};

export default UserNode;
