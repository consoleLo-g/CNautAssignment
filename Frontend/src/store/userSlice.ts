// src/store/userSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface User {
  id: string;
  username: string;
  age: number;
  popularityScore: number;
  hobbies: string[];
  friends: string[];
}

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
};

export const API_BASE = import.meta.env.VITE_API_BASE as string;
// Fetch all users
export const fetchUsers = createAsyncThunk<User[]>("users/fetchUsers", async () => {
  const res = await axios.get(`${API_BASE}/users`);
  return res.data.map((u: any) => ({
    id: u.id,
    username: u.username,
    age: u.age,
    friends: u.friends || [],
    hobbies: (u.hobbies || []).filter(Boolean),
    popularityScore: u.popularityScore,
  }));
});

// Create user
export const createUser = createAsyncThunk<User, Omit<User, "id" | "popularityScore" | "friends">>(
  "users/createUser",
  async (user) => {
    const res = await axios.post(`${API_BASE}/users`, user);
    const u = res.data;
    return {
      id: u.id,
      username: u.username,
      age: u.age,
      hobbies: u.hobbies || [],
      friends: [],
      popularityScore: u.popularityScore,
    };
  }
);

// Update user details
export const updateUser = createAsyncThunk<User, { id: string; patch: Partial<User> }>(
  "users/updateUser",
  async ({ id, patch }) => {
    const res = await axios.put(`${API_BASE}/users/${id}/details`, patch);
    const u = res.data;
    return {
      id: u.id,
      username: u.username,
      age: u.age,
      friends: u.friends || [],
      hobbies: (u.hobbies || []).filter(Boolean),
      popularityScore: u.popularityScore,
    };
  }
);

// Delete user
export const deleteUser = createAsyncThunk<string, string>("users/deleteUser", async (id) => {
  await axios.delete(`${API_BASE}/users/${id}`);
  return id;
});

// Add hobby
export const addHobbyToUser = createAsyncThunk<User, { id: string; hobby: string }>(
  "users/addHobbyToUser",
  async ({ id, hobby }) => {
    const res = await axios.patch(`${API_BASE}/users/${id}/hobbies`, { hobby });
    const u = res.data;
    return {
      id: u.id,
      username: u.username,
      age: u.age,
      friends: u.friends || [],
      hobbies: (u.hobbies || []).filter(Boolean),
      popularityScore: u.popularityScore,
    };
  }
);

// Link / unlink friends
export const addFriend = createAsyncThunk<User, { sourceId: string; targetId: string }>(
  "users/addFriend",
  async ({ sourceId, targetId }) => {
    const res = await axios.post(`${API_BASE}/users/${sourceId}/link`, null, { params: { friendId: targetId } });
    const u = res.data;
    return {
      id: u.id,
      username: u.username,
      age: u.age,
      friends: u.friends || [],
      hobbies: u.hobbies || [],
      popularityScore: u.popularityScore,
    };
  }
);

export const removeFriend = createAsyncThunk<{ id: string; friendId: string }, { id: string; friendId: string }>(
  "users/removeFriend",
  async ({ id, friendId }) => {
    await axios.delete(`${API_BASE}/users/${id}/unlink`, { params: { friendId } });
    return { id, friendId };
  }
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<User[]>) {
      state.users = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchUsers.pending, (s) => { s.loading = true; })
      .addCase(fetchUsers.fulfilled, (s, a) => { s.loading = false; s.users = a.payload; })
      .addCase(fetchUsers.rejected, (s, a) => { s.loading = false; s.error = a.error.message || "Failed to fetch"; })

      // create
      .addCase(createUser.fulfilled, (s, a) => { s.users.push(a.payload); })
      .addCase(createUser.rejected, (s, a) => { s.error = a.error.message || "Failed to create user"; })

      // update
      .addCase(updateUser.fulfilled, (s, a) => {
        const idx = s.users.findIndex((u) => u.id === a.payload.id);
        if (idx >= 0) s.users[idx] = a.payload;
      })

      // delete
      .addCase(deleteUser.fulfilled, (s, a) => {
        s.users = s.users.filter((u) => u.id !== a.payload);
      })

      // add hobby
      .addCase(addHobbyToUser.fulfilled, (s, a) => {
        const idx = s.users.findIndex((u) => u.id === a.payload.id);
        if (idx >= 0) s.users[idx] = a.payload;
      })

      // friends
      .addCase(addFriend.fulfilled, (s, a) => {
        const idx = s.users.findIndex((u) => u.id === a.payload.id);
        if (idx >= 0) s.users[idx] = a.payload;
      })
      .addCase(removeFriend.fulfilled, (s, a) => {
        const { id, friendId } = a.payload;
        const user = s.users.find((u) => u.id === id);
        if (user) user.friends = user.friends.filter((f) => f !== friendId);
      });
  },
});

export const { setUsers } = userSlice.actions;
export default userSlice.reducer;
