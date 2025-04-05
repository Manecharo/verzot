import api from './api';

/**
 * Tournament service for handling tournament operations
 */
const tournamentService = {
  /**
   * Get all tournaments with optional filters
   * @param {Object} filters - Filter parameters (status, type, etc.)
   * @returns {Promise<Array>} List of tournaments
   */
  getAllTournaments: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await api.get(`/tournaments?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch tournaments');
    }
  },

  /**
   * Get tournament by ID
   * @param {string} id - Tournament ID
   * @returns {Promise<Object>} Tournament details
   */
  getTournamentById: async (id) => {
    try {
      const response = await api.get(`/tournaments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch tournament');
    }
  },

  /**
   * Create a new tournament
   * @param {Object} tournamentData - Tournament data
   * @returns {Promise<Object>} Created tournament
   */
  createTournament: async (tournamentData) => {
    try {
      const response = await api.post('/tournaments', tournamentData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to create tournament');
    }
  },

  /**
   * Update tournament
   * @param {string} id - Tournament ID
   * @param {Object} tournamentData - Updated tournament data
   * @returns {Promise<Object>} Updated tournament
   */
  updateTournament: async (id, tournamentData) => {
    try {
      const response = await api.put(`/tournaments/${id}`, tournamentData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update tournament');
    }
  },

  /**
   * Delete tournament
   * @param {string} id - Tournament ID
   * @returns {Promise<Object>} Response data
   */
  deleteTournament: async (id) => {
    try {
      const response = await api.delete(`/tournaments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to delete tournament');
    }
  },

  /**
   * Register team for tournament
   * @param {string} tournamentId - Tournament ID
   * @param {string} teamId - Team ID
   * @returns {Promise<Object>} Registration response
   */
  registerTeam: async (tournamentId, teamId) => {
    try {
      const response = await api.post(`/tournaments/${tournamentId}/teams`, { teamId });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to register team');
    }
  },

  /**
   * Get teams registered for tournament
   * @param {string} tournamentId - Tournament ID
   * @returns {Promise<Array>} List of teams
   */
  getTournamentTeams: async (tournamentId) => {
    try {
      const response = await api.get(`/tournaments/${tournamentId}/teams`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch teams');
    }
  },
};

export default tournamentService; 