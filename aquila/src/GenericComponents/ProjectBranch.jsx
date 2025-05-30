import { Button, Textarea } from '@heroui/react';
import { motion } from 'framer-motion';
import { Check, Plus, Star, Trash, Wand, X } from 'lucide-react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addTask, deleteTask, editTask } from '../redux/slices/ProjectSlices';

/**
 * ProjectBranchActionButtonGroup Component
 *
 * A component that provides an interactive set of action buttons for task management,
 * displayed around a central button when hovered.
 *
 * Features:
 * - Central `DeviceHub` button that shows a hoverable gray circle and expands on hover.
 * - Four interactive action buttons positioned in a compass layout:
 *   - **North**: Toggles task completion (Check/Cancel button).
 *   - **East**: Adds a new subtask (Add button).
 *   - **South**: Atomizes a task (custom Atomize button).
 *   - **West**: Deletes the current task (Delete button).
 *
 * Props:
 * @param {boolean} completed - Indicates if the task is completed. Changes the toggle button's state and color.
 * @param {Function} onComplete - Callback invoked when the "Complete" button is clicked.
 * @param {Function} onAddTask - Callback invoked when the "Add Task" button is clicked.
 * @param {Function} onAtomize - Callback invoked when the "Atomize" button is clicked.
 * @param {Function} onDelete - Callback invoked when the "Delete" button is clicked.
 *
 * State:
 * @state {boolean} isHovered - Tracks if the mouse is hovering over the component, enabling the action buttons.
 *
 * Styling:
 * - Expands a gray circular hover area centered on the `DeviceHub` button for user interaction.
 * - Each action button has custom hover effects and color schemes based on its functionality.
 *
 * Usage:
 * This component is designed to be embedded within a task card or project branch component,
 * providing contextual task management options.
 */

const ProjectBranchActionButtonGroup = ({
  completed,
  onComplete,
  onAddTask,
  onAtomize,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative flex items-center">
      {/* Center Star Button */}
      <Button
        size="sm"
        className={`${
          isExpanded
            ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
        } rounded-full p-2 transition-colors duration-200`}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Star size={16} />
      </Button>

      {/* Animated Action Buttons */}
      <motion.div
        className="absolute flex gap-2 right-full ml-2"
        initial={{ opacity: 0, x: 0 }}
        animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? '-20%' : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        {/* Complete Task */}
        <Button
          size="sm"
          onPress={() => {
            onComplete();
            setIsExpanded(false);
          }}
          className={`bg-${completed ? 'gray-500' : 'green-600'} hover:bg-${completed ? 'gray-400' : 'green-500'} text-white rounded-full p-2`}
        >
          {completed ? <X size={16} /> : <Check size={16} />}
        </Button>

        {/* Add Task */}
        <Button
          size="sm"
          onPress={() => {
            onAddTask();
            setIsExpanded(false);
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-2"
        >
          <Plus size={16} />
        </Button>

        {/* Atomize Task */}
        <Button
          size="sm"
          onPress={() => {
            onAtomize();
            setIsExpanded(false);
          }}
          className="bg-purple-600 hover:bg-purple-500 text-white rounded-full p-2"
        >
          <Wand size={16} />
        </Button>

        {/* Delete Task */}
        <Button
          size="sm"
          onPress={() => {
            onDelete();
            setIsExpanded(false);
          }}
          className="bg-red-600 hover:bg-red-500 text-white rounded-full p-2"
        >
          <Trash size={16} />
        </Button>
      </motion.div>
    </div>
  );
};

ProjectBranchActionButtonGroup.propTypes = {
  completed: PropTypes.bool.isRequired,
  onComplete: PropTypes.func.isRequired,
  onAddTask: PropTypes.func.isRequired,
  onAtomize: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

/**
 * ProjectBranch Component
 *
 * Represents an individual task or project branch.
 * Allows editing of task details, completion toggling, and manipulation of subtasks.
 *
 * @param {Object} task - Task object containing details like name, description, and subtasks.
 * @param {Array} path - Array representing the location of the task in the task hierarchy.
 */

const ProjectBranch = ({ activeProject, task, path = [] }) => {
  const { name, description, tasks = [], completed } = task;
  const dispatch = useDispatch();

  const [taskName, setTaskName] = useState(name);
  const [taskDescription, setTaskDescription] = useState(description);

  const handleEditTask = (field, value) => {
    dispatch(editTask({ path, field, value }));
  };

  const handleToggleCompletion = () => {
    dispatch(editTask({ path, field: 'completed', value: !completed }));
  };

  const handleDeleteTask = () => {
    dispatch(deleteTask({ path }));
  };

  const handleAddTask = () => {
    dispatch(
      addTask({
        path,
        newTask: {
          name: null,
          description: null,
          completed: false,
          tasks: [],
        },
        projectId: activeProject.projectId,
      })
    );
  };

  const handleAtomize = () => {
    console.log('Atomize task:', path);
  };

  return (
    <div
      className="relative ml-[var(--spacing)]"
      style={{ '--spacing': `${path.length * 4}%` }}
    >
      {/* Task Card */}
      <div
        className={`p-4 mb-2 rounded-lg transition-all shadow-md max-w-md ${
          completed ? 'bg-green-800' : 'bg-gray-900'
        }`}
      >
        {/* Task Name Input */}
        <Textarea
          className="w-full bg-transparent text-white text-lg font-semibold border-none focus:ring-0 focus:outline-none"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          onBlur={() => handleEditTask('name', taskName)}
          placeholder="Task Name"
          maxRows={1}
        />

        {/* Task Description Input */}
        <Textarea
          isClearable
          className="w-full bg-transparent text-gray-300 text-sm border-none focus:ring-0 focus:outline-none"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          onBlur={() => handleEditTask('description', taskDescription)}
          label="Task Description"
          placeholder="Enter your task description"
        />

        {/* Action Buttons */}
        <div className="flex justify-end mt-2">
          <ProjectBranchActionButtonGroup
            completed={completed}
            onComplete={handleToggleCompletion}
            onAddTask={handleAddTask}
            onAtomize={handleAtomize}
            onDelete={handleDeleteTask}
          />
        </div>
      </div>

      {/* Render Subtasks */}
      {tasks.length > 0 && (
        <div className="relative flex flex-col space-y-2">
          {/* Vertical Line (extends halfway down & hooks right) */}
          <div className="absolute left-5 top-0 h-1/2 w-[2px] bg-white/20"></div>
          {tasks.map((subtask, index) => (
            <>
              <ProjectBranch
                key={index}
                activeProject={activeProject}
                task={subtask}
                path={[...path, index]}
              />
            </>
          ))}
        </div>
      )}
    </div>
  );
};

ProjectBranch.propTypes = {
  task: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    tasks: PropTypes.array,
    completed: PropTypes.bool.isRequired,
  }).isRequired,
  path: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default ProjectBranch;
