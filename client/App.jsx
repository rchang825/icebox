
import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import MyFridge from './pages/MyFridge';

function App() {
  const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId'));
  const [view, setView] = useState(sessionId ? 'myfridge' : 'login');

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
      <nav>
        {sessionId && (
          <>
            <button onClick={() => setView('myfridge')}>My Fridge</button>
            <button onClick={() => { setSessionId(null); }}>Logout</button>
          </>
        )}
        {!sessionId && (
          <>
            <button onClick={() => setView('login')}>Login</button>
            <button onClick={() => setView('register')}>Register</button>
          </>
        )}
      </nav>
  {view === 'login' && <Login setSessionId={setSessionId} />}
  {view === 'register' && <Register setSessionId={setSessionId} />}
  {view === 'myfridge' && <MyFridge sessionId={sessionId} />}
    </div>
  );
}

export default App;
