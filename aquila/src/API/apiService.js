import axios from 'axios';

// Set up the base API client
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add an interceptor to include JWT tokens in requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt'); // Assumes JWT is stored in localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Service
const apiService = {
  /**
   * AUTHENTICATION
   */

  /**
   * Logs in a user with the provided credentials.
   * @param {Object} credentials - The login credentials (email and password).
   * @returns {Promise<Object>} The JWT token and user information.
   */
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { access_token, email_address, plan } = response.data;

      // Store the token in localStorage
      localStorage.setItem('jwt', access_token);
      localStorage.setItem('emailAddress', email_address);
      localStorage.setItem('plan', plan);
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Registers a new user with the provided details.
   * @param {Object} registrationData - The user details (name, email, password, etc.).
   * @returns {Promise<Object>} A success message or error.
   */
  register: async (registrationData) => {
    try {
      const response = await apiClient.post('/auth/register', registrationData);
      return response.data.message;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Logs out the user by clearing the JWT token.
   */
  logout: () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('emailAddress');
    localStorage.removeItem('plan');
  },

  /**
   * PROJECT MANAGEMENT
   */

  /**
   * Get all projects for the authenticated user.
   * @returns {Promise<Object[]>} List of projects.
   */
  getProjects: async () => {
    try {
      const response = await apiClient.get('/projects/get_projects');
      return response.data.projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get a specific project by ID.
   * @param {number} projectId - The ID of the project to retrieve.
   * @returns {Promise<Object>} The project details.
   */
  getProjectById: async (projectId) => {
    try {
      const response = await apiClient.get(
        `/projects/get_project/${projectId}`
      );
      return response.data.project;
    } catch (error) {
      console.error(`Error fetching project with ID ${projectId}:`, error);
      throw error.response?.data || error;
    }
  },

  /**
   * Create a new project.
   * @param {Object} projectData - The project data (name, description, tasks).
   * @returns {Promise<Object>} The response message.
   */
  createProject: async (projectData) => {
    try {
      const response = await apiClient.post(
        '/projects/create_project',
        projectData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update an existing project.
   * @param {Object} projectData - The updated project data (projectId, name, description, tasks).
   * @returns {Promise<Object>} The response message.
   */
  updateProject: async (projectData) => {
    try {
      const response = await apiClient.put(
        '/projects/update_project',
        projectData
      );
      return response.data.message;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete a project by ID.
   * @param {number} projectId - The ID of the project to delete.
   * @returns {Promise<Object>} The response message.
   */
  deleteProject: async (projectId) => {
    try {
      const response = await apiClient.delete(
        `/projects/delete_project?project_id=${projectId}`
      );
      return response.data.message;
    } catch (error) {
      console.error(`Error deleting project with ID ${projectId}:`, error);
      throw error.response?.data || error;
    }
  },
};

export default apiService;
