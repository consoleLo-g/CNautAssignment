import React, { useEffect, useState, useMemo, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  MarkerType,
  type Edge,
  type Connection,
  BackgroundVariant,
  type NodeChange,
  type EdgeChange,
  Position,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  createUser,
  addFriend,
  addHobbyToUser,
  type User,
} from "../store/userSlice";
import type { AppDispatch, RootState } from "../store";
import dagre from "dagre";

import UserNode from "./UserNode";
import HighScoreNode from "./HighScoreNode";
import LowScoreNode from "./LowScoreNode";
import UserDetailSidebar from "./UserDetailSidebar";
import UserForm from "./UserForm";
import { CustomEdge } from "./EdgeTypes";
import { toast } from "react-toastify";

const nodeTypes = {
  highScoreNode: HighScoreNode,
  lowScoreNode: LowScoreNode,
  userNode: UserNode,
};

// Helpers
const getNodeColor = (popularityScore: number, seed: string) => {
  const hue = parseInt(seed.slice(-2), 16) % 360;
  const lightness = 60 + Math.min(popularityScore * 5, 30);
  return `hsl(${hue}, 70%, ${lightness}%)`;
};

const getNodeSize = (popularityScore: number) => ({
  width: 120 + popularityScore * 8,
  height: 40 + popularityScore * 4,
});

const Graph: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading } = useSelector((state: RootState) => state.users);
  const [nodes, setNodes, onNodesChangeBase] = useNodesState<Node<any, string>[]>([]);
  const [edges, setEdges, onEdgesChangeBase] = useEdgesState<Edge[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [history, setHistory] = useState<{ nodes: Node<any, string>[]; edges: Edge[] }[]>([]);
  const [_redoStack, setRedoStack] = useState<typeof history>([]);

  const selectedUser = useMemo(
    () => users.find(u => u.id === selectedUserId) || null,
    [selectedUserId, users]
  );

  const pushHistory = useCallback((newNodes: Node<any, string>[], newEdges: Edge[]) => {
    setHistory(prev => [...prev.slice(-9), { nodes: newNodes, edges: newEdges }]);
    setRedoStack([]);
  }, []);

  useEffect(() => {
    dispatch(fetchUsers()).catch(() => toast.error("Failed to load users"));
  }, [dispatch]);

  const getDagreLayout = useCallback((usersList: User[], edgesList: Edge[]) => {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: "LR", ranksep: 120, nodesep: 80 });

    usersList.forEach(u => {
      const { width, height } = getNodeSize(u.popularityScore);
      g.setNode(u.id, { width, height });
    });

    edgesList.forEach(e => g.setEdge(e.source, e.target));
    dagre.layout(g);

    return usersList.map(u => {
      const n = g.node(u.id);
      const bgColor = getNodeColor(u.popularityScore, u.id);
      const { width, height } = getNodeSize(u.popularityScore);
      const yOffset = (Math.random() - 0.5) * 50;

      return {
        id: u.id,
        type: u.popularityScore > 5 ? "highScoreNode" : "lowScoreNode",
        data: {
          user: u,
          bgColor,
          width,
          height,
          onNodeClick: () => setSelectedUserId(u.id),
          onAddHobby: async (hobby: string) => {
            try {
              const updatedUser = await dispatch(addHobbyToUser({ id: u.id, hobby })).unwrap();
              return updatedUser;
            } catch (err: any) {
              toast.error(err.message || "Failed to add hobby");
              return u;
            }
          },
        },
        position: { x: n.x - width / 2, y: n.y - height / 2 + yOffset },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      } as Node<any, string>;
    });
  }, [dispatch]);

  useEffect(() => {
    if (!users?.length) return;

    const newEdges: Edge[] = [];
    const seen = new Set<string>();
    users.forEach(u => {
      (u.friends || []).forEach(fid => {
        if (!users.some(f => f.id === fid)) return;
        const key = [u.id, fid].sort().join("-");
        if (!seen.has(key)) {
          seen.add(key);
          newEdges.push({
            id: key,
            source: u.id,
            target: fid,
            type: "default",
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: "#2563eb", strokeWidth: 2.5 },
          });
        }
      });
    });

    const layoutedNodes = getDagreLayout(users, newEdges);

    setNodes(prev =>
      layoutedNodes.map(newNode => {
        const existing = prev.find(n => n.id === newNode.id);
        return {
          ...newNode,
          position: existing?.position || newNode.position,
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          data: { ...newNode.data },
        };
      })
    );

    setEdges(prev => {
      const updated = prev.filter(pe => newEdges.find(ne => ne.id === pe.id));
      newEdges.forEach(ne => {
        if (!updated.find(e => e.id === ne.id)) updated.push(ne);
      });
      return updated;
    });

    pushHistory(layoutedNodes, newEdges);
  }, [users, getDagreLayout, pushHistory]);

  const onConnect = async (params: Edge | Connection) => {
    if ("source" in params && "target" in params && params.source && params.target) {
      try {
        await dispatch(addFriend({ sourceId: params.source, targetId: params.target })).unwrap();
        toast.success("Friend connected successfully!");
        dispatch(fetchUsers());
      } catch (err: any) {
        toast.error(err.message || "Failed to connect users");
      }
    }
  };

  const onNodesChange = useCallback((changes: NodeChange[]) => onNodesChangeBase(changes), [onNodesChangeBase]);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => onEdgesChangeBase(changes), [onEdgesChangeBase]);

  return (
    <div style={{ flex: 1, display: "flex", minHeight: 0, flexDirection: "row" }}>
      {/* Graph container */}
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        {loading && <div style={{ padding: 20 }}>Loading users...</div>}

        {!selectedUser && !showAddUserForm && (
          <button
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 10,
              padding: "8px 12px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
              fontSize: window.innerWidth < 425 ? 12 : 14,
            }}
            onClick={() => setShowAddUserForm(true)}
          >
            + Add User
          </button>
        )}

        {showAddUserForm && (
          <div
            style={{
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
              zIndex: 2000,
              padding: 10,
            }}
          >
            <div style={{ width: window.innerWidth < 425 ? "95%" : 400, maxWidth: "90%" }}>
              <UserForm
                onClose={() => setShowAddUserForm(false)}
                onSubmit={async data => {
                  try {
                    await dispatch(createUser({ ...data, age: Number(data.age), hobbies: data.hobbies || [] })).unwrap();
                    toast.success("User added successfully!");
                    setShowAddUserForm(false);
                  } catch (err: any) {
                    toast.error(err.message || "Failed to add user");
                  }
                }}
              />
            </div>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={{ default: CustomEdge }}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_event, node) => setSelectedUserId(node.id)}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          style={{
            width: "100%",
            height: "100%",
            minHeight: 400,
            flex: 1,
          }}
        >
          <MiniMap nodeColor={n => n.data?.bgColor || "#ccc"} maskColor="rgba(0,0,0,0.05)" />
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} />
        </ReactFlow>
      </div>

      {/* Sidebar container */}
      {selectedUser && (
        <div style={{ width: window.innerWidth < 425 ? "100%" : 320 }}>
          <UserDetailSidebar user={selectedUser} onClose={() => setSelectedUserId(null)} />
        </div>
      )}
    </div>
  );
};

export default Graph;
