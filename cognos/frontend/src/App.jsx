import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import PRReview from './pages/PRReview';
import CIPredictor from './pages/CIPredictor';
import TestGenerator from './pages/TestGenerator';
import Retrospective from './pages/Retrospective';
import CopilotChat from './pages/CopilotChat';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const PAGES = {
  dashboard: Dashboard,
  pr_review: PRReview,
  ci_predictor: CIPredictor,
  test_generator: TestGenerator,
  retrospective: Retrospective,
  copilot: CopilotChat,
};

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [repoName, setRepoName] = useState('');
  const [repoSet, setRepoSet] = useState(false);

  const PageComponent = PAGES[activePage] || Dashboard;

  if (!repoSet) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: '24px',
      }}>
        <div style={{
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          animation: 'fadeIn 0.5s ease',
        }}>
          {/* Logo */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
            }}>
              <div style={{
                width: 48,
                height: 48,
                background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                boxShadow: '0 0 32px var(--glow-blue)',
              }}>🧠</div>
              <h1 style={{
                fontSize: 36,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #63b3ed, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-1px',
              }}>CognOS</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>
              AI-Native Software Delivery Intelligence.<br/>
              Connect your GitHub repository to begin.
            </p>
          </div>

          {/* Input box */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 28,
          }}>
            <label style={{
              display: 'block',
              color: 'var(--text-secondary)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 10,
              textAlign: 'left',
            }}>GitHub Repository</label>
            <input
              type="text"
              placeholder="username/repository-name"
              value={repoName}
              onChange={e => setRepoName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && repoName.includes('/') && setRepoSet(true)}
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '14px 16px',
                color: 'var(--text-primary)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 14,
                outline: 'none',
                marginBottom: 16,
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={() => repoName.includes('/') && setRepoSet(true)}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
                border: 'none',
                borderRadius: 10,
                color: 'white',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s, transform 0.1s',
                opacity: repoName.includes('/') ? 1 : 0.5,
              }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.01)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              Launch CognOS →
            </button>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 12 }}>
              Example: <span style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>microsoft/vscode</span>
            </p>
          </div>

          {/* Features preview */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 12,
            marginTop: 20,
          }}>
            {[
              { emoji: '🔍', label: 'PR Intelligence' },
              { emoji: '⚡', label: 'CI Predictor' },
              { emoji: '🧪', label: 'Test Generator' },
              { emoji: '📊', label: 'Dev Dashboard' },
              { emoji: '🔄', label: 'AI Retro' },
              { emoji: '💬', label: 'Copilot Chat' },
            ].map(f => (
              <div key={f.label} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '10px 8px',
                fontSize: 12,
                color: 'var(--text-secondary)',
              }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{f.emoji}</div>
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Header repoName={repoName} setRepoSet={setRepoSet} />
        <main style={{ flex: 1, padding: '24px 28px' }}>
          <PageComponent repoName={repoName} />
        </main>
      </div>
    </div>
  );
}
