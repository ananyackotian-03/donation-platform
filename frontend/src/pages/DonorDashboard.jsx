import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './DonorDashboard.css';

export default function DonorDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/requests/my-requests', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setRequests(response.data);
      } catch (err) {
        console.error('Failed to load requests', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/requests/${requestId}/approve`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      alert('Request approved!');
      setRequests(requests.map(r => 
        r._id === requestId ? { ...r, status: 'APPROVED' } : r
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/requests/${requestId}/reject`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      alert('Request rejected!');
      setRequests(requests.map(r => 
        r._id === requestId ? { ...r, status: 'REJECTED' } : r
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject request');
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Donor Dashboard</h1>
          <p>Welcome! Manage your donations and help organizations in need.</p>
        </div>

        <div className="dashboard-grid">
          <Link to="/add-donation" className="dashboard-card">
            <div className="card-icon">📝</div>
            <h2>Add Donation</h2>
            <p>Post a new item you'd like to donate</p>
            <div className="card-arrow">→</div>
          </Link>

          <Link to="/my-donations" className="dashboard-card">
            <div className="card-icon">📦</div>
            <h2>View My Donations</h2>
            <p>Track the status of your donations</p>
            <div className="card-arrow">→</div>
          </Link>

          <Link to="/donation-status" className="dashboard-card">
            <div className="card-icon">📊</div>
            <h2>Donation Status</h2>
            <p>View overall donation statistics</p>
            <div className="card-arrow">→</div>
          </Link>

          <Link to="/map" className="dashboard-card">
            <div className="card-icon">🗺️</div>
            <h2>Donation Map</h2>
            <p>Find donations near you</p>
            <div className="card-arrow">→</div>
          </Link>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-number">5</div>
            <div className="stat-label">Total Donations</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{requests.filter(r => r.status === 'PENDING').length}</div>
            <div className="stat-label">Pending Requests</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{requests.filter(r => r.status === 'APPROVED').length}</div>
            <div className="stat-label">Approved</div>
          </div>
        </div>

        <div className="requests-section">
          <h2>📬 Donation Requests Received</h2>
          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <p>Loading requests...</p>
          ) : requests.length > 0 ? (
            <div className="requests-list">
              {requests.map((request) => (
                <div key={request._id} className="request-card">
                  <div className="request-content">
                    <div className="request-logo">📦</div>
                    
                    <div className="request-details">
                      <h3 className="request-title">{request.donationId?.title}</h3>
                      
                      <div className="request-meta">
                        <div className="meta-item">
                          <span className="meta-label">Organization:</span>
                          <span className="meta-value">{request.organizationId?.name}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Email:</span>
                          <a href={`mailto:${request.organizationId?.email}`} className="meta-value">
                            {request.organizationId?.email}
                          </a>
                        </div>
                      </div>

                      <div className="donation-specs">
                        <span className="spec-item">
                          <strong>Category:</strong> {request.donationId?.category}
                        </span>
                        <span className="spec-item">
                          <strong>Condition:</strong> {request.donationId?.condition}
                        </span>
                      </div>
                    </div>

                    <div className="request-status">
                      <span className={`status-badge status-${request.status.toLowerCase()}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>

                  {request.status === 'PENDING' && (
                    <div className="request-actions">
                      <button 
                        className="btn-approve"
                        onClick={() => handleApprove(request._id)}
                      >
                        <span>✓</span> Approve Request
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => handleReject(request._id)}
                      >
                        <span>✕</span> Reject Request
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-requests">No donation requests yet</p>
          )}
        </div>
      </div>
    </div>
  );
}