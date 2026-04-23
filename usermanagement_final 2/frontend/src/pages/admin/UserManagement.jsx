import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Ban, Unlock, ShieldAlert, Trash2, MoreVertical, Search, Edit, X, BrainCircuit, AlertTriangle, ShieldX } from 'lucide-react';
import { validateUniversityEmail, validateRequired, validateStudentId } from '../../utils/validators';
import { analyzeUserFraudRisk } from '../../utils/fraudAlgorithm';
import { getAllUsers, updateUser, updateUserStatus, deleteUserById } from '../../services/authService';
import styles from './AdminPages.module.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Categorization & ML Scopes
  const [activeTab, setActiveTab] = useState('all');
  const [showAiModal, setShowAiModal] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [algoResults, setAlgoResults] = useState(null);

  // Real Editing logic
  const [editingUser, setEditingUser] = useState(null);
  const [editErrors, setEditErrors] = useState({});

  // Fetch users from MongoDB on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      // Map MongoDB documents to component-friendly format
      const mapped = data.users.map(u => ({
        id: u._id,
        name: u.fullName,
        email: u.email,
        studentId: u.studentId,
        faculty: u.faculty,
        status: u.status,
        idPhotoUrl: u.idPhotoUrl || '',
        createdAt: new Date(u.createdAt).toISOString().split('T')[0],
      }));
      setUsers(mapped);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Powerful dynamic filtering logic
  const filteredUsers = users.filter(user => {
    // 1. Tab match check
    if (activeTab === 'pending' && user.status !== 'pending') return false;
    if (activeTab === 'blocked' && user.status !== 'blocked') return false;
    
    // 2. Search match check
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const toggleMenu = (id) => {
    if (activeMenu === id) setActiveMenu(null);
    else setActiveMenu(id);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingUser(prev => ({ ...prev, [name]: value }));
    // Clear targeted error as user types
    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    
    // Strict Validation Engine Execution before save
    const errs = {};
    const nameErr = validateRequired(editingUser.name, 'Full Name');
    const emailErr = validateUniversityEmail(editingUser.email);
    const idErr = validateStudentId(editingUser.studentId);
    
    if (nameErr) errs.name = nameErr;
    if (emailErr) errs.email = emailErr;
    if (idErr) errs.studentId = idErr;
    
    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return; // Block save if validation fails
    }

    try {
      await updateUser(editingUser.id, {
        fullName: editingUser.name,
        email: editingUser.email,
        studentId: editingUser.studentId,
        faculty: editingUser.faculty,
      });
      
      // Update local state
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setEditingUser(null);
      setEditErrors({});
    } catch (err) {
      alert('Failed to update user: ' + err.message);
    }
  };

  const exportToCSV = () => {
    // 1. Define Standard Columns
    const headers = ['System ID,Full Name,University Email,Student ID,Faculty,Status,Registered Date'];
    
    // 2. Extract Data securely from currently filtered view
    const rows = filteredUsers.map(user => {
      const cleanName = user.name.replace(/,/g, ''); 
      return `${user.id},${cleanName},${user.email},${user.studentId},${user.faculty},${user.status},${user.createdAt}`;
    });
    
    // 3. Assemble complete file payload
    const csvContent = headers.concat(rows).join('\n');
    
    // 4. Mount Blob to DOM temporarily to execute browser download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const dateStamp = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Sliit_Marketplace_Users_${dateStamp}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAction = async (userId, action) => {
    try {
      if (action === 'delete') {
        if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
        await deleteUserById(userId);
        setUsers(users.filter(u => u.id !== userId));
      } else {
        const statusMap = {
          approve: 'approved',
          reject: 'rejected',
          block: 'blocked',
          unblock: 'approved',
        };
        const newStatus = statusMap[action];
        await updateUserStatus(userId, newStatus);
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      }
      setActiveMenu(null);
    } catch (err) {
      alert(`Action [${action}] failed: ` + err.message);
    }
  };

  const runFraudAnalysis = () => {
    setShowAiModal(true);
    setIsAiLoading(true);
    
    // Execute live algorithm over the current database array!
    const calculations = analyzeUserFraudRisk(users);
    
    // Simulate prediction processing time overlay
    setTimeout(() => {
      setAlgoResults(calculations);
      setIsAiLoading(false);
    }, 2500);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return <span className={`${styles.badge} ${styles.badgeGreen}`}>Approved</span>;
      case 'pending': return <span className={`${styles.badge} ${styles.badgeOrange}`}>Pending Approval</span>;
      case 'rejected': return <span className={`${styles.badge} ${styles.badgeRed}`}>Rejected</span>;
      case 'blocked': return <span className={`${styles.badge} ${styles.badgeRedDark}`}><ShieldX size={12} style={{marginRight: '2px'}}/> Blocked (3 Mos)</span>;
      case 'inactive': return <span className={`${styles.badge} ${styles.badgeGray}`}>Inactive</span>;
      default: return <span className={styles.badge}>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <p>Loading users from MongoDB...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>User Management</h1>
          <p className={styles.pageSubtitle}>Analyze, approve, and mathematically isolate security threats.</p>
        </div>
        
        <div className={styles.headerActions}>
          <div className={styles.tableSearchContainer}>
            <Search className={styles.searchIcon} size={18} />
            <input 
              type="text" 
              placeholder="Search by Name, Email, or ID..." 
              className={styles.tableSearchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={exportToCSV} className={styles.primaryBtn}>Export CSV</button>
        </div>
      </div>

      <div className={styles.tabsContainer}>
        <button onClick={() => setActiveTab('all')} className={`${styles.tab} ${activeTab === 'all' ? styles.tabActive : ''}`}>Master List</button>
        <button onClick={() => setActiveTab('pending')} className={`${styles.tab} ${activeTab === 'pending' ? styles.tabActive : ''}`}>Pending Actions</button>
        <button onClick={() => setActiveTab('blocked')} className={`${styles.tab} ${styles.tabBlocked} ${activeTab === 'blocked' ? styles.tabActive : ''}`}>
          🚨 Fraud & Block List
        </button>
      </div>
      
      {activeTab === 'blocked' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button onClick={runFraudAnalysis} className={styles.aiBtn}>
            <BrainCircuit size={18} /> Run ML Fraud Analysis
          </button>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Student ID</th>
              <th>Faculty</th>
              <th>ID Photo</th>
              <th>Status</th>
              <th>Created Date</th>
              <th className={styles.textRight}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td className={styles.fw600}>#{String(user.id).slice(-4).padStart(4, '0')}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.studentId}</td>
                <td>{user.faculty}</td>
                <td>
                  {user.idPhotoUrl ? (
                    <img src={user.idPhotoUrl} alt="ID" className={styles.tableAvatar} />
                  ) : (
                    <span className={styles.noPhoto}>No Image</span>
                  )}
                </td>
                <td>{getStatusBadge(user.status)}</td>
                <td>{user.createdAt}</td>
                <td className={styles.actionsCell}>
                  
                  <button className={styles.iconBtn} title="View Details">
                    <Eye size={18} />
                  </button>

                  <div className={styles.dropdownContainer}>
                    <button className={styles.iconBtn} onClick={() => toggleMenu(user.id)} title="More Actions">
                      <MoreVertical size={18} />
                    </button>
                    
                    {activeMenu === user.id && (
                      <div className={styles.dropdownMenu}>
                        {user.status === 'pending' && (
                          <>
                            <button onClick={() => handleAction(user.id, 'approve')} className={styles.menuItemGreen}>
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button onClick={() => handleAction(user.id, 'reject')} className={styles.menuItemRed}>
                              <XCircle size={14} /> Reject
                            </button>
                          </>
                        )}
                        
                        {user.status !== 'blocked' ? (
                          <button onClick={() => handleAction(user.id, 'block')} className={styles.menuItemOrange}>
                            <Ban size={14} /> Block
                          </button>
                        ) : (
                          <button onClick={() => handleAction(user.id, 'unblock')} className={styles.menuItemGreen}>
                            <Unlock size={14} /> Unblock
                          </button>
                        )}
                        
                        <button onClick={() => { setEditingUser(user); setActiveMenu(null); }} className={styles.menuItem}>
                          <Edit size={14} /> Edit User
                        </button>
                        
                        <div className={styles.menuDivider}></div>
                        
                        <button onClick={() => handleAction(user.id, 'delete')} className={styles.menuItemRed}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className={styles.emptyState}>
            <p>No users found matching your search "{searchTerm}".</p>
          </div>
        )}
      </div>

      {editingUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Edit Master File</h2>
              <button onClick={() => { setEditingUser(null); setEditErrors({}); }} className={styles.closeModalBtn}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={saveEdit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Name</label>
                  <input type="text" name="name" value={editingUser.name} onChange={handleEditChange} className={`${styles.formInput} ${editErrors.name ? styles.errorInput : ''}`} required />
                  {editErrors.name && <span className={styles.errorText}>{editErrors.name}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>University Email</label>
                  <input type="email" name="email" value={editingUser.email} onChange={handleEditChange} className={`${styles.formInput} ${editErrors.email ? styles.errorInput : ''}`} required />
                  {editErrors.email && <span className={styles.errorText}>{editErrors.email}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Student ID</label>
                  <input type="text" name="studentId" value={editingUser.studentId} onChange={handleEditChange} className={`${styles.formInput} ${editErrors.studentId ? styles.errorInput : ''}`} required />
                  {editErrors.studentId && <span className={styles.errorText}>{editErrors.studentId}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Faculty Configuration</label>
                  <select name="faculty" value={editingUser.faculty} onChange={handleEditChange} className={styles.formInput}>
                    <option value="Computing">Computing</option>
                    <option value="Business">Business</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Humanities & Sciences">Humanities & Sciences</option>
                    <option value="Staff">System Staff</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => { setEditingUser(null); setEditErrors({}); }} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" className={styles.primaryBtn}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Fraud Dashboard Overlay */}
      {showAiModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '720px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BrainCircuit color="#8b5cf6" /> ML Fraud Detection Report
              </h2>
              <button onClick={() => setShowAiModal(false)} className={styles.closeModalBtn}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              {isAiLoading ? (
                <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
                  <BrainCircuit size={48} className={styles.pulseDot} style={{ background: 'transparent', margin: '0 auto 1.5rem', color: '#8b5cf6', animation: 'pulse 1.5s infinite' }} />
                  <p style={{ fontWeight: '600', marginBottom: '1rem' }}>Running Weighted Anomaly Scoring + Naive Bayes Classification...</p>
                  <p style={{ fontSize: '0.85rem' }}>Extracting 5 features per user, calculating anomaly scores, and clustering via Euclidean distance.</p>
                  <div className={styles.progressBarBack}>
                    <div className={styles.progressBarFill}></div>
                  </div>
                </div>
              ) : algoResults && (
                <div className={styles.aiDashboard}>
                  {/* Algorithm Info Badge */}
                  <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#6d28d9' }}>
                    <strong>Model:</strong> {algoResults.algorithmMeta.model} &nbsp;|&nbsp;
                    <strong>Features:</strong> {algoResults.algorithmMeta.features} &nbsp;|&nbsp;
                    <strong>Users Scanned:</strong> {algoResults.scoredUsers.length}
                  </div>

                  {/* Risk Distribution Stats */}
                  <div className={styles.aiStatGrid}>
                    <div className={styles.aiStatBox} style={{ borderLeft: '4px solid #10b981' }}>
                      <span className={styles.aiStatTitle}>Low Risk</span>
                      <span className={styles.aiStatValue}>{algoResults.riskDistribution.LOW}</span>
                      <span style={{fontSize: '0.7rem', color: '#64748b'}}>Score &lt; 0.30</span>
                    </div>
                    <div className={styles.aiStatBox} style={{ borderLeft: '4px solid #f59e0b' }}>
                      <span className={styles.aiStatTitle}>Medium Risk</span>
                      <span className={styles.aiStatValue}>{algoResults.riskDistribution.MEDIUM}</span>
                      <span style={{fontSize: '0.7rem', color: '#64748b'}}>Score 0.30 – 0.55</span>
                    </div>
                    <div className={styles.aiStatBox} style={{ borderLeft: '4px solid #ef4444' }}>
                      <span className={styles.aiStatTitle}>High Risk</span>
                      <span className={styles.aiStatValue}>{algoResults.riskDistribution.HIGH}</span>
                      <span style={{fontSize: '0.7rem', color: '#64748b'}}>Score 0.55 – 0.75</span>
                    </div>
                    <div className={`${styles.aiStatBox} ${styles.aiDangerBox}`} style={{ borderLeft: '4px solid #7f1d1d' }}>
                      <span className={styles.aiStatTitle}>Critical</span>
                      <span className={styles.aiStatValue}>{algoResults.riskDistribution.CRITICAL}</span>
                      <span style={{fontSize: '0.7rem', color: '#dc2626'}}>Score &gt; 0.75</span>
                    </div>
                  </div>

                  {/* Per-User Anomaly Scores Table */}
                  <div style={{ marginTop: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', color: '#1e293b' }}>Per-User Anomaly Scores (Naive Bayes Classification):</h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                            <th style={{ padding: '0.5rem 0.75rem', borderBottom: '2px solid #e2e8f0' }}>User</th>
                            <th style={{ padding: '0.5rem 0.75rem', borderBottom: '2px solid #e2e8f0' }}>Student ID</th>
                            <th style={{ padding: '0.5rem 0.75rem', borderBottom: '2px solid #e2e8f0' }}>Anomaly Score</th>
                            <th style={{ padding: '0.5rem 0.75rem', borderBottom: '2px solid #e2e8f0' }}>Risk Tier</th>
                          </tr>
                        </thead>
                        <tbody>
                          {algoResults.scoredUsers.map((u, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '0.5rem 0.75rem', fontWeight: '500' }}>{u.name}</td>
                              <td style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{u.studentId}</td>
                              <td style={{ padding: '0.5rem 0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${u.anomalyScore * 100}%`, height: '100%', background: u.classification.color, borderRadius: '3px' }}></div>
                                  </div>
                                  <span style={{ fontWeight: '600' }}>{u.anomalyScore.toFixed(3)}</span>
                                </div>
                              </td>
                              <td style={{ padding: '0.5rem 0.75rem' }}>
                                <span style={{ background: u.classification.color + '18', color: u.classification.color, padding: '2px 10px', borderRadius: '12px', fontWeight: '600', fontSize: '0.75rem' }}>
                                  {u.classification.label}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Cohort Risk Analysis */}
                  {algoResults.highRiskCohorts.length > 0 && (
                    <div style={{ marginTop: '1.25rem' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', color: '#1e293b' }}>Cohort Risk Analysis (Batch Prefix):</h3>
                      {algoResults.highRiskCohorts.map((cohort, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.6rem 1rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: '700', color: '#991b1b' }}>Batch "{cohort.cohort}"</span>
                          <span style={{ fontSize: '0.8rem', color: '#dc2626' }}>Avg Score: {cohort.avgRiskScore} | {cohort.memberCount} user(s) | {cohort.severity}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Findings & Recommendations */}
                  <div style={{ marginTop: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem', color: '#1e293b' }}>Findings & Recommended Actions:</h3>
                    <ul className={styles.aiWarningList}>
                      {algoResults.suspiciousClusters.map((cluster, idx) => (
                        <li key={`c-${idx}`}>
                          <AlertTriangle size={18} /> 
                          <span>{cluster.description}</span>
                        </li>
                      ))}
                      {algoResults.recommendedActions.map((action, idx) => (
                        <li key={`a-${idx}`}>
                          <Ban size={18} />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            {!isAiLoading && (
              <div className={styles.modalFooter}>
                <button onClick={() => setShowAiModal(false)} className={styles.primaryBtn}>Acknowledge Findings</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
