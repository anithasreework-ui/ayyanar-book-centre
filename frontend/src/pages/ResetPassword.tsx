import React from 'react';
import { Link } from 'react-router-dom';

const ResetPassword = () => {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>Reset Password</h2>
      <p>Password reset is disabled. Please use Phone OTP Login.</p>
      <Link to="/login">Go to Login</Link>
    </div>
  );
};

export default ResetPassword;
