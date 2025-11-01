import React from 'react';

function App() {
  return (
    <div style={{ padding: '50px', fontSize: '24px', color: 'red', backgroundColor: 'yellow' }}>
      <h1>TEST - React is Working!</h1>
      <p>If you can see this, React is rendering correctly.</p>
      <button onClick={() => alert('Button clicked!')}>Click me to test JavaScript</button>
    </div>
  );
}

export default App;