import React from 'react';

export default function Header({ repoName, setRepoSet }) {
  return (
    <header style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      padding: '14px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Repository</span>
        <span style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '4px 12px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 13,
          color: 'var(--accent-cyan)',
        }}>
          📁 {repoName}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
          <div className="pulse-dot" />
          Live
        </div>
        <button
          onClick={() => setRepoSet(false)}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '6px 14px',
            color: 'var(--text-secondary)',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 12,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.target.style.borderColor = 'var(--accent-blue)';
            e.target.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            e.target.style.borderColor = 'var(--border)';
            e.target.style.color = 'var(--text-secondary)';
          }}
        >
          Change Repo
        </button>
      </div>
    </header>
  );
}
