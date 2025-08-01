import React, { useMemo } from 'react';
import { Card, ButtonGroup, Button, Badge } from 'react-bootstrap';
import { Line, Scatter } from 'react-chartjs-2';
import { 
  BarElement, 
  CategoryScale, 
  Chart as ChartJS, 
  Legend, 
  LinearScale, 
  LineElement, 
  PointElement, 
  Title, 
  Tooltip 
} from 'chart.js';
import { TrendingUp, Grid3X3, Activity } from 'lucide-react';
import type { SensorCardProps, SensorReading } from '../../types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ProcessedData {
  timestamps: number[];
  xData: number[];
  yData: number[];
  zData: number[];
}

const SensorCard: React.FC<SensorCardProps> = ({ 
  floor, 
  sensor, 
  data, 
  chartConfig, 
  onConfigChange 
}) => {
  
  // Process data for charts - Handle batched ESP32 data structure
  const processedData: ProcessedData = useMemo(() => {
    const timestamps: number[] = [];
    const xData: number[] = [];
    const yData: number[] = [];
    const zData: number[] = [];

    // Process data with proper timestamp ordering for ESP32 batch structure
    data.forEach((reading: SensorReading) => {
      // Use the actual timestamp from the reading
      const timestamp = reading.timestamp || Date.now();
      timestamps.push(timestamp);
      xData.push(reading.x || 0);
      yData.push(reading.y || 0);
      zData.push(reading.z || 0);
    });

    // Sort all arrays by timestamp to maintain chronological order
    const combined = timestamps.map((timestamp, index) => ({
      timestamp,
      x: xData[index],
      y: yData[index],
      z: zData[index]
    }));

    combined.sort((a, b) => a.timestamp - b.timestamp);

    // Extract sorted data
    const sortedTimestamps = combined.map(item => item.timestamp);
    const sortedXData = combined.map(item => item.x);
    const sortedYData = combined.map(item => item.y);
    const sortedZData = combined.map(item => item.z);

    return { 
      timestamps: sortedTimestamps, 
      xData: sortedXData, 
      yData: sortedYData, 
      zData: sortedZData 
    };
  }, [data]);

  // Chart data configuration with proper timestamp labels
  const chartData = useMemo(() => {
    // Convert timestamps to readable labels (relative to first timestamp for cleaner display)
    const baseTimestamp = processedData.timestamps[0] || 0;
    const relativeTimestamps = processedData.timestamps.map(ts => 
      ((ts - baseTimestamp) / 1000).toFixed(1) + 's'
    );

    return {
      labels: relativeTimestamps,
      datasets: [
        {
          label: 'X-Axis',
          data: processedData.xData,
          borderColor: '#ff6b6b',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          borderWidth: 2,
          pointRadius: chartConfig.type === 'scatter' ? 3 : 1,
          pointHoverRadius: 5,
          tension: 0.4,
        },
        {
          label: 'Y-Axis',
          data: processedData.yData,
          borderColor: '#4ecdc4',
          backgroundColor: 'rgba(78, 205, 196, 0.1)',
          borderWidth: 2,
          pointRadius: chartConfig.type === 'scatter' ? 3 : 1,
          pointHoverRadius: 5,
          tension: 0.4,
        },
        {
          label: 'Z-Axis',
          data: processedData.zData,
          borderColor: '#45b7d1',
          backgroundColor: 'rgba(69, 183, 209, 0.1)',
          borderWidth: 2,
          pointRadius: chartConfig.type === 'scatter' ? 3 : 1,
          pointHoverRadius: 5,
          tension: 0.4,
        }
      ]
    };
  }, [processedData, chartConfig.type]);

  // Chart options
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#333',
          font: {
            size: 11
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#4a7c59',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time (samples)',
          color: '#666',
          font: {
            size: 11
          }
        },
        grid: {
          display: chartConfig.showGrid,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#666',
          font: {
            size: 10
          }
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Acceleration (m/s²)',
          color: '#666',
          font: {
            size: 11
          }
        },
        grid: {
          display: chartConfig.showGrid,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#666',
          font: {
            size: 10
          }
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    },
    animation: {
      duration: chartConfig.animated ? 750 : 0,
      easing: 'easeInOutQuart' as const
    }
  }), [chartConfig]);

  // Get latest values
  const latestData = data[data.length - 1];
  const magnitude = latestData ? 
    Math.sqrt(latestData.x ** 2 + latestData.y ** 2 + latestData.z ** 2).toFixed(2) : 
    '0.00';

  const ChartComponent = chartConfig.type === 'line' ? Line : Scatter;

  return (
    <Card 
      className="sensor-card h-100"
      style={{
        border: '2px solid #e8f5e8',
        borderRadius: '12px',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fffe 100%)',
        boxShadow: '0 4px 15px rgba(45, 90, 39, 0.1)',
        transition: 'all 0.3s ease',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(45, 90, 39, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(45, 90, 39, 0.1)';
      }}
    >
      <Card.Header 
        className="d-flex justify-content-between align-items-center"
        style={{
          background: 'linear-gradient(135deg, #4a7c59 0%, #2d5a27 100%)',
          border: 'none',
          color: 'white',
          padding: '0.75rem 1rem'
        }}
      >
        <div className="d-flex align-items-center">
          <Activity size={18} className="me-2" />
          <h6 className="mb-0 fw-bold">{floor} - {sensor}</h6>
        </div>
        <Badge 
          bg="light" 
          text="dark"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            fontSize: '0.7rem'
          }}
        >
          |a| = {magnitude} m/s²
        </Badge>
      </Card.Header>

      <Card.Body style={{ padding: '1rem' }}>
        {/* Chart Controls */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <ButtonGroup size="sm">
            <Button
              variant={chartConfig.type === 'line' ? 'success' : 'outline-success'}
              onClick={() => onConfigChange({ ...chartConfig, type: 'line' })}
              style={{ fontSize: '0.75rem' }}
            >
              <TrendingUp size={14} className="me-1" />
              Line
            </Button>
            <Button
              variant={chartConfig.type === 'scatter' ? 'success' : 'outline-success'}
              onClick={() => onConfigChange({ ...chartConfig, type: 'scatter' })}
              style={{ fontSize: '0.75rem' }}
            >
              <Grid3X3 size={14} className="me-1" />
              Dots
            </Button>
          </ButtonGroup>

          <ButtonGroup size="sm">
            <Button
              variant={chartConfig.showGrid ? 'outline-secondary' : 'secondary'}
              onClick={() => onConfigChange({ ...chartConfig, showGrid: !chartConfig.showGrid })}
              style={{ fontSize: '0.75rem' }}
            >
              Grid
            </Button>
            <Button
              variant={chartConfig.animated ? 'outline-info' : 'info'}
              onClick={() => onConfigChange({ ...chartConfig, animated: !chartConfig.animated })}
              style={{ fontSize: '0.75rem' }}
            >
              Anim
            </Button>
          </ButtonGroup>
        </div>

        {/* Chart */}
        <div style={{ height: '200px', position: 'relative' }}>
          {data.length > 0 ? (
            <ChartComponent data={chartData} options={chartOptions} />
          ) : (
            <div 
              className="d-flex align-items-center justify-content-center h-100"
              style={{ 
                color: '#666',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '2px dashed #dee2e6'
              }}
            >
              <div className="text-center">
                <Activity size={32} className="mb-2 text-muted" />
                <p className="mb-0 small">No data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Current Values */}
        {latestData && (
          <div className="mt-3">
            <div className="d-flex justify-content-between text-center">
              <div className="flex-fill">
                <div style={{ color: '#ff6b6b', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  X: {latestData.x?.toFixed(2) || '0.00'}
                </div>
              </div>
              <div className="flex-fill">
                <div style={{ color: '#4ecdc4', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  Y: {latestData.y?.toFixed(2) || '0.00'}
                </div>
              </div>
              <div className="flex-fill">
                <div style={{ color: '#45b7d1', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  Z: {latestData.z?.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default SensorCard;
