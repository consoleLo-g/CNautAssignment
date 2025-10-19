import React from "react";
import { getBezierPath, type EdgeProps } from "reactflow";
import { motion, AnimatePresence } from "framer-motion";

export const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const [edgePath] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });

  return (
    <AnimatePresence>
      <motion.path
        key={id}
        layout
        d={edgePath}
        stroke={style.stroke || "#2563eb"}
        strokeWidth={style.strokeWidth || 2.5}
        fill="none"
        markerEnd={markerEnd}
        style={{ ...style, filter: "drop-shadow(0 0 2px rgba(0,0,0,0.3))" }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        exit={{ pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </AnimatePresence>
  );
};
