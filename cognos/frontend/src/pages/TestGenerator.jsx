import React, { useState } from 'react';
import axios from 'axios';
import { Card, Badge, LoadingSpinner, ErrorBox } from '../components/Card';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function TestGenerator({ repoName }) {
  const [prNumber, setPrNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFile, setActiveFile] = useState(0);

  const generate = async () => {
    if (!prNumber) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post(`${API}/generate-tests`, {
        repo_name: repoName,
        pr_number: parseInt(prNumber),
      });
      setResult(res.data.tests);
      setActiveFile(0);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>🧪 Test Generator</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Auto-generate comprehensive test cases for any PR — happy paths, edge cases, error handling
        </p>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>PR Number</div>
          <input
            type="number"
            placeholder="e.g. 42"
            value={prNumber}
            onChange={e => setPrNumber(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generate()}
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
            onClick={generate}
            disabled={!prNumber || loading}
            style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
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
            Generate Tests →
          </button>
        </div>
      </Card>

      {loading && <LoadingSpinner text="Generating comprehensive test suite..." />}
      {error && <ErrorBox message={error} />}

      {result && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { label: 'Language', value: result.language, color: 'var(--accent-cyan)' },
              { label: 'Coverage Estimate', value: `${result.coverage_estimate_percent}%`, color: 'var(--accent-green)' },
              { label: 'Test Files', value: result.test_files?.length || 0, color: 'var(--accent-purple)' },
            ].map(s => (
              <Card key={s.label}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              </Card>
            ))}
          </div>

          {/* Strategy */}
          <Card>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Testing Strategy
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>{result.test_strategy}</p>
          </Card>

          {/* Test files */}
          {result.test_files && result.test_files.length > 0 && (
            <Card>
              {/* Tab selector */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {result.test_files.map((tf, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveFile(i)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: '1px solid',
                      borderColor: activeFile === i ? 'var(--accent-green)' : 'var(--border)',
                      background: activeFile === i ? 'rgba(16,185,129,0.1)' : 'transparent',
                      color: activeFile === i ? 'var(--accent-green)' : 'var(--text-secondary)',
                      fontFamily: 'JetBrains Mono',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {tf.filename}
                  </button>
                ))}
              </div>

              {/* Active file */}
              {result.test_files[activeFile] && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {result.test_files[activeFile].filename}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {result.test_files[activeFile].description} · {result.test_files[activeFile].test_count} tests
                      </div>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(result.test_files[activeFile].code)}
                      style={{
                        padding: '6px 12px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        color: 'var(--text-secondary)',
                        fontSize: 11,
                        cursor: 'pointer',
                        fontFamily: 'Space Grotesk',
                      }}
                    >
                      Copy Code
                    </button>
                  </div>
                  <pre style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '16px 20px',
                    overflow: 'auto',
                    fontSize: 12,
                    lineHeight: 1.7,
                    color: 'var(--text-primary)',
                    maxHeight: 400,
                  }}>
                    <code>{result.test_files[activeFile].code}</code>
                  </pre>
                </div>
              )}
            </Card>
          )}

          {/* Setup */}
          {result.setup_instructions && (
            <Card>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                🚀 How to Run
              </h3>
              <pre style={{
                background: 'var(--bg-primary)',
                borderRadius: 8,
                padding: '12px 16px',
                fontSize: 12,
                color: 'var(--accent-cyan)',
                fontFamily: 'JetBrains Mono',
                lineHeight: 1.6,
              }}>
                {result.setup_instructions}
              </pre>
            </Card>
          )}

          {/* Recommendations */}
          {result.additional_recommendations?.length > 0 && (
            <Card>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                💡 Additional Recommendations
              </h3>
              {result.additional_recommendations.map((r, i) => (
                <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, paddingLeft: 12, borderLeft: '2px solid var(--accent-blue)' }}>
                  {r}
                </div>
              ))}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
