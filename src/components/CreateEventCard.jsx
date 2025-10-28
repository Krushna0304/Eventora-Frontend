import React, { useState } from 'react';
import axios from 'axios';
import './CreateEventCard.css';
import { useNavigate } from 'react-router-dom';

const CREATE_ENDPOINT = 'http://localhost:8080/public/api/events/create'; // adjust if your backend path differs

const emptyTags = [''];

const CreateEventCard = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    eventCategory: '',
    locationName: '',
    city: '',
    state: '',
    country: '',
    latitude: '',
    longitude: '',
    startDate: '',
    endDate: '',
    maxParticipants: '',
    price: '',
    imageUrl: '',
    tags: [],
    eventStatus: '',
    promotionSpend: '',
    socialMentions: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleTagsChange = (index, value) => {
    const t = [...form.tags];
    t[index] = value;
    setForm(f => ({ ...f, tags: t }));
  };

  const addTag = () => {
    setForm(f => ({ ...f, tags: [...(f.tags || []), ''] }));
  };

  const removeTag = (index) => {
    const t = [...form.tags];
    t.splice(index, 1);
    setForm(f => ({ ...f, tags: t }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Build payload mapping to CreateEventDto record
    const payload = {
      title: form.title || undefined,
      description: form.description || undefined,
      eventCategory: form.eventCategory || undefined,
      locationName: form.locationName || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      country: form.country || undefined,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      startDate: form.startDate ? form.startDate : undefined,
      endDate: form.endDate ? form.endDate : undefined,
      maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined,
      price: form.price ? Number(form.price) : undefined,
      imageUrl: form.imageUrl || undefined,
      tags: Array.isArray(form.tags) ? form.tags.filter(Boolean) : undefined,
      eventStatus: form.eventStatus || undefined,
      promotionSpend: form.promotionSpend ? Number(form.promotionSpend) : undefined,
      socialMentions: form.socialMentions ? Number(form.socialMentions) : undefined
    };

    setLoading(true);
    try {
      const token = localStorage.getItem('eventora_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const resp = await axios.post(CREATE_ENDPOINT, payload, {
        headers,
        validateStatus: (s) => s >= 200 && s < 400,
      });

      setSuccessMessage('Event created successfully');
      // Optionally navigate to organiser dashboard or event detail
      const created = resp.data;
      if (created && created.id) {
        // navigate to the event detail and indicate we came from organiser dashboard
        navigate(`/events/${created.id}?from=organiser`);
      } else {
        // fallback to organiser dashboard
        navigate(`/organiser`);
      }
    } catch (err) {
      console.error('Error creating event:', err?.message ?? err);
      const msg = err?.response?.data?.message ?? err?.response?.data ?? err?.message ?? 'Failed to create event';
      setError(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-root">
      <form className="create-event-form" onSubmit={handleSubmit}>
        <h3>Create Event</h3>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <div className="form-row">
          <label>Title</label>
          <input name="title" value={form.title} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} />
        </div>

        <div className="form-row two-col">
          <div>
            <label>Category</label>
            <select name="eventCategory" value={form.eventCategory} onChange={handleChange} required>
              <option value="">Select category</option>
              <option value="EDUCATION">Education - Tech talks, workshops, seminars</option>
              <option value="HEALTH">Health - Blood donation, yoga, wellness</option>
              <option value="SPORTS">Sports - Tournaments, marathons, fitness</option>
              <option value="CULTURE">Culture - Festivals, art shows, cultural</option>
              <option value="MUSIC">Music - Concerts, performances, gigs</option>
              <option value="COMMUNITY">Community - Meetups, volunteer work</option>
              <option value="BUSINESS">Business - Startup meetups, networking</option>
              <option value="ENTERTAINMENT">Entertainment - Movies, parties, shows</option>
              <option value="OTHER">Other - Uncategorized events</option>
            </select>
          </div>

          <div>
            <label>Image URL</label>
            <input name="imageUrl" value={form.imageUrl} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row two-col">
          <div>
            <label>Location name</label>
            <input name="locationName" value={form.locationName} onChange={handleChange} />
          </div>
          <div>
            <label>City</label>
            <input name="city" value={form.city} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row two-col">
          <div>
            <label>State</label>
            <input name="state" value={form.state} onChange={handleChange} />
          </div>
          <div>
            <label>Country</label>
            <input name="country" value={form.country} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row two-col">
          <div>
            <label>Latitude</label>
            <input name="latitude" value={form.latitude} onChange={handleChange} />
          </div>
          <div>
            <label>Longitude</label>
            <input name="longitude" value={form.longitude} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row two-col">
          <div>
            <label>Starts</label>
            <input type="datetime-local" name="startDate" value={form.startDate} onChange={handleChange} />
          </div>
          <div>
            <label>Ends</label>
            <input type="datetime-local" name="endDate" value={form.endDate} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row two-col">
          <div>
            <label>Max participants</label>
            <input name="maxParticipants" type="number" value={form.maxParticipants} onChange={handleChange} />
          </div>
          <div>
            <label>Price</label>
            <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row">
          <label>Tags</label>
          <div className="tags">
            {(form.tags || []).map((t, i) => (
              <div key={i} className="tag-item">
                <input value={t} onChange={(e) => handleTagsChange(i, e.target.value)} />
                <button type="button" onClick={() => removeTag(i)}>Remove</button>
              </div>
            ))}
            <div>
              <button type="button" onClick={addTag}>Add tag</button>
            </div>
          </div>
        </div>

        <div className="form-row two-col">
          <div>
            <label>Event status</label>
            <select name="eventStatus" value={form.eventStatus} onChange={handleChange} required>
              <option value="">Select status</option>
              <option value="UPCOMING">Upcoming - Future event</option>
              <option value="ONGOING">Ongoing - Currently running</option>
              <option value="COMPLETED">Completed - Past event</option>
              <option value="CANCELLED">Cancelled - Not happening</option>
              <option value="DRAFT">Draft - Not yet published</option>
              <option value="PUBLISHED">Published - Visible to all</option>
            </select>
          </div>
          <div>
            <label>Promotion spend</label>
            <input name="promotionSpend" type="number" value={form.promotionSpend} onChange={handleChange} />
          </div>
        </div>

        <div className="form-row two-col">
          <div>
            <label>Social mentions</label>
            <input name="socialMentions" type="number" value={form.socialMentions} onChange={handleChange} />
          </div>
          <div>
            <label>&nbsp;</label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="cancel-button" onClick={() => navigate('/organiser')} disabled={loading}>Cancel</button>
              <button type="submit" className="submit-button" disabled={loading}>{loading ? 'Creating...' : 'Create Event'}</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEventCard;
