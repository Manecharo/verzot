const { Notification, User, sequelize } = require('../models');
const nodemailer = require('nodemailer');

/**
 * Notification service for creating and sending notifications
 */
class NotificationService {
  /**
   * Create a notification in the database
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification
   */
  static async createNotification(notificationData) {
    const { userId, type, title, message, metadata, priority, expiresAt } = notificationData;

    try {
      // Create notification
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        metadata: metadata || {},
        priority: priority || 'normal',
        expiresAt: expiresAt || null
      });

      // If notification related to email, send it
      if (notificationData.sendEmail) {
        const user = await User.findByPk(userId);
        if (user && user.email) {
          await this.sendEmailNotification(user.email, title, message);
          
          // Update notification to mark email as sent
          await notification.update({ emailSent: true });
        }
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Send email notification
   * @param {string} email - Recipient email
   * @param {string} subject - Email subject
   * @param {string} message - Email message
   * @returns {Promise<Object>} Email send result
   */
  static async sendEmailNotification(email, subject, message) {
    try {
      // In production, this would use actual email service like SendGrid
      // For now, just log the email details
      console.log(`Email notification to ${email}: ${subject} - ${message}`);
      
      // Uncomment and configure this for actual email sending
      /*
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const result = await transporter.sendMail({
        from: `"Verzot" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: subject,
        text: message,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
                <h2 style="color: #3498db;">${subject}</h2>
                <p>${message}</p>
                <hr>
                <p style="font-size: 12px; color: #777;">This is an automated message from Verzot.</p>
              </div>`
      });
      
      return result;
      */
      
      return { success: true, message: 'Email notification logged (not actually sent)' };
    } catch (error) {
      console.error('Error sending email notification:', error);
      throw error;
    }
  }

  /**
   * Create a team invitation notification
   * @param {string} userId - User ID to notify
   * @param {string} teamId - Team ID
   * @param {string} teamName - Team name
   * @param {string} inviterName - Name of the person who sent the invitation
   * @param {boolean} sendEmail - Whether to send an email
   * @returns {Promise<Object>} Created notification
   */
  static async createTeamInvitation(userId, teamId, teamName, inviterName, sendEmail = true) {
    const title = `Team Invitation`;
    const message = `${inviterName} has invited you to join ${teamName}`;
    
    return this.createNotification({
      userId,
      type: 'team_invitation',
      title,
      message,
      metadata: { teamId, teamName, inviterName },
      priority: 'normal',
      sendEmail
    });
  }

  /**
   * Create a tournament invitation notification
   * @param {string} userId - User ID to notify
   * @param {string} tournamentId - Tournament ID
   * @param {string} tournamentName - Tournament name
   * @param {string} inviterName - Name of the person who sent the invitation
   * @param {boolean} sendEmail - Whether to send an email
   * @returns {Promise<Object>} Created notification
   */
  static async createTournamentInvitation(userId, tournamentId, tournamentName, inviterName, sendEmail = true) {
    const title = `Tournament Invitation`;
    const message = `${inviterName} has invited you to participate in ${tournamentName}`;
    
    return this.createNotification({
      userId,
      type: 'tournament_invite',
      title,
      message,
      metadata: { tournamentId, tournamentName, inviterName },
      priority: 'normal',
      sendEmail
    });
  }

  /**
   * Create a match scheduled notification
   * @param {string} userId - User ID to notify
   * @param {Object} matchDetails - Match details
   * @param {boolean} sendEmail - Whether to send an email
   * @returns {Promise<Object>} Created notification
   */
  static async createMatchScheduledNotification(userId, matchDetails, sendEmail = true) {
    const { id, matchDate, homeTeamName, awayTeamName, tournamentName } = matchDetails;
    
    const title = `Match Scheduled`;
    const message = `A new match has been scheduled: ${homeTeamName} vs ${awayTeamName} on ${new Date(matchDate).toLocaleString()}`;
    
    return this.createNotification({
      userId,
      type: 'match_scheduled',
      title,
      message,
      metadata: { matchId: id, homeTeamName, awayTeamName, tournamentName, matchDate },
      priority: 'normal',
      sendEmail
    });
  }

  /**
   * Create a match result notification
   * @param {string} userId - User ID to notify
   * @param {Object} resultDetails - Match result details
   * @param {boolean} sendEmail - Whether to send an email
   * @returns {Promise<Object>} Created notification
   */
  static async createMatchResultNotification(userId, resultDetails, sendEmail = true) {
    const { id, homeTeamName, homeScore, awayTeamName, awayScore, tournamentName } = resultDetails;
    
    const title = `Match Result`;
    const message = `Match result: ${homeTeamName} ${homeScore} - ${awayScore} ${awayTeamName}`;
    
    return this.createNotification({
      userId,
      type: 'match_result',
      title,
      message,
      metadata: { matchId: id, homeTeamName, homeScore, awayTeamName, awayScore, tournamentName },
      priority: 'normal',
      sendEmail
    });
  }

  /**
   * Create a tournament status notification
   * @param {string} userId - User ID to notify
   * @param {Object} tournamentDetails - Tournament details
   * @param {boolean} sendEmail - Whether to send an email
   * @returns {Promise<Object>} Created notification
   */
  static async createTournamentStatusNotification(userId, tournamentDetails, sendEmail = true) {
    const { id, name, status, previousStatus } = tournamentDetails;
    
    let title = `Tournament Status Update`;
    let message = `The status of tournament "${name}" has changed from ${previousStatus} to ${status}`;
    
    // Customize message based on status
    if (status === 'in-progress') {
      title = `Tournament Started`;
      message = `The tournament "${name}" has officially started`;
    } else if (status === 'completed') {
      title = `Tournament Completed`;
      message = `The tournament "${name}" has been completed`;
    } else if (status === 'cancelled') {
      title = `Tournament Cancelled`;
      message = `The tournament "${name}" has been cancelled`;
    }
    
    return this.createNotification({
      userId,
      type: 'tournament_status',
      title,
      message,
      metadata: { tournamentId: id, tournamentName: name, status, previousStatus },
      priority: status === 'cancelled' ? 'high' : 'normal',
      sendEmail
    });
  }

  /**
   * Create a registration status notification
   * @param {string} userId - User ID to notify
   * @param {Object} registrationDetails - Registration details
   * @param {boolean} sendEmail - Whether to send an email
   * @returns {Promise<Object>} Created notification
   */
  static async createRegistrationStatusNotification(userId, registrationDetails, sendEmail = true) {
    const { teamName, tournamentName, status } = registrationDetails;
    
    let title = `Registration Status Update`;
    let message = '';
    let priority = 'normal';
    
    if (status === 'approved') {
      title = `Registration Approved`;
      message = `Your team "${teamName}" has been approved for "${tournamentName}"`;
    } else if (status === 'rejected') {
      title = `Registration Rejected`;
      message = `Your team "${teamName}" registration for "${tournamentName}" has been rejected`;
      priority = 'high';
    }
    
    return this.createNotification({
      userId,
      type: 'registration_status',
      title,
      message,
      metadata: registrationDetails,
      priority,
      sendEmail
    });
  }

  /**
   * Create a match event notification
   * @param {string} userId - User ID to notify
   * @param {string} eventType - Type of match event (match_goal, match_red_card)
   * @param {Object} eventDetails - Event details
   * @param {boolean} sendEmail - Whether to send an email
   * @returns {Promise<Object>} Created notification
   */
  static async createMatchEventNotification(userId, eventType, eventDetails, sendEmail = true) {
    const { 
      matchId, 
      homeTeamName, 
      awayTeamName, 
      playerName, 
      playerNumber, 
      teamName, 
      minute,
      half,
      description 
    } = eventDetails;
    
    let title = '';
    let message = '';
    let priority = 'normal';
    
    // Format time display (e.g., "45+2" for added time)
    const timeDisplay = eventDetails.addedTime > 0 ? `${minute}+${eventDetails.addedTime}` : `${minute}`;
    
    if (eventType === 'match_goal') {
      title = `Goal Scored`;
      message = `${playerName} (${teamName}) scored a goal at ${timeDisplay}' in the match ${homeTeamName} vs ${awayTeamName}`;
    } else if (eventType === 'match_red_card') {
      title = `Red Card`;
      message = `${playerName} (${teamName}) received a red card at ${timeDisplay}' in the match ${homeTeamName} vs ${awayTeamName}`;
      priority = 'high';
    }
    
    return this.createNotification({
      userId,
      type: eventType,
      title,
      message,
      metadata: {
        matchId,
        playerName,
        playerNumber,
        teamName,
        minute,
        half,
        homeTeamName,
        awayTeamName,
        description
      },
      priority,
      sendEmail
    });
  }

  /**
   * Create a system announcement notification
   * @param {Array<string>} userIds - User IDs to notify
   * @param {string} title - Announcement title
   * @param {string} message - Announcement message
   * @param {boolean} sendEmail - Whether to send an email
   * @returns {Promise<Array<Object>>} Created notifications
   */
  static async createSystemAnnouncement(userIds, title, message, sendEmail = true) {
    try {
      const notificationPromises = userIds.map(userId => 
        this.createNotification({
          userId,
          type: 'admin_announcement',
          title,
          message,
          priority: 'normal',
          sendEmail
        })
      );
      
      return Promise.all(notificationPromises);
    } catch (error) {
      console.error('Error creating system announcement:', error);
      throw error;
    }
  }
}

module.exports = NotificationService; 