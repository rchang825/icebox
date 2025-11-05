import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import Fridge from './src/pages/Fridge';
import GroceryList from './src/pages/GroceryList';
import MealList from './src/pages/MealList';
import FridgePrompt from './src/components/FridgePrompt';
import GroceryPrompt from './src/components/GroceryPrompt';
import MealPrompt from './src/components/MealPrompt';
import UploadReceipt from './src/pages/UploadReceipt';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [isValidating, setIsValidating] = useState(true);
  const addHandlers = useRef({});
  const location = useLocation();
  const navigate = useNavigate();

  // Validate session on app startup
  useEffect(() => {
    const storedSessionId = localStorage.getItem('sessionId');
    if (storedSessionId) {
      // Validate the session with the server
      fetch('/api/me', {
        headers: { 'x-session-id': storedSessionId }
      })
      .then(res => {
        if (res.ok) {
          setSessionId(storedSessionId);
        } else {
          // Session is invalid, clear it
          localStorage.removeItem('sessionId');
          setSessionId(null);
        }
      })
      .catch(() => {
        // Network error or server down, clear invalid session
        localStorage.removeItem('sessionId');
        setSessionId(null);
      })
      .finally(() => {
        setIsValidating(false);
      });
    } else {
      setIsValidating(false);
    }
  }, []);

  useEffect(() => {
    if (isValidating) return; // Don't navigate while validating

    if (sessionId) {
      localStorage.setItem('sessionId', sessionId);
      if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/') {
        navigate('/fridge', { replace: true });
      }
    } else {
      localStorage.removeItem('sessionId');
      if (location.pathname !== '/login' && location.pathname !== '/register') {
        navigate('/login', { replace: true });
      }
    }
  }, [sessionId, isValidating]);

  const getView = () => {
    if (location.pathname === '/fridge') return 'fridge';
    if (location.pathname === '/grocerylist') return 'grocery';
    if (location.pathname === '/meals') return 'meal';
    if (location.pathname === '/upload') return 'upload';
    return '';
  };
  const view = getView();

  // Show loading while validating session
  if (isValidating) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      <nav className="main-navbar">
        <div>
          {sessionId && (
            <>
              <Link to="/fridge" className={`nav-btn${view === 'fridge' ? ' active' : ''}`}>My Fridge</Link>
              <Link to="/grocerylist" className={`nav-btn${view === 'grocery' ? ' active' : ''}`}>Grocery List</Link>
              {/* <Link to="/meals" className={`nav-btn${view === 'meal' ? ' active' : ''}`}>Meal Planner</Link> */}
            </>
          )}
        </div>
        {sessionId ? (
          <div>
            {view === 'fridge' && <Link to="/upload">Upload Receipt</Link>}
            <button
              className="add-btn"
              onClick={() => {
                if (addHandlers.current[view]) addHandlers.current[view]();
              }}
              title={view === 'fridge' ? 'Add to Fridge' : view === 'grocery' ? 'Add to Grocery List' : view === 'meal' ? 'Add to Meal Planner' : 'Add'}
              type="button"
            >
              +
            </button>
            <button onClick={() => { setSessionId(null); }} className='nav-btn'>Logout</button>
          </div>
        ) : (
          <div>
            <Link to="/login" className={`nav-btn${view === '' && location.pathname === '/login' ? ' active' : ''}`}>Login</Link>
            <Link to="/register" className={`nav-btn${view === '' && location.pathname === '/register' ? ' active' : ''}`}>Register</Link>
          </div>
        )}
      </nav>
      <Routes>
        <Route path="/login" element={<Login setSessionId={setSessionId} />} />
        <Route path="/register" element={<Register setSessionId={setSessionId} />} />
        <Route path="/fridge" element={<Fridge sessionId={sessionId} registerAddHandler={fn => { addHandlers.current['fridge'] = fn; }} />} />
        <Route path="/upload" element={<UploadReceipt sessionId={sessionId} />} />
        <Route path="/grocerylist" element={<GroceryList sessionId={sessionId} registerAddHandler={fn => { addHandlers.current['grocery'] = fn; }} />} />
        {/* <Route path="/meals" element={<MealList sessionId={sessionId} registerAddHandler={fn => { addHandlers.current['meal'] = fn; }} />} /> */}
        <Route path="*" element={<Navigate to={sessionId ? '/fridge' : '/login'} />} />
      </Routes>
    </div>
  );
}

export default App;
