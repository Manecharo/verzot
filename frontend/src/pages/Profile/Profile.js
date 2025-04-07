import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services';
import { useTranslation } from 'react-i18next';
import styles from './Profile.module.css';

const Profile = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    preferredLanguage: 'en'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        preferredLanguage: user.preferredLanguage || 'en'
      });
      
      // Set the profile image if it exists
      if (user.profileImageUrl) {
        setImagePreview(user.profileImageUrl);
      }
    }
  }, [user]);

  // Handle input changes for profile form
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle input changes for password form
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setError(null);
    setSuccess(null);
    
    // Reset image preview when canceling edit
    if (isEditing && user?.profileImageUrl) {
      setImagePreview(user.profileImageUrl);
      setProfileImage(null);
    }
  };

  // Handle profile image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError(t('profile.invalidImageType'));
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError(t('profile.imageSizeExceeded'));
      return;
    }
    
    setProfileImage(file);
    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Upload profile image
  const uploadProfileImage = async () => {
    if (!profileImage) return null;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('profileImage', profileImage);
      
      const response = await authService.uploadProfileImage(formData, (progress) => {
        setUploadProgress(progress);
      });
      
      if (response.status === 'success') {
        setIsUploading(false);
        return response.data.imageUrl;
      } else {
        setError(response.message || t('profile.imageUploadError'));
        setIsUploading(false);
        return null;
      }
    } catch (err) {
      setError(err.message || t('profile.imageUploadError'));
      setIsUploading(false);
      return null;
    }
  };

  // Save profile changes
  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Upload profile image first if selected
      let profileImageUrl = null;
      if (profileImage) {
        profileImageUrl = await uploadProfileImage();
        if (!profileImageUrl) {
          setLoading(false);
          return;
        }
      }
      
      // Update profile with new image URL if uploaded
      const updatedProfileData = {
        ...profileData,
        ...(profileImageUrl && { profileImageUrl })
      };
      
      const response = await authService.updateProfile(updatedProfileData);
      if (response.status === 'success') {
        setSuccess(t('profile.updateSuccess'));
        setIsEditing(false);
        setProfileImage(null);
        
        // Refresh auth context user data
        if (refreshUserData) {
          refreshUserData();
        }
      } else {
        setError(response.message || t('profile.updateError'));
      }
    } catch (err) {
      setError(err.message || t('profile.updateError'));
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError(t('profile.passwordsDoNotMatch'));
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Implement password change when backend is ready
      const response = await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (response.status === 'success') {
        setSuccess(t('profile.passwordChangeSuccess'));
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(response.message || t('profile.passwordChangeError'));
      }
    } catch (err) {
      setError(err.message || t('profile.passwordChangeError'));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className={styles.loadingContainer}>{t('common.loading')}</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.profileTitle}>{t('profile.title')}</h1>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}
      
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <h2>{t('profile.personalInfo')}</h2>
          {!isEditing ? (
            <button className={styles.editButton} onClick={toggleEditMode}>
              {t('profile.edit')}
            </button>
          ) : (
            <button className={styles.cancelButton} onClick={toggleEditMode}>
              {t('common.cancel')}
            </button>
          )}
        </div>
        
        {/* Profile Image */}
        <div className={styles.profileImageSection}>
          <div className={styles.profileImageContainer}>
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt={t('profile.profileImage')} 
                className={styles.profileImage} 
              />
            ) : (
              <div className={styles.profileImagePlaceholder}>
                {user?.firstName?.charAt(0) || ''}{user?.lastName?.charAt(0) || ''}
              </div>
            )}
            
            {isEditing && (
              <button 
                type="button" 
                className={styles.changeImageButton} 
                onClick={triggerFileInput}
              >
                {t('profile.changeImage')}
              </button>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef}
              className={styles.fileInput}
              accept="image/jpeg, image/png, image/gif" 
              onChange={handleImageChange}
            />
          </div>
          
          {isUploading && (
            <div className={styles.uploadProgress}>
              <div 
                className={styles.progressBar} 
                style={{ width: `${uploadProgress}%` }}
              />
              <span>{uploadProgress}%</span>
            </div>
          )}
        </div>
        
        {!isEditing ? (
          // Profile View Mode
          <div className={styles.profileInfo}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>{t('profile.name')}:</span>
              <span className={styles.infoValue}>
                {profileData.firstName} {profileData.lastName}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>{t('profile.email')}:</span>
              <span className={styles.infoValue}>{profileData.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>{t('profile.language')}:</span>
              <span className={styles.infoValue}>
                {profileData.preferredLanguage === 'en' ? t('languages.english') : t('languages.spanish')}
              </span>
            </div>
          </div>
        ) : (
          // Profile Edit Mode
          <form onSubmit={saveProfile} className={styles.profileForm}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">{t('profile.firstName')}</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={profileData.firstName}
                onChange={handleProfileChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lastName">{t('profile.lastName')}</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={profileData.lastName}
                onChange={handleProfileChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">{t('profile.email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                required
                disabled // Email is typically not editable after registration
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="preferredLanguage">{t('profile.preferredLanguage')}</label>
              <select
                id="preferredLanguage"
                name="preferredLanguage"
                value={profileData.preferredLanguage}
                onChange={handleProfileChange}
              >
                <option value="en">{t('languages.english')}</option>
                <option value="es">{t('languages.spanish')}</option>
              </select>
            </div>
            <button 
              type="submit" 
              className={styles.saveButton}
              disabled={loading || isUploading}
            >
              {loading ? t('common.saving') : t('common.save')}
            </button>
          </form>
        )}
      </div>
      
      {/* Password Change Section */}
      <div className={styles.profileCard}>
        <h2>{t('profile.changePassword')}</h2>
        <form onSubmit={changePassword} className={styles.profileForm}>
          <div className={styles.formGroup}>
            <label htmlFor="currentPassword">{t('profile.currentPassword')}</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="newPassword">{t('profile.newPassword')}</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              minLength="8"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">{t('profile.confirmPassword')}</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <button 
            type="submit" 
            className={styles.saveButton}
            disabled={loading}
          >
            {loading ? t('common.updating') : t('profile.updatePassword')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile; 