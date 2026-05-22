import React from 'react';

export function Card({ children, style = {}, glow = false }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${glow ? 'var(--border-bright)' : 'var(--border)'}`,
      borderRadius: 14,
      padding: '20px 24px',
      boxShadow: glow ? '0 0 24px var(--glow-blue)' : 'none',
      ...style,
    }}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, color = 'var(--accent-blue)', emoji }) {
  return (
    <Card style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            {label}
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>}
        </div>
        {emoji && <span style={{ fontSize: 28, opacity: 0.7 }}>{emoji}</span>}
      </div>
    </Card>
  );
}

export function Badge({ label, color = 'var(--accent-blue)', bg }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      color,
      background: bg || `${color}22`,
      border: `1px solid ${color}44`,
    }}>
      {label}
    </span>
  );
}

export function RiskBadge({ level }) {
  const map = {
    LOW: { color: 'var(--accent-green)', label: '🟢 LOW' },
    MEDIUM: { color: 'var(--accent-yellow)', label: '🟡 MEDIUM' },
    HIGH: { color: 'var(--accent-red)', label: '🔴 HIGH' },
    CRITICAL: { color: '#ff0055', label: '💀 CRITICAL' },
  };
  const cfg = map[level] || map['MEDIUM'];
  return <Badge label={cfg.label} color={cfg.color} />;
}

export function LoadingSpinner({ text = 'Analyzing...' }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{
        width: 48,
        height: 48,
        border: '3px solid var(--border)',
        borderTop: '3px solid var(--accent-blue)',
        borderRadius: '50%',
        margin: '0 auto 16px',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{text}</p>
    </div>
  );
}

export function ErrorBox({ message }) {
  return (
    <div style={{
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: 12,
      padding: '16px 20px',
      color: '#fca5a5',
      fontSize: 14,
    }}>
      ⚠️ {message}
    </div>
  );
}
