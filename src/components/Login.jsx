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
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        
        if (!code) return;

        // Determine provider from pathname (e.g., "/auth/google/callback")
        const pathMatch = location.pathname.match(/\/auth\/(\w+)\/callback/);
        
        if (!pathMatch) {
            console.error('Invalid OAuth callback path:', location.pathname);
            return;
        }

        const provider = pathMatch[1]; // Extract provider name (google, github, linkedin)

        // Prevent multiple calls by checking if already processing
        const isProcessing = sessionStorage.getItem('oauth_processing');
        if (isProcessing === 'true') {
            console.log('OAuth already processing, skipping...');
            return;
        }

        const handleOAuthCallback = async () => {
            sessionStorage.setItem('oauth_processing', 'true');
            setLoading(true);
            setError('');

            try {
                // Send code to backend - endpoint should match provider name
                const response = await axios.get(`http://localhost:8080/auth/${provider}/code`, {
                    params: { code },
                    timeout: 10000 // 10 second timeout
                });

                const token = response.data?.token;
                
                if (token) {
                    localStorage.setItem('eventora_token', token);
                    sessionStorage.removeItem('oauth_processing');
                    // Clear the OAuth params from URL before navigating
                    navigate('/home', { replace: true });
                } else {
                    setError('Authentication failed. No token received.');
                    sessionStorage.removeItem('oauth_processing');
                    // Navigate back to login after 3 seconds
                    setTimeout(() => navigate('/login', { replace: true }), 3000);
                }
            } catch (err) {
                console.error('OAuth callback error:', err);
                const errorMessage = err.response?.data?.message || 
                                   err.message || 
                                   'OAuth authentication failed.';
                setError(errorMessage);
                sessionStorage.removeItem('oauth_processing');
                // Navigate back to login after 3 seconds
                setTimeout(() => navigate('/login', { replace: true }), 3000);
            } finally {
                setLoading(false);
            }
        };

        handleOAuthCallback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array - only run once on mount

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