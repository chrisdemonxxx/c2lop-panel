import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


// Custom marker icons
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

import type { Icon } from 'leaflet';

interface Client {
  id: string | number;
  lat: number;
  lon: number;
  status: string;
  hostname?: string;
  city?: string;
  country?: string;
  ip?: string;
}

interface ClientsMapProps {
  clients: Client[];
}

export default function ClientsMap({ clients }: ClientsMapProps) {
  const onlineClients = clients.filter(c => c.lat && c.lon && c.status === 'ONLINE');
  const offlineClients = clients.filter(c => c.lat && c.lon && c.status === 'OFFLINE');

  return (
    <div style={{ width: '100%', minHeight: 420, margin: '2rem 0', background: 'rgba(24,32,44,0.9)', borderRadius: 16, boxShadow: '0 0 32px #0f08', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 16 }}>
        <span style={{display:'flex',alignItems:'center',gap:4}}>
          <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png" width={18} alt="Online" />
          <span style={{color:'#22c55e'}}>Online</span>
        </span>
        <span style={{display:'flex',alignItems:'center',gap:4}}>
          <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png" width={18} alt="Offline" />
          <span style={{color:'#ef4444'}}>Offline</span>
        </span>
        <span style={{marginLeft:'auto',fontSize:12,color:'#a0aec0'}}>Map shows all geolocated clients</span>
      </div>
      {/* @ts-expect-error: MapContainer type mismatch workaround for react-leaflet+TS */}
      <MapContainer center={[20, 0]} zoom={2} style={{ height: 400, width: '100%', borderRadius: 12 } as React.CSSProperties}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MarkerClusterGroup>
          {onlineClients.map(client => (
            <Marker key={client.id} position={[client.lat, client.lon] as [number, number]} {...({ icon: greenIcon } as any)}>
              <Popup>
                <div style={{minWidth:180}}>
                  <div style={{fontWeight:'bold',fontSize:16,color:'#22c55e'}}>{client.hostname}</div>
                  <div style={{fontSize:13}}>{client.city ? `${client.city}, ` : ''}{client.country || ''}</div>
                  <div style={{fontSize:12}}>IP: {client.ip}</div>
                  <div style={{marginTop:4,fontSize:12}}><span style={{color:'#22c55e'}}>●</span> Online</div>
                </div>
              </Popup>
            </Marker>
          ))}
          {offlineClients.map(client => (
            <Marker key={client.id} position={[client.lat, client.lon] as [number, number]} {...({ icon: redIcon } as any)}>
              <Popup>
                <div style={{minWidth:180}}>
                  <div style={{fontWeight:'bold',fontSize:16,color:'#ef4444'}}>{client.hostname}</div>
                  <div style={{fontSize:13}}>{client.city ? `${client.city}, ` : ''}{client.country || ''}</div>
                  <div style={{fontSize:12}}>IP: {client.ip}</div>
                  <div style={{marginTop:4,fontSize:12}}><span style={{color:'#ef4444'}}>●</span> Offline</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
