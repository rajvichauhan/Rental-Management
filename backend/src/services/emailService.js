const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
    this.templates = new Map();
    this.loadTemplates();
  }

  /**
   * Create email transporter
   */
  createTransporter() {
    const config = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    };

    // For development, use ethereal email
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_HOST) {
      return nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass'
        }
      });
    }

    return nodemailer.createTransporter(config);
  }

  /**
   * Load email templates
   */
  loadTemplates() {
    const templatesDir = path.join(__dirname, '../templates/email');
    
    // Create templates directory if it doesn't exist
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
      this.createDefaultTemplates(templatesDir);
    }

    try {
      const templateFiles = fs.readdirSync(templatesDir);
      
      templateFiles.forEach(file => {
        if (file.endsWith('.hbs')) {
          const templateName = file.replace('.hbs', '');
          const templateContent = fs.readFileSync(path.join(templatesDir, file), 'utf8');
          this.templates.set(templateName, handlebars.compile(templateContent));
        }
      });
      
      logger.info(`Loaded ${this.templates.size} email templates`);
    } catch (error) {
      logger.error('Failed to load email templates:', error);
    }
  }

  /**
   * Create default email templates
   */
  createDefaultTemplates(templatesDir) {
    const templates = {
      'verification': `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Email Verification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Welcome to {{appName}}!</h2>
        <p>Hi {{firstName}},</p>
        <p>Thank you for registering with {{appName}}. Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{verificationUrl}}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">{{verificationUrl}}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account with us, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">{{appName}} Team</p>
    </div>
</body>
</html>`,
      
      'password-reset': `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Password Reset Request</h2>
        <p>Hi {{firstName}},</p>
        <p>You requested a password reset for your {{appName}} account. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{resetUrl}}" style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">{{resetUrl}}</p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">{{appName}} Team</p>
    </div>
</body>
</html>`,

      'order-confirmation': `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #27ae60;">Order Confirmed!</h2>
        <p>Hi {{customerName}},</p>
        <p>Your rental order has been confirmed. Here are the details:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> {{orderNumber}}</p>
            <p><strong>Rental Period:</strong> {{rentalStart}} to {{rentalEnd}}</p>
            <p><strong>Total Amount:</strong> ${{totalAmount}}</p>
        </div>
        
        <h3>Items:</h3>
        {{#each items}}
        <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
            <p><strong>{{name}}</strong></p>
            <p>Quantity: {{quantity}} | Price: ${{price}}</p>
        </div>
        {{/each}}
        
        <p>We'll send you a reminder before your pickup date.</p>
        <p>Thank you for choosing {{appName}}!</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">{{appName}} Team</p>
    </div>
</body>
</html>`,

      'rental-reminder': `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rental Return Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f39c12;">Rental Return Reminder</h2>
        <p>Hi {{customerName}},</p>
        <p>This is a friendly reminder that your rental is due for return soon.</p>
        
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f39c12;">
            <h3>Return Details</h3>
            <p><strong>Order Number:</strong> {{orderNumber}}</p>
            <p><strong>Return Date:</strong> {{returnDate}}</p>
            <p><strong>Days Remaining:</strong> {{daysRemaining}}</p>
        </div>
        
        <p>Please ensure all items are returned on time to avoid late fees.</p>
        <p>If you need to extend your rental, please contact us as soon as possible.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">{{appName}} Team</p>
    </div>
</body>
</html>`
    };

    Object.entries(templates).forEach(([name, content]) => {
      fs.writeFileSync(path.join(templatesDir, `${name}.hbs`), content);
    });
  }

  /**
   * Send email
   */
  async sendEmail(to, subject, templateName, data = {}) {
    try {
      const template = this.templates.get(templateName);
      if (!template) {
        throw new Error(`Template ${templateName} not found`);
      }

      const html = template({
        ...data,
        appName: process.env.APP_NAME || 'Rental Management System',
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('Email sent successfully:', {
        to,
        subject,
        template: templateName,
        messageId: result.messageId
      });

      return result;
    } catch (error) {
      logger.error('Failed to send email:', {
        to,
        subject,
        template: templateName,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(email, firstName, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    
    return this.sendEmail(
      email,
      'Verify Your Email Address',
      'verification',
      {
        firstName,
        verificationUrl
      }
    );
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, firstName, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    
    return this.sendEmail(
      email,
      'Password Reset Request',
      'password-reset',
      {
        firstName,
        resetUrl
      }
    );
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(email, orderData) {
    return this.sendEmail(
      email,
      `Order Confirmation - ${orderData.orderNumber}`,
      'order-confirmation',
      orderData
    );
  }

  /**
   * Send rental reminder email
   */
  async sendRentalReminderEmail(email, reminderData) {
    return this.sendEmail(
      email,
      `Rental Return Reminder - ${reminderData.orderNumber}`,
      'rental-reminder',
      reminderData
    );
  }

  /**
   * Test email configuration
   */
  async testConnection() {
    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
