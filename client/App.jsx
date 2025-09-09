
import React, { useState, useEffect } from 'react';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import MyFridge from './src/pages/MyFridge';
import GroceryList from './src/pages/GroceryList';
import FridgePrompt from './src/components/FridgePrompt';
import GroceryPrompt from './src/components/GroceryPrompt';


function App() {
  const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId'));
  const [view, setView] = useState(sessionId ? 'myfridge' : 'login');
  // Remove global showAddForm and promptItem
  // Instead, keep a ref to the add handlers for each page
  const addHandlers = React.useRef({});

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('sessionId', sessionId);
      setView('myfridge');
    } else {
      localStorage.removeItem('sessionId');
      setView('login');
    }
  }, [sessionId]);

  // Nav button with className for active state
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
              {navBtn('My Fridge', 'myfridge')}
              {navBtn('Grocery List', 'grocery')}
            </>
          )}
        </div>
        {sessionId ? (
          <div>
            <button
              className="add-btn"
              onClick={() => {
                // Call the add handler for the current view
                if (addHandlers.current[view]) addHandlers.current[view]();
              }}
              title={view === 'myfridge' ? 'Add to Fridge' : view === 'grocery' ? 'Add to Grocery List' : 'Add'}
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
      {view === 'myfridge' && (
        <MyFridge
          sessionId={sessionId}
          // Provide a registration function for the add handler
          registerAddHandler={fn => { addHandlers.current['myfridge'] = fn; }}
        />
      )}
      {view === 'grocery' && (
        <GroceryList
          sessionId={sessionId}
          registerAddHandler={fn => { addHandlers.current['grocery'] = fn; }}
        />
      )}
    </div>
  );
}

export default App;
