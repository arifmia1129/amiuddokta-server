import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./features/user/userSlice";
import settingSlice from "./features/setting/settingSlice";
import { siteApi } from "./api/siteApi";

export const store = configureStore({
  reducer: {
    user: userSlice,
    setting: settingSlice,
    [siteApi.reducerPath]: siteApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(siteApi.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
