import React, { useState, useMemo } from 'react';
import { Card, Row, Col, Button, Badge, Alert } from 'react-bootstrap';
import { Building2, Eye, Trash2, Wifi, WifiOff, Calendar, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import SensorCard from '../SensorCard/SensorCard';
import type { BuildingCardProps, ChartConfig, SensorReading } from '../../types';

const BuildingCard: React.FC<BuildingCardProps> = ({ 
  building, 
  onViewDetails, 
  onDelete 
}) => {
  const [chartConfigs, setChartConfigs] = useState<{ [key: string]: ChartConfig }>({});

  // Default chart configuration
  const defaultChartConfig: ChartConfig = {
    type: 'line',
    showGrid: true,
    animated: true
  };

  // Get chart config for a specific sensor
  const getChartConfig = (floor: string, sensor: string): ChartConfig => {
    const key = `${floor}-${sensor}`;
    return chartConfigs[key] || defaultChartConfig;
  };

  // Update chart config for a specific sensor
  const updateChartConfig = (floor: string, sensor: string, config: ChartConfig) => {
    const key = `${floor}-${sensor}`;
    setChartConfigs(prev => ({ ...prev, [key]: config }));
  };

  // Extract sensor data from batch data
  const extractSensorData = (floor: string, sensor: string): SensorReading[] => {
    const readings: SensorReading[] = [];
    
    // For batch_data building, read from ROOT batch_data (where ESP32 uploads)
    if (building.id === 'batch_data') {
      // Get root batch_data from Firebase service or context
      // For now, we'll access it through the building's data structure
      // This needs to be connected to the root batch_data in Firebase
      
      // First check if building has batch_data internally (old structure)
      const batchData = building.batch_data || {};
      
      // Process ESP32 batch data structure with timestamps
      Object.values(batchData).forEach(batch => {
        batch.forEach(dataPoint => {
          const floorData = dataPoint[floor];
          const timestamp = dataPoint.timestamp;
          
          if (floorData && typeof floorData === 'object' && timestamp) {
            // Type assertion for floor data structure
            const floorSensors = floorData as unknown as Record<string, SensorReading>;
            const sensorReading = floorSensors[sensor];
            if (sensorReading && typeof sensorReading === 'object' && 'x' in sensorReading) {
              // Add timestamp to the sensor reading
              readings.push({
                ...sensorReading,
                timestamp: timestamp
              });
            }
          }
        });
      });
    } else {
      // For regular buildings, use internal batch_data
      Object.values(building.batch_data || {}).forEach(batch => {
        batch.forEach(dataPoint => {
          const floorData = dataPoint[floor];
          const timestamp = dataPoint.timestamp;
          
          if (floorData && typeof floorData === 'object' && timestamp) {
            const floorSensors = floorData as unknown as Record<string, SensorReading>;
            const sensorReading = floorSensors[sensor];
            if (sensorReading && typeof sensorReading === 'object' && 'x' in sensorReading) {
              readings.push({
                ...sensorReading,
                timestamp: timestamp
              });
            }
          }
        });
      });
    }

    // Sort by timestamp to maintain chronological order (ESP32 batch processing)
    readings.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    return readings.slice(-100); // Keep last 100 readings for better visualization
  };

  // Calculate building stats
  const buildingStats = useMemo(() => {
    const totalSensors = Object.values(building.sensorsPerFloor || {})
      .reduce((total, sensors) => total + sensors.length, 0);
    
    const hasRecentData = building.lastUpdated && 
      (Date.now() - building.lastUpdated) < 30000; // Less than 30 seconds
    
    const totalDataPoints = Object.values(building.batch_data || {})
      .reduce((total, batch) => total + batch.length, 0);

    return {
      totalSensors,
      totalFloors: building.floors?.length || 0,
      hasRecentData,
      totalDataPoints,
      isActive: totalDataPoints > 0
    };
  }, [building]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-4"
    >
      <Card 
        className="building-card"
        style={{
          border: '3px solid #e8f5e8',
          borderRadius: '16px',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fffe 100%)',
          boxShadow: '0 8px 30px rgba(45, 90, 39, 0.1)',
          overflow: 'hidden'
        }}
      >
        {/* Building Header */}
        <Card.Header 
          style={{
            background: 'linear-gradient(135deg, #2d5a27 0%, #4a7c59 50%, #2d5a27 100%)',
            border: 'none',
            color: 'white',
            padding: '1.5rem'
          }}
        >
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex align-items-center mb-2">
                <Building2 size={28} className="me-3" />
                <div>
                  <h4 className="mb-0 fw-bold">{building.name}</h4>
                  <small className="opacity-75">
                    Building ID: {building.id}
                  </small>
                </div>
              </div>
              
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <Badge 
                  bg={buildingStats.hasRecentData ? 'success' : 'secondary'}
                  className="d-flex align-items-center"
                >
                  {buildingStats.hasRecentData ? <Wifi size={14} /> : <WifiOff size={14} />}
                  <span className="ms-1">
                    {buildingStats.hasRecentData ? 'Live' : 'Offline'}
                  </span>
                </Badge>
                
                <Badge bg="light" text="dark">
                  <Activity size={14} className="me-1" />
                  {buildingStats.totalSensors} Sensors
                </Badge>
                
                <Badge bg="light" text="dark">
                  <Building2 size={14} className="me-1" />
                  {buildingStats.totalFloors} Floors
                </Badge>
                
                <Badge bg="info">
                  {buildingStats.totalDataPoints} Data Points
                </Badge>
              </div>
            </Col>
            
            <Col md={4} className="text-end">
              <div className="d-flex gap-2 justify-content-end">
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => onViewDetails(building.id)}
                  className="d-flex align-items-center"
                >
                  <Eye size={16} className="me-1" />
                  Details
                </Button>
                
                {onDelete && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDelete(building.id)}
                    className="d-flex align-items-center"
                    style={{ borderColor: '#ff6b6b', color: '#ff6b6b' }}
                  >
                    <Trash2 size={16} className="me-1" />
                    Delete
                  </Button>
                )}
              </div>
              
              {building.lastUpdated && (
                <div className="mt-2">
                  <small className="opacity-75 d-flex align-items-center justify-content-end">
                    <Calendar size={12} className="me-1" />
                    Last update: {new Date(building.lastUpdated).toLocaleTimeString()}
                  </small>
                </div>
              )}
            </Col>
          </Row>
        </Card.Header>

        {/* Building Content */}
        <Card.Body style={{ padding: '1.5rem' }}>
          {buildingStats.isActive ? (
            <div>
              {/* Render sensors by floor */}
              {building.floors?.map(floor => (
                <div key={floor} className="mb-4">
                  <h5 
                    className="mb-3 pb-2"
                    style={{ 
                      borderBottom: '2px solid #e8f5e8',
                      color: '#2d5a27',
                      fontWeight: 'bold'
                    }}
                  >
                    Floor {floor}
                  </h5>
                  
                  <Row>
                    {building.sensorsPerFloor?.[floor]?.map(sensor => {
                      const sensorData = extractSensorData(floor, sensor);
                      const chartConfig = getChartConfig(floor, sensor);
                      
                      return (
                        <Col md={12} lg={6} key={`${floor}-${sensor}`} className="mb-4">
                          <SensorCard
                            floor={floor}
                            sensor={sensor}
                            data={sensorData}
                            chartConfig={chartConfig}
                            onConfigChange={(config) => updateChartConfig(floor, sensor, config)}
                          />
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              ))}
            </div>
          ) : (
            <Alert 
              variant="warning" 
              className="text-center"
              style={{
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                borderColor: '#ffc107',
                color: '#856404'
              }}
            >
              <Activity size={24} className="mb-2" />
              <h6>No sensor data available</h6>
              <p className="mb-0">
                This building has been created but no sensor data has been received yet.
              </p>
            </Alert>
          )}
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default BuildingCard;
