'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';
import AdminRouteGuard from '@/components/AdminRouteGuard';

interface DashboardStats {
  totalUsers: number;
  totalFeedback: number;
  completedUsers: number;
  averageRating: number;
}

export default function AdminDashboardPage() {
  const { logout } = useAdmin();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalFeedback: 0,
    completedUsers: 0,
    averageRating: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats from API
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch stats from API
      const statsResponse = await fetch('/api/feedback/stats');
      const statsData = await statsResponse.json();
      
      // Fetch leaderboard to get completed users count
      const leaderboardResponse = await fetch('/api/admin/leaderboard');
      const leaderboardData = await leaderboardResponse.json();
      const completedUsers = leaderboardData.filter((user: { isCompleted: boolean }) => user.isCompleted).length;

      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalFeedback: statsData.totalFeedback || 0,
        completedUsers,
        averageRating: statsData.averageRating || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#7d7d7d',
    border: '4px solid',
    borderColor: '#c6c6c6 #585858 #585858 #c6c6c6',
    padding: '1.5rem',
    margin: '1rem',
    textAlign: 'center',
    color: 'white',
    fontFamily: 'var(--font-minecraft)'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '1rem 2rem',
    backgroundColor: '#5E8D4A',
    color: 'white',
    border: '4px outset #a0a0a0',
    fontSize: '1.25rem',
    fontFamily: 'var(--font-minecraft)',
    cursor: 'pointer',
    margin: '0.5rem',
    textDecoration: 'none',
    display: 'inline-block'
  };

  const logoutButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#8B0000'
  };

  return (
    <AdminRouteGuard>
      <main style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-minecraft)', color: 'white' }}>
            Admin Dashboard
          </h1>
          <button onClick={handleLogout} style={logoutButtonStyle}>
            Logout
          </button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', color: 'white', fontFamily: 'var(--font-minecraft)' }}>
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div style={cardStyle}>
                <h3>Total Users</h3>
                <p style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{stats.totalUsers}</p>
              </div>
              <div style={cardStyle}>
                <h3>Total Feedback</h3>
                <p style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{stats.totalFeedback}</p>
              </div>
              <div style={cardStyle}>
                <h3>Completed Users</h3>
                <p style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{stats.completedUsers}</p>
              </div>
              <div style={cardStyle}>
                <h3>Average Rating</h3>
                <p style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{stats.averageRating}</p>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button onClick={() => router.push('/admin/leaderboard')} style={buttonStyle}>
                View Leaderboard
              </button>
              <button onClick={() => router.push('/admin/feedback')} style={buttonStyle}>
                View All Feedback
              </button>
            </div>
          </>
        )}
      </main>
    </AdminRouteGuard>
  );
}
