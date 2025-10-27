const GOOGLE_CLIENT_ID = "631122116715-qrjgivvn1d0bt2q88f69a7arnfln7jcd.apps.googleusercontent.com";
const GITHUB_CLIENT_ID = "YOUR_GITHUB_CLIENT_ID";
const LINKEDIN_CLIENT_ID = "YOUR_LINKEDIN_CLIENT_ID";
const FRONTEND_URL = "http://localhost:5173";

export const initiateGoogleLogin = () => {
  const redirectUri = `${FRONTEND_URL}/auth/google/callback`;
  const scope = "email profile";
  window.location.href =
    `https://accounts.google.com/o/oauth2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
};

export const initiateGithubLogin = () => {
  const redirectUri = `${FRONTEND_URL}/auth/github/callback`;
  const scope = "user:email";
  window.location.href =
    `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scope}`;
};

export const initiateLinkedInLogin = () => {
  const redirectUri = `${FRONTEND_URL}/auth/linkedin/callback`;
  const scope = "r_emailaddress r_liteprofile";
  window.location.href =
    `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scope}`;
};