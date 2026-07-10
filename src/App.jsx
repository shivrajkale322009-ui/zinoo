import React, { useState, useEffect } from 'react';
import { initialProjects, initialLeads, initialVisits, initialCashbacks, calculatePlotItScore } from './data/initialState';
import BuyerApp from './components/BuyerApp';
import SellerDashboard from './components/SellerDashboard';
import AdminPanel from './components/AdminPanel';
import DatabaseInspector from './components/DatabaseInspector';
import { Shield, Sparkles, Smartphone, Layers, Layout, RefreshCw } from 'lucide-react';

function App() {
  // Global State (persisted in localStorage)
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('plotit_projects');
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem('plotit_leads');
    return saved ? JSON.parse(saved) : initialLeads;
  });

  const [visits, setVisits] = useState(() => {
    const saved = localStorage.getItem('plotit_visits');
    return saved ? JSON.parse(saved) : initialVisits;
  });

  const [cashbacks, setCashbacks] = useState(() => {
    const saved = localStorage.getItem('plotit_cashbacks');
    return saved ? JSON.parse(saved) : initialCashbacks;
  });

  // Simulator Settings
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [activeRole, setActiveRole] = useState('buyer'); // 'buyer', 'seller', 'admin'
  const [activeBackofficeTab, setActiveBackofficeTab] = useState('seller'); // 'seller', 'admin', 'inspector'

  // Resize Listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('plotit_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('plotit_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('plotit_visits', JSON.stringify(visits));
  }, [visits]);

  useEffect(() => {
    localStorage.setItem('plotit_cashbacks', JSON.stringify(cashbacks));
  }, [cashbacks]);

  // Database Reset Handler
  const resetDatabase = () => {
    if (window.confirm("Are you sure you want to reset the mock database? All modifications will be lost.")) {
      setProjects(initialProjects);
      setLeads(initialLeads);
      setVisits(initialVisits);
      setCashbacks(initialCashbacks);
      localStorage.removeItem('plotit_projects');
      localStorage.removeItem('plotit_leads');
      localStorage.removeItem('plotit_visits');
      localStorage.removeItem('plotit_cashbacks');
    }
  };

  // Helper functions for state updates
  const addLead = (newLead) => {
    setLeads(prev => [newLead, ...prev]);
  };

  const addVisit = (newVisit) => {
    setVisits(prev => [newVisit, ...prev]);
  };

  const addCashback = (newCashback) => {
    setCashbacks(prev => [newCashback, ...prev]);
  };

  const updateProject = (updatedProject) => {
    // Recalculate PlotIt score when project properties change
    const withScore = {
      ...updatedProject,
      plotItScore: calculatePlotItScore(updatedProject)
    };
    setProjects(prev => prev.map(p => p.id === withScore.id ? withScore : p));
  };

  const addProject = (newProject) => {
    const withScore = {
      ...newProject,
      plotItScore: calculatePlotItScore(newProject)
    };
    setProjects(prev => [withScore, ...prev]);
  };

  const updateCashbackStatus = (id, newStatus) => {
    setCashbacks(prev => prev.map(c => {
      if (c.id === id) {
        // If approved, sync with lead stage of buyer if matching
        if (newStatus === "Approved") {
          setLeads(leadsPrev => leadsPrev.map(l => 
            l.phone === c.buyerPhone ? { ...l, stage: "Purchased" } : l
          ));
        }
        return { ...c, status: newStatus };
      }
      return c;
    }));
  };

  // Mobile Screen Rendering
  if (isMobile) {
    return (
      <div className="mobile-only-pwa">
        {/* Floating Quick Role Toggle for Mobile PWA testers */}
        <div className="role-quick-toggle">
          <button 
            className={`role-quick-btn ${activeRole === 'buyer' ? 'active' : ''}`}
            onClick={() => setActiveRole('buyer')}
          >
            Buyer App
          </button>
          <button 
            className={`role-quick-btn ${activeRole === 'seller' ? 'active' : ''}`}
            onClick={() => setActiveRole('seller')}
          >
            Developer
          </button>
          <button 
            className={`role-quick-btn ${activeRole === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveRole('admin')}
          >
            Admin
          </button>
        </div>

        {activeRole === 'buyer' && (
          <BuyerApp 
            projects={projects} 
            leads={leads}
            visits={visits}
            cashbacks={cashbacks}
            addLead={addLead}
            addVisit={addVisit}
            addCashback={addCashback}
          />
        )}
        {activeRole === 'seller' && (
          <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg-dark)' }}>
            <SellerDashboard 
              projects={projects} 
              leads={leads} 
              visits={visits} 
              updateProject={updateProject}
              addProject={addProject}
            />
          </div>
        )}
        {activeRole === 'admin' && (
          <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg-dark)' }}>
            <AdminPanel 
              projects={projects} 
              leads={leads} 
              cashbacks={cashbacks}
              updateCashbackStatus={updateCashbackStatus}
              addProject={addProject}
            />
          </div>
        )}
      </div>
    );
  }

  // Desktop Screen Rendering (Simulator + Backoffice Panels)
  return (
    <div className="app-container">
      {/* LEFT: Phone Simulator */}
      <div className="simulator-pane">
        <div className="phone-bezel">
          <div className="phone-notch">
            <div className="phone-speaker" />
          </div>
          <div className="phone-screen">
            {/* Direct access to the Buyer Mobile View */}
            <BuyerApp 
              projects={projects} 
              leads={leads}
              visits={visits}
              cashbacks={cashbacks}
              addLead={addLead}
              addVisit={addVisit}
              addCashback={addCashback}
            />
          </div>
        </div>
      </div>

      {/* RIGHT: Backoffice Control Center */}
      <div className="dashboard-pane">
        {/* Backoffice Header */}
        <div className="dash-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'var(--brand-primary)', padding: '8px', borderRadius: '8px', display: 'flex' }}>
              <Layers size={20} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', lineHeight: '1.2' }}>PlotIt Console</h1>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Hyperlocal Backoffice Simulator v1.0</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={resetDatabase}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} />
              Reset DB
            </button>
            <div style={{ fontSize: '11px', background: 'var(--brand-glow)', border: '1px solid var(--brand-primary)', color: 'var(--brand-primary)', padding: '4px 10px', borderRadius: '12px', fontWeight: '500' }}>
              Connected to Chakan Node
            </div>
          </div>
        </div>

        {/* Console Nav Bar */}
        <div className="dash-nav">
          <button 
            className={`dash-nav-btn ${activeBackofficeTab === 'seller' ? 'active' : ''}`}
            onClick={() => setActiveBackofficeTab('seller')}
          >
            Developer / Seller Dashboard
          </button>
          <button 
            className={`dash-nav-btn ${activeBackofficeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveBackofficeTab('admin')}
          >
            PlotIt Admin Panel
          </button>
          <button 
            className={`dash-nav-btn ${activeBackofficeTab === 'inspector' ? 'active' : ''}`}
            onClick={() => setActiveBackofficeTab('inspector')}
          >
            Live Database Inspector
          </button>
        </div>

        {/* Tab Content */}
        <div className="dash-content">
          {activeBackofficeTab === 'seller' && (
            <SellerDashboard 
              projects={projects} 
              leads={leads} 
              visits={visits} 
              updateProject={updateProject}
              addProject={addProject}
            />
          )}
          {activeBackofficeTab === 'admin' && (
            <AdminPanel 
              projects={projects} 
              leads={leads} 
              cashbacks={cashbacks}
              updateCashbackStatus={updateCashbackStatus}
              addProject={addProject}
            />
          )}
          {activeBackofficeTab === 'inspector' && (
            <DatabaseInspector 
              projects={projects} 
              leads={leads} 
              visits={visits} 
              cashbacks={cashbacks}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
