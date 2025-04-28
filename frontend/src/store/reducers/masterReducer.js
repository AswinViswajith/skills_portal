import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "showMasterData",
  initialState: {
    showMasterData: false,
  },
  reducers: {
    toggleMasterData: (state) => {
      state.showMasterData = !state.showMasterData;
    },
  },
});

export const { toggleMasterData } = uiSlice.actions;
export default uiSlice.reducer;

