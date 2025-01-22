import React, { useEffect, useState } from 'react';
import './Login.css';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isOtpPage, setIsOtpPage] = useState(false);
  const [otp, setOtp] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [fieldError , setFieldError] = useState({
    nameError : '',
    mobileError : '',
    passwordError : '',
    confirmPasswordError : '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [fileImage, setFileImage] = useState(0);

  useEffect(() => {
    const avatarUploadElement = document.querySelector('.avatar-img');
  
    if (avatarUploadElement) {
      if (fileImage) {
        avatarUploadElement.classList.add('avatar-upload-active');
      } else {
        avatarUploadElement.classList.remove('avatar-upload-active');
      }
    }
  }, [fileImage]);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
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
            setError('');  // Clear any previous error if the file is valid
        };
        setFileImage("uploaded");
        reader.readAsDataURL(file);
    }
};

const handleVerifyOtp = () => {
  
};
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!mobile || !password) {
      setError('Please fill in all fields');
      return;
    }
    if(fieldError.confirmPasswordError || fieldError.mobileError){
      setError("Voilate Conditions! Enter valid input");
      return ;
    }
    console.log('Login Details:', { mobile, password });
    showSuccessMessage('Login successful!');
    resetFields();
  };

  // Check Error : 
  const fieldValidation = (e, field) => {
    const value = e.target.value;

    if (field === 'mobile') {
      const regMobile = /^(\+)?(0|91)?[1-9][0-9]{9}$/;
      console.log(value, e.target.value)
      const regNumber = /^[0-9]+$/;
      if(regNumber.test(value)){
        setMobile(value);
      }
      else{
        setFieldError(prev => ({
          ...prev,
          mobileError: 'Enter Valid valid 0-9',
        }));
        return ;
      } 
      if (!regMobile.test(value)) {
        setFieldError(prev => ({
          ...prev,
          mobileError: 'Mobile length must be 10 and valid format',
        }));
      } else {
        
        setFieldError(prev => ({
          ...prev,
          mobileError: '',
        }));
      }
    } else if (field === 'password') {
      setPassword(value);
      const regPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
      if (!regPassword.test(value)) {
        setFieldError(prev => ({
          ...prev,
          passwordError: 'Password must be Strong!!',
        }));
      } else {
        setFieldError(prev => ({
          ...prev,
          passwordError: '',
        }));
      }
    } else if (field === 'confirmPassword') {
      setConfirmPassword(value);
      if (value !== password) {
        setFieldError(prev => ({
          ...prev,
          confirmPasswordError: 'Passwords do not match!',
        }));
      } else {
        setFieldError(prev => ({
          ...prev,
          confirmPasswordError: '',
        }));
      }
    } else if (field === 'name') {
      setName(value);
      if (value.length < 3) {
        setFieldError(prev => ({
          ...prev,
          nameError: 'Name must contain at least 3 characters',
        }));
      } else {
        setFieldError(prev => ({
          ...prev,
          nameError: '',
        }));
      }
    }
  };
const submitSignUp = (e)=>{
  e.preventDefault();
  if(fieldError.name || fieldError.passwordError || fieldError.confirmPasswordError || fieldError.mobileError){
    setError("Voilate Conditions! Enter valid input");
    return 0;
  }
  console.log('Signup Details:', { name, mobile, bio, avatar });
  showSuccessMessage('Signup successful!');
  resetFields();
}
const resetFields = () => {
  setName('');
  setMobile('');
  setBio('');
  setPassword('');
  setConfirmPassword('');
  setError('');
  setAvatar(null);
};
const showSuccessMessage = (message) => {
  setSuccessMessage(message);
  setTimeout(() => {
    setSuccessMessage('');
  }, 3000); // Hides the message after 3 seconds
};
  return (
    <div className='container-login-signUp'>
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
            <button type="button" onClick={handleVerifyOtp}>
              Verify OTP
            </button>
          </form>
          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
        </div>
      ) :
    <div className="login-container">
      {isLogin ? (
        <div className="login-form">
          <h2 className="form-title">Login</h2>
          <form onSubmit={handleLoginSubmit}>
            <label htmlFor="login-mobile">Mobile:</label>
            <input
              type="tel"
              id="login-mobile"
              value={mobile}
              required
              onChange={(e) => fieldValidation(e, 'mobile')}
            />
            {fieldError.mobileError && <p className="error-message">{fieldError.mobileError}</p>}

            <label htmlFor="login-password">Password:</label>
            <input
              type="password"
              id="login-password"
              value={password}
              required
              onChange={(e) => fieldValidation(e, 'password')}
            />
            {fieldError.passwordError && <p className="error-message">{fieldError.passwordError}</p>}

            {error && <p className="error-message">{error}</p>}
            <button type="submit">Submit</button>
          </form>
          <div className="switch-option">
            <div>OR </div>
            <button onClick={() => setIsLogin(false)} className="switch-link">Sign Up Instead</button>
          </div>
        </div>
      ) : (
        <div className="signup-form">
          <h2 className="form-title">Sign Up</h2>
          <form onSubmit={submitSignUp}>
            <div className="avatar-section">
              <div className="avatar">
                <img
                  src={avatar || 'https://via.placeholder.com/100'}
                  alt=" "
                  className="avatar-img"
                  onClick={() => document.getElementById('avatar-upload').click()}
                />
                <p className='upload-icon' onClick={ () => document.getElementById('avatar-upload').click()}>+</p>
                { (
                  <input
                    type="file"
                    id="avatar-upload"
                    style={{ display: 'none' }}
                    onChange={handleAvatarUpload}
                  />
                )}
              </div>
            </div>
            <label htmlFor="signup-name">Name:</label>
            <input
              type="text"
              id="signup-name"
              value={name}
              required
              onChange={(e) => fieldValidation(e, 'name')}
            />
            {fieldError.nameError && <p className="error-message">{fieldError.nameError}</p>}

            <label htmlFor="signup-mobile">Mobile:</label>
            <input
              type="text"
              id="signup-mobile"
              value={mobile}
              required
              onChange={(e) => fieldValidation(e, 'mobile')}
            />
            {fieldError.mobileError && <p className="error-message">{fieldError.mobileError}</p>}

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
              onChange={(e) => fieldValidation(e, 'password')}
            />
            {fieldError.passwordError && <p className="error-message">{fieldError.passwordError}</p>}

            <label htmlFor="signup-confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="signup-confirmPassword"
              value={confirmPassword}
              required
              onChange={(e) => fieldValidation(e, 'confirmPassword')}
            />
            {fieldError.confirmPasswordError && <p className="error-message">{fieldError.confirmPasswordError}</p>}

            {error && <p className="error-message">{error}</p>}
            <button type="submit" onClick={()=>{}}>Submit</button>
          </form>
          <div className="switch-option">
            <div>OR </div>
            <button onClick={() => setIsLogin(true)} className="switch-link">Login Instead</button>
          </div>
        </div>
      )}
      
    </div>
    }
    {successMessage && <div className="success-message">{successMessage}</div>}
    </div>

  );
}

export default Login;
