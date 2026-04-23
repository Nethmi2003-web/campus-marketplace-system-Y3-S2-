import React, { useState, useEffect } from 'react';
import { Users, UserX, ShieldQuestion, Store, UserCheck, Clock } from 'lucide-react';
import { getDashboardStats } from '../../services/authService';
import styles from './AdminPages.module.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data.stats);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        // Fallback to empty stats
        setStats({
          totalUsers: 0,
          pendingVerification: 0,
          activeSellers: 0,
          blockedUsers: 0,
          totalAdmins: 0,
          recentRegistrations: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Get current logged-in user name
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = storedUser.fullName || 'Admin';

  const metrics = stats ? [
    { label: 'Total Users', value: String(stats.totalUsers), icon: Users, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Pending Verification', value: String(stats.pendingVerification), icon: Clock, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Active Sellers', value: String(stats.activeSellers), icon: Store, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Blocked Users', value: String(stats.blockedUsers), icon: UserX, color: '#ef4444', bg: '#fef2f2' },
    { label: 'Total Admins', value: String(stats.totalAdmins), icon: ShieldQuestion, color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Recent Registrations', value: String(stats.recentRegistrations), icon: UserCheck, color: '#ec4899', bg: '#fdf2f8' },
  ] : [];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>Welcome, {userName}!</h1>
        <p className={styles.welcomeSubtitle}>Manage your marketplace users and administration duties</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <p>Loading dashboard metrics from database...</p>
        </div>
      ) : (
        <div className={styles.gridContainer}>
          {metrics.map((metric, idx) => (
            <div key={idx} className={styles.metricCard}>
              <div className={styles.metricIconWrapper} style={{ backgroundColor: metric.bg, color: metric.color }}>
                <metric.icon size={26} strokeWidth={2.5} />
              </div>
              <div className={styles.metricInfo}>
                <h3 className={styles.metricValue}>{metric.value}</h3>
                <p className={styles.metricLabel}>{metric.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Visual placeholder for future charts */}
      <div className={styles.chartSection}>
        <div className={styles.chartCard}>
          <h3 className={styles.cardSectionTitle}>Recent Activity Pipeline</h3>
          <div className={styles.placeholderChart}>
            <div className={styles.pulseDot} />
            <p>Live metrics from MongoDB — {stats ? stats.totalUsers : 0} users tracked</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
