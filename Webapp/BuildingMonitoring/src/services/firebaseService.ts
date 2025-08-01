import { 
  ref, 
  push, 
  onValue, 
  set, 
  remove,
  get,
  DataSnapshot 
} from 'firebase/database';
import { database } from '../config/firebase';
import type { BuildingData, BatchData, DebugLog } from '../types';

class FirebaseService {
  private listeners: Map<string, () => void> = new Map();
  private debugCallback?: (log: DebugLog) => void;

  // Set debug callback for logging
  setDebugCallback(callback: (log: DebugLog) => void) {
    this.debugCallback = callback;
  }

  // Log debug information
  private log(level: 'info' | 'warning' | 'error', message: string, data?: unknown) {
    if (this.debugCallback) {
      this.debugCallback({
        id: Date.now().toString(),
        timestamp: Date.now(),
        level,
        message,
        data
      });
    }
    
    // Use proper console methods
    if (level === 'warning') {
      console.warn(`[FirebaseService] ${message}`, data || '');
    } else if (level === 'error') {
      console.error(`[FirebaseService] ${message}`, data || '');
    } else {
      console.log(`[FirebaseService] ${message}`, data || '');
    }
  }

  // Get all buildings
  async getAllBuildings(): Promise<BuildingData[]> {
    try {
      this.log('info', 'Fetching all buildings from Firebase');
      const buildingsRef = ref(database, 'buildings');
      const snapshot = await get(buildingsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const buildings = Object.entries(data).map(([id, building]) => ({
          id,
          ...(building as Omit<BuildingData, 'id'>)
        }));
        this.log('info', `Successfully fetched ${buildings.length} buildings`);
        return buildings;
      }
      
      this.log('info', 'No buildings found in database');
      return [];
    } catch (error) {
      this.log('error', 'Failed to fetch buildings', error);
      throw error;
    }
  }

