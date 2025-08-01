import React from 'react';
import { Navbar, Nav, Container, Badge, Button } from 'react-bootstrap';
import { Activity, Wifi, WifiOff, Eye, EyeOff, Flame, Upload, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataImportService } from '../../services/dataImportService';
import { firebaseCleanupService } from '../../services/firebaseCleanupService';

const Header: React.FC = () => {
  const { state, actions } = useApp();

  return (
    <Navbar 
      expand="lg" 
      className="header-navbar"
      style={{
        background: 'linear-gradient(135deg, #2d5a27 0%, #4a7c59 50%, #2d5a27 100%)',
        boxShadow: '0 4px 20px rgba(45, 90, 39, 0.3)',
        borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
      }}
      variant="dark"
    >
      <Container fluid>
        {/* Logo and Brand */}
        <Navbar.Brand 
          href="#" 
          className="d-flex align-items-center"
          style={{ fontWeight: 'bold', fontSize: '1.5rem' }}
        >
          <Activity 
            size={32} 
            className="me-2" 
            style={{ 
              color: '#7dd87d',
              filter: 'drop-shadow(0 0 5px rgba(125, 216, 125, 0.5))'
            }} 
          />
          <span style={{ color: '#ffffff' }}>
            {import.meta.env.VITE_APP_NAME || 'Structural Health Monitoring'}
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          {/* Company Info */}
          <Nav className="me-auto">
            <Nav.Item className="d-flex align-items-center ms-3">
              <span 
                style={{ 
                  color: '#b8e6b8', 
                  fontSize: '0.9rem',
                  fontStyle: 'italic'
                }}
              >
                {import.meta.env.VITE_COMPANY_NAME || 'Green Energy Park'}
              </span>
            </Nav.Item>
          </Nav>

          {/* Status and Controls */}
          <Nav className="d-flex align-items-center">
            {/* Connection Status */}
            <Nav.Item className="me-3">
              <div className="d-flex align-items-center">
                {state.connected ? (
                  <>
                    <Wifi size={20} className="me-1" style={{ color: '#7dd87d' }} />
                    <Badge bg="success" className="me-2">Connected</Badge>
                  </>
                ) : (
                  <>
                    <WifiOff size={20} className="me-1" style={{ color: '#ff6b6b' }} />
                    <Badge bg="danger" className="me-2">Disconnected</Badge>
                  </>
                )}
              </div>
            </Nav.Item>

            {/* Buildings Count */}
            <Nav.Item className="me-3">
              <Badge 
                bg="light" 
                text="dark"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 'bold'
                }}
              >
                {state.buildings.length} Buildings
              </Badge>
            </Nav.Item>

            {/* Firebase Connection Button */}
            <Nav.Item className="me-2">
              <Button
                variant="outline-light"
                size="sm"
                onClick={async () => {
                  console.log('🔥 Manual Firebase connection test triggered...');
                  try {
                    await actions.testConnection();
                    console.log('Connection test completed - check debug panel for results');
                    alert('Connection test completed - check debug panel for results');
                  } catch (error) {
                    console.error('❌ Connection test error:', error);
                    alert('Connection test failed - Check console for details');
                  }
                }}
                disabled={state.loading}
                className="d-flex align-items-center"
                style={{
                  borderColor: '#ff6b6b',
                  color: '#ff6b6b',
                  backgroundColor: 'transparent',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff6b6b';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#ff6b6b';
                }}
              >
                <Flame size={16} className="me-1" />
                <Flame size={16} className="me-1" />
                Firebase
                <Flame size={16} className="ms-1" />
              </Button>
            </Nav.Item>

            {/* Import Data Button */}
            <Nav.Item className="me-2">
              <Button
                variant="outline-success"
                size="sm"
                onClick={async () => {
                  try {
                    console.log('📥 Importing data to root batch_data...');
                    
                    // Sample data structure based on your export
                    const sampleData = {
                      "16226": [
                        {
                          "E1": {
                            "M1": { "x": -0.8, "y": -1.3, "z": 10.47 },
                            "M2": { "x": 5.25, "y": -3.05, "z": 7.31 }
                          },
                          "E2": {
                            "S1": { "x": -0.54, "y": -0.12, "z": 9.78 },
                            "S2": { "x": -0.81, "y": -0.17, "z": 10.86 }
                          },
                          "timestamp": 15804
                        }
                      ]
                    };
                    
                    await dataImportService.importBatchData({ batch_data: sampleData });
                    console.log(`✅ Data imported to batch_data building successfully!`);
                    alert(`Data imported to ESP32 building successfully!`);
                    
                    // Data will automatically update via real-time subscription
                  } catch (error) {
                    console.error('❌ Data import failed:', error);
                    alert(`Data import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  }
                }}
                disabled={state.loading}
                className="d-flex align-items-center"
                style={{
                  borderColor: '#28a745',
                  color: '#28a745',
                  backgroundColor: 'transparent',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#28a745';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#28a745';
                }}
              >
                <Upload size={16} className="me-1" />
                Import Data
              </Button>
            </Nav.Item>

            {/* Cleanup Firebase Button */}
            <Nav.Item className="me-3">
              <Button
                variant="outline-warning"
                size="sm"
                onClick={async () => {
                  try {
                    console.log('🧹 Cleaning up Firebase structure...');
                    await firebaseCleanupService.cleanupFirebaseStructure();
                    console.log('✅ Firebase cleanup completed!');
                    alert('Firebase structure cleaned up successfully!');
                  } catch (error) {
                    console.error('❌ Cleanup failed:', error);
                    alert(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  }
                }}
                disabled={state.loading}
                className="d-flex align-items-center"
                style={{
                  borderColor: '#ffc107',
                  color: '#ffc107',
                  backgroundColor: 'transparent',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffc107';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#ffc107';
                }}
              >
                <Trash2 size={16} className="me-1" />
                Fix Firebase
              </Button>
            </Nav.Item>

            {/* Debug Toggle */}
            <Nav.Item>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => actions.toggleDebugPanel()}
                className="d-flex align-items-center"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: state.showDebug ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
                }}
              >
                {state.showDebug ? (
                  <EyeOff size={16} className="me-1" />
                ) : (
                  <Eye size={16} className="me-1" />
                )}
                Debug
                {state.debugLogs.length > 0 && (
                  <Badge 
                    bg="warning" 
                    className="ms-1"
                    style={{ fontSize: '0.6rem' }}
                  >
                    {state.debugLogs.length}
                  </Badge>
                )}
              </Button>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
