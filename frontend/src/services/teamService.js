import api from './api';

/**
 * Team service for handling team operations
 */
const teamService = {
  /**
   * Get all teams with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array>} List of teams
   */
  getAllTeams: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await api.get(`/teams?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch teams');
    }
  },

  /**
   * Get team by ID
   * @param {string} id - Team ID
   * @returns {Promise<Object>} Team details
   */
  getTeamById: async (id) => {
    try {
      const response = await api.get(`/teams/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch team');
    }
  },

  /**
   * Create a new team
   * @param {Object} teamData - Team data
   * @returns {Promise<Object>} Created team
   */
  createTeam: async (teamData) => {
    try {
      const response = await api.post('/teams', teamData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to create team');
    }
  },

  /**
   * Update team
   * @param {string} id - Team ID
   * @param {Object} teamData - Updated team data
   * @returns {Promise<Object>} Updated team
   */
  updateTeam: async (id, teamData) => {
    try {
      const response = await api.put(`/teams/${id}`, teamData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update team');
    }
  },

  /**
   * Delete team
   * @param {string} id - Team ID
   * @returns {Promise<Object>} Response data
   */
  deleteTeam: async (id) => {
    try {
      const response = await api.delete(`/teams/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to delete team');
    }
  },

  /**
   * Add member to team
   * @param {string} teamId - Team ID
   * @param {Object} memberData - Member data (userId, role)
   * @returns {Promise<Object>} Response data
   */
  addMember: async (teamId, memberData) => {
    try {
      const response = await api.post(`/teams/${teamId}/members`, memberData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to add member');
    }
  },

  /**
   * Remove member from team
   * @param {string} teamId - Team ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Response data
   */
  removeMember: async (teamId, userId) => {
    try {
      const response = await api.delete(`/teams/${teamId}/members/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to remove member');
    }
  },

  /**
   * Get team members
   * @param {string} teamId - Team ID
   * @returns {Promise<Array>} List of team members
   */
  getTeamMembers: async (teamId) => {
    try {
      const response = await api.get(`/teams/${teamId}/members`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch team members');
    }
  },
};

export default teamService; 