// Sensor data types
export interface SensorReading {
  x: number;
  y: number;
  z: number;
  timestamp?: number; // Optional timestamp for ESP32 batch data
}

export interface FloorSensors {
  [sensorKey: string]: SensorReading;
}

export interface BuildingFloors {
  [floorKey: string]: FloorSensors;
}

export interface DataPoint {
  timestamp: number;
  [floorKey: string]: BuildingFloors | number;
}

export interface BatchData {
  [batchId: string]: DataPoint[];
}

export interface BuildingData {
  id: string;
  name: string;
  batch_data: BatchData;
  createdAt: number;
  lastUpdated: number;
  floors: string[];
  sensorsPerFloor: { [floor: string]: string[] };
}

// UI State types
export interface ChartConfig {
  type: 'line' | 'scatter';
  showGrid: boolean;
  animated: boolean;
}

export interface SensorCardProps {
  floor: string;
  sensor: string;
  data: SensorReading[];
  chartConfig: ChartConfig;
  onConfigChange: (config: ChartConfig) => void;
}

export interface BuildingCardProps {
  building: BuildingData;
  onViewDetails: (buildingId: string) => void;
  onDelete?: (buildingId: string) => void;
}

// Firebase types
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Debug types
export interface DebugLog {
  id: string;
  timestamp: number;
  level: 'info' | 'warning' | 'error';
  message: string;
  data?: unknown;
}

// Application state
export interface AppState {
  buildings: BuildingData[];
  loading: boolean;
  connected: boolean;
  selectedBuilding: string | null;
  debugLogs: DebugLog[];
  showDebug: boolean;
}
