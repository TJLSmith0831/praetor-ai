import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiService from '../../API/apiService';
import { firstProject } from '../_const';

// Fetch projects from API
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      let projects = await apiService.getProjects();
      projects.forEach((project) => {
        if (typeof project.tasks !== 'object') {
          project.tasks = JSON.parse(project.tasks);
        }
      });
      return projects; // Return fetched projects
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      return rejectWithValue(error.message || 'Failed to fetch projects');
    }
  }
);

// Async Thunk for updating the project
export const updateProjectAsync = createAsyncThunk(
  'projects/updateProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const message = await apiService.updateProject(projectData);
      return message;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update project');
    }
  }
);

const resolveTaskPath = (state, path) => {
  // Validate path
  if (!Array.isArray(path) || path.some((p) => typeof p !== 'number')) {
    throw new Error(`Invalid path provided: ${JSON.stringify(path)}`);
  }

  // Find the active project
  const activeProject = state.data.find(
    (project) => project.projectId === state.activeProjectId
  );

  if (!activeProject) {
    throw new Error('Active project not found.');
  }

  // Traverse the `path` to locate the target `tasks` array or task
  let currentTask = activeProject.tasks;
  for (let i = 0; i < path.length; i++) {
    if (!currentTask[path[i]]) {
      throw new Error(`Invalid path at index ${i}: ${JSON.stringify(path)}`);
    }
    currentTask = currentTask[path[i]].tasks;
  }

  return { activeProject, currentTask };
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    data: [],
    hasSavedProjects: false,
    activeProjectId: null,
    status: 'loading', // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {
    updateActiveProjectId(state, action) {
      state.activeProjectId = action.payload;
    },
    addProject: (state, action) => {
      state.data.push(action.payload);
    },
    replaceProjectId: (state, action) => {
      const { fakeProjectId, realProjectId } = action.payload;
      const projectIndex = state.data.findIndex(
        (p) => p.projectId === fakeProjectId
      );
      if (projectIndex !== -1) {
        state.data[projectIndex].projectId = realProjectId;
      }
    },
    updateProject: (state, action) => {
      const { projectId, ...updatedFields } = action.payload;
      const projectIndex = state.data.findIndex(
        (p) => p.projectId === projectId
      );
      if (projectIndex !== -1) {
        state.data[projectIndex] = {
          ...state.data[projectIndex],
          ...updatedFields, // Apply only updated fields
        };
      }
    },
    deleteProject: (state, action) => {
      state.data = state.data.filter((p) => p.projectId !== action.payload);
    },
    editTask: (state, action) => {
      const { path, field, value } = action.payload;

      const { activeProject, currentTask } = resolveTaskPath(
        state,
        path.slice(0, -1)
      );

      // Update the target task
      const targetIndex = path[path.length - 1];
      if (!currentTask[targetIndex]) {
        throw new Error(`Target task not found at index: ${targetIndex}`);
      }

      currentTask[targetIndex] = {
        ...currentTask[targetIndex],
        [field]: value,
      };

      // Trigger the API call
      const projectData = {
        project_id: activeProject.projectId,
        project_name: activeProject.projectName,
        project_description: activeProject.projectDescription,
        tasks: activeProject.tasks, // Updated tasks array
      };
      apiService
        .updateProject(projectData)
        .catch((err) => console.error('Error updating project:', err));
    },
    deleteTask: (state, action) => {
      const { path } = action.payload;

      const { activeProject, currentTask } = resolveTaskPath(
        state,
        path.slice(0, -1)
      );

      // Get the index of the task to delete
      const indexToDelete = path[path.length - 1];

      // Ensure the target task exists
      if (!Array.isArray(currentTask) || !currentTask[indexToDelete]) {
        throw new Error(
          `Task to delete not found at path: ${JSON.stringify(path)}`
        );
      }

      // Delete the task
      currentTask.splice(indexToDelete, 1);

      // Trigger the API call
      const projectData = {
        project_id: activeProject.projectId,
        project_name: activeProject.projectName,
        project_description: activeProject.projectDescription,
        tasks: activeProject.tasks, // Updated tasks array
      };
      apiService
        .updateProject(projectData)
        .catch((err) => console.error('Error updating project:', err));
    },
    addTask: (state, action) => {
      const { path, newTask, projectId } = action.payload;

      const { activeProject, currentTask } = resolveTaskPath(state, path);

      // Add the new task to the located `tasks` array
      if (!Array.isArray(currentTask)) {
        throw new Error('Target task does not have a tasks array.');
      }

      currentTask.push(newTask);

      // TODO: Can't save more than one task. Can't save nested tasks
      // Trigger the API call
      const projectData = {
        project_id: projectId,
        project_name: activeProject.projectName,
        project_description: activeProject.projectDescription,
        tasks: activeProject.tasks, // Updated tasks array
      };
      apiService
        .updateProject(projectData)
        .catch((err) => console.error('Error updating project:', err));
    },
    markFirstProject: (state) => {
      state.hasSavedProjects = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;

        // If this is the user's first project, we want to inject the
        // default first project
        if (state.data.length === 0) {
          state.data.push(firstProject);
        } else {
          state.hasSavedProjects = true;
        }
        state.activeProjectId = state.data[0]?.projectId || null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch projects';
      });
  },
});

export const {
  addProject,
  updateProject,
  replaceProjectId,
  deleteProject,
  updateActiveProjectId,
  editTask,
  addTask,
  deleteTask,
  markFirstProject,
} = projectsSlice.actions;
export default projectsSlice.reducer;
