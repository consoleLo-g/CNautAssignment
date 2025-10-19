import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface HobbyState {
  hobbies: string[];
}

const initialState: HobbyState = {
  hobbies: ['Reading', 'Gaming', 'Music', 'Sports', 'Cooking', 'Traveling', 'Art'],
};

const hobbySlice = createSlice({
  name: 'hobbies',
  initialState,
  reducers: {
    addHobby: (state, action: PayloadAction<string>) => {
      if (!state.hobbies.includes(action.payload)) state.hobbies.push(action.payload);
    },
  },
});

export const { addHobby } = hobbySlice.actions;
export default hobbySlice.reducer;
