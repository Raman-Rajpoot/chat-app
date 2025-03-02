import rateLimit from 'express-rate-limit';

const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, 
    message: "Too many OTP requests, try again later.",
});

export default otpLimiter;