import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import './App.css'
import EventDetailCard from './components/EventDetailCard';
import OrganiserDashboard from './components/OrganiserDashboard';
import CreateEventCard from './components/CreateEventCard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/events/:id" element={<EventDetailCard />} />
          <Route path="/auth/:provider/callback" element={<Login />} />
          <Route path="/auth/google/callback" element={<Login />} />
          <Route path="/auth/github/callback" element={<Login />} />
          <Route path="/auth/linkedin/callback" element={<Login />} />
          <Route path="/organiser" element={<OrganiserDashboard />} />
          <Route path="/create-event" element={<CreateEventCard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
