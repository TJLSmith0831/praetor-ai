// src/components/TaskManager/TaskSidebar.jsx
import { ChevronLeft, ChevronRight, Delete } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import apiService from '../API/apiService';
import { addProject, deleteProject } from '../redux/slices/ProjectSlices';

const TaskSidebar = (props) => {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    setIsNewProject,
    isNewProject,
  } = props;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const calculateProjectProgress = (project) => {
    let totalTasks = 0;
    let completedTasks = 0;

    // Helper function to recursively count tasks
    const countTasks = (tasks) => {
      tasks.forEach((task) => {
        totalTasks += 1;
        if (task.completed) {
          completedTasks += 1;
        }
        // Check for nested tasks
        if (task.tasks && task.tasks.length > 0) {
          countTasks(task.tasks);
        }
      });
    };

    if (project.tasks && project.tasks.length > 0) {
      countTasks(project.tasks);
    }

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };
  const dispatch = useDispatch();

  const handleAddProject = () => {
    const newProject = {
      projectId: 5000,
      projectName: 'Enter Project Title',
      projectDescription: 'Enter project background',
      updatedAt: new Date().toISOString().split('T')[0],
      tasks: [],
    };
    setActiveProjectId(newProject.projectId);
    setIsNewProject(true);
    dispatch(addProject(newProject));
  };

  const handleDeleteProject = async (projectId) => {
    try {
      // Call the deleteProject API
      if (!isNewProject) await apiService.deleteProject(projectId);

      // Dispatch Redux action to update state
      dispatch(deleteProject(projectId));

      if (projectId === activeProjectId) {
        const projectIndex = projects.findIndex(
          (project) => project.projectId === activeProjectId
        );

        if (projects.length === 1) {
          // If no projects remain, add a new project
          handleAddProject();
        } else {
          // Determine the next active project
          let nextProjectId = null;

          if (projectIndex < projects.length - 1) {
            // If there’s a project after the current one, switch to it
            nextProjectId = projects[projectIndex + 1].projectId;
          } else {
            // Otherwise, switch to the previous project
            nextProjectId = projects[projectIndex - 1].projectId;
          }

          setActiveProjectId(nextProjectId);
        }
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <Box
      component="aside"
      sx={{
        width: isCollapsed ? '64px' : 'min(20%, 300px)',
        bgcolor: 'rgba(30, 30, 60, 0.7)',
        backdropFilter: 'blur(15px)',
        minHeight: '90vh',
        position: 'relative',
        transition: 'width 0.3s',
        borderRight: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      <IconButton
        sx={{
          position: 'absolute',
          top: '50%',
          right: '-16px',
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(255, 215, 0, 0.9)',
          '&:hover': { bgcolor: 'rgba(255, 215, 0, 1)' },
          zIndex: 10,
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
      </IconButton>

      {!isCollapsed && (
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" color="white" gutterBottom>
            Projects
          </Typography>

          <Box
            sx={{
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 120px)',
              pr: 1,
            }}
          >
            {projects.map((project) => {
              const projectUpdatedAtTime = new Date(
                project.updatedAt
              ).toLocaleString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              });
              const projectUpdatedAtDate = new Date(
                project.updatedAt
              ).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: '2-digit',
              });

              return (
                <Box
                  key={project.projectId}
                  sx={{
                    position: 'relative', // Enable absolute positioning for children
                    p: '1rem',
                    mb: '1rem',
                    bgcolor: 'rgba(40, 40, 70, 0.8)',
                    border:
                      activeProjectId === project.projectId
                        ? '2px solid'
                        : '0px',
                    borderColor:
                      activeProjectId === project.projectId
                        ? '#FFD700'
                        : 'inherit',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(40, 40, 70, 1)' },
                  }}
                  onClick={() => setActiveProjectId(project.projectId)}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.projectId);
                    }}
                  >
                    <Delete
                      sx={{
                        color: '#FFD700', // Gold color
                        fontSize: { xs: '0.5rem', sm: '1rem', md: '1.5rem' },
                      }}
                    />
                  </Box>

                  {/* Progress Donut */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: { xs: '0', sm: '48px' },
                      height: { xs: '0', sm: '48px' },
                      mr: { xs: 0, sm: '1rem' },
                      display: { xs: 'none', sm: 'block' },
                    }}
                  >
                    <CircularProgress
                      variant="determinate"
                      value={calculateProjectProgress(project)}
                      sx={{ color: '#FFD700' }}
                      size="100%"
                      thickness={5}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        fontWeight: 'bold',
                        display: { xs: 'block', sm: 'block' },
                        fontSize: { xs: '0.8rem', sm: '1rem' },
                      }}
                    >
                      {`${calculateProjectProgress(project)}%`}
                    </Typography>
                  </Box>

                  {/* Project Details */}
                  <Box
                    sx={{
                      flex: 1,
                      textAlign: 'center',
                      width: '100%',
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      color="white"
                      noWrap
                      sx={{
                        fontSize: 'clamp(0.5rem, 4vw, 1rem)', // Dynamically scale font size
                      }}
                    >
                      {project.projectName}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="white"
                      sx={{
                        fontSize: 'clamp(0.5rem, 2.5vw, 0.75rem)',
                        display: 'block',
                        mt: '0.5rem',
                      }}
                    >
                      {`Last Updated ${projectUpdatedAtDate} at ${projectUpdatedAtTime}`}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* New Project Button */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
            }}
          >
            <Button
              variant="contained"
              fullWidth
              sx={{
                bgcolor: '#FFD700',
                color: 'black',
                fontWeight: 'bold',
                '&:hover': { bgcolor: '#FFC107' },
              }}
              onClick={() => {
                if (isNewProject) return;
                handleAddProject();
              }}
            >
              New Project
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TaskSidebar;
