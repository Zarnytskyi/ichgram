import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  posts: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    addPost: (state, action) => {
      state.posts.unshift(action.payload);
    },
    setPosts: (state, action) => {
        state.posts = action.payload;
        state.status = 'succeeded';
    }
  },
});

export const { addPost, setPosts } = postSlice.actions;
export default postSlice.reducer;