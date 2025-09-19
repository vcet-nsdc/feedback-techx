'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';
import AdminRouteGuard from '@/components/AdminRouteGuard';

interface LeaderboardEntry {
  name: string;
  email: string;
  department: string;
  totalFeedback: number;
  averageRating: number;
  completionDate?: string;
  isCompleted: boolean;
}

interface ProductStatsEntry {
  productId: string;
  productName: string;
  labName: string;
  totalRatings: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  totalComments: number;
  lastRated: string | null;
}

export default function AdminLeaderboardPage() {
  const { logout } = useAdmin();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [productStats, setProductStats] = useState<ProductStatsEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'name' | 'department' | 'progress' | 'rating'>('rank');
  const [viewMode, setViewMode] = useState<'users' | 'products'>('users');

  useEffect(() => {
    fetchLeaderboard();
    fetchProductStats();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchLeaderboard();
      fetchProductStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/admin/leaderboard');
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      const data = await response.json();
      setLeaderboard(data);
      setError('');
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductStats = async () => {
    try {
      const response = await fetch('/api/admin/product-stats');
      if (!response.ok) throw new Error('Failed to fetch product stats');
      const data = await response.json();
      setProductStats(data);
    } catch (error) {
      console.error('Error fetching product stats:', error);
    }
  };

  // Filter and sort leaderboard data
  const filteredLeaderboard = leaderboard
    .filter(entry => {
      const matchesSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = !filterDepartment || entry.department === filterDepartment;
      return matchesSearch && matchesDepartment;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'department':
          return a.department.localeCompare(b.department);
        case 'progress':
          return b.totalFeedback - a.totalFeedback;
        case 'rating':
          return b.averageRating - a.averageRating;
        default:
          return 0; // Keep original ranking
      }
    });

  const departments = [...new Set(leaderboard.map(entry => entry.department))];

  // Filter and sort product stats data
  const filteredProductStats = productStats
    .filter(entry => {
      const matchesSearch = entry.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.labName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = !filterDepartment || entry.labName === filterDepartment;
      return matchesSearch && matchesDepartment;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.productName.localeCompare(b.productName);
        case 'department':
          return a.labName.localeCompare(b.labName);
        case 'progress':
          return b.totalRatings - a.totalRatings;
        case 'rating':
          return b.averageRating - a.averageRating;
        default:
          return 0; // Keep original ranking
      }
    });

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#7d7d7d',
    border: '4px solid',
    borderColor: '#c6c6c6 #585858 #585858 #c6c6c6',
    fontFamily: 'var(--font-minecraft)',
    color: 'white'
  };

  const thStyle: React.CSSProperties = {
    backgroundColor: '#5E8D4A',
    padding: '1rem',
    border: '2px solid #585858',
    textAlign: 'left'
  };

  const tdStyle: React.CSSProperties = {
    padding: '0.75rem',
    border: '2px solid #585858',
    backgroundColor: '#8d8d8d'
  };

  const completedStyle: React.CSSProperties = {
    ...tdStyle,
    backgroundColor: '#4a7c59'
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

  const refreshButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#2E8B57'
  };

  return (
    <AdminRouteGuard>
      <main style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-minecraft)', color: 'white' }}>
            Live Leaderboard
          </h1>
          
          {/* View Mode Toggle */}
          <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <div style={{ 
              display: 'inline-flex', 
              backgroundColor: '#3a3a3a', 
              border: '2px solid #585858', 
              borderRadius: '4px',
              padding: '0.25rem'
            }}>
              <button 
                onClick={() => setViewMode('users')}
                style={{
                  ...buttonStyle,
                  backgroundColor: viewMode === 'users' ? '#5E8D4A' : '#3a3a3a',
                  margin: '0',
                  padding: '0.5rem 1rem',
                  fontSize: '1rem'
                }}
              >
                👥 Users
              </button>
              <button 
                onClick={() => setViewMode('products')}
                style={{
                  ...buttonStyle,
                  backgroundColor: viewMode === 'products' ? '#5E8D4A' : '#3a3a3a',
                  margin: '0',
                  padding: '0.5rem 1rem',
                  fontSize: '1rem'
                }}
              >
                📦 Products
              </button>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button onClick={() => {
              fetchLeaderboard();
              fetchProductStats();
            }} style={refreshButtonStyle}>
              🔄 Refresh
            </button>
            <button onClick={() => router.push('/admin/dashboard')} style={buttonStyle}>
              📊 Dashboard
            </button>
            <button onClick={() => router.push('/admin/feedback')} style={buttonStyle}>
              📝 View Feedback
            </button>
            <button onClick={handleLogout} style={logoutButtonStyle}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem', 
          flexWrap: 'wrap',
          alignItems: 'center',
          backgroundColor: '#3a3a3a',
          padding: '1rem',
          border: '2px solid #585858',
          borderRadius: '4px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: 'white', fontFamily: 'var(--font-minecraft)', fontSize: '0.9rem' }}>
              Search:
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.5rem',
                backgroundColor: '#373737',
                border: '2px inset #585858',
                color: 'white',
                fontFamily: 'var(--font-minecraft)',
                minWidth: '200px'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: 'white', fontFamily: 'var(--font-minecraft)', fontSize: '0.9rem' }}>
              Department:
            </label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              style={{
                padding: '0.5rem',
                backgroundColor: '#373737',
                border: '2px inset #585858',
                color: 'white',
                fontFamily: 'var(--font-minecraft)',
                minWidth: '150px'
              }}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: 'white', fontFamily: 'var(--font-minecraft)', fontSize: '0.9rem' }}>
              Sort By:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rank' | 'name' | 'department' | 'progress' | 'rating')}
              style={{
                padding: '0.5rem',
                backgroundColor: '#373737',
                border: '2px inset #585858',
                color: 'white',
                fontFamily: 'var(--font-minecraft)',
                minWidth: '120px'
              }}
            >
              <option value="rank">Rank</option>
              <option value="name">Name</option>
              <option value="department">Department</option>
              <option value="progress">Progress</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: 'white', fontFamily: 'var(--font-minecraft)', fontSize: '0.9rem' }}>
              Stats:
            </label>
            <div style={{ color: '#FFD700', fontFamily: 'var(--font-minecraft)', fontSize: '0.9rem' }}>
              {viewMode === 'users' ? (
                <>
                  Total Users: {leaderboard.length} | 
                  Completed: {leaderboard.filter(e => e.isCompleted).length} | 
                  Showing: {filteredLeaderboard.length}
                </>
              ) : (
                <>
                  Total Products: {productStats.length} | 
                  Total Ratings: {productStats.reduce((sum, p) => sum + p.totalRatings, 0)} | 
                  Showing: {filteredProductStats.length}
                </>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', color: 'white', fontFamily: 'var(--font-minecraft)' }}>
            <p>Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#ff4444', 
            fontFamily: 'var(--font-minecraft)',
            backgroundColor: 'rgba(255, 68, 68, 0.1)',
            padding: '1rem',
            border: '2px solid #ff4444'
          }}>
            <p>{error}</p>
            <button onClick={fetchLeaderboard} style={refreshButtonStyle}>
              Try Again
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {viewMode === 'users' ? (
              // User Leaderboard Table
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Rank</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Department</th>
                    <th style={thStyle}>Feedback Count</th>
                    <th style={thStyle}>Avg Rating</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Completion Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaderboard.map((entry, index) => (
                    <tr key={entry.email}>
                      <td style={entry.isCompleted ? completedStyle : tdStyle}>
                        <strong>#{index + 1}</strong>
                      </td>
                      <td style={entry.isCompleted ? completedStyle : tdStyle}>
                        {entry.name}
                      </td>
                      <td style={entry.isCompleted ? completedStyle : tdStyle}>
                        {entry.department}
                      </td>
                      <td style={entry.isCompleted ? completedStyle : tdStyle}>
                        {entry.totalFeedback}/25
                      </td>
                      <td style={entry.isCompleted ? completedStyle : tdStyle}>
                        {entry.averageRating.toFixed(2)} ⭐
                      </td>
                      <td style={entry.isCompleted ? completedStyle : tdStyle}>
                        {entry.isCompleted ? (
                          <span style={{ color: '#FFD700', fontWeight: 'bold' }}>✅ COMPLETED</span>
                        ) : (
                          <span style={{ color: '#FFA500' }}>⏳ In Progress</span>
                        )}
                      </td>
                      <td style={entry.isCompleted ? completedStyle : tdStyle}>
                        {entry.completionDate ? 
                          new Date(entry.completionDate).toLocaleDateString() : 
                          '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              // Product Leaderboard Table
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>🏆 Rank</th>
                    <th style={thStyle}>📦 Product</th>
                    <th style={thStyle}>🏢 Lab</th>
                    <th style={thStyle}>📊 Ratings</th>
                    <th style={thStyle}>⭐ Average</th>
                    <th style={thStyle}>📈 Distribution</th>
                    <th style={thStyle}>💬 Comments</th>
                    <th style={thStyle}>🕒 Last Rated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProductStats.map((entry, index) => {
                    const isTopThree = index < 3;
                    const rowStyle = isTopThree ? {
                      ...tdStyle,
                      backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                      color: '#000',
                      fontWeight: 'bold'
                    } : tdStyle;
                    
                    const getProductRankIcon = (rank: number) => {
                      if (rank === 1) return '🥇';
                      if (rank === 2) return '🥈';
                      if (rank === 3) return '🥉';
                      return `#${rank}`;
                    };

                    const formatRatingDistribution = (distribution: { [key: string]: number }) => {
                      return Object.entries(distribution)
                        .filter(([, count]) => count > 0)
                        .map(([rating, count]) => `${rating}⭐: ${count}`)
                        .join(' • ');
                    };

                    return (
                      <tr key={entry.productId}>
                        <td style={rowStyle}>
                          <strong>{getProductRankIcon(index + 1)}</strong>
                        </td>
                        <td style={rowStyle}>
                          <strong>{entry.productName}</strong>
                        </td>
                        <td style={rowStyle}>
                          {entry.labName}
                        </td>
                        <td style={rowStyle}>
                          <strong style={{ fontSize: '1.1rem', color: isTopThree ? '#000' : '#FFD700' }}>
                            {entry.totalRatings}
                          </strong>
                        </td>
                        <td style={rowStyle}>
                          <span style={{ 
                            fontSize: '1rem',
                            color: isTopThree ? '#000' : '#FFD700',
                            fontWeight: 'bold'
                          }}>
                            {entry.averageRating.toFixed(2)} ⭐
                          </span>
                        </td>
                        <td style={rowStyle}>
                          <div style={{ 
                            fontSize: '0.85rem',
                            color: isTopThree ? '#333' : '#ccc',
                            lineHeight: '1.2'
                          }}>
                            {formatRatingDistribution(entry.ratingDistribution)}
                          </div>
                        </td>
                        <td style={rowStyle}>
                          <strong style={{ color: isTopThree ? '#000' : '#FFD700' }}>
                            {entry.totalComments}
                          </strong>
                        </td>
                        <td style={rowStyle}>
                          {entry.lastRated ? 
                            new Date(entry.lastRated).toLocaleDateString() : 
                            '-'
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {((viewMode === 'users' && leaderboard.length === 0) || (viewMode === 'products' && productStats.length === 0)) && !isLoading && !error && (
          <div style={{ 
            textAlign: 'center', 
            color: 'white', 
            fontFamily: 'var(--font-minecraft)',
            marginTop: '2rem'
          }}>
            <p>No {viewMode === 'users' ? 'user' : 'product'} data available yet.</p>
          </div>
        )}
      </main>
    </AdminRouteGuard>
  );
}
