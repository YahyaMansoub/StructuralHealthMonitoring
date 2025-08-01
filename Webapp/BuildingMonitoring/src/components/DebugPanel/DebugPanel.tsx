import React from 'react';
import { Button, Badge, ListGroup } from 'react-bootstrap';
import { X, Trash2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import type { DebugLog } from '../../types';

const DebugPanel: React.FC = () => {
  const { state, actions } = useApp();

  if (!state.showDebug) return null;

  const getLogIcon = (level: DebugLog['level']) => {
    switch (level) {
      case 'error':
        return <AlertCircle size={16} className="text-danger" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-warning" />;
      default:
        return <Info size={16} className="text-info" />;
    }
  };

  const getLogVariant = (level: DebugLog['level']) => {
    switch (level) {
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      default:
        return 'light';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: '300px',
          right: 0,
          height: '300px',
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '3px solid #4a7c59',
          zIndex: 1050,
          overflow: 'hidden'
        }}
      >
        <div className="h-100 d-flex flex-column">
          {/* Header */}
          <div 
            className="d-flex justify-content-between align-items-center p-3"
            style={{ 
              background: 'linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="d-flex align-items-center">
              <h6 className="mb-0 text-white fw-bold">Debug Console</h6>
              <Badge bg="secondary" className="ms-2">
                {state.debugLogs.length} logs
              </Badge>
            </div>
            
            <div className="d-flex gap-2">
              <Button
                variant="outline-light"
                size="sm"
                onClick={actions.clearDebugLogs}
                disabled={state.debugLogs.length === 0}
                className="d-flex align-items-center"
              >
                <Trash2 size={14} className="me-1" />
                Clear
              </Button>
              
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => actions.toggleDebugPanel(false)}
                className="d-flex align-items-center"
              >
                <X size={14} />
              </Button>
            </div>
          </div>

          {/* Log Content */}
          <div className="flex-grow-1 overflow-auto p-2">
            {state.debugLogs.length === 0 ? (
              <div 
                className="d-flex align-items-center justify-content-center h-100 text-muted"
                style={{ fontSize: '0.9rem' }}
              >
                <Info size={20} className="me-2" />
                No debug logs yet. Logs will appear here as you interact with the app.
              </div>
            ) : (
              <ListGroup variant="flush">
                {state.debugLogs.slice().reverse().map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ListGroup.Item
                      className="border-0 mb-1"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '6px',
                        border: `1px solid ${
                          log.level === 'error' ? 'rgba(220, 53, 69, 0.3)' :
                          log.level === 'warning' ? 'rgba(255, 193, 7, 0.3)' :
                          'rgba(108, 117, 125, 0.3)'
                        }`
                      }}
                    >
                      <div className="d-flex align-items-start">
                        <div className="me-2 mt-1">
                          {getLogIcon(log.level)}
                        </div>
                        
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <div className="text-white" style={{ fontSize: '0.85rem' }}>
                              {log.message}
                            </div>
                            
                            <div className="d-flex align-items-center gap-2">
                              <Badge 
                                bg={getLogVariant(log.level)}
                                style={{ fontSize: '0.65rem' }}
                              >
                                {log.level}
                              </Badge>
                              
                              <small 
                                className="text-muted"
                                style={{ fontSize: '0.7rem' }}
                              >
                                {formatTimestamp(log.timestamp)}
                              </small>
                            </div>
                          </div>
                          
                          {log.data && (
                            <details className="mt-2">
                              <summary 
                                className="text-muted cursor-pointer"
                                style={{ 
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  userSelect: 'none'
                                }}
                              >
                                Show details
                              </summary>
                              <pre 
                                className="mt-2 text-muted"
                                style={{
                                  fontSize: '0.7rem',
                                  background: 'rgba(0, 0, 0, 0.3)',
                                  padding: '0.5rem',
                                  borderRadius: '4px',
                                  maxHeight: '100px',
                                  overflow: 'auto',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word'
                                }}
                              >
                                {typeof log.data === 'string' 
                                  ? log.data 
                                  : JSON.stringify(log.data, null, 2)
                                }
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  </motion.div>
                ))}
              </ListGroup>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DebugPanel;
