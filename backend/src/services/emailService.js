const nodemailer = require('nodemailer');
const moment = require('moment');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendBookingConfirmation(booking) {
        const formattedDateTime = moment(booking.dateTime).format('MMMM Do YYYY, h:mm a');
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: booking.email,
            subject: 'Your Soul Connect Session is Confirmed!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1A1A1A;">Your Session is Confirmed!</h2>
                    <p>Dear valued member,</p>
                    <p>Your session with Soul Connect has been confirmed for:</p>
                    <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <strong>Date and Time:</strong> ${formattedDateTime}
                    </div>
                    <h3>Session Details:</h3>
                    <ul>
                        <li>Duration: 45 minutes</li>
                        <li>Format: Online video session</li>
                        <li>Cost: $20</li>
                    </ul>
                    <p>Please make sure to:</p>
                    <ul>
                        <li>Be in a quiet, private space</li>
                        <li>Have a stable internet connection</li>
                        <li>Join 5 minutes before the session</li>
                    </ul>
                    <p>Need to reschedule? Please contact us at least 24 hours before your session.</p>
                    <p style="margin-top: 30px;">Best regards,<br>The Soul Connect Team</p>
                </div>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Confirmation email sent to:', booking.email);
        } catch (error) {
            console.error('Error sending confirmation email:', error);
            throw error;
        }
    }

    async sendAdminNotification(booking) {
        const formattedDateTime = moment(booking.dateTime).format('MMMM Do YYYY, h:mm a');
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Admin email
            subject: 'New Session Booking',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1A1A1A;">New Session Booked</h2>
                    <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Client Email:</strong> ${booking.email}</p>
                        <p><strong>Date and Time:</strong> ${formattedDateTime}</p>
                    </div>
                    <p>This session has been automatically added to your Google Calendar.</p>
                </div>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Admin notification email sent');
        } catch (error) {
            console.error('Error sending admin notification:', error);
            throw error;
        }
    }
}

module.exports = new EmailService(); 