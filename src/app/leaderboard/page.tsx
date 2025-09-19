'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';

interface LeaderboardEntry {
  name: string;
  department: string;
  totalFeedback: number;
  averageRating: number;
  isCompleted: boolean;
  rank: number;
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

export default function PublicLeaderboardPage() {
  const { user, logout } = useUser();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [productStats, setProductStats] = useState<ProductStatsEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'users' | 'products'>('users');

  useEffect(() => {
    fetchLeaderboard();
    fetchProductStats();
    // Set up auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchLeaderboard();
      fetchProductStats();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/admin/leaderboard');
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      const data = await response.json();
      
      // Transform data for public view (hide emails, add ranks)
      const publicData = data.map((entry: LeaderboardEntry & { email: string; completedFeedback: string[] }, index: number) => ({
        name: entry.name,
        department: entry.department,
        totalFeedback: entry.completedFeedback?.length || 0,
        averageRating: entry.averageRating || 0,
        isCompleted: entry.isCompleted || false,
        rank: index + 1
      }));
      
      setLeaderboard(publicData);
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

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    padding: '2rem 1rem',
    fontFamily: 'var(--font-minecraft)'
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#2c2c2c',
    border: '4px solid',
    borderColor: '#c6c6c6 #585858 #585858 #c6c6c6',
    borderRadius: '8px',
    padding: '2rem'
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    color: 'white',
    marginBottom: '2rem'
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
    textAlign: 'left',
    fontSize: '1.1rem'
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

  const topThreeStyle: React.CSSProperties = {
    ...tdStyle,
    backgroundColor: '#FFD700',
    color: '#000',
    fontWeight: 'bold'
  };

  const userRowStyle: React.CSSProperties = {
    ...tdStyle,
    backgroundColor: '#4a90e2',
    color: 'white',
    fontWeight: 'bold'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#5E8D4A',
    color: 'white',
    border: '4px outset #a0a0a0',
    fontSize: '1rem',
    fontFamily: 'var(--font-minecraft)',
    cursor: 'pointer',
    margin: '0.5rem'
  };

  const logoutButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#8B0000'
  };

  const getRowStyle = (entry: LeaderboardEntry, index: number) => {
    if (user && entry.name === user.name) {
      return userRowStyle;
    }
    if (index < 3) {
      return topThreeStyle;
    }
    return entry.isCompleted ? completedStyle : tdStyle;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  if (isLoading) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <div style={{ textAlign: 'center', color: 'white', fontFamily: 'var(--font-minecraft)' }}>
            <p>Loading leaderboard...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            🏆 Leaderboard
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#a0a0a0' }}>
            {viewMode === 'users' ? 'Top performers in the feedback system' : 'Most rated products across all labs'}
          </p>
          {user && viewMode === 'users' && (
            <p style={{ fontSize: '1rem', color: '#FFD700', marginTop: '1rem' }}>
              Welcome, {user.name}! Your current rank is highlighted below.
            </p>
          )}
          
          {/* View Mode Toggle */}
          <div style={{ marginTop: '1.5rem' }}>
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
                  padding: '0.5rem 1rem',
                  backgroundColor: viewMode === 'users' ? '#5E8D4A' : '#3a3a3a',
                  color: 'white',
                  border: '2px outset #a0a0a0',
                  fontSize: '1rem',
                  fontFamily: 'var(--font-minecraft)',
                  cursor: 'pointer',
                  margin: '0'
                }}
              >
                👥 Users
              </button>
              <button 
                onClick={() => setViewMode('products')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: viewMode === 'products' ? '#5E8D4A' : '#3a3a3a',
                  color: 'white',
                  border: '2px outset #a0a0a0',
                  fontSize: '1rem',
                  fontFamily: 'var(--font-minecraft)',
                  cursor: 'pointer',
                  margin: '0'
                }}
              >
                📦 Products
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <button 
              onClick={() => window.history.back()}
              style={buttonStyle}
            >
              ← Back
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              style={buttonStyle}
            >
              🏠 Home
            </button>
          </div>
          {user && (
            <button 
              onClick={logout}
              style={logoutButtonStyle}
            >
              Logout
            </button>
          )}
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#ff4444', 
            color: 'white', 
            padding: '1rem', 
            marginBottom: '1rem',
            textAlign: 'center',
            fontFamily: 'var(--font-minecraft)',
            border: '2px solid #ff6666'
          }}>
            {error}
          </div>
        )}

        {((viewMode === 'users' && leaderboard.length > 0) || (viewMode === 'products' && productStats.length > 0)) && (
          <div style={{ overflowX: 'auto' }}>
            {viewMode === 'users' ? (
              // User Leaderboard Table
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Rank</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Department</th>
                    <th style={thStyle}>Progress</th>
                    <th style={thStyle}>Avg Rating</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr key={`${entry.name}-${entry.department}`}>
                      <td style={getRowStyle(entry, index)}>
                        <strong>{getRankIcon(entry.rank)}</strong>
                      </td>
                      <td style={getRowStyle(entry, index)}>
                        {entry.name}
                      </td>
                      <td style={getRowStyle(entry, index)}>
                        {entry.department}
                      </td>
                      <td style={getRowStyle(entry, index)}>
                        {entry.totalFeedback}/25
                      </td>
                      <td style={getRowStyle(entry, index)}>
                        {entry.averageRating.toFixed(2)} ⭐
                      </td>
                      <td style={getRowStyle(entry, index)}>
                        {entry.isCompleted ? (
                          <span style={{ color: '#00FF00', fontWeight: 'bold' }}>✅ COMPLETED</span>
                        ) : (
                          <span style={{ color: '#FFA500' }}>⏳ In Progress</span>
                        )}
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
                  </tr>
                </thead>
                <tbody>
                  {productStats.length > 0 ? productStats.map((entry, index) => {
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
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: '#ccc' }}>
                        No product data available
                      </td>
                    </tr>
                  )}
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

        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          backgroundColor: '#3a3a3a', 
          border: '2px solid #585858',
          borderRadius: '4px'
        }}>
          <h3 style={{ color: '#FFD700', marginBottom: '1rem' }}>🏆 Ranking System</h3>
          {viewMode === 'users' ? (
            <ul style={{ color: '#a0a0a0', lineHeight: '1.6' }}>
              <li><strong>🥇 Gold:</strong> Top 3 performers</li>
              <li><strong>✅ Green:</strong> Completed all 25 feedbacks</li>
              <li><strong>🔵 Blue:</strong> Your current position (if logged in)</li>
              <li><strong>Ranking:</strong> Based on completion status, then feedback count, then average rating</li>
            </ul>
          ) : (
            <ul style={{ color: '#a0a0a0', lineHeight: '1.6' }}>
              <li><strong>🥇 Gold:</strong> Top 3 most rated products</li>
              <li><strong>📊 Total Ratings:</strong> Number of people who rated this product</li>
              <li><strong>⭐ Average Rating:</strong> Overall rating across all users</li>
              <li><strong>📈 Rating Distribution:</strong> Breakdown of 1-5 star ratings</li>
              <li><strong>Ranking:</strong> Based on total number of ratings, then average rating</li>
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
