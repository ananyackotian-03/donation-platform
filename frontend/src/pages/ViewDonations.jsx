import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ViewDonations.css';

export default function ViewDonations() {
  const [donations, setDonations] = useState([]);
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
        setDonations(response.data);
      } catch (err) {
        setError('Failed to load donations');
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'status-available';
      case 'REQUESTED':
        return 'status-requested';
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'DONATED':
        return 'status-donated';
      default:
        return '';
    }
  };

  return (
    <div className="view-donations-page">
      <div className="view-donations-container">
        <Link to="/donor-dashboard" className="back-link">← Back to Dashboard</Link>

        <div className="donations-header">
          <h1>My Donations</h1>
          <p>Track and manage all your donations</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading donations...</div>
        ) : (
          <>
            <div className="donations-grid">
              {donations.map((donation) => (
                <div key={donation._id} className="donation-card">
                  <div className="card-header">
                    <h3>{donation.title}</h3>
                    <span className={`status-badge ${getStatusColor(donation.status)}`}>
                      {donation.status}
                    </span>
                  </div>

                  <div className="card-body">
                    <div className="donation-info">
                      <div className="info-item">
                        <span className="label">Category:</span>
                        <span className="value">{donation.category}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Condition:</span>
                        <span className="value">{donation.condition}</span>
                      </div>
                    </div>

                    <div className="donation-info">
                      <div className="info-item">
                        <span className="label">Description:</span>
                        <span className="value">{donation.description}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-footer">
                    <button className="btn-edit">Edit</button>
                    <button className="btn-delete">Delete</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="add-new-donation">
              <Link to="/add-donation" className="btn-add-donation">+ Add New Donation</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
