import React, { useEffect, useMemo, useState } from 'react';
import { signOut } from 'firebase/auth';
import {
  Building,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  ShieldCheck,
  ShieldX,
  Store,
  Sun,
  User,
  Users
} from 'lucide-react';
import {
  collection,
  onSnapshot,
  query,
  limit
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import EditProfileModal from './EditProfileModal';
import { auth, db, functions } from '../firebaseConfig';
import { normalizePermissions } from '../utils/permissions';

const getName = (account) => account?.displayName || account?.name || account?.businessName || account?.userName || account?.email || 'Unknown';

const getProjectOwnerName = (project, sellers) => {
  const owner = sellers.find((item) => item.id === project.ownerId);
  return owner ? getName(owner) : (project.developer || 'Unknown seller');
};

function AdminPanel({
  projects,
  user,
  isDarkMode,
  onThemeToggle,
  onSwitchToAdmin,
  onSwitchToBuyer,
  onSwitchToSeller,
  onSelectSeller,
  initialTab = 'home'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sellerRequests, setSellerRequests] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [workingKey, setWorkingKey] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab === 'seller_selection' ? 'sellers' : initialTab);
  }, [initialTab]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'sellerRequests'),
      (snapshot) => {
        const requests = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        setSellerRequests(requests);
      },
      (error) => {
        console.error('Failed to load seller requests:', error);
        setErrorMessage('Your signed-in account is not authorized to load Admin seller requests.');
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const accounts = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

        const sellerList = accounts.filter((account) => {
          const permissions = normalizePermissions(account.permissions);
          return permissions.seller && !permissions.admin;
        });

        const buyerList = accounts.filter((account) => {
          const permissions = normalizePermissions(account.permissions);
          return permissions.buyer && !permissions.seller && !permissions.admin;
        });

        setSellers(sellerList);
        setBuyers(buyerList);
      },
      (error) => {
        console.error('Failed to load Admin accounts:', error);
        setErrorMessage('Your signed-in account is not authorized to load Admin account data.');
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!statusMessage && !errorMessage) return undefined;
    const timeout = setTimeout(() => {
      setStatusMessage('');
      setErrorMessage('');
    }, 3000);
    return () => clearTimeout(timeout);
  }, [statusMessage, errorMessage]);

  const approvedProjects = useMemo(
    () => projects.filter((project) => project.status === 'approved').length,
    [projects]
  );
  const pendingProjects = useMemo(
    () => projects.filter((project) => project.status === 'pending' || project.status === 'pending_review'),
    [projects]
  );
  const pendingSellerRequests = useMemo(
    () => sellerRequests.filter((request) => request.status === 'pending').length,
    [sellerRequests]
  );
  const sortedBuyers = useMemo(
    () => [...buyers].sort((left, right) => getName(left).localeCompare(getName(right))),
    [buyers]
  );
  const sortedSellers = useMemo(
    () => [...sellers].sort((left, right) => getName(left).localeCompare(getName(right))),
    [sellers]
  );
  const pendingRequests = useMemo(
    () => sellerRequests
      .filter((request) => request.status === 'pending')
      .sort((left, right) => getName(left).localeCompare(getName(right))),
    [sellerRequests]
  );

  const resetFeedback = () => {
    setStatusMessage('');
    setErrorMessage('');
  };

  const handleApproveSellerRequest = async (request) => {
    const actionKey = `approve-request-${request.id}`;
    setWorkingKey(actionKey);
    resetFeedback();

    try {
      await httpsCallable(functions, 'reviewSellerRequest')({
        requestId: request.id,
        decision: 'approved'
      });

      setStatusMessage(`${getName(request)} has been approved as a seller.`);
    } catch (error) {
      console.error('Failed to approve seller request:', error);
      setErrorMessage(error?.message || 'Unable to approve the seller request right now.');
    } finally {
      setWorkingKey('');
    }
  };

  const handleRejectSellerRequest = async (request) => {
    const actionKey = `reject-request-${request.id}`;
    setWorkingKey(actionKey);
    resetFeedback();

    try {
      await httpsCallable(functions, 'reviewSellerRequest')({
        requestId: request.id,
        decision: 'rejected'
      });

      setStatusMessage(`${getName(request)} has been marked as rejected.`);
    } catch (error) {
      console.error('Failed to reject seller request:', error);
      setErrorMessage(error?.message || 'Unable to reject the seller request right now.');
    } finally {
      setWorkingKey('');
    }
  };

  const handleApproveProject = async (projectId) => {
    const actionKey = `approve-project-${projectId}`;
    setWorkingKey(actionKey);
    resetFeedback();

    try {
      await httpsCallable(functions, 'reviewProject')({
        projectId,
        decision: 'approved'
      });
      setStatusMessage('Property listing approved successfully.');
    } catch (error) {
      console.error('Failed to approve property:', error);
      setErrorMessage('Unable to approve this property right now.');
    } finally {
      setWorkingKey('');
    }
  };

  const handleRejectProject = async (projectId) => {
    const actionKey = `reject-project-${projectId}`;
    setWorkingKey(actionKey);
    resetFeedback();

    try {
      await httpsCallable(functions, 'reviewProject')({
        projectId,
        decision: 'rejected'
      });
      setStatusMessage('Property listing rejected successfully.');
    } catch (error) {
      console.error('Failed to reject property:', error);
      setErrorMessage('Unable to reject this property right now.');
    } finally {
      setWorkingKey('');
    }
  };

  const openSellerWorkspace = (seller) => {
    resetFeedback();
    onSelectSeller(seller);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      setErrorMessage('Unable to log out right now.');
    }
  };

  const handleSupport = () => {
    window.open('mailto:support@druvio.com?subject=Admin Support Request', '_blank');
  };

  const sidebarGroups = [
    {
      label: 'Main',
      items: [
        { key: 'home', label: 'Dashboard', icon: LayoutDashboard, count: null },
        { key: 'buyers', label: 'Buyers', icon: Users, count: buyers.length },
        { key: 'sellers', label: 'Sellers', icon: Store, count: sellers.length },
        { key: 'requests', label: 'Seller Requests', icon: ClipboardList, count: pendingSellerRequests },
        { key: 'listings', label: 'Property Reviews', icon: Building, count: pendingProjects.length }
      ]
    },
    {
      label: 'Account',
      items: [
        { key: 'profile', label: 'Profile', icon: User, count: null },
        { key: 'settings', label: 'Settings', icon: Settings, count: null },
        { key: 'logout', label: 'Logout', icon: LogOut, count: null, tone: 'danger' }
      ]
    }
  ];

  const handleSidebarAction = (key) => {
    resetFeedback();

    if (key === 'buyer_mode') {
      onSwitchToBuyer();
      return;
    }

    if (key === 'seller_mode') {
      setActiveTab('sellers');
      onSwitchToAdmin();
      return;
    }

    if (key === 'logout') {
      handleLogout();
      return;
    }

    setActiveTab(key);
  };

  const dashboardRequestsPreview = pendingRequests.slice(0, 4);
  const dashboardListingPreview = pendingProjects.slice(0, 4);
  const profileName = user?.displayName || user?.phoneNumber || user?.email || 'Admin User';
  const profileEmail = user?.email || user?.phoneNumber || 'No contact info';

  const viewMeta = {
    home: {
      title: 'Dashboard',
      description: 'Monitor buyers, sellers, approvals, and review queues from one primary admin workspace.'
    },
    buyers: {
      title: 'Buyer Accounts',
      description: 'Review buyer accounts while keeping the existing buyer application unchanged.'
    },
    sellers: {
      title: 'Seller Accounts',
      description: 'Select a seller to open the current seller dashboard and manage that seller with existing components.'
    },
    requests: {
      title: 'Seller Requests',
      description: 'Approve or reject incoming seller applications from the primary admin interface.'
    },
    listings: {
      title: 'Property Review Queue',
      description: 'Approve pending property submissions or jump into the seller workspace for deeper edits.'
    },
    profile: {
      title: 'Profile',
      description: 'Review your admin account details and open the existing profile editor when needed.'
    },
    settings: {
      title: 'Settings',
      description: 'Adjust interface preferences for the admin workspace without leaving the dashboard.'
    }
  };

  const currentMeta = viewMeta[activeTab] || viewMeta.home;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <nav className="admin-sidebar-nav" aria-label="Admin navigation">
          {sidebarGroups.map((group) => (
            <div key={group.label} className="admin-sidebar-group">
              <div className="admin-sidebar-group-label">{group.label}</div>
              <div className="admin-sidebar-group-items">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      className={`admin-sidebar-link ${isActive ? 'active' : ''} ${item.tone === 'danger' ? 'danger' : ''}`}
                      onClick={() => handleSidebarAction(item.key)}
                    >
                      <span className="admin-sidebar-link-main">
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </span>
                      {typeof item.count === 'number' && (
                        <span className="admin-sidebar-badge">{item.count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <section className="admin-content">
        <div className="admin-content-header">
          <div>
            <h2>{currentMeta.title}</h2>
            <p>{currentMeta.description}</p>
          </div>
        </div>

        {statusMessage && <div className="app-success" role="status">{statusMessage}</div>}
        {errorMessage && <div className="app-error" role="alert">{errorMessage}</div>}

        {activeTab === 'home' && (
          <div className="admin-panel-stack">
            <div className="admin-metric-grid">
              <article className="admin-metric-card">
                <span>Active sellers</span>
                <strong>{sellers.length}</strong>
              </article>
              <article className="admin-metric-card">
                <span>Buyer accounts</span>
                <strong>{buyers.length}</strong>
              </article>
              <article className="admin-metric-card">
                <span>Approved properties</span>
                <strong>{approvedProjects}</strong>
              </article>
              <article className="admin-metric-card">
                <span>Pending requests</span>
                <strong>{pendingSellerRequests}</strong>
              </article>
              <article className="admin-metric-card">
                <span>Pending listings</span>
                <strong>{pendingProjects.length}</strong>
              </article>
            </div>

            <div className="admin-dashboard-grid">
              <section className="admin-panel-section">
                <div className="admin-panel-section-head">
                  <div>
                    <span className="admin-panel-kicker">Approval Queue</span>
                    <h3>Seller requests</h3>
                  </div>
                  <button type="button" className="btn-secondary" onClick={() => setActiveTab('requests')}>
                    Open queue
                  </button>
                </div>

                {dashboardRequestsPreview.length === 0 ? (
                  <div className="admin-empty-state">No pending seller requests right now.</div>
                ) : (
                  <div className="admin-list-preview">
                    {dashboardRequestsPreview.map((request) => (
                      <div key={request.id} className="admin-list-preview-row">
                        <div>
                          <strong>{getName(request)}</strong>
                          <span>{request.businessName || 'Business not provided'}</span>
                        </div>
                        <button type="button" className="btn-secondary seller-inline-button" onClick={() => setActiveTab('requests')}>
                          Review
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="admin-panel-section">
                <div className="admin-panel-section-head">
                  <div>
                    <span className="admin-panel-kicker">Property Queue</span>
                    <h3>Listings under review</h3>
                  </div>
                  <button type="button" className="btn-secondary" onClick={() => setActiveTab('listings')}>
                    Open reviews
                  </button>
                </div>

                {dashboardListingPreview.length === 0 ? (
                  <div className="admin-empty-state">No property listings are waiting for approval.</div>
                ) : (
                  <div className="admin-list-preview">
                    {dashboardListingPreview.map((project) => (
                      <div key={project.id} className="admin-list-preview-row">
                        <div>
                          <strong>{project.name}</strong>
                          <span>{getProjectOwnerName(project, sellers)}</span>
                        </div>
                        <button type="button" className="btn-secondary seller-inline-button" onClick={() => setActiveTab('listings')}>
                          Review
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {activeTab === 'buyers' && (
          <div className="admin-panel-section">
            <div className="table-container">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBuyers.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No buyer-only accounts found.</td>
                    </tr>
                  ) : (
                    sortedBuyers.map((buyer) => (
                      <tr key={buyer.id}>
                        <td><strong>{getName(buyer)}</strong></td>
                        <td>{buyer.email || 'N/A'}</td>
                        <td>{buyer.phoneNumber || buyer.phone || 'N/A'}</td>
                        <td><span className="badge badge-info">Buyer</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'sellers' && (
          <div className="admin-panel-section">
            <div className="table-container">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Seller Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Business Name</th>
                    <th>Properties</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSellers.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No approved sellers found.</td>
                    </tr>
                  ) : (
                    sortedSellers.map((seller) => {
                      const sellerProjects = projects.filter((project) => project.ownerId === seller.id);
                      return (
                        <tr key={seller.id}>
                          <td><strong>{seller.displayName || seller.name || seller.businessName || 'Unknown'}</strong></td>
                          <td>{seller.email || 'N/A'}</td>
                          <td>{seller.phoneNumber || seller.phone || 'N/A'}</td>
                          <td>{seller.businessName || 'N/A'}</td>
                          <td>{sellerProjects.length}</td>
                          <td>
                            <span className="badge badge-success">Active</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-secondary seller-inline-button"
                              onClick={() => openSellerWorkspace(seller)}
                            >
                              <Users size={14} /> Open Seller Side
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {pendingSellerRequests > 0 && (
              <div className="admin-inline-note">
                <ClipboardList size={16} />
                <span>{pendingSellerRequests} seller request{pendingSellerRequests === 1 ? '' : 's'} still pending in Firestore.</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="admin-panel-section">
            <div className="table-container">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Business</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No pending seller requests.</td>
                    </tr>
                  ) : (
                    pendingRequests.map((request) => (
                      <tr key={request.id}>
                        <td>
                          <strong>{getName(request)}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{request.userEmail || request.contactEmail || 'No email'}</div>
                        </td>
                        <td>{request.businessName || 'N/A'}</td>
                        <td>{request.contactPhone || request.userPhone || 'N/A'}</td>
                        <td><span className="badge badge-warning">Pending</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="btn-primary seller-inline-button"
                              disabled={workingKey === `approve-request-${request.id}`}
                              onClick={() => handleApproveSellerRequest(request)}
                            >
                              <ShieldCheck size={14} /> Approve
                            </button>
                            <button
                              type="button"
                              className="btn-secondary seller-inline-button"
                              disabled={workingKey === `reject-request-${request.id}`}
                              onClick={() => handleRejectSellerRequest(request)}
                            >
                              <ShieldX size={14} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="admin-panel-section">
            <div className="table-container">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Projected by</th>
                    <th>Village</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingProjects.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No property listings are waiting for approval.</td>
                    </tr>
                  ) : (
                    pendingProjects.map((project) => {
                      const seller = sellers.find((item) => item.id === project.ownerId);

                      return (
                        <tr key={project.id}>
                          <td>
                            <strong>{project.name}</strong>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{project.area || 'Area not provided'}</div>
                          </td>
                          <td>{getProjectOwnerName(project, sellers)}</td>
                          <td>{project.village || 'N/A'}</td>
                          <td><span className="badge badge-warning">Pending Review</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="btn-primary seller-inline-button"
                                disabled={workingKey === `approve-project-${project.id}`}
                                onClick={() => handleApproveProject(project.id)}
                              >
                                <ShieldCheck size={14} /> Approve
                              </button>
                              <button
                                type="button"
                                className="btn-secondary seller-inline-button"
                                disabled={workingKey === `reject-project-${project.id}`}
                                onClick={() => handleRejectProject(project.id)}
                              >
                                <ShieldX size={14} /> Reject
                              </button>
                              {seller && (
                                <button
                                  type="button"
                                  className="btn-secondary seller-inline-button"
                                  onClick={() => openSellerWorkspace(seller)}
                                >
                                  <Store size={14} /> Open Seller Side
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <section className="admin-panel-section admin-profile-panel">
            <div className="admin-profile-card">
              <span className="admin-panel-kicker">Admin Account</span>
              <h3>{profileName}</h3>
              <p>{profileEmail}</p>
              <div className="admin-profile-actions">
                <button type="button" className="btn-primary" onClick={() => setShowProfileModal(true)}>
                  <User size={16} /> Edit profile
                </button>
                <button type="button" className="btn-secondary" onClick={() => setActiveTab('settings')}>
                  <Settings size={16} /> Open settings
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'settings' && (
          <section className="admin-settings-panel">
            <div className="admin-settings-card">
              <div>
                <span className="admin-panel-kicker">Appearance</span>
                <h3>Workspace preferences</h3>
                <p>Use the existing theme toggle to switch the admin interface between light and dark mode.</p>
              </div>
              <button type="button" className="btn-secondary" onClick={onThemeToggle}>
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </button>
            </div>

            <div className="admin-settings-card">
              <div>
                <span className="admin-panel-kicker">Support</span>
                <h3>Need help?</h3>
                <p>Open your mail client with the existing support address for admin-side questions.</p>
              </div>
              <button type="button" className="btn-secondary" onClick={handleSupport}>
                Contact support
              </button>
            </div>
          </section>
        )}
      </section>

      {showProfileModal && user && (
        <EditProfileModal
          user={user}
          title="Edit Admin Profile"
          successMessage="Admin profile updated successfully!"
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}

export default AdminPanel;
