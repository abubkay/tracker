// src/components/LiveMap.js
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const LiveMap = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const usersRef = ref(database, 'locations');
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.entries(data).map(([userId, userData]) => ({
          id: userId,
          ...userData
        }));
        setUsers(usersArray);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <MapContainer 
        center={[0, 0]} 
        zoom={2} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {users.map(user => (
          <Marker 
            key={user.id} 
            position={[user.latitude, user.longitude]}
          >
            <Popup>
              <div>
                <h3>User: {user.id}</h3>
                <p>Last updated: {new Date(user.timestamp).toLocaleString()}</p>
                <p>Lat: {user.latitude.toFixed(4)}, Lng: {user.longitude.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LiveMap;