import api from '../services/api';

/**
 * Utility to test API connectivity and diagnose issues
 */
const apiTest = {
  /**
   * Test basic connectivity to API
   * @returns {Promise<Object>} Test results
   */
  testApiConnection: async () => {
    console.log('Testing API connection...');
    
    try {
      // Get API base URL from configuration
      const baseURL = api.defaults.baseURL;
      console.log('API Base URL:', baseURL);
      
      // Check for authentication token
      const headers = {};
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
        console.log('Auth token exists:', !!authToken);
      } else {
        console.warn('No auth token found in localStorage');
      }
      
      // Test endpoints array
      const endpoints = [
        { url: '/tournaments', method: 'get', name: 'Get Tournaments' },
        { url: '/teams', method: 'get', name: 'Get Teams' },
        { url: '/players', method: 'get', name: 'Get Players' }
      ];
      
      // Test each endpoint
      const results = {};
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Testing endpoint: ${endpoint.name} (${endpoint.method.toUpperCase()} ${endpoint.url})`);
          const response = await api[endpoint.method](endpoint.url);
          
          results[endpoint.name] = {
            success: true,
            status: response.status,
            data: response.data ? 'Data received' : 'No data',
            headers: response.headers
          };
          
          console.log(`✅ ${endpoint.name}: Success`);
        } catch (error) {
          results[endpoint.name] = {
            success: false,
            status: error.response?.status,
            message: error.message,
            errorDetails: error.response?.data
          };
          
          console.error(`❌ ${endpoint.name}: Failed - ${error.message}`);
        }
      }
      
      return {
        baseURL,
        authToken: !!authToken,
        endpoints: results
      };
    } catch (error) {
      console.error('API Connection Test Failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Test creating a tournament
   * @param {Object} tournamentData - Test tournament data
   * @returns {Promise<Object>} Test results
   */
  testCreateTournament: async (tournamentData) => {
    console.log('Testing tournament creation...');
    
    try {
      const response = await api.post('/tournaments', tournamentData);
      
      return {
        success: true,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      console.error('Tournament Creation Test Failed:', error);
      
      return {
        success: false,
        status: error.response?.status,
        message: error.message,
        errorDetails: error.response?.data
      };
    }
  },
  
  /**
   * Test creating a team
   * @param {Object} teamData - Test team data
   * @returns {Promise<Object>} Test results
   */
  testCreateTeam: async (teamData) => {
    console.log('Testing team creation...');
    
    try {
      const response = await api.post('/teams', teamData);
      
      return {
        success: true,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      console.error('Team Creation Test Failed:', error);
      
      return {
        success: false,
        status: error.response?.status,
        message: error.message,
        errorDetails: error.response?.data
      };
    }
  }
};

export default apiTest; 