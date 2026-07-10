import React, { useState } from 'react';
import { Database, Eye, EyeOff, Clipboard, Check } from 'lucide-react';

function DatabaseInspector({ projects, leads, visits, cashbacks }) {
  const [copied, setCopied] = useState(false);
  const [expandedSection, setExpandedSection] = useState('all'); // 'all', 'projects', 'leads', 'visits', 'cashbacks'

  const fullState = {
    postgresql_tables: {
      projects_schema: {
        total_rows: projects.length,
        data: projects
      },
      leads_schema: {
        total_rows: leads.length,
        data: leads
      },
      visits_schema: {
        total_rows: visits.length,
        data: visits
      },
      cashbacks_schema: {
        total_rows: cashbacks.length,
        data: cashbacks
      }
    }
  };

  const getFilteredState = () => {
    if (expandedSection === 'projects') return fullState.postgresql_tables.projects_schema;
    if (expandedSection === 'leads') return fullState.postgresql_tables.leads_schema;
    if (expandedSection === 'visits') return fullState.postgresql_tables.visits_schema;
    if (expandedSection === 'cashbacks') return fullState.postgresql_tables.cashbacks_schema;
    return fullState;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(fullState, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      
      {/* Header details */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={18} color="var(--brand-primary)" />
          <h3 style={{ fontSize: '15px' }}>Reactive PostgreSQL Database Emulator</h3>
        </div>
        <button 
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          {copied ? <Check size={14} color="var(--brand-primary)" /> : <Clipboard size={14} />}
          {copied ? 'Copied State!' : 'Copy Schema JSON'}
        </button>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
        This pane exposes the live database state stored in `localStorage`. 
        Edits in the Developer Dashboard or booking site visits in the Phone Simulator write instantly to these state tables.
      </p>

      {/* Select schema view filter */}
      <div style={{ display: 'flex', gap: '6px', fontSize: '11px' }}>
        <button 
          className={`dash-nav-btn ${expandedSection === 'all' ? 'active' : ''}`}
          onClick={() => setExpandedSection('all')}
          style={{ padding: '4px 10px', fontSize: '11px' }}
        >
          Full DB Schema
        </button>
        <button 
          className={`dash-nav-btn ${expandedSection === 'projects' ? 'active' : ''}`}
          onClick={() => setExpandedSection('projects')}
          style={{ padding: '4px 10px', fontSize: '11px' }}
        >
          projects ({projects.length})
        </button>
        <button 
          className={`dash-nav-btn ${expandedSection === 'leads' ? 'active' : ''}`}
          onClick={() => setExpandedSection('leads')}
          style={{ padding: '4px 10px', fontSize: '11px' }}
        >
          leads ({leads.length})
        </button>
        <button 
          className={`dash-nav-btn ${expandedSection === 'visits' ? 'active' : ''}`}
          onClick={() => setExpandedSection('visits')}
          style={{ padding: '4px 10px', fontSize: '11px' }}
        >
          visits ({visits.length})
        </button>
        <button 
          className={`dash-nav-btn ${expandedSection === 'cashbacks' ? 'active' : ''}`}
          onClick={() => setExpandedSection('cashbacks')}
          style={{ padding: '4px 10px', fontSize: '11px' }}
        >
          cashbacks ({cashbacks.length})
        </button>
      </div>

      {/* JSON Viewer Area */}
      <div 
        style={{
          flex: 1,
          background: '#070a13',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '16px',
          overflow: 'auto',
          fontFamily: 'monospace',
          fontSize: '11.5px',
          lineHeight: '1.5',
          color: '#34d399',
          maxHeight: '400px'
        }}
      >
        <pre>{JSON.stringify(getFilteredState(), null, 2)}</pre>
      </div>
    </div>
  );
}

export default DatabaseInspector;
