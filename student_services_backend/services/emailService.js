const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendMeetingLink = async (studentEmail, studentName, date, time, link) => {
    // 1. ENSURE LINK HAS HTTPS
    let safeLink = link.trim();
    if (!safeLink.startsWith('http')) {
        safeLink = `https://${safeLink}`;
    }

    const mailOptions = {
        from: `"QCU Counseling Unit" <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: 'Counseling Session Confirmed - Meeting Details',
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                
                <div style="text-align: center; border-bottom: 2px solid #2c3e7f; padding-bottom: 15px; margin-bottom: 20px;">
                    <h2 style="color: #2c3e7f; margin: 0;">Session Confirmed</h2>
                </div>

                <p>Hi <strong>${studentName}</strong>,</p>
                <p>Your counseling request has been approved and scheduled. Please see the details below:</p>
                
                <div style="background-color: #f8f9fa; border-left: 4px solid #2c3e7f; padding: 15px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${date}</p>
                    <p style="margin: 5px 0;"><strong>⏰ Time:</strong> ${time}</p>
                    <p style="margin: 5px 0;"><strong>📍 Mode:</strong> Virtual (Google Meet)</p>
                </div>

                <p style="text-align: center; margin-bottom: 10px;">Click the button below to join at your scheduled time:</p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${safeLink}" target="_blank" style="background-color: #2c3e7f; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                        Join Google Meet
                    </a>
                </div>

                <p style="font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 15px;">
                    If the button above doesn't work, copy and paste this link into your browser:<br>
                    <a href="${safeLink}" style="color: #2c3e7f;">${safeLink}</a>
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${studentEmail}`);
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
};

module.exports = { sendMeetingLink };