import { TextField, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import apiService from '../API/apiService';
import {
  markFirstProject,
  replaceProjectId,
  updateActiveProjectId,
  updateProject,
} from '../redux/slices/ProjectSlices';

/**
 * EditableTypography
 *
 * A reusable component that allows inline editing of project title and description.
 * Supports initial editing state for new projects and updates Redux store on changes.
 *
 * @param {Number} projectId - ID of the project being edited.
 * @param {String} projectName - Current name of the project.
 * @param {String} projectDescription - Current description of the project.
 * @param {Boolean} isNewProject - Indicates if the project is newly created.
 * @param {Function} setIsNewProject - Callback to update the `isNewProject` state when editing completes.
 */
export const ProjectEditableTypography = ({
  projectId,
  projectName,
  projectDescription,
  isNewProject,
  setIsNewProject,
  titleStyle,
  descriptionStyle,
}) => {
  const dispatch = useDispatch();
  const hasSavedProjects = useSelector(
    (state) => state.projects.hasSavedProjects
  );

  // Local states for managing edit mode and temporary values
  const [isEditingProjectName, setIsEditingProjectName] = useState(
    isNewProject || false
  );
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedProjectName, setEditedProjectName] = useState(
    projectName || 'Untitled Project'
  );
  const [editedDescription, setEditedDescription] = useState(
    projectDescription || 'Add a project description...'
  );

  // Sync state with props whenever they change
  useEffect(() => {
    setEditedProjectName(projectName || 'Untitled Project');
    if (isNewProject && isEditingDescription) {
      setEditedDescription('');
    } else {
      setEditedDescription(
        projectDescription || 'Add a project description...'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectName, projectDescription, isNewProject]);

  // Update Redux store on blur
  const handleUpdateProject = (field, value) => {
    if (value.trim() === '') {
      // Fallback for empty input
      value =
        field === 'projectName'
          ? 'Untitled Project'
          : 'Add a project description...';
    }
    dispatch(
      updateProject({
        projectId: projectId,
        [field]: value,
      })
    );
  };

  // Handle key press for Enter
  const handleKeyPress = async (e, field) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      if (e.key === 'Tab') {
        e.preventDefault();
      }
      if (field === 'projectName') {
        const trimmedTitle = editedProjectName.trim() || 'Untitled Project';
        setEditedProjectName(trimmedTitle);
        setIsEditingProjectName(false);
        handleUpdateProject('projectName', trimmedTitle);
        if (isNewProject) {
          setIsEditingDescription(true);
        }
      } else if (field === 'projectDescription') {
        const trimmedDescription =
          editedDescription.trim() || 'Add a project description...';
        setEditedDescription(trimmedDescription);
        setIsEditingDescription(false);
        handleUpdateProject('projectDescription', trimmedDescription);
        if (isNewProject && trimmedDescription !== 'Enter project background') {
          setIsNewProject(false);
          const newProjectData = {
            project_name: editedProjectName,
            project_description: trimmedDescription,
            tasks: [],
          };
          const newProjectId = await handleCreateProject(newProjectData);

          dispatch(
            replaceProjectId({
              fakeProjectId: projectId,
              realProjectId: newProjectId,
            })
          );

          // Set the active project to the new project's ID
          dispatch(updateActiveProjectId(newProjectId));
        }
      }
    }
  };

  const handleCreateProject = async (projectData) => {
    if (!hasSavedProjects) dispatch(markFirstProject());
    try {
      // Call the createProject API
      const response = await apiService.createProject(projectData);

      // Extract the projectId from the API response
      const newProjectId = response.projectId;

      // Return the new projectId
      return newProjectId;
    } catch (err) {
      console.error('Error creating project:', err);

      // Handle the error or rethrow it
      throw err;
    }
  };

  return (
    <div>
      {/* Editable projectName */}
      {isEditingProjectName ? (
        <TextField
          value={editedProjectName}
          onKeyDown={(e) => handleKeyPress(e, 'projectName')}
          onChange={(e) => setEditedProjectName(e.target.value)}
          onBlur={() => {
            const trimmedProjectName =
              editedProjectName.trim() || 'Untitled Project';
            setEditedProjectName(trimmedProjectName);
            setIsEditingProjectName(false);
            handleUpdateProject('projectName', trimmedProjectName); // Update Redux
          }}
          autoFocus
          fullWidth
          variant="outlined"
          sx={{
            input: {
              fontSize: titleStyle?.fontSize || { xs: '1.2rem', md: '1.5rem' },
              color: titleStyle?.color || 'white',
              textAlign: titleStyle?.textAlign || 'center',
            },
          }}
        />
      ) : (
        <Typography
          variant="h4"
          color="white"
          gutterBottom
          sx={{
            textAlign: 'center',
            fontSize: { xs: '1.5rem', md: '2rem' },
            cursor: 'pointer',
            fontStyle: isNewProject ? 'italic' : 'inherit',
            ...titleStyle,
          }}
          onClick={() => {
            if (isNewProject) {
              setEditedProjectName('');
            }
            setIsEditingProjectName(true);
          }}
        >
          {editedProjectName}
        </Typography>
      )}

      {/* Editable Description */}
      {isEditingDescription ? (
        <TextField
          value={editedDescription}
          onKeyDown={(e) => handleKeyPress(e, 'projectDescription')}
          onChange={(e) => setEditedDescription(e.target.value)}
          onBlur={() => {
            const trimmedDescription =
              editedDescription.trim() || 'Add a project description...';
            setEditedDescription(trimmedDescription);
            setIsEditingDescription(false);
            handleUpdateProject('projectDescription', trimmedDescription); // Update Redux
          }}
          autoFocus
          fullWidth
          multiline
          variant="outlined"
          sx={{
            textarea: {
              fontSize: descriptionStyle?.fontSize || '1rem',
              color: descriptionStyle?.color || 'rgba(255, 255, 255, 0.7)',
              textAlign: descriptionStyle?.textAlign || 'center',
            },
          }}
        />
      ) : (
        <Typography
          variant="body1"
          color="rgba(255, 255, 255, 0.7)"
          textAlign="center"
          sx={{ cursor: 'pointer', ...descriptionStyle }}
          onClick={() => {
            setIsEditingDescription(true);
          }}
        >
          {editedDescription}
        </Typography>
      )}
    </div>
  );
};

