const nodemailer = require("nodemailer");

const BANNER_URL = "https://obcrights.org/wp-content/uploads/2024/06/bannari-amman-college.jpeg";



const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"SKILL BIT" <${process.env.ADMIN_EMAIL_ADDRESS}>`,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const sendEmailParticipants = async (bcc, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"SKILL BIT" <${process.env.ADMIN_EMAIL_ADDRESS}>`,
      bcc,
      subject,
      text,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const sendEmailHtml = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from:`"SKILL BIT" <${process.env.ADMIN_EMAIL_ADDRESS}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const sendEmailParticipantsHtml = async (bcc, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"TASK BIT" <${process.env.ADMIN_EMAIL_ADDRESS}>`,
      bcc,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};


const generateEmailTemplate = (title, body) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
    <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #4CAF50;">${title}</h2>
      <p>${body}</p>
      <footer style="margin-top: 20px; text-align: center; font-size: 0.9em; color: #999;">
        This is an automated email. Please do not reply.
      </footer>
    </div>
  </div>
`;

const generateEmailTemplateHtml = (
  skillName,
  skillCategory,
  taggedDepartment,
  taggedYear,
  maxCount,
  organiser,
  regStartTime,
  regEndTime,
  skillStartTime,
  skillEndTime,
  startTime,
  endTime,
  description,
  venueName
) => `
  <div style="font-family: 'Segoe UI', sans-serif; max-width: 640px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <div style="background-color: #4CAF50; color: white; padding: 24px; text-align: center;">
      <h2 style="margin: 0;">📚 ${skillName}</h2>
      <p style="margin: 4px 0 0; font-size: 16px;">${skillCategory}</p>
    </div>

    <img src="${BANNER_URL}" alt="Skill Banner" style="width: 100%; height: auto; max-height: 200px; object-fit: cover;" />

    <div style="padding: 24px; color: #333;">
      <h3 style="margin-bottom: 8px;">📝 Skill Details</h3>
      <table style="width: 100%; font-size: 15px; line-height: 1.6;">
        <tr><td><strong>Departments:</strong></td><td>${taggedDepartment.join(', ')}</td></tr>
        <tr><td><strong>Year:</strong></td><td>${taggedYear}</td></tr>
        <tr><td><strong>Venues:</strong></td><td>${venueName.join(', ')}</td></tr>
        <tr><td><strong>Max Participants:</strong></td><td>${maxCount}</td></tr>
        <tr><td><strong>Organiser:</strong></td><td>${organiser}</td></tr>
        <tr><td><strong>Registration:</strong></td><td>${regStartTime} → ${regEndTime}</td></tr>
        <tr><td><strong>Skill Duration:</strong></td><td>${skillStartTime} → ${skillEndTime}</td></tr>
        <tr><td><strong>Daily Timing:</strong></td><td>${startTime} → ${endTime}</td></tr>
      </table>

      <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;" />

      <h3 style="margin-bottom: 8px;">📌 Description</h3>
      <p style="font-size: 15px; color: #555;">${description}</p>
    </div>

    <div style="background-color: #f9f9f9; padding: 16px; text-align: center; font-size: 14px; color: #999;">
      Thank you for being a part of the learning journey!
    </div>
  </div>
`;

const generateEmailTemplateHtmlRejected = (
  skillName,
  skillCategory,
  taggedDepartment,
  taggedYear,
  maxCount,
  organiser,
  regStartTime,
  regEndTime,
  skillStartTime,
  skillEndTime,
  startTime,
  endTime,
  description,
  rejectionReason,
  venueName
) => `
  <div style="font-family: 'Segoe UI', sans-serif; max-width: 640px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <div style="background-color: #4CAF50; color: white; padding: 24px; text-align: center;">
      <h2 style="margin: 0;">📚 ${skillName}</h2>
      <p style="margin: 4px 0 0; font-size: 16px;">${skillCategory}</p>
    </div>

    <img src="${BANNER_URL}" alt="Skill Banner" style="width: 100%; height: auto; max-height: 200px; object-fit: cover;" />

    <div style="padding: 24px; color: #333;">
      <h3 style="margin-bottom: 8px;">📝 Skill Details</h3>
      <table style="width: 100%; font-size: 15px; line-height: 1.6;">
        <tr><td><strong>Departments:</strong></td><td>${taggedDepartment.join(', ')}</td></tr>
        <tr><td><strong>Year:</strong></td><td>${taggedYear}</td></tr>
        <tr><td><strong>Venues:</strong></td><td>${venueName.join(', ')}</td></tr>
        <tr><td><strong>Max Participants:</strong></td><td>${maxCount}</td></tr>
        <tr><td><strong>Organiser:</strong></td><td>${organiser}</td></tr>
        <tr><td><strong>Registration:</strong></td><td>${regStartTime} → ${regEndTime}</td></tr>
        <tr><td><strong>Skill Duration:</strong></td><td>${skillStartTime} → ${skillEndTime}</td></tr>
        <tr><td><strong>Daily Timing:</strong></td><td>${startTime} → ${endTime}</td></tr>
      </table>

      <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;" />

      <h3 style="margin-bottom: 8px;">📌 Description</h3>
      <p style="font-size: 15px; color: #555;">${description}</p>

      <h3 style="margin-bottom: 8px;">🚫 Rejection Reason</h3
      <p style="font-size: 15px; color: #555;">${rejectionReason}</p>
      
    </div>

    <div style="background-color: #f9f9f9; padding: 16px; text-align: center; font-size: 14px; color: #999;">
      Thank you for being a part of the learning journey!
    </div>
  </div>
`;



const sendRsvpEmail = async (event, htmlContent, jsonLD) => {
  try {
    await transporter.sendMail({
      from: `"Entra BIT" <${process.env.EMAIL_USER}>`,
      to: event.participants.join(", "),
      subject: `You're Invited: ${event.title}`,
      html: htmlContent,
      headers: {
        "Content-Type": "application/ld+json",
      },
      alternatives: [
        {
          contentType: "application/ld+json",
          content: JSON.stringify(jsonLD),
        },
      ],
    });

    console.log("RSVP email sent successfully.");
  } catch (error) {
    console.error("Error sending RSVP email:", error);
  }
};

const generateRSVPJsonLD = (event, actionUrl) => {
  return {
    "@context": "http://schema.org",
    "@type": "EmailMessage",
    "action": [
      {
        "@type": "RsvpAction",
        "name": "Accept",
        "handler": {
          "@type": "HttpActionHandler",
          "url": `${actionUrl}/rsvp?eventId=${event._id}&response=accepted&email={responseEmail}`,
        },
      },
      {
        "@type": "RsvpAction",
        "name": "Decline",
        "handler": {
          "@type": "HttpActionHandler",
          "url": `${actionUrl}/rsvp?eventId=${event._id}&response=declined&email={responseEmail}`,
        },
      },
    ],
    "description": `${event.description}`,
    "startDate": event.startTime,
    "endDate": event.endTime,
  };
};

module.exports = {
  sendEmail,
  sendEmailParticipants,
  generateEmailTemplate,
  sendRsvpEmail,
  generateRSVPJsonLD,
  sendEmailHtml,
  sendEmailParticipantsHtml,
  generateEmailTemplateHtml,
  generateEmailTemplateHtmlRejected,
  BANNER_URL
};
