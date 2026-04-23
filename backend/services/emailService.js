// services/emailService.js
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS  // Your Gmail app password
  }
});

// Send booking confirmation email
const sendBookingConfirmationEmail = async (booking) => {
  const travelDate = new Date(booking.travelDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mailOptions = {
    from: `"University Bus Service" <${process.env.EMAIL_USER}>`,
    to: booking.studentEmail,
    subject: `Booking Confirmed - ${booking.bookingReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">✓ Booking Confirmed!</h1>
          <p style="color: #d1fae5; margin: 10px 0 0 0;">Your seat has been successfully reserved</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #065f46; margin-top: 0;">Booking Details</h2>
          
          <div style="margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong style="color: #374151;">Booking Reference:</strong> <span style="color: #059669;">${booking.bookingReference}</span></p>
            <p style="margin: 5px 0;"><strong style="color: #374151;">Student Name:</strong> ${booking.studentName}</p>
            <p style="margin: 5px 0;"><strong style="color: #374151;">Student ID:</strong> ${booking.studentId}</p>
          </div>
          
          <div style="border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb; padding: 15px 0; margin: 15px 0;">
            <h3 style="color: #065f46; margin-top: 0;">Trip Information</h3>
            <p style="margin: 8px 0;"><strong>Route:</strong> ${booking.routeName}</p>
            <p style="margin: 8px 0;"><strong>Bus Number:</strong> ${booking.busNumber}</p>
            <p style="margin: 8px 0;"><strong>Travel Date:</strong> ${travelDate}</p>
            <p style="margin: 8px 0;"><strong>Departure Time:</strong> ${booking.departureTime}</p>
            <p style="margin: 8px 0;"><strong>Seat Number:</strong> <span style="font-size: 24px; font-weight: bold; color: #059669;">${booking.seatNumber}</span></p>
            <p style="margin: 8px 0;"><strong>Ticket Price:</strong> LKR ${booking.ticketPrice}</p>
          </div>
          
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; color: #065f46; font-size: 14px;">
              <strong>📌 Important:</strong> Please arrive at the bus stop at least 15 minutes before departure time. 
              Carry your student ID for verification.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 30px;">
            This is an automated message from University Bus Service. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${booking.studentEmail} for booking ${booking.bookingReference}`);
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
};

// Send booking rejection email
const sendBookingRejectionEmail = async (booking, rejectionReason) => {
  const travelDate = new Date(booking.travelDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mailOptions = {
    from: `"University Bus Service" <${process.env.EMAIL_USER}>`,
    to: booking.studentEmail,
    subject: `Booking Update - ${booking.bookingReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">✗ Booking Not Confirmed</h1>
          <p style="color: #fecaca; margin: 10px 0 0 0;">We're sorry, but your booking could not be processed</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #991b1b; margin-top: 0;">Booking Update</h2>
          
          <div style="margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong style="color: #374151;">Booking Reference:</strong> ${booking.bookingReference}</p>
            <p style="margin: 5px 0;"><strong style="color: #374151;">Student Name:</strong> ${booking.studentName}</p>
            <p style="margin: 5px 0;"><strong style="color: #374151;">Student ID:</strong> ${booking.studentId}</p>
          </div>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #991b1b; margin: 0 0 10px 0;">Rejection Reason</h3>
            <p style="color: #7f1d1d; margin: 0;">${rejectionReason}</p>
          </div>
          
          <div style="border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb; padding: 15px 0; margin: 15px 0;">
            <h3 style="color: #374151; margin-top: 0;">Trip Details</h3>
            <p style="margin: 8px 0;"><strong>Route:</strong> ${booking.routeName}</p>
            <p style="margin: 8px 0;"><strong>Bus Number:</strong> ${booking.busNumber}</p>
            <p style="margin: 8px 0;"><strong>Travel Date:</strong> ${travelDate}</p>
            <p style="margin: 8px 0;"><strong>Departure Time:</strong> ${booking.departureTime}</p>
            <p style="margin: 8px 0;"><strong>Requested Seat:</strong> ${booking.seatNumber}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>💡 What to do next:</strong><br>
              • You can try booking a different seat or bus route<br>
              • Contact the transport office for assistance<br>
              • Ensure your payment slip is clear and valid
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 30px;">
            This is an automated message from University Bus Service. Please do not reply to this email.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Rejection email sent to ${booking.studentEmail} for booking ${booking.bookingReference}`);
    return true;
  } catch (error) {
    console.error('Error sending rejection email:', error);
    return false;
  }
};

module.exports = {
  sendBookingConfirmationEmail,
  sendBookingRejectionEmail
};