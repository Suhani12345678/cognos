import React, { useState } from 'react';
import axios from 'axios';
import { Card, RiskBadge, Badge, LoadingSpinner, ErrorBox } from '../components/Card';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Section({ title, items, color = 'var(--text-secondary)', emptyMsg = 'None found ✅' }) {
  if (!items || items.length === 0) return (
    <div>
      <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{title}</h4>
      <p style={{ fontSize: 13, color: 'var(--accent-green)' }}>{emptyMsg}</p>
    </div>
  );
  return (
    <div>
      <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{title}</h4>
      {items.map((item, i) => (
        <div key={i} style={{
          display: 'flex',
          gap: 10,
          marginBottom: 8,
          padding: '10px 12px',
          background: 'var(--bg-primary)',
          borderRadius: 8,
          borderLeft: `3px solid ${color}`,
        }}>
          <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

export default function PRReview({ repoName }) {
  const [prNumber, setPrNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    if (!prNumber) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post(`${API}/review-pr`, {
        repo_name: repoName,
        pr_number: parseInt(prNumber),
      });
      setResult(res.data.review);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  const verdictColor = {
    APPROVE: 'var(--accent-green)',
    REQUEST_CHANGES: 'var(--accent-red)',
    NEEDS_DISCUSSION: 'var(--accent-yellow)',
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>🔍 PR Intelligence</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          AI-powered code review — bugs, security, performance, and quality in seconds
        </p>
      </div>

      {/* Input */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, whiteSpace: 'nowrap' }}>
            PR Number
          </div>
          <input
            type="number"
            placeholder="e.g. 42"
            value={prNumber}
            onChange={e => setPrNumber(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && analyze()}
            style={{
              flex: 1,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '10px 14px',
              color: 'var(--text-primary)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 14,
              outline: 'none',
            }}
          />
          <button
            onClick={analyze}
            disabled={!prNumber || loading}
            style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
              border: 'none',
              borderRadius: 8,
              color: 'white',
              fontFamily: 'Space Grotesk',
              fontSize: 14,
              fontWeight: 600,
              cursor: prNumber && !loading ? 'pointer' : 'not-allowed',
              opacity: prNumber && !loading ? 1 : 0.5,
              whiteSpace: 'nowrap',
            }}
          >
            Analyze PR →
          </button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>
          CognOS will post a review comment directly on the PR after analysis.
        </p>
      </Card>

      {loading && <LoadingSpinner text="CognOS is reviewing your PR..." />}
      {error && <ErrorBox message={error} />}

      {result && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Verdict banner */}
          <Card glow style={{
            background: `linear-gradient(135deg, ${verdictColor[result.verdict] || 'var(--accent-blue)'}11, var(--bg-card))`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                  AI Verdict
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: verdictColor[result.verdict] }}>
                  {result.verdict === 'APPROVE' ? '✅' : result.verdict === 'REQUEST_CHANGES' ? '🔴' : '🟡'} {result.verdict}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{result.verdict_reason}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Risk Score</div>
                <div style={{ fontSize: 40, fontWeight: 800, color: result.risk_score >= 7 ? 'var(--accent-red)' : result.risk_score >= 4 ? 'var(--accent-yellow)' : 'var(--accent-green)', lineHeight: 1 }}>
                  {result.risk_score}<span style={{ fontSize: 16, color: 'var(--text-muted)' }}>/10</span>
                </div>
                <RiskBadge level={result.risk_level} />
              </div>
            </div>
          </Card>

          {/* Summary */}
          <Card>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              Summary
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7 }}>{result.summary}</p>
          </Card>

          {/* Issues grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Section title="🐛 Bugs Found" items={result.bugs_found} color="var(--accent-red)" />
                <Section title="🔒 Security Issues" items={result.security_issues} color="var(--accent-yellow)" />
              </div>
            </Card>
            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Section title="⚡ Performance Issues" items={result.performance_issues} color="var(--accent-purple)" />
                <Section title="💡 Suggestions" items={result.suggestions} color="var(--accent-blue)" />
              </div>
            </Card>
          </div>

          {/* Good things */}
          {result.positive_aspects && result.positive_aspects.length > 0 && (
            <Card style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
              <Section title="✨ What's Good" items={result.positive_aspects} color="var(--accent-green)" />
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
