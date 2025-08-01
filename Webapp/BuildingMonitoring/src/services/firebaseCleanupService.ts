import { ref, set, get } from 'firebase/database';
import { database } from '../config/firebase';

export class FirebaseCleanupService {
  
  // Clean up the duplicated Firebase structure
  async cleanupFirebaseStructure(): Promise<void> {
    try {
      console.log('🧹 Starting Firebase cleanup...');
      
      // 1. Get the current root batch_data (this is where ESP32 data should be)
      const rootBatchRef = ref(database, 'batch_data');
      const rootBatchSnapshot = await get(rootBatchRef);
      const rootBatchData = rootBatchSnapshot.exists() ? rootBatchSnapshot.val() : {};
      
      console.log(`Found ${Object.keys(rootBatchData).length} batches in root batch_data`);
      
      // 2. Get the building batch_data (wrongly created)
      const buildingBatchRef = ref(database, 'buildings/batch_data');
      const buildingSnapshot = await get(buildingBatchRef);
      
      if (buildingSnapshot.exists()) {
        const buildingData = buildingSnapshot.val();
        
        // 3. Clean up the building structure - keep only metadata
        const cleanBuildingData = {
          name: buildingData.name || 'ESP32 Main Building',
          floors: ['E1', 'E2'],
          sensorsPerFloor: {
            'E1': ['M1', 'M2'],
            'E2': ['S1', 'S2']
          },
          createdAt: buildingData.createdAt || Date.now(),
          lastUpdated: Date.now(),
          batch_data: {} // Empty - data is at root level
        };
        
        await set(buildingBatchRef, cleanBuildingData);
        console.log('✅ Cleaned up buildings/batch_data structure');
      }
      
      // 4. Ensure root batch_data has all the data
      if (Object.keys(rootBatchData).length === 0) {
        console.log('⚠️ Root batch_data is empty - this might be where the problem is');
      } else {
        console.log('✅ Root batch_data has data - this is correct for ESP32');
      }
      
      console.log('🎉 Firebase cleanup completed!');
      
    } catch (error) {
      console.error('❌ Firebase cleanup failed:', error);
      throw error;
    }
  }

  // Import sample data to test the structure
  async importSampleData(): Promise<void> {
    try {
      console.log('📥 Importing sample data to root batch_data...');
      
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
          },
          {
            "E1": {
              "M1": { "x": -0.79, "y": -1.35, "z": 10.39 },
              "M2": { "x": 5.19, "y": -3.13, "z": 7.07 }
            },
            "E2": {
              "S1": { "x": -0.6, "y": -0.08, "z": 9.91 },
              "S2": { "x": -0.8, "y": -0.21, "z": 10.85 }
            },
            "timestamp": 15890
          }
        ]
      };
      
      // Import to root batch_data
      const rootBatchRef = ref(database, 'batch_data');
      const existingData = await get(rootBatchRef);
      const currentData = existingData.exists() ? existingData.val() : {};
      
      const mergedData = {
        ...currentData,
        ...sampleData
      };
      
      await set(rootBatchRef, mergedData);
      console.log('✅ Sample data imported to root batch_data');
      
    } catch (error) {
      console.error('❌ Sample data import failed:', error);
      throw error;
    }
  }
}

export const firebaseCleanupService = new FirebaseCleanupService();
