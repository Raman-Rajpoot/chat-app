import React, { useEffect, useState, useRef, useNevigate } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { updateData } from "../redux/features/user.feature";
import { useSelector, useDispatch } from 'react-redux';
import userAPI from "../api/user.api";
function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isOtpPage, setIsOtpPage] = useState(false);
  const timeoutRef = useRef(null);
  const [otp, setOtp] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [fieldError, setFieldError] = useState({
    nameError: "",
    emailError: "",
    passwordError: "",
    confirmPasswordError: "",
  });
  
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");
  const [fileImage, setFileImage] = useState(0);
  const [isReviewPage, setIsReviewPage] = useState(false); // New state for review page
  const [isLoading, setIsLoading] = useState(false); // New loading state

  const userData = useSelector((state) => state.userData);
  const dispatch = useDispatch();


  useEffect(() => {
    const avatarUploadElement = document.querySelector(".avatar-img");
    if (avatarUploadElement) {
      if (fileImage) {
        avatarUploadElement.classList.add("avatar-upload-active");
      } else {
        avatarUploadElement.classList.remove("avatar-upload-active");
      }
    }
  }, [fileImage]);

  useEffect(() => {
    if (successMessage) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setSuccessMessage("");
      }, 8000);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [successMessage]);

  // Upload avatar image
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a valid image (JPEG, PNG, GIF).");
        return;
      }
      if (file.size > maxSize) {
        setError("File size exceeds 5MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result);
        setError("");
      };
      setFileImage("uploaded");
      reader.readAsDataURL(file);
    }
  };

  // Send OTP to email for signup verification
  const handleSendOtp = async () => {
    if (!email || !password || !name) {
      setError("Please fill in Name, Email, and Password to get OTP");
      return;
    }
    setIsLoading(true);
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        return;
      }

      // Send request to get OTP
      const response = await fetch("http://localhost:8000/user/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(data.message);
        setIsOtpPage(true);
        setError("");
      } else {
        setError(data.message || "Error sending OTP");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError("Error connecting to server for OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter OTP");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/user/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessMessage("OTP verified successfully");
        setIsOtpPage(false);
        setIsReviewPage(true); // Show review page after OTP verification
        setError("");
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError("Error connecting to server for OTP verification");
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input fields
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (fieldError.emailError || fieldError.passwordError) {
      setError("Please correct the errors before submitting");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Make the login request
      const response = await fetch("http://localhost:8000/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        // credentials: 'include', // Uncomment if you are sending cookies
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || "Login failed");
      } else {
        setSuccessMessage(data.message || "Login successful!");
        
        // Ensure the accessToken exists before storing it
        if (data.data && data.data.accessToken) {
          localStorage.setItem("accessToken", data.data.accessToken);
          console.log("Type of accessToken:", typeof data.data.accessToken);
          console.log("accessToken (stringified):", JSON.stringify(data.data.accessToken, null, 2));


          localStorage.getItem("accessToken");
        } else {
          console.warn("No accessToken found in response", data);
        }
        
        // Update Redux with user data if available
        if (data.data && data.data.user) {
          dispatch(updateData(data.data.user));
        }
        
        // Reset the form fields and navigate to the home page
        resetFields();
        navigate('/');
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError("Error connecting to server for login");
    } finally {
      setIsLoading(false);
    }
  };
  
 
     


  // Field validation for various inputs
  const fieldValidation = (e, field) => {
    const value = e.target.value;
    if (field === "email") {
      setEmail(value);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setFieldError((prev) => ({
          ...prev,
          emailError: "Please enter a valid email address",
        }));
      } else {
        setFieldError((prev) => ({ ...prev, emailError: "" }));
      }
    } else if (field === "password") {
      setPassword(value);
      const regPassword =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
      if (!regPassword.test(value)) {
        setFieldError((prev) => ({
          ...prev,
          passwordError: "Password must be strong!",
        }));
      } else {
        setFieldError((prev) => ({ ...prev, passwordError: "" }));
      }
    } else if (field === "confirmPassword") {
      setConfirmPassword(value);
      if (value !== password) {
        setFieldError((prev) => ({
          ...prev,
          confirmPasswordError: "Passwords do not match!",
        }));
      } else {
        setFieldError((prev) => ({ ...prev, confirmPasswordError: "" }));
      }
    } else if (field === "name") {
      setName(value);
      if (value.length < 3) {
        setFieldError((prev) => ({
          ...prev,
          nameError: "Name must contain at least 3 characters",
        }));
      } else {
        setFieldError((prev) => ({ ...prev, nameError: "" }));
      }
    }
  };

  // Signup API call
  const submitSignUp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (
      fieldError.nameError ||
      fieldError.passwordError ||
      fieldError.confirmPasswordError ||
      fieldError.emailError
    ) {
      setError("Please correct the errors before submitting");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          bio,
          password,
          enteredOTP: otp,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(data.message || "Signup successful!");
        resetFields();
        setIsReviewPage(false); // Close review page after successful signup
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      console.error("Error during signup:", err);
      setError("Error connecting to server for signup");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset all fields
  const resetFields = () => {
    setName("");
    setEmail("");
    setBio("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setAvatar(null);
    setOtp("");
  };

  // Review Page Component
  const ReviewPage = () => (
    <div className="review-page">
      <h2 className="form-title">Review Your Information</h2>
      <div className="review-content">
        <div className="review-avatar">
          {avatar && <img src={avatar} alt="Avatar Preview" />}
        </div>
        <div className="review-details">
          <p>
            <strong>Name:</strong> {name}
          </p>
          <p>
            <strong>Email:</strong> {email}
          </p>
          {bio && (
            <p>
              <strong>Bio:</strong> {bio}
            </p>
          )}
        </div>
      </div>
      <div className="review-actions">
        <button
          type="button"
          onClick={submitSignUp}
          className="confirm-button"
          disabled={isLoading}
        >
          {isLoading ? <span className="loader"></span> : "Confirm Sign Up"}
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );

  return (
    <div className="container-login-signUp">
      {successMessage && (
        <div className="success-message-container">
          <div className="success-message">{successMessage}</div>
        </div>
      )}
      {isOtpPage ? (
        <div className="otp-page">
          <h2 className="form-title">Verify OTP</h2>
          <form>
            <label htmlFor="otp">OTP:</label>
            <input
              type="text"
              id="otp"
              value={otp}
              required
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isLoading}
            >
              {isLoading ? <span className="loader"></span> : "Submit"}
            </button>
          </form>
          {error && <p className="error-message">{error}</p>}
        </div>
      ) : isReviewPage ? (
        <ReviewPage />
      ) : (
        <div className="login-container">
          {isLogin ? (
            <div className="login-form">
              <h2 className="form-title">Login</h2>
              <form onSubmit={handleLoginSubmit}>
                <label htmlFor="login-email">Email:</label>
                <input
                  type="email"
                  id="login-email"
                  value={email}
                  required
                  onChange={(e) => fieldValidation(e, "email")}
                />
                {fieldError.emailError && (
                  <p className="error-message">{fieldError.emailError}</p>
                )}

                <label htmlFor="login-password">Password:</label>
                <input
                  type="password"
                  id="login-password"
                  value={password}
                  required
                  onChange={(e) => fieldValidation(e, "password")}
                />
                {fieldError.passwordError && (
                  <p className="error-message">{fieldError.passwordError}</p>
                )}

                {error && <p className="error-message">{error}</p>}
                <button type="submit" disabled={isLoading}>
                  {isLoading ? <span className="loader"></span> : "Login"}
                </button>
              </form>
              <div className="switch-option">
                <div>OR</div>
                <button
                  onClick={() => {
                    setIsLogin(false);
                    resetFields();
                  }}
                  className="switch-link"
                >
                  Sign Up Instead
                </button>
              </div>
            </div>
          ) : (
            <div className="signup-form">
              <h2 className="form-title">Sign Up</h2>
              <form onSubmit={submitSignUp}>
                <div className="avatar-section">
                  <div className="avatar-container">
                    <div className="avatar">
                      <img
                        src={
                          avatar ||
                          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iOCIgcj0iNCIvPjxwYXRoIGQ9Ik0yMCAyMHYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIi8+PC9zdmc+"
                        }
                        alt="Avatar"
                        className="avatar-img"
                        onClick={() =>
                          document.getElementById("avatar-upload").click()
                        }
                      />
                      <div className="upload-icon">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 6V18M18 12L6 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="file"
                      id="avatar-upload"
                      style={{ display: "none" }}
                      onChange={handleAvatarUpload}
                    />
                  </div>
                </div>
                <label htmlFor="signup-name">Name:</label>
                <input
                  type="text"
                  id="signup-name"
                  value={name}
                  required
                  onChange={(e) => fieldValidation(e, "name")}
                />
                {fieldError.nameError && (
                  <p className="error-message">{fieldError.nameError}</p>
                )}

                <label htmlFor="signup-email">Email:</label>
                <input
                  type="email"
                  id="signup-email"
                  value={email}
                  required
                  onChange={(e) => fieldValidation(e, "email")}
                />
                {fieldError.emailError && (
                  <p className="error-message">{fieldError.emailError}</p>
                )}

                <label htmlFor="signup-bio">Bio:</label>
                <input
                  type="text"
                  id="signup-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />

                <label htmlFor="signup-password">Password:</label>
                <input
                  type="password"
                  id="signup-password"
                  value={password}
                  required
                  onChange={(e) => fieldValidation(e, "password")}
                />
                {fieldError.passwordError && (
                  <p className="error-message">{fieldError.passwordError}</p>
                )}

                <label htmlFor="signup-confirmPassword">
                  Confirm Password:
                </label>
                <input
                  type="password"
                  id="signup-confirmPassword"
                  value={confirmPassword}
                  required
                  onChange={(e) => fieldValidation(e, "confirmPassword")}
                />
                {fieldError.confirmPasswordError && (
                  <p className="error-message">
                    {fieldError.confirmPasswordError}
                  </p>
                )}

                {error && <p className="error-message">{error}</p>}
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                >
                  {isLoading ? <span className="loader"></span> : "NEXT"}
                </button>
              </form>
              <div className="switch-option">
                <div>OR</div>
                <button
                  onClick={() => {
                    setIsLogin(true);
                    resetFields();
                  }}
                  className="switch-link"
                >
                  Login Instead
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Login;
