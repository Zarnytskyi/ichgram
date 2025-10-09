import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import postSlice from './slices/postSlice.js';
import likeSlice from './slices/likeSlice.js';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['likes'], 
};

const rootReducer = combineReducers({
  posts: postSlice,
  likes: likeSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);