/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/TaskManager/TaskManager.jsx
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';
import { Box, Button } from '@mui/material';
import { Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import apiService from '../API/apiService';
import {
  fetchProjects,
  updateActiveProjectId,
} from '../redux/slices/ProjectSlices';
import ProjectDetails from './ProjectDetails';
import TaskSidebar from './TaskSidebar';

const SettingsDropdown = () => {
  const navigate = useNavigate();
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button className="bg-transparent shadow-none hover:bg-gray-700 p-2 rounded-full">
          <Settings className="fill-[#FFD700] text-blue-950 w-6 h-6" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Settings"
        className="bg-gray-700 text-white shadow-lg rounded-md"
      >
        <DropdownItem
          key="logout"
          onPress={() => {
            apiService.logout();
            navigate('/');
          }}
          className="hover:bg-gray-700 text-white px-4 py-2 rounded-md"
        >
          Log Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

const TaskManager = () => {
  const dispatch = useDispatch();
  const projects = useSelector((state) => state.projects.data);
  const hasSavedProjects = useSelector(
    (state) => state.projects.hasSavedProjects
  );
  const { status, error } = useSelector((state) => state.projects);
  const [isNewProject, setIsNewProject] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const activeProjectId = useSelector(
    (state) => state.projects.activeProjectId
  );

  const activeProject = useSelector((state) =>
    state.projects.data.find(
      (project) => project.projectId === state.projects.activeProjectId
    )
  );

  // TODO: We need a state in tasks and projects called isSaved
  //       because we need a way to enforce completion of prompts

  const handleSetActiveProject = (projectId) => {
    dispatch(updateActiveProjectId(projectId));
  };

  // Set isNewProject based on hasSavedProjects only when hasSavedProjects changes
  useEffect(() => {
    if (status === 'succeeded' && !hasSavedProjects) {
      setIsNewProject(true);
    }
  }, [status, hasSavedProjects]);

  // TODO: Create actual components for these pages
  if (status === 'loading') return <div>Loading projects...</div>;
  if (status === 'failed') return <div>Error: {error}</div>;

  // TODO: Need a login page for if the JWT token expires

  return (
    <>
      <div className="fixed top-8 right-6 z-50">
        <SettingsDropdown />
      </div>
      {/* Main Content */}
      <Box
        className="bg-gradient-to-t from-blue-950 via-blue-950 to-black"
        sx={{
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
          backdropFilter: 'blur(15px)',
        }}
      >
        {/* Left Sidebar */}
        <TaskSidebar
          projects={projects}
          activeProjectId={activeProjectId}
          setActiveProjectId={handleSetActiveProject}
          isNewProject={isNewProject}
          setIsNewProject={setIsNewProject}
        />

        {/* Center Task Diagram */}
        <ProjectDetails
          activeProject={activeProject}
          isNewProject={isNewProject}
          setIsNewProject={setIsNewProject}
        />

        {/* Right Sidebar (Timeline and Export Buttons) */}
        {/* <Box
          sx={{
            width: '20%',
            bgcolor: 'rgba(30, 30, 60, 0.9)',
            backdropFilter: 'blur(15px)',
            p: 4,
          }}
        >
          <Typography variant="h6" color="white" gutterBottom>
            Project Timeline
          </Typography>
          <ProjectTimeline activeProject={activeProject} />

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              fullWidth
              sx={{
                bgcolor: '#FFD700',
                color: 'black',
                fontWeight: 'bold',
                mb: 2,
                '&:hover': { bgcolor: '#FFC107' },
              }}
            >
              Export to TXT
            </Button>
            <Button
              variant="contained"
              fullWidth
              sx={{
                bgcolor: '#FFD700',
                color: 'black',
                fontWeight: 'bold',
                '&:hover': { bgcolor: '#FFC107' },
              }}
            >
              Export to PDF
            </Button>
          </Box>
        </Box> */}
      </Box>
    </>
  );
};

export default TaskManager;
