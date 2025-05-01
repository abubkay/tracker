import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { database } from '../firebase';
import { ref, get } from 'firebase/database';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component to change map center dynamically
const ChangeMapCenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const LiveMap = () => {
  const [users, setUsers] = useState([]);
  const [rawData, setRawData] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    console.log('Connecting to Firebase real-time database with polling every 500ms...');
    const usersRef = ref(database, 'users');

    const fetchData = async () => {
      try {
        const snapshot = await get(usersRef);
        const data = snapshot.val();
        console.log('Raw data fetched from Firebase:', data);
        setRawData(data);
        if (data && typeof data === 'object') {
          const usersArray = Object.entries(data).map(([userId, userData]) => {
            const location = userData && userData.location ? userData.location : {};
            return {
              id: userId,
              latitude: location.latitude || null,
              longitude: location.longitude || null,
              timestamp: location.timestamp || null
            };
          });
          setUsers(usersArray);
        } else {
          console.warn('No valid users data found in Firebase.');
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching data from Firebase:', error);
        setUsers([]);
        setRawData(null);
      }
    };

    fetchData(); // initial fetch
    const intervalId = setInterval(fetchData, 500);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
      );
    }
  }, []);

  // Helper function to format coordinates or show 'N/A'
  const formatCoord = (coord) => {
    return typeof coord === 'number' && !isNaN(coord) ? coord.toFixed(6) : 'N/A';
  };

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      {/* Display raw data fetched from Firebase at the top */}
      <div style={{ padding: '8px', backgroundColor: '#e0e0e0', fontWeight: 'bold', maxHeight: '150px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
        <h4>Raw Data from Firebase (Live):</h4>
        {rawData ? JSON.stringify(rawData, null, 2) : 'No data fetched yet'}
      </div>
      {/* Display all users' coordinates from Firebase */}
      {/* <div style={{ padding: '8px', backgroundColor: '#f0f0f0', fontWeight: 'bold', maxHeight: '100px', overflowY: 'auto' }}>
        <h4>Tracked Users Coordinates (Live):</h4>
        {users.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {users.map(user => (
              <li key={user.id}>
                {user.id}: Lat: {formatCoord(user.latitude)}, Lng: {formatCoord(user.longitude)}
              </li>
            ))}
          </ul>
        ) : (
          'No coordinates available from Firebase'
        )}
      </div> */}
      <MapContainer 
        center={currentLocation || [0, 0]} 
        zoom={currentLocation ? 13 : 2} 
        style={{ height: 'calc(80vh - 280px)', width: '100%' }}
      >
        <ChangeMapCenter center={currentLocation} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {users.map(user => (
          user.latitude && user.longitude && (
            <Marker 
              key={user.id} 
              position={[user.latitude, user.longitude]}
            >
              <Popup>
                <div>
                  <h3>User: {user.id}</h3>
                  <p>Last updated: {user.timestamp ? new Date(user.timestamp).toLocaleString() : 'N/A'}</p>
                  <p>Lat: {user.latitude.toFixed(4)}, Lng: {user.longitude.toFixed(4)}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
        {currentLocation && (
          <Marker position={currentLocation}>
            <Popup>
              <div>
                <h3>Current Location</h3>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
