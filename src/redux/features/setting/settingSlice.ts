import { createSlice } from "@reduxjs/toolkit";

export interface SettingState {
  global: {
    project_name: string;
  } | null;
}

const initialState: SettingState = {
  global: {
    project_name: "XYZ",
  },
};

export const settingSlice = createSlice({
  name: "setting",
  initialState,
  reducers: {
    addProjectName: (state: any, action) => {
      state.global.project_name = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { addProjectName } = settingSlice.actions;

export default settingSlice.reducer;
