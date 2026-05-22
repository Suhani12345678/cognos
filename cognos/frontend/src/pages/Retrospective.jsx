import React, { useState } from 'react';
import axios from 'axios';
import { Card, LoadingSpinner, ErrorBox } from '../components/Card';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const HEALTH_CONFIG = {
  STRUGGLING: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', emoji: '🔴' },
  NEEDS_IMPROVEMENT: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', emoji: '🟡' },
  GOOD: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', emoji: '🟢' },
  EXCELLENT: { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', emoji: '✨' },
};

export default function Retrospective({ repoName }) {
  const [days, setDays] = useState(7);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post(`${API}/retrospective`, {
        repo_name: repoName,
        days,
      });
      setResult(res.data.retrospective);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  const healthCfg = result ? (HEALTH_CONFIG[result.health_label] || HEALTH_CONFIG['GOOD']) : null;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>🔄 AI Retrospective</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          AI-generated sprint retrospective — velocity, blockers, team health, and action items
        </p>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Period</div>
          {[7, 14, 30].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: '1px solid',
                borderColor: days === d ? 'var(--accent-purple)' : 'var(--border)',
                background: days === d ? 'rgba(139,92,246,0.15)' : 'transparent',
                color: days === d ? 'var(--accent-purple)' : 'var(--text-secondary)',
                fontFamily: 'Space Grotesk',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Last {d} days
            </button>
          ))}
          <button
            onClick={generate}
            disabled={loading}
            style={{
              marginLeft: 'auto',
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              border: 'none',
              borderRadius: 8,
              color: 'white',
              fontFamily: 'Space Grotesk',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            Generate Retro →
          </button>
        </div>
      </Card>

      {loading && <LoadingSpinner text="Generating AI sprint retrospective..." />}
      {error && <ErrorBox message={error} />}

      {result && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Health banner */}
          <Card glow style={{ background: healthCfg.bg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Sprint Health</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: healthCfg.color }}>
                  {healthCfg.emoji} {result.health_label}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, maxWidth: 600, lineHeight: 1.6 }}>
                  {result.executive_summary}
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 56, fontWeight: 800, color: healthCfg.color, lineHeight: 1 }}>
                  {result.sprint_health_score}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Health Score / 100</div>
              </div>
            </div>
          </Card>

          {/* Velocity stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {[
              { label: 'Commits/Day', value: result.velocity?.commits_per_day || 0, color: 'var(--accent-cyan)' },
              { label: 'PRs Merged', value: result.data_summary?.prs_merged || 0, color: 'var(--accent-green)' },
              { label: 'Issues Closed', value: result.data_summary?.issues_closed || 0, color: 'var(--accent-blue)' },
              { label: 'PRs Open', value: result.data_summary?.prs_open || 0, color: 'var(--accent-yellow)' },
              { label: 'Contributors', value: result.data_summary?.contributors || 0, color: 'var(--accent-purple)' },
            ].map(s => (
              <Card key={s.label} style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{s.label}</div>
              </Card>
            ))}
          </div>

          {/* Retro columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Card style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                ✅ What Went Well
              </h3>
              {(result.what_went_well || []).map((item, i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'rgba(16,185,129,0.06)', borderRadius: 8, marginBottom: 8, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {item}
                </div>
              ))}
            </Card>
            <Card style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-yellow)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                🔧 Needs Improvement
              </h3>
              {(result.what_needs_improvement || []).map((item, i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'rgba(245,158,11,0.06)', borderRadius: 8, marginBottom: 8, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {item}
                </div>
              ))}
            </Card>
          </div>

          {/* Action items */}
          {result.action_items_for_next_sprint?.length > 0 && (
            <Card>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                📋 Action Items for Next Sprint
              </h3>
              {result.action_items_for_next_sprint.map((a, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 16px',
                  background: 'var(--bg-primary)',
                  borderRadius: 8,
                  marginBottom: 8,
                }}>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{a.item}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Owner: {a.owner}</div>
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: 20,
                    background: a.priority === 'HIGH' ? 'rgba(239,68,68,0.15)' : a.priority === 'MEDIUM' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                    color: a.priority === 'HIGH' ? '#fca5a5' : a.priority === 'MEDIUM' ? '#fde68a' : '#6ee7b7',
                  }}>
                    {a.priority}
                  </span>
                </div>
              ))}
            </Card>
          )}

          {/* AI Recommendations */}
          {result.ai_recommendations?.length > 0 && (
            <Card glow>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                🤖 CognOS Strategic Recommendations
              </h3>
              {result.ai_recommendations.map((r, i) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  background: 'var(--bg-primary)',
                  borderLeft: '3px solid var(--accent-cyan)',
                  borderRadius: '0 8px 8px 0',
                  marginBottom: 8,
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                }}>
                  {r}
                </div>
              ))}
            </Card>
          )}

          {/* Team morale */}
          {result.team_morale_signals && (
            <Card>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                💪 Team Morale Signals
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.team_morale_signals}</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
