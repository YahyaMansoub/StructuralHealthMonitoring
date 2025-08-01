import React from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Building2, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import BuildingCard from '../BuildingCard/BuildingCard';

const Dashboard: React.FC = () => {
  const { state, actions } = useApp();

  if (state.loading) {
    return (
      <div 
        className="d-flex align-items-center justify-content-center"
        style={{ 
          height: 'calc(100vh - 80px)',
          marginLeft: '300px',
          background: 'linear-gradient(135deg, #f8fffe 0%, #e8f5e8 100%)'
        }}
      >
        <div className="text-center">
          <Spinner 
            animation="border" 
            style={{ color: '#4a7c59', width: '3rem', height: '3rem' }} 
          />
          <div className="mt-3" style={{ color: '#2d5a27', fontWeight: 'bold' }}>
            Loading monitoring system...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        marginLeft: '300px',
        minHeight: 'calc(100vh - 80px)',
        background: 'linear-gradient(135deg, #f8fffe 0%, #e8f5e8 100%)',
        paddingBottom: state.showDebug ? '300px' : '2rem'
      }}
    >
      <Container fluid className="py-4">
        {/* Connection Status */}
        {!state.connected && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <Alert 
              variant="warning" 
              className="d-flex align-items-center"
              style={{
                background: 'linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%)',
                border: '2px solid #ffc107',
                borderRadius: '12px'
              }}
            >
              <Wifi size={20} className="me-2" />
              <div>
                <strong>Connection Issue</strong> - Unable to connect to Firebase. 
                Some features may be limited.
              </div>
            </Alert>
          </motion.div>
        )}

        {/* Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <Row className="align-items-center mb-4">
            <Col>
              <h2 
                className="mb-2 d-flex align-items-center"
                style={{ color: '#2d5a27', fontWeight: 'bold' }}
              >
                <Building2 size={32} className="me-3" />
                Buildings Dashboard
              </h2>
              <p 
                className="mb-0"
                style={{ color: '#666', fontSize: '1.1rem' }}
              >
                Monitor structural health across all buildings in real-time
              </p>
            </Col>
            
            <Col xs="auto">
              <div 
                className="d-flex align-items-center p-3 rounded"
                style={{
                  background: 'rgba(45, 90, 39, 0.1)',
                  border: '2px solid rgba(45, 90, 39, 0.2)'
                }}
              >
                <div className="text-center">
                  <div 
                    style={{ 
                      fontSize: '2rem', 
                      fontWeight: 'bold', 
                      color: '#2d5a27',
                      lineHeight: 1
                    }}
                  >
                    {state.buildings.length}
                  </div>
                  <div 
                    style={{ 
                      fontSize: '0.9rem', 
                      color: '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Buildings
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </motion.div>

        {/* Buildings List */}
        {state.buildings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Alert 
              variant="info" 
              className="text-center py-5"
              style={{
                background: 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)',
                border: '2px solid #17a2b8',
                borderRadius: '16px'
              }}
            >
              <Building2 size={48} className="mb-3 text-info" />
              <h4 style={{ color: '#0c5460' }}>No Buildings Found</h4>
              <p className="mb-0" style={{ color: '#0c5460' }}>
                Get started by adding your first building using the sidebar. 
                Configure floors and sensors to begin monitoring structural health.
              </p>
            </Alert>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {state.buildings.map((building, index) => (
              <motion.div
                key={building.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <BuildingCard
                  building={building}
                  onViewDetails={(buildingId) => {
                    actions.selectBuilding(buildingId);
                    // Here you could navigate to a detailed view
                    console.log('View details for building:', buildingId);
                  }}
                  onDelete={(buildingId) => {
                    if (window.confirm('Are you sure you want to delete this building?')) {
                      actions.deleteBuilding(buildingId);
                    }
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </Container>
    </div>
  );
};

export default Dashboard;
