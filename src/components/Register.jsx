import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Register.css';
import { Button, Input, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { initiateGoogleLogin, initiateGithubLogin, initiateLinkedInLogin } from '../utils/oauth';
import { authAPI } from '../services/api';
import { STORAGE_KEYS } from '../config/constants';

const Register = () => {
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // ✅ Handle OAuth Callback
    useEffect(() => {
        const handleOAuthCallback = async () => {
            const params = new URLSearchParams(location.search);
            const code = params.get('code');

            if (!code) return;

            // Determine provider from pathname (e.g., /auth/google/callback)
            const pathParts = location.pathname.split('/');
            const provider = pathParts[2];

            if (!provider) return;

            setLoading(true);
            setError('');

            try {
                const response = await authAPI.oauthCallback(provider, code);
                const token = response?.token;

                if (token) {
                    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
                    navigate('/home');
                } else {
                    setError('Authentication failed. No token received.');
                }
            } catch (err) {
                console.error('OAuth callback error:', err);
                setError(err.response?.data?.message || 'OAuth authentication failed.');
            } finally {
                setLoading(false);
            }
        };

        handleOAuthCallback();
    }, [location, navigate]);

    // ✅ Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ✅ Handle registration
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authAPI.register(formData);
            navigate('/login');
        } catch (err) {
            console.error('Registration error:', err);
            let msg = err?.response?.data?.message ?? '';
            const status = err?.response?.status;

            if (!msg) {
                if (status === 409) msg = 'User already exists. Try logging in or use a different email.';
                else if (status === 400) msg = 'Invalid registration data. Please check your inputs.';
                else msg = 'Registration failed. Please try again.';
            }

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>Create an Account</h2>

                {error && <div className="error-message">{error}</div>}
                {loading && <div className="loading-message">Processing...</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="displayName">Display Name</label>
                        <Input
                            id="displayName"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleChange}
                            required
                            fullWidth
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            fullWidth
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            required
                            fullWidth
                            disabled={loading}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                        disabled={loading}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                    </div>

                    <Button
                        type="submit"
                        className="submit-button"
                        fullWidth
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </Button>
                </form>

                <div className="social-login">
                    <div className="divider"><span>OR</span></div>

                    <Button
                        variant="outlined"
                        startIcon={<GoogleIcon />}
                        onClick={initiateGoogleLogin}
                        fullWidth
                        style={{ marginBottom: '10px' }}
                        disabled={loading}
                    >
                        Sign up with Google
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<GitHubIcon />}
                        onClick={initiateGithubLogin}
                        fullWidth
                        style={{ marginBottom: '10px' }}
                        disabled={loading}
                    >
                        Sign up with GitHub
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<LinkedInIcon />}
                        onClick={initiateLinkedInLogin}
                        fullWidth
                        style={{ marginBottom: '10px' }}
                        disabled={loading}
                    >
                        Sign up with LinkedIn
                    </Button>
                </div>

                <p className="login-link">
                    Already have an account? <a href="/login">Login here</a>
                </p>
            </div>
        </div>
    );
};

export default Register;
