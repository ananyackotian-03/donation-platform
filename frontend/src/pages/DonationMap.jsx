import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './DonationMap.css';

export default function DonationMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [donations, setDonations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(5);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([51.505, -0.09], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstance.current);
    }

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });

          // Center map on user location
          if (mapInstance.current) {
            mapInstance.current.setView([latitude, longitude], 13);
          }

          // Fetch nearby donations
          fetchNearbyDonations(latitude, longitude, radius);
        },
        (error) => {
          setLoading(false);
          fetchAllDonationsWithLocation();
        }
      );
    } else {
      fetchAllDonationsWithLocation();
    }
  }, []);

  // Update donations when radius changes
  useEffect(() => {
    if (userLocation) {
      fetchNearbyDonations(userLocation.latitude, userLocation.longitude, radius);
    }
  }, [radius]);

  const fetchNearbyDonations = async (lat, lng, km) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/donations/nearby?lat=${lat}&lng=${lng}&km=${km}`
      );
      const data = await response.json();
      setDonations(data);
      addMarkersToMap(data, lat, lng);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDonationsWithLocation = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/donations');
      const data = await response.json();
      const donationsWithLocation = data.filter(d => d.latitude && d.longitude);
      setDonations(donationsWithLocation);
      
      if (donationsWithLocation.length > 0) {
        addMarkersToMap(donationsWithLocation);
        const bounds = L.latLngBounds(
          donationsWithLocation.map(d => [d.latitude, d.longitude])
        );
        mapInstance.current.fitBounds(bounds);
      }
    } finally {
      setLoading(false);
    }
  };

  const addMarkersToMap = (donationsList, userLat = null, userLng = null) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add user location marker
    if (userLat && userLng && mapInstance.current) {
      const userMarker = L.marker([userLat, userLng], {
        icon: L.divIcon({
          className: 'user-location-marker',
          html: '<div class="user-marker-icon">📍</div>',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        }),
      })
        .bindPopup('<strong>Your Location</strong>')
        .addTo(mapInstance.current);

      markersRef.current.push(userMarker);

      // Draw circle for radius
      if (mapInstance.current.circleLayer) {
        mapInstance.current.removeLayer(mapInstance.current.circleLayer);
      }
      mapInstance.current.circleLayer = L.circle([userLat, userLng], {
        radius: radius * 1000,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        weight: 2,
      }).addTo(mapInstance.current);
    }

    // Add donation markers
    donationsList.forEach(donation => {
      if (donation.latitude && donation.longitude) {
        const color = getDonationColor(donation.status);
        const marker = L.marker([donation.latitude, donation.longitude], {
          icon: L.divIcon({
            className: 'donation-marker',
            html: `<div class="marker-icon" style="background-color: ${color}">📦</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          }),
        })
          .bindPopup(createPopupContent(donation))
          .addTo(mapInstance.current);

        marker.addEventListener('click', () => setSelectedDonation(donation));
        markersRef.current.push(marker);
      }
    });
  };

  const getDonationColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return '#10b981'; // green
      case 'REQUESTED':
        return '#f59e0b'; // amber
      case 'CONFIRMED':
        return '#3b82f6'; // blue
      case 'DONATED':
        return '#8b5cf6'; // purple
      default:
        return '#6b7280'; // gray
    }
  };

  const createPopupContent = (donation) => {
    return `
      <div class="popup-content">
        <strong>${donation.title}</strong>
        <p>${donation.category}</p>
        <p class="status">Status: ${donation.status}</p>
        <p class="donor">Donor: ${donation.donorId?.name || 'Anonymous'}</p>
      </div>
    `;
  };

  return (
    <div className="donation-map-page">
      <div className="map-header">
        <h1>Find Donations Near You</h1>
        <p>Explore available donations in your area</p>
      </div>

      <div className="map-container">
        <div className="map-sidebar">
          <div className="search-section">
            <h2>Search Radius</h2>
            <div className="radius-input">
              <input
                type="range"
                min="1"
                max="50"
                value={radius}
                onChange={(e) => setRadius(Number.parseInt(e.target.value))}
              />
              <div className="radius-display">
                <span>{radius} km</span>
              </div>
            </div>
          </div>

          <div className="donations-list-section">
            <h2>Nearby Donations ({donations.length})</h2>
            {loading ? (
              <div className="loading">Loading donations...</div>
            ) : donations.length === 0 ? (
              <div className="no-donations">No donations found in this area</div>
            ) : (
              <div className="donations-list">
                {donations.map((donation) => (
                  <button
                    key={donation._id}
                    className={`donation-list-item ${selectedDonation?._id === donation._id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedDonation(donation);
                      mapInstance.current.setView(
                        [donation.latitude, donation.longitude],
                        15
                      );
                    }}
                    type="button"
                  >
                    <div className="list-item-header">
                      <h3>{donation.title}</h3>
                      <span
                        className="status-badge"
                        style={{ background: getDonationColor(donation.status) }}
                      >
                        {donation.status}
                      </span>
                    </div>
                    <p className="category">{donation.category}</p>
                    <p className="condition">Condition: {donation.condition}</p>
                    <p className="donor">
                      <strong>Donor:</strong> {donation.donorId?.name || 'Anonymous'}
                    </p>
                    {donation.distance && (
                      <p className="distance">
                        <strong>Distance:</strong> {donation.distance.toFixed(2)} km
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="map-area" ref={mapRef}></div>
      </div>

      {selectedDonation && (
        <div className="donation-detail-popup">
          <div className="detail-header">
            <h2>{selectedDonation.title}</h2>
            <button
              className="close-btn"
              onClick={() => setSelectedDonation(null)}
            >
              ✕
            </button>
          </div>
          <div className="detail-content">
            <p>
              <strong>Category:</strong> {selectedDonation.category}
            </p>
            <p>
              <strong>Condition:</strong> {selectedDonation.condition}
            </p>
            <p>
              <strong>Status:</strong> {selectedDonation.status}
            </p>
            <p>
              <strong>Description:</strong> {selectedDonation.description}
            </p>
            {selectedDonation.address && (
              <p>
                <strong>Location:</strong> {selectedDonation.address}
              </p>
            )}
            <p>
              <strong>Donor:</strong> {selectedDonation.donorId?.name || 'Anonymous'}
            </p>
            {selectedDonation.distance && (
              <p>
                <strong>Distance:</strong> {selectedDonation.distance.toFixed(2)} km
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
