import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { Card, StatCard, LoadingSpinner, ErrorBox } from '../components/Card';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function Dashboard({ repoName }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`${API}/repo-stats?repo_name=${encodeURIComponent(repoName)}`)
      .then(r => setStats(r.data.stats))
      .catch(e => setError(e.response?.data?.detail || e.message))
      .finally(() => setLoading(false));
  }, [repoName]);

  if (loading) return <LoadingSpinner text="Loading repository intelligence..." />;
  if (error) return <ErrorBox message={error} />;
  if (!stats) return null;

  const { repo_info, commit_stats, pr_stats, ci_stats, contributors, language_breakdown } = stats;

  const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6'];

  const langData = Object.entries(language_breakdown || {}).map(([name, pct]) => ({
    name, value: pct
  }));

  const overallCiSuccess = ci_stats.workflows.length > 0
    ? Math.round(ci_stats.workflows.reduce((s, w) => s + w.success_rate, 0) / ci_stats.workflows.length)
    : 100;

  return (
    <div className="fade-in">
      {/* Page title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
          Repository Overview
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {repo_info.description || 'No description'} · {repo_info.language}
        </p>
      </div>

      {/* Stat cards row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatCard
          label="Commits (30d)"
          value={commit_stats.last_30_days}
          sub={`${commit_stats.commits_per_day_avg}/day avg`}
          color="var(--accent-cyan)"
          emoji="📝"
        />
        <StatCard
          label="PRs Merged (30d)"
          value={pr_stats.merged_last_30_days}
          sub={`${pr_stats.open_prs} open now`}
          color="var(--accent-green)"
          emoji="🔀"
        />
        <StatCard
          label="Avg Merge Time"
          value={`${pr_stats.avg_merge_time_hours}h`}
          sub="Time PR open → merged"
          color="var(--accent-yellow)"
          emoji="⏱️"
        />
        <StatCard
          label="CI Success Rate"
          value={`${overallCiSuccess}%`}
          sub={`${ci_stats.workflows.length} workflows`}
          color={overallCiSuccess >= 80 ? 'var(--accent-green)' : 'var(--accent-red)'}
          emoji="⚙️"
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Commit activity */}
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>
            Commit Activity — Last 30 Days
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={commit_stats.heatmap}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                labelStyle={{ color: 'var(--text-secondary)' }}
              />
              <Bar dataKey="count" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} name="Commits" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Language breakdown */}
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>
            Language Breakdown
          </h3>
          {langData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={langData} cx="50%" cy="50%" outerRadius={70} dataKey="value">
                    {langData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {langData.map((l, i) => (
                  <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{l.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{l.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No language data available</p>
          )}
        </Card>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Top contributors */}
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>
            Top Contributors (30d)
          </h3>
          {contributors.map((c, i) => (
            <div key={c.name} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 0',
              borderBottom: i < contributors.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444'][i % 5]}, transparent)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: 'white',
              }}>
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.commits} commits</div>
              </div>
              <div style={{
                fontSize: 11,
                color: 'var(--accent-cyan)',
                fontFamily: 'monospace',
                background: 'rgba(6,182,212,0.1)',
                padding: '2px 8px',
                borderRadius: 6,
              }}>
                #{i + 1}
              </div>
            </div>
          ))}
        </Card>

        {/* CI Workflows */}
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>
            CI/CD Workflows
          </h3>
          {ci_stats.workflows.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No workflow runs found</p>
          ) : (
            ci_stats.workflows.map((wf, i) => (
              <div key={i} style={{
                padding: '10px 0',
                borderBottom: i < ci_stats.workflows.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{wf.name}</span>
                  <span style={{
                    fontSize: 11,
                    color: wf.success_rate >= 80 ? 'var(--accent-green)' : 'var(--accent-red)',
                    fontFamily: 'monospace',
                  }}>
                    {wf.success_rate}%
                  </span>
                </div>
                <div style={{ height: 4, background: 'var(--bg-primary)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${wf.success_rate}%`,
                    background: wf.success_rate >= 80 ? 'var(--accent-green)' : 'var(--accent-red)',
                    borderRadius: 2,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                  {wf.failures} failures / {wf.total_runs} runs · Last: {wf.last_status}
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
