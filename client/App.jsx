
import React, { useState, useEffect, useRef } from 'react';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import Fridge from './src/pages/Fridge';
import GroceryList from './src/pages/GroceryList';
import Meal from './src/pages/Meal';
import FridgePrompt from './src/components/FridgePrompt';
import GroceryPrompt from './src/components/GroceryPrompt';


function App() {
  const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId'));
  const [view, setView] = useState(sessionId ? 'fridge' : 'login');
  const addHandlers = useRef({});

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('sessionId', sessionId);
      setView('fridge');
    } else {
      localStorage.removeItem('sessionId');
      setView('login');
    }
  }, [sessionId]);

  const navBtn = (label, v) => (
    <button
      onClick={() => setView(v)}
      className={`nav-btn${view === v ? ' active' : ''}`}
      type="button"
    >
      {label}
    </button>
  );

  return (
    <div>
      <nav className="main-navbar">
        <div>
          {sessionId && (
            <>
              {navBtn('My Fridge', 'fridge')}
              {navBtn('Grocery List', 'grocery')}
              {navBtn('Meal Planner', 'meal')}
            </>
          )}
        </div>
        {sessionId ? (
          <div>
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
            {navBtn('Login', 'login')}
            {navBtn('Register', 'register')}
          </div>
        )}
      </nav>
      {view === 'login' && <Login setSessionId={setSessionId} />}
      {view === 'register' && <Register setSessionId={setSessionId} />}
      {view === 'fridge' && (
        <Fridge
          sessionId={sessionId}
          registerAddHandler={fn => { addHandlers.current['fridge'] = fn; }}
        />
      )}
      {view === 'grocery' && (
        <GroceryList
          sessionId={sessionId}
          registerAddHandler={fn => { addHandlers.current['grocery'] = fn; }}
        />
      )}
      {view === 'meal' && (
        <Meal
          sessionId={sessionId}
          registerAddHandler={fn => { addHandlers.current['meal'] = fn; }}
        />
      )}
    </div>
  );
}

export default App;