  // Listen to real-time updates for a specific building
  subscribeToBuilding(
    buildingId: string, 
    callback: (data: BuildingData | null) => void
  ): () => void {
    try {
      this.log('info', `Subscribing to building: ${buildingId}`);
      const buildingRef = ref(database, `buildings/${buildingId}`);
      
      const unsubscribe = onValue(buildingRef, (snapshot: DataSnapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const building: BuildingData = {
            id: buildingId,
            ...data
          };
          this.log('info', `Received update for building: ${buildingId}`);
          callback(building);
        } else {
          this.log('warning', `Building ${buildingId} not found`);
          callback(null);
        }
      }, (error) => {
        this.log('error', `Error subscribing to building ${buildingId}`, error);
      });

      this.listeners.set(buildingId, unsubscribe);
      
      return () => {
        this.log('info', `Unsubscribing from building: ${buildingId}`);
        unsubscribe();
        this.listeners.delete(buildingId);
      };
    } catch (error) {
      this.log('error', `Failed to subscribe to building ${buildingId}`, error);
      throw error;
    }
  }

  // Listen to real-time updates for all buildings + root batch_data
  subscribeToAllBuildings(
    callback: (buildings: BuildingData[]) => void
  ): () => void {
    try {
      this.log('info', 'Subscribing to all buildings and root batch_data');
      const buildingsRef = ref(database, 'buildings');
      const rootBatchRef = ref(database, 'batch_data');
      
      let buildingsData: Record<string, Omit<BuildingData, 'id'>> = {};
      let rootBatchData: Record<string, unknown> = {};
      
      const updateCallback = () => {
        const buildings = Object.entries(buildingsData).map(([id, building]) => {
          // If this is the batch_data building, merge with root batch_data
          if (id === 'batch_data') {
            return {
              id,
              ...building,
              batch_data: rootBatchData as BatchData // Use root batch_data instead
            } as BuildingData;
          }
          return {
            id,
            ...building
          } as BuildingData;
        });
        this.log('info', `Received update for ${buildings.length} buildings`);
        callback(buildings);
      };

      // Subscribe to buildings
      const buildingsUnsubscribe = onValue(buildingsRef, (snapshot: DataSnapshot) => {
        if (snapshot.exists()) {
          buildingsData = snapshot.val();
        } else {
          buildingsData = {};
          this.log('info', 'No buildings found');
        }
        updateCallback();
      }, (error) => {
        this.log('error', 'Error subscribing to buildings', error);
      });

      // Subscribe to root batch_data
      const batchUnsubscribe = onValue(rootBatchRef, (snapshot: DataSnapshot) => {
        if (snapshot.exists()) {
          rootBatchData = snapshot.val();
          this.log('info', `Received root batch_data update with ${Object.keys(rootBatchData).length} batches`);
        } else {
          rootBatchData = {};
          this.log('info', 'No root batch_data found');
        }
        updateCallback();
      }, (error) => {
        this.log('error', 'Error subscribing to root batch_data', error);
      });

      this.listeners.set('all-buildings', () => {
        buildingsUnsubscribe();
        batchUnsubscribe();
      });
      
      return () => {
        this.log('info', 'Unsubscribing from all buildings and root batch_data');
        buildingsUnsubscribe();
        batchUnsubscribe();
        this.listeners.delete('all-buildings');
      };
    } catch (error) {
      this.log('error', 'Failed to subscribe to all buildings', error);
      throw error;
    }
  }

  // Add a new building
  async addBuilding(
    name: string,
    floors: string[] = ['E1', 'E2'],
    sensorsPerFloor: { [floor: string]: string[] } = {
      'E1': ['M1', 'M2'],
      'E2': ['S1', 'S2']
    }
  ): Promise<string> {
    try {
      this.log('info', `Adding new building: ${name}`);
      const buildingsRef = ref(database, 'buildings');
      const newBuildingRef = push(buildingsRef);
      
      const buildingData: Omit<BuildingData, 'id'> = {
        name,
        floors,
        sensorsPerFloor,
        batch_data: {},
        createdAt: Date.now(),
        lastUpdated: Date.now()
      };

      await set(newBuildingRef, buildingData);
      const buildingId = newBuildingRef.key!;
      
      this.log('info', `Successfully added building: ${name} with ID: ${buildingId}`);
      return buildingId;
    } catch (error) {
      this.log('error', `Failed to add building: ${name}`, error);
      throw error;
    }
  }

  // Update building data (for batch data updates)
  async updateBuildingData(buildingId: string, batchData: BatchData): Promise<void> {
    try {
      this.log('info', `Updating data for building: ${buildingId}`);
      const buildingRef = ref(database, `buildings/${buildingId}`);
      
      await set(buildingRef, {
        batch_data: batchData,
        lastUpdated: Date.now()
      });
      
      this.log('info', `Successfully updated building: ${buildingId}`);
    } catch (error) {
      this.log('error', `Failed to update building: ${buildingId}`, error);
      throw error;
    }
  }

  // Delete a building
  async deleteBuilding(buildingId: string): Promise<void> {
    try {
      this.log('info', `Deleting building: ${buildingId}`);
      const buildingRef = ref(database, `buildings/${buildingId}`);
      await remove(buildingRef);
      this.log('info', `Successfully deleted building: ${buildingId}`);
    } catch (error) {
      this.log('error', `Failed to delete building: ${buildingId}`, error);
      throw error;
    }
  }

  // Test connection to Firebase
  async testConnection(): Promise<boolean> {
    try {
      this.log('info', 'Testing Firebase connection');
      
      // First try to read the .info/connected path
      try {
        const connectedRef = ref(database, '.info/connected');
        const snapshot = await get(connectedRef);
        const connected = snapshot.val() === true;
        
        if (connected) {
          this.log('info', 'Firebase connection test: Connected via .info/connected');
          return true;
        }
      } catch (error) {
        this.log('warning', 'Failed to check .info/connected, trying alternative method', error);
      }
      
      // Alternative: Try to read from a simple path
      try {
        const testRef = ref(database, '/');
        await get(testRef);
        // If we can read without error, we're connected
        this.log('info', 'Firebase connection test: Connected via root read');
        return true;
      } catch (error) {
        this.log('error', 'Firebase connection test failed - cannot read from database', error);
        return false;
      }
      
    } catch (error) {
      this.log('error', 'Firebase connection test failed', error);
      return false;
    }
  }

  // Clean up all listeners
  cleanup(): void {
    this.log('info', 'Cleaning up Firebase listeners');
    this.listeners.forEach((unsubscribe, key) => {
      this.log('info', `Cleaning up listener: ${key}`);
      unsubscribe();
    });
    this.listeners.clear();
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
export default firebaseService;
