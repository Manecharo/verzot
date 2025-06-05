const { User, Role, Team, Tournament, Player, Match, MatchEvent } = require('../models');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { firstName, lastName, birthDate, profilePicture, preferredLanguage } = req.body;

    // Get user by ID
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (birthDate) user.birthDate = birthDate;
    if (profilePicture) user.profilePicture = profilePicture;
    if (preferredLanguage) user.preferredLanguage = preferredLanguage;

    // Save updated user to database
    await user.save();

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Change user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.changePassword = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user by ID
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Role,
        through: { attributes: [] }
      }]
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error retrieving user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Upload profile image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Upload image to Supabase Storage
    const fileBase64 = req.file.buffer.toString('base64');
    const filePath = `profiles/${user.id}/${Date.now()}-${req.file.originalname}`;
    
    const { data, error } = await supabase.storage
      .from('user-content')
      .upload(filePath, Buffer.from(fileBase64, 'base64'), {
        contentType: req.file.mimetype
      });

    if (error) {
      console.error('Supabase storage error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to upload image',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Get public URL for the uploaded file
    const { publicURL } = supabase.storage
      .from('user-content')
      .getPublicUrl(filePath);

    // Delete previous profile image if exists
    if (user.profilePicture && user.profilePicture.includes('user-content')) {
      const oldPath = user.profilePicture.split('user-content/')[1];
      if (oldPath) {
        await supabase.storage.from('user-content').remove([oldPath]);
      }
    }

    // Update user profile with new image URL
    user.profilePicture = publicURL;
    await user.save();

    res.json({
      status: 'success',
      message: 'Profile image uploaded successfully',
      data: {
        profilePicture: publicURL
      }
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error uploading profile image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user teams
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserTeams = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    // Check if user exists
    const userExists = await User.findByPk(userId);
    if (!userExists) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get teams owned by the user
    const teams = await Team.findAll({
      where: { teamLeaderId: userId },
      include: [
        {
          model: Tournament,
          through: { attributes: ['status', 'group'] }
        },
        {
          model: Player,
          as: 'players'
        }
      ]
    });

    res.json({
      status: 'success',
      data: {
        teams
      }
    });
  } catch (error) {
    console.error('Get user teams error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error retrieving user teams',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user tournaments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserTournaments = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    // Check if user exists
    const userExists = await User.findByPk(userId);
    if (!userExists) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get tournaments organized by the user
    const organizedTournaments = await Tournament.findAll({
      where: { organizerId: userId },
      attributes: { exclude: ['rules', 'tiebreakerRules', 'tournamentStructure'] }
    });

    // Get tournaments where user has a team participating
    const teams = await Team.findAll({
      where: { teamLeaderId: userId },
      include: [
        {
          model: Tournament,
          through: { attributes: ['status', 'group'] },
          attributes: { exclude: ['rules', 'tiebreakerRules', 'tournamentStructure'] }
        }
      ]
    });

    // Extract unique tournaments from teams
    const participatingTournaments = [];
    teams.forEach(team => {
      team.Tournaments.forEach(tournament => {
        if (!participatingTournaments.some(t => t.id === tournament.id)) {
          participatingTournaments.push(tournament);
        }
      });
    });

    res.json({
      status: 'success',
      data: {
        organized: organizedTournaments,
        participating: participatingTournaments
      }
    });
  } catch (error) {
    console.error('Get user tournaments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error retrieving user tournaments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserStatistics = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    // Check if user exists
    const userExists = await User.findByPk(userId);
    if (!userExists) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get counts of different entities
    const teamsCount = await Team.count({ where: { teamLeaderId: userId } });
    const tournamentsCount = await Tournament.count({ where: { organizerId: userId } });
    
    // Get teams owned by user
    const teams = await Team.findAll({ where: { teamLeaderId: userId } });
    const teamIds = teams.map(team => team.id);
    
    // Get counts of matches for user's teams
    const matchesCount = await Match.count({
      where: {
        [require('../models').Sequelize.Op.or]: [
          { homeTeamId: { [require('../models').Sequelize.Op.in]: teamIds } },
          { awayTeamId: { [require('../models').Sequelize.Op.in]: teamIds } }
        ]
      }
    });
    
    // Get win/loss records
    let wins = 0;
    let losses = 0;
    let draws = 0;
    
    const matches = await Match.findAll({
      where: {
        [require('../models').Sequelize.Op.or]: [
          { homeTeamId: { [require('../models').Sequelize.Op.in]: teamIds } },
          { awayTeamId: { [require('../models').Sequelize.Op.in]: teamIds } }
        ],
        status: 'completed'
      },
      attributes: ['id', 'homeTeamId', 'awayTeamId', 'homeScore', 'awayScore']
    });
    
    matches.forEach(match => {
      const isHomeTeam = teamIds.includes(match.homeTeamId);
      const isAwayTeam = teamIds.includes(match.awayTeamId);
      
      if (isHomeTeam) {
        if (match.homeScore > match.awayScore) wins++;
        else if (match.homeScore < match.awayScore) losses++;
        else draws++;
      } else if (isAwayTeam) {
        if (match.awayScore > match.homeScore) wins++;
        else if (match.awayScore < match.homeScore) losses++;
        else draws++;
      }
    });
    
    // Get player count
    const playersCount = await Player.count({
      where: { teamId: { [require('../models').Sequelize.Op.in]: teamIds } }
    });
    
    // Get recent activity (last 5 matches)
    const recentMatches = await Match.findAll({
      where: {
        [require('../models').Sequelize.Op.or]: [
          { homeTeamId: { [require('../models').Sequelize.Op.in]: teamIds } },
          { awayTeamId: { [require('../models').Sequelize.Op.in]: teamIds } }
        ]
      },
      include: [
        {
          model: Team,
          as: 'homeTeam',
          attributes: ['id', 'name', 'logoUrl']
        },
        {
          model: Team,
          as: 'awayTeam',
          attributes: ['id', 'name', 'logoUrl']
        },
        {
          model: Tournament,
          as: 'tournament',
          attributes: ['id', 'name']
        }
      ],
      order: [['scheduledDate', 'DESC']],
      limit: 5
    });
    
    res.json({
      status: 'success',
      data: {
        teams: teamsCount,
        tournaments: tournamentsCount,
        matches: matchesCount,
        players: playersCount,
        record: {
          wins,
          losses,
          draws,
          winPercentage: matches.length > 0 ? (wins / matches.length * 100).toFixed(1) : 0
        },
        recentActivity: recentMatches
      }
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error retrieving user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 