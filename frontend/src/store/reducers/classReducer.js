import { createSlice } from '@reduxjs/toolkit';

const classSlice = createSlice({
  name: 'classinfo',
  initialState: {
    department: null,
    batchYear: null,
  },
  reducers: {
    setDepartmentState: (state, action) => {
      state.department = action.payload.department;
    },
    setBatchYearState: (state, action) => {
      state.batchYear = action.payload.batchYear;
    },
    clearClassInfo: (state) => {
      state.department = null;
      state.batchYear = null;
    },
  },
});

export const { setDepartmentState, setBatchYearState, clearClassInfo } = classSlice.actions;

export default classSlice.reducer;

