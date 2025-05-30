export const firstProject = {
  projectId: 5000,
  projectName: 'Enter Project Title',
  projectDescription: 'Enter project background',
  updatedAt: new Date().toLocaleString('en-US', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }),
  tasks: [],
  isFirstProject: true,
};
