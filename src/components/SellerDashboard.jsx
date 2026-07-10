import React, { useState } from 'react';
import { 
  Building, Users, PhoneCall, Calendar, Plus, Save, 
  MapPin, CheckSquare, Edit, IndianRupee, Layers, Check 
} from 'lucide-react';

function SellerDashboard({ projects, leads, visits, updateProject, addProject }) {
  const [activeTab, setActiveTab] = useState('listings'); // 'listings', 'add', 'leads', 'visits'
  const [editingProject, setEditingProject] = useState(null);

  // New Project Form State
  const [newProject, setNewProject] = useState({
    name: '',
    developer: 'Shivraj Land Developers',
    village: 'Chakan',
    area: '',
    latitude: 18.7889,
    longitude: 73.8568,
    startingPrice: 1000000,
    pricePerSqFt: 1000,
    distance: 3.5,
    remainingPlots: 20,
    totalPlots: 40,
    sizeMin: 1200,
    sizeMax: 2400,
    facing: 'East, North',
    bankLoan: true,
    naPlot: true,
    verified: true,
    amenities: 'Water Supply Connection, Electricity Line, 9m Tar Road, Street Lights',
    nearbySchools: '',
    nearbyHospitals: '',
    nearbyMIDC: '',
    nearbyHighway: '',
    description: '',
    heroImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    layoutPlanUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80'
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filter listings by Developer
  const developerName = 'Shivraj Land Developers';
  const myProjects = projects.filter(p => p.developer === developerName);

  // Leads and visits for this developer's projects
  const myProjectNames = myProjects.map(p => p.name);
  const myLeads = leads.filter(l => myProjectNames.includes(l.project) || l.project === "PlotIt Verified");
  const myVisits = visits.filter(v => myProjectNames.includes(v.project));

  // Metrics
  const totalPlotsForSale = myProjects.reduce((acc, p) => acc + p.remainingPlots, 0);
  const totalLeads = myLeads.length;
  const pendingVisits = myVisits.filter(v => v.status === "Scheduled").length;

  const handleEditClick = (project) => {
    setEditingProject({ ...project });
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    updateProject(editingProject);
    setEditingProject(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProject.name || !newProject.area) {
      alert("Please fill name and area!");
      return;
    }

    const createdProject = {
      id: `proj-${Date.now()}`,
      name: newProject.name,
      developer: newProject.developer,
      village: newProject.village,
      area: newProject.area,
      coords: [parseFloat(newProject.latitude), parseFloat(newProject.longitude)],
      startingPrice: parseInt(newProject.startingPrice),
      pricePerSqFt: parseInt(newProject.pricePerSqFt),
      distance: parseFloat(newProject.distance),
      remainingPlots: parseInt(newProject.remainingPlots),
      totalPlots: parseInt(newProject.totalPlots),
      sizeMin: parseInt(newProject.sizeMin),
      sizeMax: parseInt(newProject.sizeMax),
      facing: newProject.facing.split(',').map(f => f.trim()),
      bankLoan: newProject.bankLoan,
      naPlot: newProject.naPlot,
      verified: newProject.verified,
      amenities: newProject.amenities.split(',').map(a => a.trim()),
      nearby: {
        schools: newProject.nearbySchools || "ZP School (2.0 km)",
        hospitals: newProject.nearbyHospitals || "Rural Hospital (3.0 km)",
        midc: newProject.nearbyMIDC || "Chakan MIDC (1.5 km)",
        highway: newProject.nearbyHighway || "Pune-Nashik Highway (2.0 km)"
      },
      updated: "Just Now",
      status: "Active",
      heroImage: newProject.heroImage,
      description: newProject.description || "Freshly listed residential plotting development near Chakan.",
      layoutPlanUrl: newProject.layoutPlanUrl
    };

    addProject(createdProject);
    setSaveSuccess(true);
    
    // Reset form
    setNewProject({
      name: '',
      developer: 'Shivraj Land Developers',
      village: 'Chakan',
      area: '',
      latitude: 18.7889,
      longitude: 73.8568,
      startingPrice: 1000000,
      pricePerSqFt: 1000,
      distance: 3.5,
      remainingPlots: 20,
      totalPlots: 40,
      sizeMin: 1200,
      sizeMax: 2400,
      facing: 'East, North',
      bankLoan: true,
      naPlot: true,
      verified: true,
      amenities: 'Water Supply Connection, Electricity Line, 9m Tar Road, Street Lights',
      nearbySchools: '',
      nearbyHospitals: '',
      nearbyMIDC: '',
      nearbyHighway: '',
      description: '',
      heroImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      layoutPlanUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80'
    });

    setTimeout(() => {
      setSaveSuccess(false);
      setActiveTab('listings');
    }, 2000);
  };

  return (
    <div>
      {/* Metrics Row */}
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-title">Active Projects</div>
          <div className="metric-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={20} color="var(--brand-primary)" />
            {myProjects.length}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Shivraj Developers</span>
        </div>
        <div className="metric-card">
          <div className="metric-title">Remaining Inventory</div>
          <div className="metric-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} color="var(--accent-gold)" />
            {totalPlotsForSale}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Unsold Plots</span>
        </div>
        <div className="metric-card">
          <div className="metric-title">Total Platform Leads</div>
          <div className="metric-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="#3b82f6" />
            {totalLeads}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Meta Ads & Direct App</span>
        </div>
        <div className="metric-card">
          <div className="metric-title">Booked Site Visits</div>
          <div className="metric-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="#a855f7" />
            {pendingVisits}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Scheduled Visits</span>
        </div>
      </div>

      {/* Sub tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button 
          onClick={() => { setActiveTab('listings'); setEditingProject(null); }}
          style={{ background: 'transparent', border: 'none', color: activeTab === 'listings' ? 'var(--brand-primary)' : 'var(--text-secondary)', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          My Plotting Projects
        </button>
        <button 
          onClick={() => { setActiveTab('add'); setEditingProject(null); }}
          style={{ background: 'transparent', border: 'none', color: activeTab === 'add' ? 'var(--brand-primary)' : 'var(--text-secondary)', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Plus size={14} /> Add New Project
        </button>
        <button 
          onClick={() => { setActiveTab('leads'); setEditingProject(null); }}
          style={{ background: 'transparent', border: 'none', color: activeTab === 'leads' ? 'var(--brand-primary)' : 'var(--text-secondary)', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Leads Pipeline ({totalLeads})
        </button>
        <button 
          onClick={() => { setActiveTab('visits'); setEditingProject(null); }}
          style={{ background: 'transparent', border: 'none', color: activeTab === 'visits' ? 'var(--brand-primary)' : 'var(--text-secondary)', padding: '6px 12px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Site Visits ({myVisits.length})
        </button>
      </div>

      {/* SUCCESS POPUP FOR SAVE ACTION */}
      {saveSuccess && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--color-active)', color: 'var(--color-active)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
          <Check size={18} /> Operation Successful! State updated.
        </div>
      )}

      {/* EDITING FORM */}
      {editingProject ? (
        <form onSubmit={handleEditSave} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px' }}>Edit Project Details: <strong>{editingProject.name}</strong></h3>
            <button type="button" onClick={() => setEditingProject(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Starting Price (₹)</label>
              <input 
                type="number" 
                className="form-input" 
                value={editingProject.startingPrice}
                onChange={(e) => setEditingProject({ ...editingProject, startingPrice: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Price per Sq.Ft (₹)</label>
              <input 
                type="number" 
                className="form-input" 
                value={editingProject.pricePerSqFt}
                onChange={(e) => setEditingProject({ ...editingProject, pricePerSqFt: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Remaining Plots Inventory</label>
              <input 
                type="number" 
                className="form-input" 
                value={editingProject.remainingPlots}
                onChange={(e) => setEditingProject({ ...editingProject, remainingPlots: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Availability Status</label>
              <select 
                className="form-input" 
                value={editingProject.status}
                onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
              >
                <option value="Active">Active (Showing in feed)</option>
                <option value="Sold Out">Sold Out (Gray markers)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Save size={16} /> Save Changes
            </button>
            <button type="button" className="btn-secondary" onClick={() => setEditingProject(null)}>Cancel</button>
          </div>
        </form>
      ) : activeTab === 'listings' ? (
        // LISTINGS TAB
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {myProjects.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No projects registered under {developerName} yet. Add one!</p>
          ) : (
            myProjects.map(proj => (
              <div 
                key={proj.id} 
                style={{ 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 'bold' }}>{proj.name}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    📍 {proj.village} • {proj.distance} km from center
                  </p>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px', fontSize: '12px' }}>
                    <span>Starting: <strong style={{ color: 'var(--brand-primary)' }}>₹{(proj.startingPrice / 100000).toFixed(1)}L</strong></span>
                    <span>Unsold: <strong>{proj.remainingPlots} / {proj.totalPlots}</strong></span>
                    <span>PlotIt Score: <strong style={{ color: 'var(--accent-gold)' }}>★ {proj.plotItScore}</strong></span>
                    <span>Status: <strong style={{ color: proj.status === 'Active' ? 'var(--color-active)' : 'var(--text-muted)' }}>{proj.status}</strong></span>
                  </div>
                </div>
                <button 
                  onClick={() => handleEditClick(proj)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  <Edit size={12} /> Edit Details
                </button>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'add' ? (
        // ADD NEW PROJECT TAB
        <form onSubmit={handleAddProject} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '15px' }}>Register New Plotting Project</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Project Name *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Example: Shrinath NA Meadows"
                required
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Village Location *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Example: Kadachiwadi"
                required
                value={newProject.village}
                onChange={(e) => setNewProject({ ...newProject, village: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Micro-Area / Proximity Area *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Example: Near Mercedes Benz Junction"
                required
                value={newProject.area}
                onChange={(e) => setNewProject({ ...newProject, area: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Developer Identity</label>
              <input type="text" className="form-input" disabled value={newProject.developer} />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Latitude (Chakan: ~18.78)</label>
              <input 
                type="number" 
                step="0.0001"
                className="form-input" 
                value={newProject.latitude}
                onChange={(e) => setNewProject({ ...newProject, latitude: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Longitude (Chakan: ~73.85)</label>
              <input 
                type="number" 
                step="0.0001"
                className="form-input" 
                value={newProject.longitude}
                onChange={(e) => setNewProject({ ...newProject, longitude: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Starting Price (₹)</label>
              <input 
                type="number" 
                className="form-input" 
                value={newProject.startingPrice}
                onChange={(e) => setNewProject({ ...newProject, startingPrice: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Price per Sq.Ft (₹)</label>
              <input 
                type="number" 
                className="form-input" 
                value={newProject.pricePerSqFt}
                onChange={(e) => setNewProject({ ...newProject, pricePerSqFt: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Total Lots Layout</label>
              <input 
                type="number" 
                className="form-input" 
                value={newProject.totalPlots}
                onChange={(e) => setNewProject({ ...newProject, totalPlots: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Remaining Available Lots</label>
              <input 
                type="number" 
                className="form-input" 
                value={newProject.remainingPlots}
                onChange={(e) => setNewProject({ ...newProject, remainingPlots: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Amenities (Comma separated)</label>
              <input 
                type="text" 
                className="form-input" 
                value={newProject.amenities}
                onChange={(e) => setNewProject({ ...newProject, amenities: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Distance from Chakan Circle (km)</label>
              <input 
                type="number" 
                step="0.1"
                className="form-input" 
                value={newProject.distance}
                onChange={(e) => setNewProject({ ...newProject, distance: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <input 
                type="checkbox" 
                checked={newProject.naPlot} 
                onChange={(e) => setNewProject({ ...newProject, naPlot: e.target.checked })}
              />
              Collector NA Certified
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
              <input 
                type="checkbox" 
                checked={newProject.bankLoan} 
                onChange={(e) => setNewProject({ ...newProject, bankLoan: e.target.checked })}
              />
              Bank Loan pre-approved
            </label>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '200px', marginTop: '10px' }}>
            <Plus size={16} /> Create & Publish
          </button>
        </form>
      ) : activeTab === 'leads' ? (
        // LEADS TAB
        <div className="table-container">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Lead Name</th>
                <th>Phone</th>
                <th>Desired Budget</th>
                <th>Interested Project</th>
                <th>Funnel Stage</th>
                <th>Last Update</th>
              </tr>
            </thead>
            <tbody>
              {myLeads.map(lead => (
                <tr key={lead.id}>
                  <td><strong>{lead.name}</strong></td>
                  <td>{lead.phone}</td>
                  <td>{lead.budget}</td>
                  <td>{lead.project}</td>
                  <td>
                    <span className={`badge ${
                      lead.stage === "Purchased" ? "badge-success" : 
                      lead.stage === "Visit Done" ? "badge-info" : 
                      lead.stage === "Book Visit" ? "badge-warning" : "badge-danger"
                    }`}>
                      {lead.stage}
                    </span>
                  </td>
                  <td>{lead.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // VISITS LOG TAB
        <div className="table-container">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Visitor Name</th>
                <th>Visitor Phone</th>
                <th>Project Target</th>
                <th>Scheduled Date</th>
                <th>Scheduled Time</th>
                <th>Visit Status</th>
              </tr>
            </thead>
            <tbody>
              {myVisits.map(v => (
                <tr key={v.id}>
                  <td><strong>{v.buyerName}</strong></td>
                  <td>{v.buyerPhone}</td>
                  <td>{v.project}</td>
                  <td>{v.date}</td>
                  <td>{v.time}</td>
                  <td>
                    <span className="badge badge-warning">{v.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SellerDashboard;
