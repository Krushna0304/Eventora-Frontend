import React from 'react';
import { Link } from 'react-router-dom';
import './EventCard.css';

const EventCard = ({ event }) => {
  if (!event) return null;

  const {
    id,
    title,
    organizerName,
    eventCategory,
    city,
    eventStatus,
    startDate,
    participantCount,
  } = event;

  const formattedDate = startDate ? new Date(startDate).toLocaleString() : 'TBA';

  return (
    <div className="event-card" key={id}>
      <div className="event-header">
        <h3 className="event-title"><Link to={`/events/${id}`}>{title}</Link></h3>
        <div className="event-category">{eventCategory || 'General'}</div>
      </div>
      <div className="event-meta">
        <div className="organizer">Organizer: {organizerName || '—'}</div>
        <div className="location">{city || '—'}</div>
        <div className="date">{formattedDate}</div>
      </div>
      <div className="event-footer">
        <div className="status">Status: {eventStatus || 'UNKNOWN'}</div>
        <div className="participants">{participantCount ?? 0} going</div>
      </div>
    </div>
  );
};

export default EventCard;
