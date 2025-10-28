import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import EventCard from './EventCard';
import Filters from './Filters';
import ProfileMenu from './ProfileMenu';
import './Home.css';

const EVENTS_ENDPOINT = 'http://localhost:8080/public/api/events/getByFilter';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [organizerSearch, setOrganizerSearch] = useState('');
  const [isMyEventList, setIsMyEventList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('eventora_token'));
  const [userInfo, setUserInfo] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // update isLoggedIn if localStorage changes (e.g., login/logout in another tab)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'eventora_token') {
        const newToken = e.newValue;
        setIsLoggedIn(!!newToken);
        if (!newToken) {
          setUserInfo(null);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Fetch user info when logged in
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('eventora_token');
      if (!token) return;

      try {
        const response = await axios.get('http://localhost:8080/public/api/getUserInfo', {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: (s) => s >= 200 && s < 400,
        });
        setUserInfo(response.data);
      } catch (err) {
        console.error('Error fetching user info:', err?.message ?? err);
      }
    };

    if (isLoggedIn) {
      fetchUserInfo();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    // On initial load, read query param to restore view if present
    const qs = new URLSearchParams(location.search);
    const view = qs.get('view');
    if (view === 'my') {
      setIsMyEventList(true);
      handleMyEvents();
    } else {
      setIsMyEventList(false);
      // Initial load without filters
      fetchEvents({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!search.trim() && !organizerSearch.trim()) {
        setFilteredEvents(events);
        return;
      }

      setIsSearching(true);
      try {
        const params = {
          eventName: search.trim(),
          organizerName: organizerSearch.trim(),
          isMyEventList: isMyEventList
        };
        
        const token = localStorage.getItem('eventora_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(`http://localhost:8080/public/api/events/getByNameAndOrganizer`, {
          params,
          headers,
          validateStatus: (s) => s >= 200 && s < 400,
        });

        const data = response.data;
        if (Array.isArray(data)) {
          setFilteredEvents(data);
        } else {
          setFilteredEvents([]);
        }
      } catch (err) {
        console.error('Search error:', err?.message ?? err);
        // Don't show error for search - just reset to all events
        setFilteredEvents(events);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce the search with 500ms delay
    const timeoutId = setTimeout(fetchSearchResults, 500);
    return () => clearTimeout(timeoutId);
  }, [search, organizerSearch, events]);

  const fetchEvents = async (filterPayload) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(EVENTS_ENDPOINT, filterPayload, {
        validateStatus: (status) => status >= 200 && status < 400,
      });

      const data = response.data;
      if (Array.isArray(data)) {
        setEvents(data);
        setFilteredEvents(data);
      } else if (data && data.events) {
        setEvents(data.events);
        setFilteredEvents(data.events);
      } else {
        setEvents([]);
        setFilteredEvents([]);
      }
    } catch (err) {
      const resp = err?.response;
      if (resp && Array.isArray(resp.data)) {
        setEvents(resp.data);
        setFilteredEvents(resp.data);
        return;
      }

      const status = resp?.status;
      const xhr = err?.request;
      if (status === 302 && xhr && xhr.responseText) {
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (Array.isArray(parsed)) {
            setEvents(parsed);
            setFilteredEvents(parsed);
            return;
          }
        } catch (parseErr) {
          console.warn('Failed to parse 302 responseText as JSON', parseErr);
        }
      }

      console.error('Error fetching events:', err?.message || err);
      let serverMsg = err?.response?.data?.message ?? err?.response?.data ?? err?.message ?? 'Could not load events.';
      if (typeof serverMsg === 'object') {
        try {
          serverMsg = JSON.stringify(serverMsg);
        } catch {
          serverMsg = String(serverMsg);
        }
      }

      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (filterPayload) => {
    fetchEvents(filterPayload);
  };

  const handleClearFilters = () => {
    fetchEvents({});
  };

  const handleMyEvents = async () => {
    const token = localStorage.getItem('eventora_token');
    if (!token) {
      setError('You must be logged in to view your events.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const resp = await axios.get('http://localhost:8080/api/registrations/getMyEvents', {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: (s) => s >= 200 && s < 400,
      });

      const data = resp.data;
      if (Array.isArray(data)) {
        setEvents(data);
        setFilteredEvents(data);
      } else {
        setEvents(data?.events ?? []);
        setFilteredEvents(data?.events ?? []);
      }
    } catch (err) {
      console.error('Error loading my events:', err?.message ?? err);
      let serverMsg = err?.response?.data?.message ?? err?.response?.data ?? err?.message ?? 'Could not load my events.';
      if (typeof serverMsg === 'object') {
        try {
          serverMsg = JSON.stringify(serverMsg);
        } catch {
          serverMsg = String(serverMsg);
        }
      }
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleLogout = () => {
    localStorage.removeItem('eventora_token');
    setIsLoggedIn(false);
    setUserInfo(null);
    setIsProfileMenuOpen(false);
    window.location.href = '/home';
  };

  const handleSwitchToOrganizer = () => {
    // Navigate to organiser dashboard
    setIsProfileMenuOpen(false);
    navigate('/organiser');
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Eventora</h1>
        <div className="view-toggle">
          <button 
            className={`toggle-button ${!isMyEventList ? 'active' : ''}`} 
            onClick={() => {
              setIsMyEventList(false);
              setSearch('');
              setOrganizerSearch('');
              fetchEvents({});
            }}
          >
            All Events
          </button>
          {isLoggedIn && (
            <button 
              className={`toggle-button ${isMyEventList ? 'active' : ''}`}
              onClick={() => {
                setIsMyEventList(true);
                setSearch('');
                setOrganizerSearch('');
                handleMyEvents();
              }}
            >
              My Events
            </button>
          )}
        </div>
        <div className="search-row">
          <div className="search-wrapper" style={{ display: 'flex', gap: 8 }}>
            <input
              className="search-input"
              placeholder="Search events by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ minWidth: 180 }}
            />
            <input
              className="search-input"
              placeholder="Organizer name (optional)"
              value={organizerSearch}
              onChange={(e) => setOrganizerSearch(e.target.value)}
              style={{ minWidth: 180 }}
            />
            {isSearching && <div className="search-spinner">Searching...</div>}
          </div>
          {isLoggedIn ? (
            <>
              <button 
                className="profile-button" 
                style={{ marginLeft: 8 }}
                onClick={() => setIsProfileMenuOpen(true)}
              >
                <div className="profile-icon">
                  {userInfo?.displayName?.charAt(0)?.toUpperCase() || '?'}
                </div>
              </button>
            </>
          ) : (
            <button style={{ marginLeft: 8 }} onClick={handleLogin}>Login</button>
          )}

          {isLoggedIn && (
            <ProfileMenu
              isOpen={isProfileMenuOpen}
              onClose={() => setIsProfileMenuOpen(false)}
              userInfo={userInfo || { displayName: 'User', email: 'Loading...' }}
              onLogout={handleLogout}
              onSwitchToOrganizer={handleSwitchToOrganizer}
              onMyEvents={handleMyEvents}
            />
          )}
        </div>
      </div>

      <div className="home-body">
        <aside className="home-filters">
          <h3>Filters</h3>
          <Filters onApply={handleApplyFilters} onClear={handleClearFilters} />
        </aside>

        <main className="home-list">
          {loading && <div className="info">Loading events...</div>}
          {error && <div className="error-message">{error}</div>}
          {!loading && filteredEvents.length === 0 && !error && <div className="info">No events found.</div>}

          <div className="events-grid">
            {filteredEvents.map((ev) => (
              <EventCard key={ev.id} event={ev} fromHomeView={isMyEventList ? 'my' : 'all'} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
