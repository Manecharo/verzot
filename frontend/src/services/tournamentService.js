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
  
  /**
   * Get matches for a tournament
   * @param {string} tournamentId - Tournament ID
   * @param {Object} filters - Filter parameters (phase, status, etc.)
   * @returns {Promise<Object>} Matches response
   */
  getTournamentMatches: async (tournamentId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await api.get(`/tournaments/${tournamentId}/matches?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch tournament matches');
    }
  },
  
  /**
   * Get match by ID
   * @param {string} matchId - Match ID
   * @returns {Promise<Object>} Match details
   */
  getMatchById: async (matchId) => {
    try {
      const response = await api.get(`/matches/${matchId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch match details');
    }
  },
  
  /**
   * Schedule matches for a tournament
   * @param {string} tournamentId - Tournament ID
   * @param {Array} matches - Array of match objects
   * @returns {Promise<Object>} Schedule response
   */
  scheduleMatches: async (tournamentId, matches) => {
    try {
      const response = await api.post(`/tournaments/${tournamentId}/matches`, { matches });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to schedule matches');
    }
  },
  
  /**
   * Update match details
   * @param {string} matchId - Match ID
   * @param {Object} matchData - Updated match data
   * @returns {Promise<Object>} Updated match
   */
  updateMatch: async (matchId, matchData) => {
    try {
      const response = await api.put(`/matches/${matchId}`, matchData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update match');
    }
  },
  
  /**
   * Update match score
   * @param {string} matchId - Match ID
   * @param {Object} scoreData - Score data (homeScore, awayScore, etc.)
   * @returns {Promise<Object>} Updated match
   */
  updateMatchScore: async (matchId, scoreData) => {
    try {
      const response = await api.patch(`/matches/${matchId}/score`, scoreData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update match score');
    }
  },
  
  /**
   * Confirm match result (by team or referee)
   * @param {string} matchId - Match ID
   * @param {string} role - Role of confirming party ('home', 'away', 'referee')
   * @returns {Promise<Object>} Confirmation response
   */
  confirmMatchResult: async (matchId, role) => {
    try {
      const response = await api.post(`/matches/${matchId}/confirm`, { role });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to confirm match result');
    }
  },
  
  /**
   * Add events to a match
   * @param {string} matchId - Match ID
   * @param {Array} events - Array of event objects
   * @returns {Promise<Object>} Events response
   */
  addMatchEvents: async (matchId, events) => {
    try {
      const response = await api.post(`/matches/${matchId}/events`, { events });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to add match events');
    }
  },
  
  /**
   * Get tournament standings
   * @param {string} tournamentId - Tournament ID
   * @param {string} groupId - Optional group ID for group tournaments
   * @returns {Promise<Object>} Standings response
   */
  getTournamentStandings: async (tournamentId, groupId = null) => {
    try {
      let endpoint = `/tournaments/${tournamentId}/standings`;
      if (groupId) {
        endpoint += `?group=${groupId}`;
      }
      
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch tournament standings');
    }
  },
  
  /**
   * Get tournament player statistics
   * @param {string} tournamentId - Tournament ID
   * @param {Object} filters - Optional filters (teamId, eventType, etc.)
   * @returns {Promise<Object>} Player statistics response
   */
  getTournamentPlayerStats: async (tournamentId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await api.get(`/tournaments/${tournamentId}/player-stats?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch tournament player statistics');
    }
  },
  
  /**
   * Get single player statistics for a tournament
   * @param {string} tournamentId - Tournament ID
   * @param {string} playerId - Player ID
   * @returns {Promise<Object>} Player statistics response
   */
  getPlayerTournamentStats: async (tournamentId, playerId) => {
    try {
      const response = await api.get(`/tournaments/${tournamentId}/players/${playerId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch player tournament statistics');
    }
  },

  /**
   * Get tournament brackets
   * @param {string} tournamentId - Tournament ID 
   * @returns {Promise<Object>} Bracket data including knockout stage matches
   */
  getTournamentBrackets: async (tournamentId) => {
    try {
      const response = await api.get(`/tournaments/${tournamentId}/brackets`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch tournament brackets');
    }
  },
};

export default tournamentService; 