import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  likedPostIds: {},
};

const likeSlice = createSlice({
  name: 'likes',
  initialState,
  reducers: {
    toggleLike: (state, action) => {
      const postId = action.payload;
      if (state.likedPostIds[postId]) {
        delete state.likedPostIds[postId];
      } else {
        state.likedPostIds[postId] = true;
      }
    },
    clearLikes: (state) => {
      state.likedPostIds = {};
    },
  },
});

export const { toggleLike, clearLikes } = likeSlice.actions;
export default likeSlice.reducer;