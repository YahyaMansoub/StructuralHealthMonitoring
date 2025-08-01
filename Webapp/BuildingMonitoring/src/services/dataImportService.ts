import { ref, set, get } from 'firebase/database';
import { database } from '../config/firebase';
import { firebaseService } from './firebaseService';

interface SensorData {
  x?: number;
  y?: number;
  z: number;
}

interface FloorData {
  [sensorId: string]: SensorData;
}

interface TimeStampData {
  E1?: FloorData;
  E2?: FloorData;
  timestamp: number;
}

interface BatchDataEntry {
  [timestamp: string]: TimeStampData[];
}

interface ImportData {
  batch_data: BatchDataEntry;
}

export class DataImportService {
  
  // Import data to existing "batch_data" building (ESP32 target)
  async importBatchData(importData: ImportData): Promise<string> {
    try {
      console.log('Importing data to root batch_data structure...');
      
      // Test connection first
      const isConnected = await firebaseService.testConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to Firebase. Please check your database rules.');
      }

      // Check if buildings/batch_data exists, if not create it
      const buildingsRef = ref(database, 'buildings/batch_data');
      const buildingSnapshot = await get(buildingsRef);
      
      if (!buildingSnapshot.exists()) {
        // Create the building metadata pointing to root batch_data
        await set(buildingsRef, {
          name: 'ESP32 Main Building',
          floors: ['E1', 'E2'],
          sensorsPerFloor: {
            'E1': ['M1', 'M2'],
            'E2': ['S1', 'S2']
          },
          createdAt: Date.now(),
          lastUpdated: Date.now(),
          // Note: batch_data is at root level, not here
          batch_data: {} // Empty - data is at root
        });
        console.log('Created batch_data building metadata');
      }

      // Import data to ROOT batch_data (where ESP32 uploads)
      const rootBatchRef = ref(database, 'batch_data');
      const rootSnapshot = await get(rootBatchRef);
      
      const existingData = rootSnapshot.exists() ? rootSnapshot.val() : {};
      const mergedData = {
        ...existingData,
        ...importData.batch_data
      };
      
      await set(rootBatchRef, mergedData);

      // Update building lastUpdated timestamp
      const buildingMetaRef = ref(database, 'buildings/batch_data/lastUpdated');
      await set(buildingMetaRef, Date.now());

      console.log('Data imported to root batch_data successfully!');
      
      return 'batch_data';
    } catch (error) {
      console.error('Data import failed:', error);
      throw error;
    }
  }

  // Import and create multiple buildings from the data
  async importAsMultipleBuildings(importData: ImportData): Promise<string[]> {
    try {
      console.log('Starting multi-building import...');
      
      const isConnected = await firebaseService.testConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to Firebase. Please check your database rules.');
      }

      const buildingIds: string[] = [];
      const batchKeys = Object.keys(importData.batch_data);
      
      // Split data into chunks for different buildings
      const chunksPerBuilding = Math.ceil(batchKeys.length / 3); // Create 3 buildings
      
      for (let i = 0; i < 3; i++) {
        const startIdx = i * chunksPerBuilding;
        const endIdx = Math.min(startIdx + chunksPerBuilding, batchKeys.length);
        const buildingBatchKeys = batchKeys.slice(startIdx, endIdx);
        
        if (buildingBatchKeys.length === 0) break;
        
        // Create building data subset
        const buildingBatchData: BatchDataEntry = {};
        buildingBatchKeys.forEach(key => {
          buildingBatchData[key] = importData.batch_data[key];
        });
        
        // Create building
        const buildingId = await firebaseService.addBuilding(
          `Building ${i + 1}`,
          ['E1', 'E2'],
          {
            'E1': ['M1', 'M2'],
            'E2': ['S1', 'S2']
          }
        );
        
        // Import data
        const buildingRef = ref(database, `buildings/${buildingId}/batch_data`);
        await set(buildingRef, buildingBatchData);
        
        buildingIds.push(buildingId);
        console.log(`Created and populated Building ${i + 1} with ID: ${buildingId}`);
      }

      console.log('Multi-building import completed successfully!');
      return buildingIds;
    } catch (error) {
      console.error('Multi-building import failed:', error);
      throw error;
    }
  }

  // Verify imported data
  async verifyImportedData(buildingId: string): Promise<boolean> {
    try {
      const buildingRef = ref(database, `buildings/${buildingId}`);
      const snapshot = await get(buildingRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const batchDataKeys = Object.keys(data.batch_data || {});
        console.log(`Building ${buildingId} has ${batchDataKeys.length} batch entries`);
        return batchDataKeys.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error('Data verification failed:', error);
      return false;
    }
  }
}

export const dataImportService = new DataImportService();
