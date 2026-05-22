import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Card, LoadingSpinner } from '../components/Card';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const SUGGESTED = [
  "What were the most recent commits?",
  "Why did CI fail recently?",
  "Who is the most active contributor?",
  "Are there any open PRs with high risk?",
  "What issues are currently open?",
  "How is the team's velocity looking?",
];

export default function CopilotChat({ repoName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (question) => {
    const q = question || input.trim();
    if (!q || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: q };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await axios.post(`${API}/chat`, {
        repo_name: repoName,
        question: q,
        history: messages.slice(-6),
      });
      setMessages([...newHistory, { role: 'assistant', content: res.data.answer }]);
    } catch (e) {
      setMessages([...newHistory, {
        role: 'assistant',
        content: `Sorry, I hit an error: ${e.response?.data?.detail || e.message}`,
        error: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>💬 CognOS Copilot</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Ask anything about your repository — commits, CI, PRs, team, issues
        </p>
      </div>

      {/* Chat area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        marginBottom: 16,
        paddingRight: 4,
      }}>
        {/* Welcome */}
        {messages.length === 0 && (
          <div className="fade-in" style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🧠</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>CognOS Copilot</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
              I know your entire repository. Ask me anything.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 600, margin: '0 auto' }}>
              {SUGGESTED.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 20,
                    color: 'var(--text-secondary)',
                    fontSize: 12,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontFamily: 'Space Grotesk',
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
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className="fade-in"
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            {msg.role === 'assistant' && (
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0,
                boxShadow: '0 0 12px var(--glow-blue)',
              }}>
                🧠
              </div>
            )}
            <div style={{
              maxWidth: '72%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))'
                : msg.error ? 'rgba(239,68,68,0.1)' : 'var(--bg-card)',
              border: msg.role === 'assistant' ? `1px solid ${msg.error ? 'rgba(239,68,68,0.3)' : 'var(--border)'}` : 'none',
              fontSize: 14,
              lineHeight: 1.7,
              color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0,
              }}>
                👤
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}>🧠</div>
            <div style={{
              padding: '12px 20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '14px 14px 14px 4px',
              display: 'flex',
              gap: 6,
              alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--accent-blue)',
                  animation: 'pulse 1.2s ease infinite',
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <Card style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask anything about your repository..."
            style={{
              flex: 1,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '12px 16px',
              color: 'var(--text-primary)',
              fontFamily: 'Space Grotesk',
              fontSize: 14,
              outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
              border: 'none',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              opacity: input.trim() && !loading ? 1 : 0.4,
              fontSize: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            ↑
          </button>
        </div>
      </Card>
    </div>
  );
}
