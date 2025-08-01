import { AppProvider } from './context/AppContext';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import DebugPanel from './components/DebugPanel/DebugPanel';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <AppProvider>
      <div className="App">
        <Header />
        <div className="d-flex">
          <Sidebar />
          <Dashboard />
        </div>
        <DebugPanel />
      </div>
    </AppProvider>
  );
}

export default App;
