'use client';
import React, { useState } from 'react';

export default function ProfileCard() {
  const [image, setImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState('Operator');
  const [email, setEmail] = useState('operator@c2.local');
  const [dirty, setDirty] = useState(false);

  // Load from backend on mount
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const api = (await import('@/lib/api')).default;
        const res = await api.get('/admin/profile');
        const data = res.data;
        if (mounted) {
          setName(data.name || 'Operator');
          setEmail(data.email || 'operator@c2.local');
          if (data.image) {
            setImage(data.image);
            setPreview(data.image);
          }
        }
      } catch {
        // fallback/defaults
      }
    })();
    let socket: any;
    let onProfileUpdate: any;
    import('@/lib/socket').then(({ default: s }) => {
      socket = s;
      onProfileUpdate = (data: any) => {
        setName(data.name || 'Operator');
        setEmail(data.email || 'operator@c2.local');
        if (data.image) {
          setImage(data.image);
          setPreview(data.image);
        }
      };
      socket.on('admin_profile_updated', onProfileUpdate);
    });
    return () => {
      mounted = false;
      if (socket && onProfileUpdate) {
        socket.off('admin_profile_updated', onProfileUpdate);
      }
    };
  }, []);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setPreview(reader.result as string);
      setDirty(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      const api = (await import('@/lib/api')).default;
      const socket = (await import('@/lib/socket')).default;
      await api.put('/admin/profile', { name, email, image });
      socket.emit('admin_profile_updated', { name, email, image });
      alert(`Profile saved!\nName: ${name}\nEmail: ${email}${image ? '\nImage updated' : ''}`);
      setDirty(false);
    } catch (err: any) {
      alert('Failed to save profile: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Profile</h2>
      <input type="file" accept="image/*" onChange={handleImage} />
      {preview && <img src={preview} alt="profile" width={100} />}
      <div style={{ marginTop: '1rem' }}>
        <label>Name: <input type="text" value={name} onChange={e => { setName(e.target.value); setDirty(true); }} /></label>
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        <label>Email: <input type="email" value={email} onChange={e => { setEmail(e.target.value); setDirty(true); }} /></label>
      </div>
      <p style={{ marginTop: '0.5rem' }}>Role: ADMIN</p>
      <button style={{marginTop: '1rem'}} onClick={handleSave} disabled={!dirty}>Save</button>
    </div>
  );
}