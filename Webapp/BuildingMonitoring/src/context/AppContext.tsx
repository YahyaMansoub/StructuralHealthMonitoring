import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { firebaseService } from '../services/firebaseService';
import type { AppState, BuildingData, DebugLog } from '../types';

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_BUILDINGS'; payload: BuildingData[] }
  | { type: 'ADD_BUILDING'; payload: BuildingData }
  | { type: 'UPDATE_BUILDING'; payload: BuildingData }
  | { type: 'REMOVE_BUILDING'; payload: string }
  | { type: 'SET_SELECTED_BUILDING'; payload: string | null }
  | { type: 'ADD_DEBUG_LOG'; payload: DebugLog }
  | { type: 'CLEAR_DEBUG_LOGS' }
  | { type: 'TOGGLE_DEBUG'; payload?: boolean };

// Initial state
const initialState: AppState = {
  buildings: [],
  loading: true,
  connected: false,
  selectedBuilding: null,
  debugLogs: [],
  showDebug: false,
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_CONNECTED':
      return { ...state, connected: action.payload };
    
    case 'SET_BUILDINGS':
      return { ...state, buildings: action.payload, loading: false };
    
    case 'ADD_BUILDING':
      return { 
        ...state, 
        buildings: [...state.buildings, action.payload] 
      };
    
    case 'UPDATE_BUILDING':
      return {
        ...state,
        buildings: state.buildings.map(building =>
          building.id === action.payload.id ? action.payload : building
        )
      };
    
    case 'REMOVE_BUILDING':
      return {
        ...state,
        buildings: state.buildings.filter(building => building.id !== action.payload),
        selectedBuilding: state.selectedBuilding === action.payload ? null : state.selectedBuilding
      };
    
    case 'SET_SELECTED_BUILDING':
      return { ...state, selectedBuilding: action.payload };
    
    case 'ADD_DEBUG_LOG':
      return {
        ...state,
        debugLogs: [...state.debugLogs.slice(-99), action.payload] // Keep last 100 logs
      };
    
    case 'CLEAR_DEBUG_LOGS':
      return { ...state, debugLogs: [] };
    
    case 'TOGGLE_DEBUG':
      return { 
        ...state, 
        showDebug: action.payload !== undefined ? action.payload : !state.showDebug 
      };
    
    default:
      return state;
  }
};

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    addBuilding: (name: string, floors?: string[], sensorsPerFloor?: { [floor: string]: string[] }) => Promise<void>;
    deleteBuilding: (buildingId: string) => Promise<void>;
    selectBuilding: (buildingId: string | null) => void;
    testConnection: () => Promise<void>;
    clearDebugLogs: () => void;
    toggleDebugPanel: (show?: boolean) => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Set up debug logging
  useEffect(() => {
    firebaseService.setDebugCallback((log: DebugLog) => {
      dispatch({ type: 'ADD_DEBUG_LOG', payload: log });
    });
  }, []);

  // Subscribe to all buildings on mount
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initializeApp = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Test connection with detailed logging
        console.log('🔥 Initializing Firebase connection...');
        const connected = await firebaseService.testConnection();
        dispatch({ type: 'SET_CONNECTED', payload: connected });

        if (connected) {
          console.log('✅ Firebase connected, subscribing to real-time updates...');
          // Subscribe to real-time updates
          unsubscribe = firebaseService.subscribeToAllBuildings((buildings) => {
            console.log('📡 Received buildings update:', buildings.length, 'buildings');
            dispatch({ type: 'SET_BUILDINGS', payload: buildings });
          });
        } else {
          console.log('⚠️ Firebase not connected, trying to get cached data...');
          // If not connected, try to get cached data
          try {
            const buildings = await firebaseService.getAllBuildings();
            console.log('📋 Got cached buildings:', buildings.length);
            dispatch({ type: 'SET_BUILDINGS', payload: buildings });
          } catch (error) {
            console.error('❌ Failed to get cached buildings:', error);
            dispatch({ type: 'SET_BUILDINGS', payload: [] });
          }
        }
      } catch (error) {
        console.error('❌ Failed to initialize app:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_CONNECTED', payload: false });
        dispatch({ type: 'ADD_DEBUG_LOG', payload: {
          id: Date.now().toString(),
          timestamp: Date.now(),
          level: 'error',
          message: 'Failed to initialize app',
          data: error
        }});
      }
    };

    initializeApp();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      firebaseService.cleanup();
    };
  }, []);

  // Actions
  const actions = {
    addBuilding: async (
      name: string,
      floors: string[] = ['E1', 'E2'],
      sensorsPerFloor: { [floor: string]: string[] } = {
        'E1': ['M1', 'M2'],
        'E2': ['S1', 'S2']
      }
    ) => {
      try {
        await firebaseService.addBuilding(name, floors, sensorsPerFloor);
        // Building will be added via real-time subscription
      } catch (error) {
        dispatch({ type: 'ADD_DEBUG_LOG', payload: {
          id: Date.now().toString(),
          timestamp: Date.now(),
          level: 'error',
          message: `Failed to add building: ${name}`,
          data: error
        }});
        throw error;
      }
    },

    deleteBuilding: async (buildingId: string) => {
      try {
        await firebaseService.deleteBuilding(buildingId);
        // Building will be removed via real-time subscription
      } catch (error) {
        dispatch({ type: 'ADD_DEBUG_LOG', payload: {
          id: Date.now().toString(),
          timestamp: Date.now(),
          level: 'error',
          message: `Failed to delete building: ${buildingId}`,
          data: error
        }});
        throw error;
      }
    },

    selectBuilding: (buildingId: string | null) => {
      dispatch({ type: 'SET_SELECTED_BUILDING', payload: buildingId });
    },

    testConnection: async () => {
      try {
        const connected = await firebaseService.testConnection();
        dispatch({ type: 'SET_CONNECTED', payload: connected });
      } catch (error) {
        dispatch({ type: 'SET_CONNECTED', payload: false });
        dispatch({ type: 'ADD_DEBUG_LOG', payload: {
          id: Date.now().toString(),
          timestamp: Date.now(),
          level: 'error',
          message: 'Connection test failed',
          data: error
        }});
      }
    },

    clearDebugLogs: () => {
      dispatch({ type: 'CLEAR_DEBUG_LOGS' });
    },

    toggleDebugPanel: (show?: boolean) => {
      dispatch({ type: 'TOGGLE_DEBUG', payload: show });
    }
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    actions
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
