import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfileMenu from './ProfileMenu';
import EventCard from './EventCard';
import Dialog from './Dialog';
import './OrganiserDashboard.css';

const OrganiserDashboard = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [dialogProps, setDialogProps] = useState({ isOpen: false, message: '' });
  const [mlLoading, setMlLoading] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('eventora_token');
      if (!token) return;
      try {
        const resp = await axios.get('http://localhost:8080/public/api/getUserInfo', {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: (s) => s >= 200 && s < 400,
        });
        setUserInfo(resp.data);
      } catch (err) {
        console.error('Failed to fetch user info:', err);
      }
    };
    fetchUserInfo();

    // Fetch events for organiser (initial load)
    const fetchEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('eventora_token');
        const resp = await axios.get('http://localhost:8080/public/api/events/getByNameOrganiserByMe', {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: (s) => s >= 200 && s < 400,
        });
        setEvents(Array.isArray(resp.data) ? resp.data : []);
      } catch (err) {
        setError('Could not load your events.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Debounced search for organiser's events by name
  useEffect(() => {
    const runSearch = async () => {
      // if empty search, reload initial list
      if (!search.trim()) {
        setIsSearching(false);
        try {
          setLoading(true);
          const token = localStorage.getItem('eventora_token');
          const resp = await axios.get('http://localhost:8080/public/api/events/getByNameOrganiserByMe', {
            headers: { Authorization: `Bearer ${token}` },
            validateStatus: (s) => s >= 200 && s < 400,
          });
          setEvents(Array.isArray(resp.data) ? resp.data : []);
        } catch (err) {
          setError('Could not load your events.');
        } finally {
          setLoading(false);
        }
        return;
      }

      setIsSearching(true);
      try {
        const token = localStorage.getItem('eventora_token');
        const resp = await axios.get('http://localhost:8080/public/api/events/getByNameOrganiserByMe', {
          params: { eventName: search.trim() },
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: (s) => s >= 200 && s < 400,
        });
        setEvents(Array.isArray(resp.data) ? resp.data : []);
      } catch (err) {
        console.error('Search error:', err?.message ?? err);
        setEvents([]);
      } finally {
        setIsSearching(false);
      }
    };

    const id = setTimeout(runSearch, 500);
    return () => clearTimeout(id);
  }, [search]);

  // ML API helpers
  const buildAuthHeaders = () => {
    const token = localStorage.getItem('eventora_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const predictEvent = async (eventId) => {
    setMlLoading(true);
    setDialogProps({ isOpen: false, message: '' });
    try {
      const headers = buildAuthHeaders();
      const resp = await axios.get(`http://localhost:8080/api/ml/predict/event/${eventId}`, {
        headers,
        validateStatus: (s) => s >= 200 && s < 500,
      });

      if (resp.status >= 200 && resp.status < 400) {
        setDialogProps({ isOpen: true, message: JSON.stringify(resp.data, null, 2) });
      } else {
        setDialogProps({ isOpen: true, message: `Prediction failed: ${resp.status} ${resp.data || ''}` });
      }
    } catch (err) {
      console.error('Predict error', err);
      setDialogProps({ isOpen: true, message: err?.response?.data || err?.message || 'Prediction error' });
    } finally {
      setMlLoading(false);
    }
  };

  const getLatestPrediction = async (eventId) => {
    setMlLoading(true);
    setDialogProps({ isOpen: false, message: '' });
    try {
      const headers = buildAuthHeaders();
      const resp = await axios.get(`http://localhost:8080/api/ml/prediction/latest/${eventId}`, { headers, validateStatus: (s) => s >= 200 && s < 500 });
      if (resp.status === 200) {
        setDialogProps({ isOpen: true, message: JSON.stringify(resp.data, null, 2) });
      } else {
        setDialogProps({ isOpen: true, message: 'No latest prediction available.' });
      }
    } catch (err) {
      console.error('Latest prediction error', err);
      setDialogProps({ isOpen: true, message: err?.response?.data || err?.message || 'Error fetching latest prediction' });
    } finally {
      setMlLoading(false);
    }
  };

  const getPredictionHistory = async (eventId) => {
    setMlLoading(true);
    setDialogProps({ isOpen: false, message: '' });
    try {
      const headers = buildAuthHeaders();
      const resp = await axios.get(`http://localhost:8080/api/ml/prediction/history/${eventId}`, { headers, validateStatus: (s) => s >= 200 && s < 500 });
      setDialogProps({ isOpen: true, message: JSON.stringify(resp.data, null, 2) });
    } catch (err) {
      console.error('History error', err);
      setDialogProps({ isOpen: true, message: err?.response?.data || err?.message || 'Error fetching prediction history' });
    } finally {
      setMlLoading(false);
    }
  };

  const checkMLHealth = async () => {
    setMlLoading(true);
    setDialogProps({ isOpen: false, message: '' });
    try {
      const resp = await axios.get('http://localhost:8080/api/ml/health', { validateStatus: (s) => s >= 200 && s < 500 });
      setDialogProps({ isOpen: true, message: JSON.stringify(resp.data, null, 2) });
    } catch (err) {
      console.error('ML health error', err);
      setDialogProps({ isOpen: true, message: err?.message || 'Error checking ML health' });
    } finally {
      setMlLoading(false);
    }
  };

  const getMLStats = async () => {
    setMlLoading(true);
    setDialogProps({ isOpen: false, message: '' });
    try {
      const resp = await axios.get('http://localhost:8080/api/ml/stats', { validateStatus: (s) => s >= 200 && s < 500 });
      setDialogProps({ isOpen: true, message: JSON.stringify(resp.data, null, 2) });
    } catch (err) {
      console.error('ML stats error', err);
      setDialogProps({ isOpen: true, message: err?.message || 'Error fetching ML stats' });
    } finally {
      setMlLoading(false);
    }
  };

  const handleLaunchEvent = () => {
    // navigate to event creation page - create route later
    navigate('/create-event');
  };

  const handleSwitchToParticipant = () => {
    // go back to home (participant mode)
    setIsProfileMenuOpen(false);
    navigate('/home');
  };

  const handleLogout = () => {
    localStorage.removeItem('eventora_token');
    setIsProfileMenuOpen(false);
    navigate('/home');
    window.location.reload();
  };

  return (
    <div className="organiser-root">
      <header className="organiser-header">
        <h2>Organiser Dashboard</h2>
        <div className="organiser-actions">
          <input
            className="search-input"
            placeholder="Search events"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="launch-button" onClick={handleLaunchEvent}>Launch Event</button>
          <button className="ml-button" onClick={checkMLHealth} disabled={mlLoading}>ML Health</button>
          <button className="ml-button" onClick={getMLStats} disabled={mlLoading}>ML Stats</button>
          <button className="profile-button" onClick={() => setIsProfileMenuOpen(true)}>
            <div className="profile-icon">{userInfo?.displayName?.charAt(0)?.toUpperCase() || '?'}</div>
          </button>
        </div>
      </header>

      <main className="organiser-body">
        <p>Welcome to the organiser area. Use "Launch Event" to create new events and manage your existing ones.</p>
        {loading && <div className="info">Loading your events...</div>}
        {error && <div className="error-message">{error}</div>}
        {!loading && !error && events.length === 0 && <div className="info">No events found.</div>}
        <div className="events-grid">
          {events.map(ev => (
            <div key={ev.id} className="event-with-actions">
              <EventCard event={ev} fromOrganiser={true} />
              <div className="event-actions">
                <button onClick={() => predictEvent(ev.id)} disabled={mlLoading}>Predict</button>
                <button onClick={() => getLatestPrediction(ev.id)} disabled={mlLoading}>Latest</button>
                <button onClick={() => getPredictionHistory(ev.id)} disabled={mlLoading}>History</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Dialog
        isOpen={dialogProps.isOpen}
        message={dialogProps.message}
        onClose={() => setDialogProps({ isOpen: false, message: '' })}
      />

      <ProfileMenu
        isOpen={isProfileMenuOpen}
        onClose={() => setIsProfileMenuOpen(false)}
        userInfo={userInfo || { displayName: 'Organizer', email: '' }}
        onLogout={handleLogout}
        onSwitchToOrganizer={handleSwitchToParticipant}
        switchLabel="Switch to Participant"
      />
    </div>
  );
};

export default OrganiserDashboard;
