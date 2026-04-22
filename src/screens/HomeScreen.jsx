import React from 'react';

export default function HomeScreen() {
  return (
    <div>
      <h2 style={{ margin: 0, fontSize: 18 }}>Home</h2>
      <p style={{ marginTop: 8, opacity: 0.9 }}>
        This is an example screen component. Swap this with your own
        <code> screen.jsx</code> components.
      </p>

      <div
        style={{
          marginTop: 16,
          padding: 12,
          borderRadius: 12,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        Tip: create more screens in <code>src/screens</code> and inject them as
        children of <code>IPhoneFrame</code>.
      </div>
    </div>
  );
}

