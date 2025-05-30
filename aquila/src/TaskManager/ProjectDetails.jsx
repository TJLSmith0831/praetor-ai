import { Button } from '@heroui/react';
import { ArrowDown, ArrowUp, Plus, Wand } from 'lucide-react';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import ProjectBranch from '../GenericComponents/ProjectBranch';
import ProjectTitle from '../GenericComponents/ProjectTitle';
import { addTask } from '../redux/slices/ProjectSlices';

const ProjectDetails = (props) => {
  const { activeProject, isNewProject, setIsNewProject } = props;
  const { projectName, projectDescription, tasks, projectId } = activeProject;
  const dispatch = useDispatch();
  const tasksRef = useRef(null);

  const scrollToBottom = () => {
    if (tasksRef.current) {
      setTimeout(() => {
        tasksRef.current.scrollTo({
          top: tasksRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 0);
    }
  };

  const scrollToTop = () => {
    if (tasksRef.current) {
      setTimeout(() => {
        tasksRef.current.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }, 0);
    }
  };

  /**
   * AtomizeButton
   *
   * A styled button used to trigger the AI-driven task atomization functionality.
   *
   * - Displays the label "Atomize" along with an icon.
   * - Changes the text and icon color on hover for better interactivity.
   * - Typically placed in areas where task automation is required.
   *
   * @returns {JSX.Element} A Material-UI styled button component.
   */
  const AtomizeButton = () => {
    return (
      <Button
        className="group bg-accent hover:bg-accent-light p-3 rounded-full"
        variant="contained"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <caption className="group-hover:text-primary ml-2">Atomize</caption>
        <Wand className="group-hover:text-primary ml-1" />
      </Button>
    );
  };

  /**
   * AddTaskButton
   *
   * A styled button used to add a new task to the current project.
   *
   * - Displays the label "Add New Task" along with a "+" icon.
   * - Changes the text and icon color on hover for improved interactivity.
   * - Typically displayed alongside task-related actions or within project/task detail views.
   *
   * @returns {JSX.Element} A Material-UI styled button component.
   */
  const AddTaskButton = () => {
    return (
      <Button
        className="group bg-accent hover:bg-accent-light p-3 rounded-full"
        variant="contained"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => {
          dispatch(
            addTask({
              path: [], // Root path for the active project's task list
              newTask: {
                name: null,
                description: null,
                completed: false,
                tasks: [],
              },
              projectId: projectId, // Ensure we add to the correct project
            })
          );
          scrollToBottom();
        }}
      >
        <caption variant="caption" className="group-hover:text-primary ml-2">
          Add New Task
        </caption>
        <Plus className="group-hover:text-primary ml-1" />
      </Button>
    );
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-[rgba(40,40,70,0.8)] shadow-md">
      <div className="bg-[rgba(40,40,70,0.8)] rounded-xl p-4 shadow-md h-full">
        <div className="flex flex-col md:flex-row md:items-center gap-4 w-[80%] ml-4">
          {/* Project Title */}
          <ProjectTitle
            projectId={projectId}
            projectName={projectName}
            projectDescription={projectDescription}
            isNewProject={isNewProject}
            setIsNewProject={setIsNewProject}
            scrollToBottom={scrollToBottom}
            className="w-[90%] sm:w-[90%] md:w-2/3 lg:w-1/2"
          />

          {/* Button Group - Stacked on small, inline on medium+ */}
          <div className="grid grid-flow-col grid-rows-2 md:flex-row md:ml-4 gap-2 w-2/3 md:w-auto self-center">
            <AddTaskButton />
            <AtomizeButton />
          </div>
        </div>

        <Button
          className="fixed top-[30%] right-4 bg-yellow-500 hover:bg-yellow-400 text-black p-3 rounded-full shadow-lg z-10"
          onPress={() => scrollToTop()}
        >
          <ArrowUp />
        </Button>

        {/* Tasks List */}
        <div
          ref={tasksRef}
          className="mt-2 mb-2 overflow-y-auto z-2"
          style={{ maxHeight: 'calc(100% - 150px)' }} // Ensure 130px gap at bottom
        >
          {tasks &&
            tasks.map((task, index) => (
              <ProjectBranch
                activeProject={activeProject}
                key={index}
                task={task}
                path={[index]}
                showUpdatedAt={true}
              />
            ))}
        </div>

        <Button
          className="fixed bottom-5 right-4 bg-yellow-500 hover:bg-yellow-400 text-black p-3 rounded-full shadow-lg z-10"
          onPress={() => scrollToBottom()}
        >
          <ArrowDown size={20} />
        </Button>
      </div>
    </div>
  );
};

export default ProjectDetails;
