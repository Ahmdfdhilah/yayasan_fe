// src/redux/reducers.ts
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/redux/features/authSlice';
import themeReducer from '@/redux/features/themeSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer
});

export type RootReducer = ReturnType<typeof rootReducer>;