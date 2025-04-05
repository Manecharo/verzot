import api from './api';
import supabase from './supabaseClient';

/**
 * Authentication service for handling user authentication operations
 */
const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  register: async (userData) => {
    try {
      // First try using Supabase directly
      if (supabase && process.env.REACT_APP_USE_SUPABASE === 'true') {
        console.log('Using Supabase for registration');
        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              first_name: userData.firstName,
              last_name: userData.lastName,
              preferred_language: userData.preferredLanguage,
              birth_date: userData.birthDate
            }
          }
        });
        
        if (error) throw new Error(error.message);
        
        if (data && data.user) {
          localStorage.setItem('authToken', data.session?.access_token || '');
          localStorage.setItem('userData', JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            createdAt: data.user.created_at
          }));
          
          return {
            status: 'success',
            data: {
              user: {
                id: data.user.id,
                email: data.user.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                createdAt: data.user.created_at
              },
              token: data.session?.access_token
            }
          };
        }
      }
      
      // Fallback to API if Supabase fails or is not enabled
      const response = await api.post('/auth/register', userData);
      if (response.data.data && response.data.data.token) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      // Enhanced error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorData = error.response.data;
        const errorMessage = errorData.message || 'Registration failed';
        throw new Error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  },

  /**
   * Login a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login response
   */
  login: async (email, password) => {
    try {
      // First try using Supabase directly
      if (supabase && process.env.REACT_APP_USE_SUPABASE === 'true') {
        console.log('Using Supabase for login');
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw new Error(error.message);
        
        if (data && data.user) {
          localStorage.setItem('authToken', data.session?.access_token || '');
          localStorage.setItem('userData', JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            firstName: data.user.user_metadata?.first_name || '',
            lastName: data.user.user_metadata?.last_name || '',
            createdAt: data.user.created_at
          }));
          
          return {
            status: 'success',
            data: {
              user: {
                id: data.user.id,
                email: data.user.email,
                firstName: data.user.user_metadata?.first_name || '',
                lastName: data.user.user_metadata?.last_name || '',
                createdAt: data.user.created_at
              },
              token: data.session?.access_token
            }
          };
        }
      }
      
      // Fallback to API if Supabase fails or is not enabled
      const response = await api.post('/auth/login', { email, password });
      if (response.data.data && response.data.data.token) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      // Enhanced error handling
      if (error.response) {
        // Server responded with an error status
        const errorData = error.response.data;
        const errorMessage = errorData.message || 'Invalid email or password';
        throw new Error(errorMessage);
      } else if (error.request) {
        // No response received
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Other error
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  },

  /**
   * Logout a user
   */
  logout: async () => {
    // Try to sign out from Supabase
    if (supabase && process.env.REACT_APP_USE_SUPABASE === 'true') {
      await supabase.auth.signOut();
    }
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },

  /**
   * Get user profile
   * @returns {Promise<Object>} User profile data
   */
  getProfile: async () => {
    try {
      // Try to get user from Supabase
      if (supabase && process.env.REACT_APP_USE_SUPABASE === 'true') {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        if (data && data.user) {
          return {
            status: 'success',
            data: {
              user: {
                id: data.user.id,
                email: data.user.email,
                firstName: data.user.user_metadata?.first_name || '',
                lastName: data.user.user_metadata?.last_name || '',
                createdAt: data.user.created_at
              }
            }
          };
        }
      }
      
      // Fallback to API
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      // Enhanced error handling
      if (error.response) {
        const errorData = error.response.data;
        const errorMessage = errorData.message || 'Failed to fetch profile';
        throw new Error(errorMessage);
      } else {
        throw new Error(error.message || 'Network error or server unavailable');
      }
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Updated user profile
   */
  updateProfile: async (profileData) => {
    try {
      // Try to update user in Supabase
      if (supabase && process.env.REACT_APP_USE_SUPABASE === 'true') {
        const { data, error } = await supabase.auth.updateUser({
          data: {
            first_name: profileData.firstName,
            last_name: profileData.lastName,
            // Include other profile data as needed
          }
        });
        
        if (error) throw error;
        
        if (data && data.user) {
          const userData = {
            id: data.user.id,
            email: data.user.email,
            firstName: data.user.user_metadata?.first_name || '',
            lastName: data.user.user_metadata?.last_name || '',
            createdAt: data.user.created_at
          };
          
          localStorage.setItem('userData', JSON.stringify(userData));
          
          return {
            status: 'success',
            data: {
              user: userData
            }
          };
        }
      }
      
      // Fallback to API
      const response = await api.put('/auth/profile', profileData);
      if (response.data.data && response.data.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      // Enhanced error handling
      if (error.response) {
        const errorData = error.response.data;
        const errorMessage = errorData.message || 'Failed to update profile';
        throw new Error(errorMessage);
      } else {
        throw new Error(error.message || 'Network error or server unavailable');
      }
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  /**
   * Get current user data
   * @returns {Object|null} User data or null if not authenticated
   */
  getCurrentUser: () => {
    const userDataString = localStorage.getItem('userData');
    return userDataString ? JSON.parse(userDataString) : null;
  },
};

export default authService; 