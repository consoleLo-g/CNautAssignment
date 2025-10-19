import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Sidebar from './components/SideBar';
import Graph from './components/Graph';

class GraphErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError ? (
      <h2 style={{ textAlign: 'center', color: '#ef4444' }}>Something went wrong in Graph</h2>
    ) : this.props.children;
  }
}

const App: React.FC = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={containerStyle}>
        {/* Superheading */}
        <div style={superHeadingStyle}>
          <h1 style={{ ...headingTextStyle, fontSize: windowWidth < 425 ? 18 : 24 }}>Social Network Graph</h1>
          <p style={{ ...subTextStyle, fontSize: windowWidth < 425 ? 12 : 14 }}>
            Visualize users and their connections. Click on nodes to see user details, friends, and hobbies.
          </p>
        </div>

        {/* Mobile toolbar */}
        {windowWidth < 768 && (
          <div style={mobileToolbarStyle}>
            <button onClick={() => setSidebarOpen(prev => !prev)} style={toolbarBtnStyle}>
              {sidebarOpen ? 'Close Hobbies' : 'Hobbies'}
            </button>
          </div>
        )}

        {/* Main content */}
        <div style={mainContentStyle}>
          {/* Sidebar */}
          <Sidebar isVisible={sidebarOpen} />

          {/* Graph */}
          <div style={graphContainerStyle}>
            <GraphErrorBoundary>
              <Graph />
            </GraphErrorBoundary>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default App;

// --- Styles ---
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  fontFamily: "'Segoe UI', sans-serif",
};

const superHeadingStyle: React.CSSProperties = {
  backgroundColor: '#e5e7eb',
  padding: '12px 16px',
  borderRadius: 8,
  textAlign: 'center',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  flexShrink: 0,
};

const headingTextStyle: React.CSSProperties = {
  margin: 0,
  color: '#111827',
};

const subTextStyle: React.CSSProperties = {
  marginTop: 4,
  color: '#4b5563',
};

const mobileToolbarStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 10,
  padding: '6px 16px',
  alignItems: 'center',
};

const toolbarBtnStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 6,
  border: 'none',
  backgroundColor: '#2563eb',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 14,
};

const mainContentStyle: React.CSSProperties = {
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
  minHeight: 0,
};

const graphContainerStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  transition: 'all 0.3s ease',
};
