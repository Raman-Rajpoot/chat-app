import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a transporter using your email service details (e.g., Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,      // Your email address
    pass: process.env.EMAIL_PASSWORD,  // Your email password or an app-specific password if using 2FA
  },
});
const sendOTP = async (email, otp) => {
  try {
    if (!email || !otp) {
      throw new Error("Email and OTP are required");
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`,
      html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}: ${otp}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

export default sendOTP;
