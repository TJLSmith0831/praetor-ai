import { configureStore } from '@reduxjs/toolkit';
import ProjectsReducer from './slices/ProjectSlices';

const store = configureStore({
  reducer: {
    projects: ProjectsReducer, // Add reducers here
  },
});

export default store;
