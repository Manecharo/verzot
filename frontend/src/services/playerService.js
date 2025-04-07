import api from './api';

/**
 * Player service for handling player operations
 */
const playerService = {
  /**
   * Get all players with optional filters
   * @param {Object} filters - Filter parameters (teamId, status, etc.)
   * @returns {Promise<Object>} Response with status and data
   */
  getAllPlayers: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await api.get(`/players?${params.toString()}`);
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching players:', error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to fetch players'
      };
    }
  },

  /**
   * Get player by ID
   * @param {string} id - Player ID
   * @returns {Promise<Object>} Response with status and data
   */
  getPlayerById: async (id) => {
    try {
      const response = await api.get(`/players/${id}`);
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error(`Error fetching player ${id}:`, error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to fetch player'
      };
    }
  },

  /**
   * Get players by team ID
   * @param {string} teamId - Team ID
   * @returns {Promise<Object>} Response with status and data
   */
  getPlayersByTeam: async (teamId) => {
    try {
      const response = await api.get(`/teams/${teamId}/players`);
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error(`Error fetching players for team ${teamId}:`, error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to fetch team players'
      };
    }
  },

  /**
   * Create a new player
   * @param {Object} playerData - Player data
   * @returns {Promise<Object>} Response with status and data
   */
  createPlayer: async (playerData) => {
    try {
      const response = await api.post('/players', playerData);
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error('Error creating player:', error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to create player'
      };
    }
  },

  /**
   * Invite a player to a team by email
   * @param {string} teamId - Team ID
   * @param {Object} inviteData - Invite data including email and optional details
   * @returns {Promise<Object>} Response with status and data
   */
  invitePlayer: async (teamId, inviteData) => {
    try {
      const response = await api.post(`/teams/${teamId}/invites`, inviteData);
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error('Error inviting player:', error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to send player invitation'
      };
    }
  },

  /**
   * Update player
   * @param {string} id - Player ID
   * @param {Object} playerData - Updated player data
   * @returns {Promise<Object>} Response with status and data
   */
  updatePlayer: async (id, playerData) => {
    try {
      const response = await api.put(`/players/${id}`, playerData);
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error(`Error updating player ${id}:`, error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to update player'
      };
    }
  },

  /**
   * Update player status
   * @param {string} id - Player ID
   * @param {string} status - New status ('active', 'inactive', 'suspended', 'pending')
   * @returns {Promise<Object>} Response with status and data
   */
  updatePlayerStatus: async (id, status) => {
    try {
      const response = await api.patch(`/players/${id}/status`, { status });
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error(`Error updating player ${id} status:`, error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to update player status'
      };
    }
  },

  /**
   * Delete player (remove from team)
   * @param {string} id - Player ID
   * @returns {Promise<Object>} Response with status and data
   */
  deletePlayer: async (id) => {
    try {
      const response = await api.delete(`/players/${id}`);
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error(`Error deleting player ${id}:`, error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to delete player'
      };
    }
  },

  /**
   * Verify player identity (for tournament requirements)
   * @param {string} id - Player ID
   * @param {Object} verificationData - Verification data including ID documents
   * @returns {Promise<Object>} Response with status and data
   */
  verifyPlayerIdentity: async (id, verificationData) => {
    try {
      const response = await api.post(`/players/${id}/verify`, verificationData);
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error(`Error verifying player ${id}:`, error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to verify player identity'
      };
    }
  },

  /**
   * Get player statistics
   * @param {string} id - Player ID
   * @param {Object} filters - Optional filters like tournamentId, season, etc.
   * @returns {Promise<Object>} Response with status and data
   */
  getPlayerStats: async (id, filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await api.get(`/players/${id}/stats?${params.toString()}`);
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error(`Error fetching stats for player ${id}:`, error);
      return {
        status: 'error',
        message: error.response?.data?.message || 'Failed to fetch player statistics'
      };
    }
  }
};

export default playerService; 