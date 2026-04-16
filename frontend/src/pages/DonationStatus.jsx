import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './DonorDashboard.css';

export default function DonationStatus() {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    requested: 0,
    confirmed: 0,
    donated: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/donations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const myDonations = response.data;
        
        // Calculate statistics
        const stats = {
          total: myDonations.length,
          available: myDonations.filter(d => d.status === 'AVAILABLE').length,
          requested: myDonations.filter(d => d.status === 'REQUESTED').length,
          confirmed: myDonations.filter(d => d.status === 'CONFIRMED').length,
          donated: myDonations.filter(d => d.status === 'DONATED').length
        };
        
        setDonations(myDonations);
        setStats(stats);
        setError('');
      } catch (err) {
        console.error('Failed to load donations', err);
        setError('Failed to load donation statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'AVAILABLE': return '#10b981';
      case 'REQUESTED': return '#f59e0b';
      case 'CONFIRMED': return '#3b82f6';
      case 'DONATED': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <Link to="/donor-dashboard" className="back-link">← Back to Dashboard</Link>
          <h1>Donation Status Statistics</h1>
          <p>View the overall status of all your donations</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <p>Loading statistics...</p>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="stats-grid">
              <div className="stat-card" style={{ borderLeft: `4px solid #6b7280` }}>
                <div className="stat-number">{stats.total}</div>
                <div className="stat-label">Total Donations</div>
              </div>
              <div className="stat-card" style={{ borderLeft: `4px solid ${getStatusColor('AVAILABLE')}` }}>
                <div className="stat-number">{stats.available}</div>
                <div className="stat-label">Available</div>
              </div>
              <div className="stat-card" style={{ borderLeft: `4px solid ${getStatusColor('REQUESTED')}` }}>
                <div className="stat-number">{stats.requested}</div>
                <div className="stat-label">Requested</div>
              </div>
              <div className="stat-card" style={{ borderLeft: `4px solid ${getStatusColor('CONFIRMED')}` }}>
                <div className="stat-number">{stats.confirmed}</div>
                <div className="stat-label">Confirmed</div>
              </div>
              <div className="stat-card" style={{ borderLeft: `4px solid ${getStatusColor('DONATED')}` }}>
                <div className="stat-number">{stats.donated}</div>
                <div className="stat-label">Donated</div>
              </div>
            </div>

            {/* Donations Table */}
            <div className="donations-table-section">
              <h2>Detailed Donation Status</h2>
              {donations.length > 0 ? (
                <div className="donations-table">
                  <div className="table-header">
                    <div className="table-cell">Title</div>
                    <div className="table-cell">Category</div>
                    <div className="table-cell">Condition</div>
                    <div className="table-cell">Status</div>
                    <div className="table-cell">Created</div>
                  </div>
                  {donations.map((donation) => (
                    <div key={donation._id} className="table-row">
                      <div className="table-cell">{donation.title}</div>
                      <div className="table-cell">{donation.category}</div>
                      <div className="table-cell">{donation.condition}</div>
                      <div className="table-cell">
                        <span 
                          className="status-badge"
                          style={{ background: getStatusColor(donation.status) }}
                        >
                          {donation.status}
                        </span>
                      </div>
                      <div className="table-cell">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-donations">No donations found</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
