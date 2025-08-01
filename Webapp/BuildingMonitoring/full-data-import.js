// Full Data Import Script
// Copy this into your browser console after Firebase rules are updated

const importFullData = async () => {
  try {
    // Your complete data from the JSON file
    const fullData = {
      "batch_data": {
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
          // ... more data entries
        ],
        // ... more batch keys
      }
    };

    // Import using the dataImportService
    const buildingId = await window.dataImportService.importBatchData(fullData);
    console.log('✅ Full data imported! Building ID:', buildingId);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
};

// Run the import
importFullData();
