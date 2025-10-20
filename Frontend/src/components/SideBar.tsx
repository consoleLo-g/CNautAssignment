import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HobbyItem from './HobbyItem';
import { API_BASE } from '../store/userSlice';

interface SidebarProps {
  isVisible?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible = true }) => {
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    axios.get<string[]>(`${API_BASE}/hobbies`)
      .then(res => setHobbies(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isVisible) return null;

  const filtered = hobbies
    .filter((h): h is string => typeof h === "string")
    .filter(h => h.toLowerCase().includes(search.toLowerCase()));

  // Responsive width
  let sidebarWidth = 220;
  if (windowWidth < 375) sidebarWidth = 160;
  else if (windowWidth < 425) sidebarWidth = 180;
  else if (windowWidth < 768) sidebarWidth = 200;
  else if (windowWidth >= 1440) sidebarWidth = 260;

  return (
    <div style={{ ...sidebarStyle, width: sidebarWidth }}>
      <h2 style={{ ...headingStyle, fontSize: windowWidth < 375 ? 16 : 18 }}>Hobbies</h2>
      <input
        type="text"
        placeholder="Search hobbies..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          ...searchInputStyle,
          fontSize: windowWidth < 375 ? 12 : 14,
          padding: windowWidth < 375 ? '6px 8px' : '8px 10px',
        }}
      />

      <div style={hobbyListStyle}>
        {filtered.length ? (
          filtered.map(hobby => <HobbyItem key={hobby} hobby={hobby} />)
        ) : (
          <p style={{ textAlign: 'center', color: '#777', fontSize: windowWidth < 375 ? 12 : 14 }}>
            No hobbies found
          </p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

// --- Styles ---
const sidebarStyle: React.CSSProperties = {
  padding: 15,
  borderRight: '1px solid #ccc',
  height: '100vh',
  overflowY: 'auto',
  backgroundColor: '#f9fafb',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
};

const headingStyle: React.CSSProperties = {
  fontWeight: 600,
  marginBottom: 12,
  color: '#111827',
  textAlign: 'center',
};

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 6,
  border: '1px solid #ccc',
  marginBottom: 12,
};

const hobbyListStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};
