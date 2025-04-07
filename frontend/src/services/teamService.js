import api from './api';

/**
 * Team service for handling team operations
 */
const teamService = {
  /**
   * Get all teams with optional filters
   * @param {Object} filters - Filter parameters (name, status, etc.)
   * @returns {Promise<Object>} Response with status and data
   */
  getAllTeams: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await api.get(`/teams?${params.toString()}`);
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching teams:', error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to fetch teams'
      };
    }
  },

  /**
   * Get team by ID
   * @param {string} id - Team ID
   * @returns {Promise<Object>} Response with status and data
   */
  getTeamById: async (id) => {
    try {
      const response = await api.get(`/teams/${id}`);
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error(`Error fetching team ${id}:`, error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to fetch team'
      };
    }
  },

  /**
   * Create a new team
   * @param {Object} teamData - Team data
   * @returns {Promise<Object>} Response with status and data
   */
  createTeam: async (teamData) => {
    try {
      const response = await api.post('/teams', teamData);
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error('Error creating team:', error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to create team'
      };
    }
  },

  /**
   * Update team
   * @param {string} id - Team ID
   * @param {Object} teamData - Updated team data
   * @returns {Promise<Object>} Response with status and data
   */
  updateTeam: async (id, teamData) => {
    try {
      const response = await api.put(`/teams/${id}`, teamData);
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error(`Error updating team ${id}:`, error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to update team'
      };
    }
  },

  /**
   * Delete team
   * @param {string} id - Team ID
   * @returns {Promise<Object>} Response with status and data
   */
  deleteTeam: async (id) => {
    try {
      const response = await api.delete(`/teams/${id}`);
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error(`Error deleting team ${id}:`, error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to delete team'
      };
    }
  },

  /**
   * Get team members
   * @param {string} id - Team ID
   * @returns {Promise<Object>} Response with status and data
   */
  getTeamMembers: async (id) => {
    try {
      const response = await api.get(`/teams/${id}/members`);
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error(`Error fetching members for team ${id}:`, error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to fetch team members'
      };
    }
  },

  /**
   * Add member to team
   * @param {string} teamId - Team ID
   * @param {Object} memberData - Member data including playerId or inviteEmail
   * @returns {Promise<Object>} Response with status and data
   */
  addTeamMember: async (teamId, memberData) => {
    try {
      const response = await api.post(`/teams/${teamId}/members`, memberData);
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error(`Error adding member to team ${teamId}:`, error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to add team member'
      };
    }
  },

  /**
   * Remove member from team
   * @param {string} teamId - Team ID
   * @param {string} memberId - Member ID
   * @returns {Promise<Object>} Response with status and data
   */
  removeTeamMember: async (teamId, memberId) => {
    try {
      const response = await api.delete(`/teams/${teamId}/members/${memberId}`);
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error(`Error removing member ${memberId} from team ${teamId}:`, error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to remove team member'
      };
    }
  },

  /**
   * Get teams for current user
   * @returns {Promise<Object>} Response with status and data
   */
  getMyTeams: async () => {
    try {
      const response = await api.get('/teams/my-teams');
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching user teams:', error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to fetch your teams'
      };
    }
  },

  /**
   * Get teams for a tournament
   * @param {string} tournamentId - Tournament ID
   * @returns {Promise<Object>} Response with status and data
   */
  getTournamentTeams: async (tournamentId) => {
    try {
      const response = await api.get(`/tournaments/${tournamentId}/teams`);
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error(`Error fetching teams for tournament ${tournamentId}:`, error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to fetch tournament teams'
      };
    }
  },

  /**
   * Register team for tournament
   * @param {string} tournamentId - Tournament ID
   * @param {string} teamId - Team ID
   * @returns {Promise<Object>} Response with status and data
   */
  registerForTournament: async (tournamentId, teamId) => {
    try {
      const response = await api.post(`/tournaments/${tournamentId}/teams`, { teamId });
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error(`Error registering team ${teamId} for tournament ${tournamentId}:`, error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to register for tournament'
      };
    }
  }
};

export default teamService; 