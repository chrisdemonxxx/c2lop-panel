'use client';
import ProfileCard from '../../../components/ProfileCard';
import ThemeSwitcher from '../../../components/ThemeSwitcher';

export default function SettingsPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Settings</h1>
      <ProfileCard />
      <hr />
      <ThemeSwitcher />
    </div>
  );
}