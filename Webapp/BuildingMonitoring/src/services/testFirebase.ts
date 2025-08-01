// Simple test to verify Firebase connection and upload your JSON data
import { ref, set, get } from 'firebase/database';
import { database } from '../config/firebase';

export const uploadTestData = async () => {
  try {
    console.log('Testing Firebase write access...');
    
    // Test data based on your JSON structure
    const testData = {
      "16226": [
        {
          "E1": {
            "M1": {
              "x": -0.8,
              "y": -1.3,
              "z": 10.47
            },
            "M2": {
              "x": 5.25,
              "y": -3.05,
              "z": 7.31
            }
          },
          "E2": {
            "S1": {
              "x": -0.54,
              "y": -0.12,
              "z": 9.78
            },
            "S2": {
              "x": -0.81,
              "y": -0.17,
              "z": 10.86
            }
          },
          "timestamp": 15804
        }
      ]
    };

    // Try to write test data
    const testRef = ref(database, 'test');
    await set(testRef, { status: 'connected', timestamp: Date.now() });
    console.log('✅ Write test successful');

    // Try to read it back
    const snapshot = await get(testRef);
    if (snapshot.exists()) {
      console.log('✅ Read test successful:', snapshot.val());
    } else {
      console.log('⚠️ Read test: No data found');
    }

    // Try to write batch data
    const batchRef = ref(database, 'batch_data');
    await set(batchRef, testData);
    console.log('✅ Batch data upload successful');

    return true;
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    
    // Check specific error types
    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        console.error('📝 Permission denied - Firebase Realtime Database rules need to be updated');
        console.log('Please update your Firebase Realtime Database rules to:');
        console.log(`{
  "rules": {
    ".read": true,
    ".write": true
  }
}`);
      } else if (error.message.includes('network')) {
        console.error('🌐 Network error - Check your internet connection');
      }
    }
    
    return false;
  }
};

// Function to upload your complete JSON data
export const uploadCompleteData = async (jsonData: any) => {
  try {
    console.log('Uploading complete batch data...');
    const batchRef = ref(database, 'batch_data');
    await set(batchRef, jsonData.batch_data);
    console.log('✅ Complete data upload successful');
    return true;
  } catch (error) {
    console.error('❌ Complete data upload failed:', error);
    return false;
  }
};
