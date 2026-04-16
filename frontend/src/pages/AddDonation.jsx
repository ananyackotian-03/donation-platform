import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddDonation.css';

export default function AddDonation() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('books');
  const [condition, setCondition] = useState('like-new');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const navigate = useNavigate();

  const handleGetLocation = () => {
    setGeoLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          setLatitude(lat.toString());
          setLongitude(lng.toString());
          setGeoLoading(false);
          alert('Location captured! Latitude: ' + lat.toFixed(4) + ', Longitude: ' + lng.toFixed(4));
        },
        (error) => {
          setError('Could not get your location: ' + error.message);
          setGeoLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setGeoLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!title || !description) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/donations', {
        title,
        category,
        condition,
        description,
        imageUrl,
        latitude: latitude ? Number.parseFloat(latitude) : undefined,
        longitude: longitude ? Number.parseFloat(longitude) : undefined,
        address
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      alert('Donation added successfully!');
      navigate('/donor-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-donation-page">
      <div className="add-donation-container">
        <div className="add-donation-card">
          <Link to="/donor-dashboard" className="back-link">← Back to Dashboard</Link>
          
          <div className="form-header">
            <h1>Add a New Donation</h1>
            <p>Share an item you'd like to donate</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="donation-form">
            <div className="form-group">
              <label htmlFor="title">Item Name *</label>
              <input
                type="text"
                id="title"
                placeholder="e.g., Calculus Textbook, Winter Jacket"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="books">Books</option>
                <option value="clothing">Clothing</option>
                <option value="electronics">Electronics</option>
                <option value="furniture">Furniture</option>
                <option value="food">Food & Groceries</option>
                <option value="medical">Medical Supplies</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="condition">Condition</label>
              <select
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="used">Used</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Item Description *</label>
              <textarea
                id="description"
                placeholder="Describe the item, its condition, and any details"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="imageUrl">Image URL</label>
              <input
                type="url"
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            <div className="form-divider">
              <h3>Location Information (Optional)</h3>
              <p>Help organizations find your donation</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="latitude">Latitude</label>
                <input
                  type="number"
                  id="latitude"
                  step="0.000001"
                  placeholder="e.g., 28.7041"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="longitude">Longitude</label>
                <input
                  type="number"
                  id="longitude"
                  step="0.000001"
                  placeholder="e.g., 77.1025"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </div>
            </div>

            <button
              type="button"
              className="btn-geo"
              onClick={handleGetLocation}
              disabled={geoLoading}
            >
              {geoLoading ? 'Getting Location...' : '📍 Use My Current Location'}
            </button>

            <div className="form-group">
              <label htmlFor="address">Address / Pickup Location</label>
              <input
                type="text"
                id="address"
                placeholder="e.g., 123 Main Street, Delhi, India"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Donation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
