import api from './api';
import supabase from './supabaseClient';

// Check if we're using Supabase 
const USE_SUPABASE = process.env.REACT_APP_USE_SUPABASE === 'true';

// Log configuration for debugging
console.log('Auth Service Configuration:');
console.log(`- Using Supabase Auth: ${USE_SUPABASE ? 'Yes' : 'No'}`);

/**
 * Authentication service for handling user authentication operations
 */
const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Response with status and data
   */
  register: async (userData) => {
    try {
      // Try Supabase registration first if enabled
      if (USE_SUPABASE) {
        console.log('Attempting to register with Supabase...');
        
        // Create user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              firstName: userData.firstName,
              lastName: userData.lastName,
              fullName: `${userData.firstName} ${userData.lastName}`,
              birthDate: userData.birthDate || new Date().toISOString().split('T')[0]
            }
          }
        });
        
        if (error) {
          console.error('Supabase registration error:', error);
          
          // Return formatted error
          return {
            status: 'error',
            message: error.message || 'Registration failed with Supabase'
          };
        }
        
        if (data?.user) {
          console.log('Supabase registration successful');
          
          // Store the session token
          localStorage.setItem('authToken', data.session?.access_token || '');
          
          // Format user data for consistent structure
          const formattedUser = {
            id: data.user.id,
            email: data.user.email,
            firstName: data.user.user_metadata?.firstName || '',
            lastName: data.user.user_metadata?.lastName || '',
            role: 'user',
            ...data.user.user_metadata
          };
          
          // Store user data in localStorage
          localStorage.setItem('userData', JSON.stringify(formattedUser));
          
          return {
            status: 'success',
            data: {
              user: formattedUser,
              token: data.session?.access_token
            }
          };
        }
      }
      
      // Fallback to API registration
      console.log('Falling back to API registration...');
      const response = await api.post('/auth/register', userData);
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Format the error response
      return {
        status: 'error',
        message: error.response?.data?.message || error.message || 'Registration failed'
      };
    }
  },
  
  /**
   * Log in a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Response with status and data
   */
  login: async (email, password) => {
    try {
      // Try Supabase login first if enabled
      if (USE_SUPABASE) {
        console.log('Attempting to login with Supabase...');
        
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          console.error('Supabase login error:', error);
          
          // If Supabase login fails but it's a known error (like invalid credentials),
          // don't try the fallback API to avoid confusing the user with multiple attempts
          if (error.message.includes('Invalid login credentials')) {
            return {
              status: 'error',
              message: 'Invalid email or password'
            };
          }
          
          // For other errors, we'll try the fallback API
          console.log('Supabase error seems to be a service issue, trying fallback API...');
        } else if (data?.user) {
          console.log('Supabase login successful');
          
          // Store the session token
          localStorage.setItem('authToken', data.session?.access_token || '');
          
          // Get user's metadata from Supabase user object
          const formattedUser = {
            id: data.user.id,
            email: data.user.email,
            firstName: data.user.user_metadata?.firstName || '',
            lastName: data.user.user_metadata?.lastName || '',
            role: 'user',
            ...data.user.user_metadata
          };
          
          // Store user data in localStorage
          localStorage.setItem('userData', JSON.stringify(formattedUser));
          
          return {
            status: 'success',
            data: {
              user: formattedUser,
              token: data.session?.access_token
            }
          };
        }
      }
      
      // Fallback to API login if Supabase failed or is disabled
      console.log('Falling back to API login...');
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error('Login error:', error);
      
      // Simplified error handling
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        // Handle specific API error cases
        if (error.response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        status: 'error',
        message: errorMessage
      };
    }
  },
  
  /**
   * Log out the current user
   */
  logout: () => {
    if (USE_SUPABASE) {
      // Sign out from Supabase
      supabase.auth.signOut().catch(err => {
        console.error('Error during Supabase signout:', err);
      });
    }
    
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },
  
  /**
   * Get the current user profile
   * @returns {Promise<Object>} Response with status and data
   */
  getProfile: async () => {
    try {
      if (USE_SUPABASE) {
        // Get session from Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data?.session) {
          // Get user details
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            throw userError;
          }
          
          if (userData?.user) {
            // Format user data
            const formattedUser = {
              id: userData.user.id,
              email: userData.user.email,
              firstName: userData.user.user_metadata?.firstName || '',
              lastName: userData.user.user_metadata?.lastName || '',
              role: 'user',
              ...userData.user.user_metadata
            };
            
            return {
              status: 'success',
              data: {
                user: formattedUser
              }
            };
          }
        }
      }
      
      // Fallback to API
      const response = await api.get('/auth/profile');
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error('Profile fetch error:', error);
      
      return {
        status: 'error',
        message: error.response?.data?.message || error.message || 'Failed to load profile'
      };
    }
  },
  
  /**
   * Update user profile
   * @param {Object} userData - User profile data to update
   * @returns {Promise<Object>} Response with status and data
   */
  updateProfile: async (userData) => {
    try {
      if (USE_SUPABASE) {
        // Update user metadata in Supabase
        const { data, error } = await supabase.auth.updateUser({
          data: userData
        });
        
        if (error) {
          throw error;
        }
        
        if (data?.user) {
          // Update local storage
          const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
          const updatedUser = {
            ...currentUser,
            ...userData
          };
          
          localStorage.setItem('userData', JSON.stringify(updatedUser));
          
          return {
            status: 'success',
            data: {
              user: updatedUser
            }
          };
        }
      }
      
      // Fallback to API
      const response = await api.put('/auth/profile', userData);
      
      // Update local storage
      const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
      const updatedUser = {
        ...currentUser,
        ...response.data.user
      };
      
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error('Profile update error:', error);
      
      return {
        status: 'error',
        message: error.response?.data?.message || error.message || 'Failed to update profile'
      };
    }
  },
  
  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Response with status and data
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      if (USE_SUPABASE) {
        // Verify current password by attempting to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: authService.getCurrentUser()?.email || '',
          password: currentPassword
        });
        
        if (signInError) {
          return {
            status: 'error',
            message: 'Current password is incorrect'
          };
        }
        
        // Update password in Supabase
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        
        if (error) {
          throw error;
        }
        
        return {
          status: 'success',
          message: 'Password updated successfully'
        };
      }
      
      // Fallback to API
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error('Password change error:', error);
      
      return {
        status: 'error',
        message: error.response?.data?.message || error.message || 'Failed to change password'
      };
    }
  },
  
  /**
   * Upload profile image
   * @param {FormData} formData - Form data containing the profile image
   * @param {function} progressCallback - Callback for upload progress
   * @returns {Promise<Object>} Response with status and data
   */
  uploadProfileImage: async (formData, progressCallback) => {
    try {
      if (USE_SUPABASE) {
        // Get the current user to use their ID in the file name
        const user = authService.getCurrentUser();
        if (!user || !user.id) {
          throw new Error('User not authenticated');
        }
        
        // Extract the file from the FormData
        const file = formData.get('profileImage');
        if (!file) {
          throw new Error('No file provided');
        }
        
        // Generate a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('profile-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true,
            onUploadProgress: (progress) => {
              const percentage = Math.round((progress.loaded / progress.total) * 100);
              if (progressCallback) progressCallback(percentage);
            }
          });
        
        if (error) {
          throw error;
        }
        
        // Get public URL for the uploaded file
        const { data: urlData } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName);
        
        const imageUrl = urlData.publicUrl;
        
        return {
          status: 'success',
          data: {
            imageUrl
          }
        };
      }
      
      // Fallback to API using axios for progress tracking
      const config = {
        onUploadProgress: (progressEvent) => {
          const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          if (progressCallback) progressCallback(percentage);
        },
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const response = await api.post('/auth/profile/image', formData, config);
      
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error('Image upload error:', error);
      
      return {
        status: 'error',
        message: error.response?.data?.message || error.message || 'Failed to upload profile image'
      };
    }
  },
  
  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
  
  /**
   * Get current user data from localStorage
   * @returns {Object|null} User data or null
   */
  getCurrentUser: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }
};

export default authService; 