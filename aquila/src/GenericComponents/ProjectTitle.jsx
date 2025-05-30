import { Textarea } from '@heroui/react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateProject } from '../redux/slices/ProjectSlices';

const ProjectTitle = ({
  projectId,
  projectName,
  projectDescription,
  isNewProject,
  setIsNewProject,
  scrollToBottom,
}) => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState(projectName || 'Untitled Project');
  const [description, setDescription] = useState(
    projectDescription || 'Add a project description...'
  );
  const [isEditingTitle, setIsEditingTitle] = useState(isNewProject);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const handleUpdate = (field, value) => {
    const trimmedValue =
      value.trim() ||
      (field === 'projectName'
        ? 'Untitled Project'
        : 'Add a project description...');
    dispatch(updateProject({ projectId, [field]: trimmedValue }));
  };

  const handleKeyPress = async (e, field) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      if (e.key === 'Tab') e.preventDefault();
      if (field === 'projectName') {
        setIsEditingTitle(false);
        handleUpdate('projectName', title);
        if (isNewProject) setIsEditingDescription(true);
      } else if (field === 'projectDescription') {
        setIsEditingDescription(false);
        handleUpdate('projectDescription', description);
        if (isNewProject) {
          setIsNewProject(false);
        }
      }
    }
  };

  return (
    <div className="w-[90%] border border-gray-600 rounded-lg p-4 flex flex-col items-left bg-gray-800 shadow-lg">
      {/* Editable Project Name */}
      <Textarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => handleUpdate('projectName', title)}
        onKeyDown={(e) => handleKeyPress(e, 'projectName')}
        placeholder="Enter project title"
        className="w-full bg-transparent text-white text-lg font-bold border-none focus:ring-0 focus:outline-none"
        autoFocus={isEditingTitle}
        maxRows={1}
      />

      {/* Editable Project Description */}
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={() => handleUpdate('projectDescription', description)}
        onKeyDown={(e) => handleKeyPress(e, 'projectDescription')}
        placeholder="Add a project background..."
        className="w-full bg-transparent text-gray-300 text-sm border-none focus:ring-0 focus:outline-none"
        autoFocus={isEditingDescription}
        maxRows={3}
      />
    </div>
  );
};

export default ProjectTitle;
