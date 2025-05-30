import { Box, Step, StepLabel, Stepper, Typography } from '@mui/material';

const ProjectTimeline = (props) => {
  const { activeProject } = props;

  // Ensure we have tasks to render
  if (!activeProject || activeProject.tasks.length === 0) {
    return (
      <Box
        sx={{
          bgcolor: 'rgba(40, 40, 70, 0.8)',
          borderRadius: '16px',
          p: 4,
          boxShadow: 3,
          minHeight: '200px',
        }}
      >
        <Typography
          variant="body2"
          color="rgba(255, 255, 255, 0.7)"
          textAlign="center"
        >
          No tasks available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: 'rgba(40, 40, 70, 0.8)',
        borderRadius: '16px',
        p: 4,
        boxShadow: 3,
        height: '80%',
        overflowY: 'auto', // Scrollable if timeline exceeds max height
      }}
    >
      <Stepper orientation="vertical">
        {activeProject.tasks.map((task, index) => (
          <Step key={index} active={task.completed} completed={task.completed}>
            <StepLabel
              sx={{
                color: task.completed ? '#FFD700' : 'rgba(255, 255, 255, 0.7)',
              }}
              slotProps={{
                stepIcon: {
                  sx: {
                    color: task.completed
                      ? 'green'
                      : 'rgba(255, 255, 255, 0.3)', // Default or completed colors
                    '&.Mui-completed': {
                      color: 'green', // Completed color
                    },
                  },
                },
              }}
            >
              <Typography
                variant="subtitle2"
                color={task.completed ? '#FFD700' : 'rgba(255, 255, 255, 0.7)'}
              >
                {task.name}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default ProjectTimeline;
