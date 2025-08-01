import React, { useState } from 'react';
import { Card, Button, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { Plus, Building2, Layers, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';

const Sidebar: React.FC = () => {
  const { actions } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [buildingName, setBuildingName] = useState('');
  const [floors, setFloors] = useState('E1,E2');
  const [sensorsConfig, setSensorsConfig] = useState('E1:M1,M2;E2:S1,S2');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddBuilding = async () => {
    if (!buildingName.trim()) {
      setError('Building name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Parse floors
      const floorsList = floors.split(',').map(f => f.trim()).filter(f => f);
      if (floorsList.length === 0) {
        setError('At least one floor is required');
        return;
      }

      // Parse sensors configuration
      const sensorsPerFloor: { [floor: string]: string[] } = {};
      const sensorConfigs = sensorsConfig.split(';');
      
      for (const config of sensorConfigs) {
        const [floor, sensorsStr] = config.split(':');
        if (floor && sensorsStr) {
          const floorName = floor.trim();
          const sensorsList = sensorsStr.split(',').map(s => s.trim()).filter(s => s);
          if (sensorsList.length > 0) {
            sensorsPerFloor[floorName] = sensorsList;
          }
        }
      }

      if (Object.keys(sensorsPerFloor).length === 0) {
        setError('At least one floor with sensors is required');
        return;
      }

      await actions.addBuilding(buildingName, floorsList, sensorsPerFloor);
      
      // Reset form
      setBuildingName('');
      setFloors('E1,E2');
      setSensorsConfig('E1:M1,M2;E2:S1,S2');
      setShowModal(false);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add building');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError('');
    setBuildingName('');
    setFloors('E1,E2');
    setSensorsConfig('E1:M1,M2;E2:S1,S2');
  };

  return (
    <>
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sidebar"
        style={{
          width: '300px',
          height: 'calc(100vh - 80px)',
          position: 'fixed',
          left: 0,
          top: '80px',
          background: 'linear-gradient(180deg, #f8fffe 0%, #e8f5e8 100%)',
          borderRight: '3px solid rgba(45, 90, 39, 0.1)',
          padding: '1.5rem',
          overflowY: 'auto',
          zIndex: 1000
        }}
      >
        <Card 
          className="mb-4"
          style={{
            border: '2px solid #e8f5e8',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 15px rgba(45, 90, 39, 0.1)'
          }}
        >
          <Card.Header 
            style={{
              background: 'linear-gradient(135deg, #4a7c59 0%, #2d5a27 100%)',
              border: 'none',
              color: 'white',
              borderRadius: '10px 10px 0 0'
            }}
          >
            <h5 className="mb-0 d-flex align-items-center">
              <Building2 size={20} className="me-2" />
              Building Management
            </h5>
          </Card.Header>
          
          <Card.Body>
            <Button
              variant="success"
              className="w-100 d-flex align-items-center justify-content-center"
              onClick={() => setShowModal(true)}
              style={{
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Plus size={20} className="me-2" />
              Add New Building
            </Button>
            
            <div className="mt-3">
              <small className="text-muted">
                Click to add a new building to the monitoring system. Configure floors and sensors for real-time data collection.
              </small>
            </div>
          </Card.Body>
        </Card>

        {/* Quick Guide Card */}
        <Card 
          style={{
            border: '2px solid #e3f2fd',
            borderRadius: '12px',
            background: 'rgba(227, 242, 253, 0.3)',
            boxShadow: '0 4px 15px rgba(33, 150, 243, 0.1)'
          }}
        >
          <Card.Header 
            style={{
              background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
              border: 'none',
              color: 'white',
              borderRadius: '10px 10px 0 0'
            }}
          >
            <h6 className="mb-0">Quick Guide</h6>
          </Card.Header>
          
          <Card.Body style={{ padding: '1rem' }}>
            <div className="mb-3">
              <div className="d-flex align-items-center mb-2">
                <Layers size={16} className="me-2 text-info" />
                <strong style={{ fontSize: '0.85rem' }}>Floors</strong>
              </div>
              <small className="text-muted">
                Format: E1,E2,E3 (comma-separated)
              </small>
            </div>
            
            <div>
              <div className="d-flex align-items-center mb-2">
                <Cpu size={16} className="me-2 text-success" />
                <strong style={{ fontSize: '0.85rem' }}>Sensors</strong>
              </div>
              <small className="text-muted">
                Format: E1:M1,M2;E2:S1,S2<br/>
                (floor:sensors;floor:sensors)
              </small>
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Add Building Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header 
          closeButton
          style={{
            background: 'linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%)',
            color: 'white',
            border: 'none'
          }}
        >
          <Modal.Title className="d-flex align-items-center">
            <Building2 size={24} className="me-2" />
            Add New Building
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body style={{ background: '#f8fffe' }}>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Building Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Green Tower A"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                disabled={loading}
                style={{
                  borderColor: '#e8f5e8',
                  borderRadius: '8px'
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold d-flex align-items-center">
                <Layers size={16} className="me-1" />
                Floors
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="E1,E2,E3"
                value={floors}
                onChange={(e) => setFloors(e.target.value)}
                disabled={loading}
                style={{
                  borderColor: '#e8f5e8',
                  borderRadius: '8px'
                }}
              />
              <Form.Text className="text-muted">
                Comma-separated list of floor names (e.g., E1,E2,E3)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold d-flex align-items-center">
                <Cpu size={16} className="me-1" />
                Sensors Configuration
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="E1:M1,M2;E2:S1,S2"
                value={sensorsConfig}
                onChange={(e) => setSensorsConfig(e.target.value)}
                disabled={loading}
                style={{
                  borderColor: '#e8f5e8',
                  borderRadius: '8px'
                }}
              />
              <Form.Text className="text-muted">
                Format: Floor:Sensor1,Sensor2;Floor:Sensor1,Sensor2
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        
        <Modal.Footer style={{ background: '#f8fffe', border: 'none' }}>
          <Button 
            variant="secondary" 
            onClick={handleCloseModal}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleAddBuilding}
            disabled={loading || !buildingName.trim()}
            className="d-flex align-items-center"
            style={{
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              border: 'none'
            }}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  className="me-2"
                />
                Adding...
              </>
            ) : (
              <>
                <Plus size={16} className="me-1" />
                Add Building
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Sidebar;
