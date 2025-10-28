import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateEventCard from './CreateEventCard';

const EditEventWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem('eventora_token');
        if (!token) {
          navigate('/login');
          return;
        }

        const resp = await axios.get(`http://localhost:8080/public/api/events/getById`, {
          params: { eventId: id },
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: (s) => s >= 200 && s < 400,
        });
        
        setEvent(resp.data);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err?.response?.data?.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate]);

  if (loading) return <div className="info">Loading event details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!event) return <div className="error-message">Event not found</div>;

  return <CreateEventCard event={event} />;
};

export default EditEventWrapper;