import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';
import { Button, Input, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { initiateGoogleLogin, initiateGithubLogin, initiateLinkedInLogin } from '../utils/oauth';

const Register = () => {
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

        // Handle OAuth callback
        const location = useLocation();
        useEffect(() => {
            const query = new URLSearchParams(location.search);
            const code = query.get('code');
            const error = query.get('error');

            if (error) {
                setError('Authentication failed. Please try again.');
                return;
            }

            if (code) {
                handleOAuthCallback(code);
            }
        }, [location]);

        const handleOAuthCallback = async (code) => {
            try {
                const provider = location.pathname.split('/')[2];
                const response = await axios.get(`http://localhost:8080/auth/${provider}/code?code=${code}`);
            
                if (response.status === 200 && response.data.token) {
                    localStorage.setItem('eventora_token', response.data.token);
                    navigate('/home');
                }
            } catch (err) {
                console.error('OAuth callback error:', err);
                setError('Failed to complete authentication. Please try again.');
            }
        };
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

        try {
            const response = await axios.post('http://localhost:8080/public/api/create-user', formData);
            if (response.status === 201) navigate('/login');
        } catch (error) {
            console.error('Registration error:', error);
            let serverMsg = error?.response?.data?.message ?? error?.response?.data ?? error?.message ?? '';
            const status = error?.response?.status;

            if (!serverMsg) {
                if (status === 409) serverMsg = 'User already exists. Try logging in or use a different email.';
                else if (status === 400) serverMsg = 'Invalid registration data. Please check your inputs.';
                else serverMsg = 'Registration failed. Please try again.';
            }

            setError(serverMsg);
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>Create an Account</h2>
                {error && <div className="error-message">{error}</div>}

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
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            required
                            fullWidth
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                    </div>

                    <Button type="submit" className="submit-button" fullWidth>Register</Button>
                </form>

                    <div className="social-login">
                        <div className="divider">
                            <span>OR</span>
                        </div>
                        <Button
                            variant="outlined"
                            startIcon={<GoogleIcon />}
                            onClick={initiateGoogleLogin}
                            fullWidth
                            style={{ marginBottom: '10px' }}
                        >
                            Sign up with Google
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<GitHubIcon />}
                            onClick={initiateGithubLogin}
                            fullWidth
                            style={{ marginBottom: '10px' }}
                        >
                            Sign up with GitHub
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<LinkedInIcon />}
                            onClick={initiateLinkedInLogin}
                            fullWidth
                            style={{ marginBottom: '10px' }}
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