ProjectEditableTypography.propTypes = {
  projectId: PropTypes.number.isRequired,
  projectName: PropTypes.string,
  projectDescription: PropTypes.string,
  isNewProject: PropTypes.bool,
  setIsNewProject: PropTypes.func.isRequired,
  titleStyle: PropTypes.shape({
    // Optional style overrides for the title
    fontSize: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), // e.g., '1.5rem' or { xs: '1rem', md: '1.5rem' }
    color: PropTypes.string, // Text color for the title
    textAlign: PropTypes.string, // Alignment of the title text
  }),
  descriptionStyle: PropTypes.shape({
    // Optional style overrides for the description
    fontSize: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), // e.g., '1rem' or { xs: '0.8rem', md: '1rem' }
    color: PropTypes.string, // Text color for the description
    textAlign: PropTypes.string, // Alignment of the description text
  }),
};

/**
 * TaskEditableTypography
 *
 * A reusable component that allows inline editing of task name and description.
 * Updates Redux store on changes and supports customizable styles.
 *
 * @param {Array<Number>} path - Path array representing the task location
 * @param {String} name - Current name of the task.
 * @param {String} description - Current description of the task.
 * @param {Function} onEdit - Callback to handle the edit, typically dispatching to Redux.
 * @param {Object} nameStyle - Optional custom styles for the task name.
 * @param {Object} descriptionStyle - Optional custom styles for the task description.
 */
export const TaskEditableTypography = ({
  path,
  name,
  description,
  onEdit,
  nameStyle,
  descriptionStyle,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedName, setEditedName] = useState(name || 'Untitled Task');
  const [editedDescription, setEditedDescription] = useState(
    description || 'Add a task description...'
  );

  useEffect(() => {
    setEditedName(name || 'Untitled Task');
    setEditedDescription(description || 'Add a task description...');
  }, [name, description]);

  const handleUpdate = (path, field, value) => {
    onEdit(path, field, value.trim());
  };

  const handleKeyPress = (e, field) => {
    if (e.key === 'Enter') {
      if (field === 'name') {
        setIsEditingName(false);
        handleUpdate(path, 'name', editedName);
      } else if (field === 'description') {
        setIsEditingDescription(false);
        handleUpdate(path, 'description', editedDescription);
      }
    }
  };

  return (
    <div>
      {/* Editable Name */}
      {isEditingName ? (
        <TextField
          value={editedName}
          onKeyDown={(e) => handleKeyPress(e, 'name')}
          onChange={(e) => setEditedName(e.target.value)}
          onBlur={() => {
            setIsEditingName(false);
            handleUpdate(path, 'name', editedName);
          }}
          autoFocus
          fullWidth
          variant="outlined"
          sx={{
            input: {
              fontSize: nameStyle?.fontSize || { xs: '1rem', md: '1.25rem' },
              color: nameStyle?.color || 'white',
              textAlign: nameStyle?.textAlign || 'left',
            },
          }}
        />
      ) : (
        <Typography
          variant="h6"
          color="white"
          gutterBottom
          sx={{
            cursor: 'pointer',
            fontSize: { xs: '1rem', md: '1.25rem' },
            ...nameStyle,
          }}
          onClick={() => setIsEditingName(true)}
        >
          {editedName}
        </Typography>
      )}

      {/* Editable Description */}
      {isEditingDescription ? (
        <TextField
          value={editedDescription}
          onKeyDown={(e) => handleKeyPress(e, 'description')}
          onChange={(e) => setEditedDescription(e.target.value)}
          onBlur={() => {
            setIsEditingDescription(false);
            handleUpdate(path, 'description', editedDescription);
          }}
          autoFocus
          fullWidth
          multiline
          variant="outlined"
          sx={{
            width: '100%',
            textarea: {
              fontSize: descriptionStyle?.fontSize || '0.875rem',
              color: descriptionStyle?.color || 'rgba(255, 255, 255, 0.7)',
              textAlign: descriptionStyle?.textAlign || 'left',
            },
          }}
        />
      ) : (
        <Typography
          variant="body2"
          color="rgba(255, 255, 255, 0.7)"
          sx={{
            cursor: 'pointer',
            fontSize: { xs: '0.875rem', md: '1rem' },
            ...descriptionStyle,
          }}
          onClick={() => setIsEditingDescription(true)}
        >
          {editedDescription}
        </Typography>
      )}
    </div>
  );
};

TaskEditableTypography.propTypes = {
  path: PropTypes.arrayOf(PropTypes.number).isRequired,
  name: PropTypes.string,
  description: PropTypes.string,
  onEdit: PropTypes.func.isRequired,
  nameStyle: PropTypes.object,
  descriptionStyle: PropTypes.object,
};
