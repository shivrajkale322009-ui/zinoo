import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Lightbulb, RefreshCw, Sparkles } from 'lucide-react';
import { analyzeProject } from '../services/aiService';

const AnalysisList = ({ icon: Icon, title, items, tone }) => (
  <section className={`ai-analysis-group ${tone}`}>
    <h3><Icon size={18} /> {title}</h3>
    {items?.length ? <ul>{items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}</ul> : <p>Nothing identified.</p>}
  </section>
);

export default function AIAnalysisPanel({ projectId, hasUnsavedChanges }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      setResult(await analyzeProject(projectId));
    } catch (requestError) {
      setError(requestError?.message || 'AI analysis is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [projectId]);

  return (
    <section className="form-section enterprise-active-section ai-analysis-panel">
      <div className="ai-analysis-heading">
        <div>
          <span className="admin-panel-kicker"><Sparkles size={14} /> Firebase AI Logic</span>
          <h2 className="section-title">AI Analysis</h2>
          <p className="section-description">Structured review of the latest saved Firestore project data.</p>
        </div>
        <button type="button" className="btn-secondary" onClick={runAnalysis} disabled={loading || hasUnsavedChanges}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> {loading ? 'Analyzing…' : 'Refresh analysis'}
        </button>
      </div>

      {hasUnsavedChanges && <div className="admin-inline-note"><AlertTriangle size={16} /> Save changes before refreshing so the analysis uses the latest Firestore data.</div>}
      {error && <div className="app-error" role="alert">{error}</div>}
      {loading && !result && <div className="ai-analysis-loading">Analyzing project data…</div>}
      {result?.analysis && (
        <div className="ai-analysis-content">
          <div className="ai-analysis-summary"><h3>Executive summary</h3><p>{result.analysis.summary}</p></div>
          <div className="ai-analysis-grid">
            <AnalysisList icon={CheckCircle} title="Strengths" items={result.analysis.strengths} tone="positive" />
            <AnalysisList icon={AlertTriangle} title="Risks" items={result.analysis.risks} tone="warning" />
            <AnalysisList icon={Lightbulb} title="Recommendations" items={result.analysis.recommendations} tone="info" />
          </div>
          <p className="ai-analysis-meta">{result.cached ? 'Cached analysis' : 'Fresh analysis'} · {result.analyzedAt ? new Date(result.analyzedAt).toLocaleString() : 'just now'}</p>
        </div>
      )}
    </section>
  );
}
