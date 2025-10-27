import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import { Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { initiateGoogleLogin, initiateGithubLogin, initiateLinkedInLogin } from '../utils/oauth';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Handle OAuth Callback
    useEffect(() => {
        const handleOAuthCallback = async () => {
            const params = new URLSearchParams(location.search);
            const code = params.get('code');
            
            if (!code) return;

            // Determine provider from pathname
            const pathParts = location.pathname.split('/');
            const provider = pathParts[2]; // e.g., "google" from "/auth/google/callback"

            if (!provider) return;

            setLoading(true);
            setError('');

            try {
                // Send code to backend
                const response = await axios.get(`http://localhost:8080/auth/${provider}/code`, {
                    params: { code }
                });

                const token = response.data?.token;
                
                if (token) {
                    localStorage.setItem('eventora_token', token);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/public/api/login', formData);

            if (response.status === 202) {
                const token = response.data?.token;
                if (token) {
                    localStorage.setItem('eventora_token', token);
                }
                navigate('/home');
            }
        } catch (err) {
            console.error('Login error:', err);
            let serverMsg = err?.response?.data?.message ?? 'Login failed. Please try again.';
            setError(serverMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Login to Eventora</h2>

                {error && <div className="error-message">{error}</div>}
                {loading && <div className="loading-message">Processing...</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
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
                        Continue with Google
                    </Button>

                    <Button 
                        variant="outlined" 
                        startIcon={<GitHubIcon />} 
                        onClick={initiateGithubLogin} 
                        fullWidth 
                        style={{ marginBottom: '10px' }}
                        disabled={loading}
                    >
                        Continue with GitHub
                    </Button>

                    <Button 
                        variant="outlined" 
                        startIcon={<LinkedInIcon />} 
                        onClick={initiateLinkedInLogin} 
                        fullWidth 
                        style={{ marginBottom: '10px' }}
                        disabled={loading}
                    >
                        Continue with LinkedIn
                    </Button>
                </div>

                <p className="register-link">
                    Don't have an account? <a href="/register">Register here</a>
                </p>
            </div>
        </div>
    );
};

export default Login;