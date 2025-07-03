import axios from 'axios';

export async function getGeoFromIP(ip: string) {
  try {
    // Remove IPv6 prefix if present (e.g., '::ffff:')
    const cleanIp = ip.startsWith('::ffff:') ? ip.replace('::ffff:', '') : ip;
    const res = await axios.get(`http://ip-api.com/json/${cleanIp}`);
    if (res.data && res.data.status === 'success') {
      return {
        country: res.data.country,
        city: res.data.city,
        lat: res.data.lat,
        lon: res.data.lon,
      };
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error('Geolocation fetch failed:', e.message);
    } else {
      console.error('Geolocation fetch failed:', e);
    }
  }
  return null;
}
