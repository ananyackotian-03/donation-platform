import { useState, useEffect } from 'react';
import axios from 'axios';
import './OrgDashboard.css';

export default function OrgDashboard() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(''); // nothing selected initially

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Please login first');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5000/api/donations', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setDonations(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching donations:', err);
        setError('Failed to load donations');
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const handleRequestDonation = async (donationId) => {
    try {
      const token = localStorage.getItem('token');

      await axios.post(
        'http://localhost:5000/api/requests',
        { donationId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert('Request sent successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
    }
  };

  return (
    <div className="org-dashboard-page">
      <div className="org-dashboard-container">

        {/* HEADER */}
        <div className="org-dashboard-header">
          <h1>Organization Dashboard</h1>
          <p>Find and request items to help your community</p>
        </div>

        {/* BUTTON */}
        <div className="org-tabs">
          <button
            className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            🔍 Browse Donations
          </button>
        </div>

        {/* STATS */}
        <div className="org-stats">
          <div className="org-stat-card">
            <div className="stat-number">{donations.length}</div>
            <div className="stat-label">Available Donations</div>
          </div>
          <div className="org-stat-card">
            <div className="stat-number">8</div>
            <div className="stat-label">Items Received</div>
          </div>
          <div className="org-stat-card">
            <div className="stat-number">4</div>
            <div className="stat-label">Pending Requests</div>
          </div>
        </div>

        {/* 🔥 THIS IS THE MAIN FIX */}
        {activeTab === 'browse' && (
          <div className="tab-content">
            <h2>Available Donations</h2>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
              <div className="loading">Loading donations...</div>
            ) : donations.length > 0 ? (
              <div className="donations-grid">
                {donations.map((donation) => (
                  <div key={donation._id} className="donation-card">
                    
                    <div className="card-header">
                      <h3>{donation.title}</h3>
                      <span className={`status-badge status-${donation.status.toLowerCase()}`}>
                        {donation.status}
                      </span>
                    </div>

                    <div className="card-body">
                      <p><strong>Category:</strong> {donation.category}</p>
                      <p><strong>Condition:</strong> {donation.condition}</p>
                      <p><strong>Description:</strong> {donation.description}</p>

                      {donation.imageUrl && (
                        <img
                          src={donation.imageUrl}
                          alt={donation.title}
                          className="donation-image"
                        />
                      )}
                    </div>

                    <div className="card-footer">
                      <button
                        className="btn-request"
                        onClick={() => handleRequestDonation(donation._id)}
                      >
                        Request Item
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <p className="no-donations">No donations available at the moment</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}