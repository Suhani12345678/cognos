import React from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', emoji: '📊', label: 'Dashboard', desc: 'Overview' },
  { id: 'pr_review', emoji: '🔍', label: 'PR Intelligence', desc: 'AI Code Review' },
  { id: 'ci_predictor', emoji: '⚡', label: 'CI Predictor', desc: 'Failure Forecast' },
  { id: 'test_generator', emoji: '🧪', label: 'Test Generator', desc: 'Auto Tests' },
  { id: 'retrospective', emoji: '🔄', label: 'Retrospective', desc: 'Sprint AI Report' },
  { id: 'copilot', emoji: '💬', label: 'CognOS Copilot', desc: 'Ask Anything' },
];

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <aside style={{
      width: 220,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 12px',
      position: 'sticky',
      top: 0,
      height: '100vh',
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 8px 20px',
        borderBottom: '1px solid var(--border)',
        marginBottom: 16,
      }}>
        <div style={{
          width: 36,
          height: 36,
          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
          borderRadius: 9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          boxShadow: '0 0 20px var(--glow-blue)',
        }}>🧠</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>CognOS</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>v1.0.0</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                border: 'none',
                background: active ? 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,182,212,0.1))' : 'transparent',
                borderLeft: active ? '2px solid var(--accent-blue)' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: 4,
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: 18 }}>{item.emoji}</span>
              <div>
                <div style={{
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 8px 0',
        borderTop: '1px solid var(--border)',
        fontSize: 10,
        color: 'var(--text-muted)',
        lineHeight: 1.5,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <div className="pulse-dot" />
          <span>All systems operational</span>
        </div>
        <div>Microsoft Build AI 2025</div>
        <div style={{ color: 'var(--accent-cyan)', marginTop: 2 }}>Powered by GPT-4o + GitHub</div>
      </div>
    </aside>
  );
}
