import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EventCard from './EventCard';
import Filters from './Filters';
import './Home.css';

const EVENTS_ENDPOINT = 'http://localhost:8080/public/api/events/getByFilter';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('eventora_token'));

  // update isLoggedIn if localStorage changes (e.g., login/logout in another tab)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'eventora_token') setIsLoggedIn(!!e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    // initial load without filters
    fetchEvents({});
  }, []);

  useEffect(() => {
    // client-side search filter by title
    if (!search) setFilteredEvents(events);
    else {
      const q = search.trim().toLowerCase();
      setFilteredEvents(events.filter((ev) => (ev.title || '').toLowerCase().includes(q)));
    }
  }, [search, events]);

  const fetchEvents = async (filterPayload) => {
    setLoading(true);
    setError('');
    try {
      // backend expects EventFilterRequest; server may return a list of EventTemplate
      // Accept 3xx responses (some dev/proxy setups return 302 with a JSON body).
      const response = await axios.post(EVENTS_ENDPOINT, filterPayload, {
        validateStatus: (status) => status >= 200 && status < 400,
      });
      // Accept whatever the server returns
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
      // Try to recover first if response contains data we can use.
      const resp = err?.response;
      if (resp && Array.isArray(resp.data)) {
        setEvents(resp.data);
        setFilteredEvents(resp.data);
        setError('');
        return;
      }

      // Fallback: if XHR contains JSON text (rare), try parsing it.
      const status = resp?.status;
      const xhr = err?.request;
      if (status === 302 && xhr && xhr.responseText) {
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (Array.isArray(parsed)) {
            setEvents(parsed);
            setFilteredEvents(parsed);
            setError('');
            return;
          }
        } catch (parseErr) {
          // don't spam the console with full axios stack for recoverable parse issues
          console.warn('Failed to parse 302 responseText as JSON', parseErr);
        }
      }

      // If we can't recover, log a concise error and show a string message in UI.
      console.error('Error fetching events:', (err && err.message) || err);
      let serverMsg = err?.response?.data?.message ?? err?.response?.data ?? err?.message ?? 'Could not load events.';
      if (typeof serverMsg === 'object') {
        try {
          serverMsg = JSON.stringify(serverMsg);
        } catch (e) {
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
        // if server wraps list in an object
        setEvents(data?.events ?? []);
        setFilteredEvents(data?.events ?? []);
      }
    } catch (err) {
      console.error('Error loading my events:', err?.message ?? err);
      let serverMsg = err?.response?.data?.message ?? err?.response?.data ?? err?.message ?? 'Could not load my events.';
      if (typeof serverMsg === 'object') {
        try { serverMsg = JSON.stringify(serverMsg); } catch { serverMsg = String(serverMsg); }
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
    window.location.href = '/home';
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Eventora</h1>
        <div className="search-row">
          <input
            className="search-input"
            placeholder="Search events by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isLoggedIn && (
            <>
              <button style={{ marginLeft: 8 }} onClick={handleMyEvents}>My Events</button>
              <button style={{ marginLeft: 8 }} onClick={handleLogout}>Logout</button>
            </>
          )}
          {!isLoggedIn && (
            <button style={{ marginLeft: 8 }} onClick={handleLogin}>Login</button>
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
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
