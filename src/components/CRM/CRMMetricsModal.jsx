import React, { useState, useMemo } from 'react';
import { X, TrendingUp, BarChart2, PieChart, Users, CheckCircle, Percent, Compass } from 'lucide-react';
import { calculateConversionMetrics, getEpochMs } from '../../utils/crmLeadModel';

export default function CRMMetricsModal({ isOpen, onClose, leads = [] }) {
  const [dateFilter, setDateFilter] = useState('all'); // 'all', '7d', '30d', '90d'

  const filteredLeads = useMemo(() => {
    if (dateFilter === 'all') return leads;
    const now = Date.now();
    const days = dateFilter === '7d' ? 7 : dateFilter === '30d' ? 30 : 90;
    const threshold = now - days * 24 * 60 * 60 * 1000;
    return leads.filter((lead) => {
      const time = getEpochMs(lead.createdAt || lead.date);
      return !time || time >= threshold;
    });
  }, [leads, dateFilter]);

  const metrics = useMemo(() => {
    return calculateConversionMetrics(filteredLeads);
  }, [filteredLeads]);

  if (!isOpen) return null;

  return (
    <div className="crm-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="crm-modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
        <div className="crm-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TrendingUp size={20} color="#2563eb" />
            <div>
              <h3 style={{ margin: 0, fontSize: 16 }}>Sales Pipeline & Conversion Analytics</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                Real-time conversion metrics calculated from {filteredLeads.length} leads
              </p>
            </div>
          </div>
          <button type="button" className="crm-icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="crm-modal-body">
          {/* Time range selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Date Range Filter:</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { key: 'all', label: 'All Time' },
                { key: '7d', label: 'Last 7 Days' },
                { key: '30d', label: 'Last 30 Days' },
                { key: '90d', label: 'Last 90 Days' }
              ].map((pill) => (
                <button
                  type="button"
                  key={pill.key}
                  className={`crm-chip ${dateFilter === pill.key ? 'active' : ''}`}
                  onClick={() => setDateFilter(pill.key)}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversion Funnel Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#15803d' }}>
                {metrics.leadToVisitConversion}%
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#166534', marginTop: 4 }}>
                Lead → Site Visit
              </div>
              <div style={{ fontSize: 11, color: '#4b7a58', marginTop: 2 }}>
                {metrics.visitedCount} of {metrics.totalLeads} leads
              </div>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1d4ed8' }}>
                {metrics.visitToDealConversion}%
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1e40af', marginTop: 4 }}>
                Site Visit → Won Deal
              </div>
              <div style={{ fontSize: 11, color: '#5b7ca8', marginTop: 2 }}>
                {metrics.closedWonCount} of {metrics.visitedCount} visits
              </div>
            </div>

            <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 10, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#7e22ce' }}>
                {metrics.leadToDealConversion}%
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6b21a8', marginTop: 4 }}>
                Overall Lead → Deal
              </div>
              <div style={{ fontSize: 11, color: '#8858a8', marginTop: 2 }}>
                {metrics.closedWonCount} deals closed
              </div>
            </div>
          </div>

          {/* Pipeline stages distribution */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 13, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
              <BarChart2 size={16} color="#2563eb" />
              Pipeline Distribution by Stage
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(metrics.byStage).map(([stage, count]) => {
                const pct = metrics.totalLeads > 0 ? Math.round((count / metrics.totalLeads) * 100) : 0;
                return (
                  <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                    <span style={{ width: 140, fontWeight: 500, color: '#334155', flexShrink: 0 }}>
                      {stage}
                    </span>
                    <div style={{ flex: 1, background: '#f1f5f9', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: stage === 'Closed Won' ? '#15803d' : stage === 'Closed Lost' ? '#e11d48' : '#2563eb',
                          borderRadius: 4
                        }}
                      />
                    </div>
                    <span style={{ width: 60, textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Breakdown by Source & Agent */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: 12, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Leads by Source
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(metrics.bySource).map(([src, count]) => (
                  <div key={src} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#475569' }}>{src}</span>
                    <strong style={{ color: '#0f172a' }}>{count}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: 12, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Leads by Agent
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(metrics.byAgent).map(([agent, count]) => (
                  <div key={agent} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#475569' }}>{agent}</span>
                    <strong style={{ color: '#0f172a' }}>{count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="crm-modal-footer">
          <button type="button" className="crm-btn crm-btn-primary" onClick={onClose}>
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
