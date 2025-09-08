
import React, { useState, useEffect } from 'react';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import MyFridge from './src/pages/MyFridge';
import GroceryList from './src/pages/GroceryList';

function App() {
  const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId'));
  const [view, setView] = useState(sessionId ? 'myfridge' : 'login');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('sessionId', sessionId);
      setView('myfridge');
    } else {
      localStorage.removeItem('sessionId');
      setView('login');
    }
  }, [sessionId]);

  return (
    <div>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {sessionId && (
            <>
              <button onClick={() => setView('myfridge')}>My Fridge</button>
              <button onClick={() => setView('grocery')}>Grocery List</button>
            </>
          )}
        </div>
        {sessionId ? (
          <div>
            <button onClick={() => setShowAddForm(f => !f)} title="Add Item">+</button>
            <button onClick={() => { setSessionId(null); }} style={{ marginLeft: '1rem' }}>Logout</button>
          </div>
        ) : (
          <div>
            <button onClick={() => setView('login')}>Login</button>
            <button onClick={() => setView('register')}>Register</button>
          </div>
        )}
      </nav>
  {view === 'login' && <Login setSessionId={setSessionId} />}
  {view === 'register' && <Register setSessionId={setSessionId} />}
  {view === 'myfridge' && <MyFridge sessionId={sessionId} showAddForm={showAddForm} setShowAddForm={setShowAddForm} />}
  {view === 'grocery' && <GroceryList sessionId={sessionId} />}
    </div>
  );
}

export default App;
