import React from "react";
import UserNode from "./UserNode";
import type { NodeProps } from "reactflow";

const LowScoreNode: React.FC<NodeProps<any>> = (props) => {
  return (
    <div style={{ transition: "transform 400ms ease" }}>
      <UserNode {...props} />
    </div>
  );
};

export default LowScoreNode;
