import React, { useState } from 'react';
import axios from 'axios';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { Card, RiskBadge, LoadingSpinner, ErrorBox } from '../components/Card';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function CIPredictor({ repoName }) {
  const [branch, setBranch] = useState('main');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const predict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post(`${API}/predict-ci`, {
        repo_name: repoName,
        branch,
      });
      setResult(res.data.prediction);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  const probColor = (p) => {
    if (p >= 70) return '#ef4444';
    if (p >= 40) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>⚡ CI Failure Predictor</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Predict CI/CD failures before they happen — powered by pattern analysis + GPT-4o
        </p>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Branch</div>
          <input
            value={branch}
            onChange={e => setBranch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && predict()}
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
            onClick={predict}
            disabled={loading}
            style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              border: 'none',
              borderRadius: 8,
              color: 'white',
              fontFamily: 'Space Grotesk',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            Predict Now →
          </button>
        </div>
      </Card>

      {loading && <LoadingSpinner text="Analyzing CI patterns and predicting failures..." />}
      {error && <ErrorBox message={error} />}

      {result && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Big probability dial */}
          <Card glow style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
              Failure Probability — Next CI Run
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart
                cx="50%"
                cy="100%"
                innerRadius="60%"
                outerRadius="90%"
                barSize={18}
                data={[{ name: 'probability', value: result.failure_probability, fill: probColor(result.failure_probability) }]}
                startAngle={180}
                endAngle={0}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background={{ fill: 'var(--bg-primary)' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ marginTop: -60 }}>
              <div style={{
                fontSize: 56,
                fontWeight: 800,
                color: probColor(result.failure_probability),
                lineHeight: 1,
              }}>
                {result.failure_probability}%
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>
                Confidence: {result.confidence}
              </div>
              <div style={{ marginTop: 12 }}>
                <RiskBadge level={result.risk_level} />
              </div>
            </div>
          </Card>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { label: 'Historical Failure Rate', value: `${result.actual_failure_rate_percent}%`, color: 'var(--accent-red)' },
              { label: 'Runs Analyzed', value: result.runs_analyzed, color: 'var(--accent-blue)' },
              { label: 'Est. Fix Time', value: `${result.estimated_fix_time_minutes} min`, color: 'var(--accent-yellow)' },
            ].map(s => (
              <Card key={s.label}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              </Card>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Predicted failures */}
            <Card>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                Predicted Failure Types
              </h3>
              {(result.predicted_failure_types || []).map((f, i) => (
                <div key={i} style={{
                  padding: '8px 12px',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 8,
                  marginBottom: 8,
                  fontSize: 13,
                  color: '#fca5a5',
                }}>
                  ⚠️ {f}
                </div>
              ))}
            </Card>

            {/* Recommended actions */}
            <Card>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                Recommended Actions
              </h3>
              {(result.recommended_actions || []).map((a, i) => (
                <div key={i} style={{
                  padding: '8px 12px',
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: 8,
                  marginBottom: 8,
                  fontSize: 13,
                  color: '#6ee7b7',
                }}>
                  ✅ {a}
                </div>
              ))}
            </Card>
          </div>

          {/* Analysis summary */}
          <Card>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              AI Analysis Summary
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7 }}>{result.analysis_summary}</p>
          </Card>

          {/* Warning signals */}
          {result.warning_signals?.length > 0 && (
            <Card style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                ⚠️ Warning Signals Detected
              </h3>
              {result.warning_signals.map((s, i) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--accent-yellow)', marginBottom: 6 }}>
                  → {s}
                </div>
              ))}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
