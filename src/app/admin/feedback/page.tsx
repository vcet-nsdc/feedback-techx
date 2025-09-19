'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';
import AdminRouteGuard from '@/components/AdminRouteGuard';

interface FeedbackEntry {
  studentName: string;
  studentEmail: string;
  studentDepartment: string;
  rating: number;
  comment: string;
  tableId: string;
  timestamp: string;
}

export default function AdminFeedbackPage() {
  const { logout } = useAdmin();
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    email: '',
    productId: '',
    department: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (filters.email) params.append('email', filters.email);
        if (filters.productId) params.append('productId', filters.productId);
        if (filters.department) params.append('department', filters.department);

        const response = await fetch(`/api/admin/feedback?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch feedback');
        const data = await response.json();
        setFeedback(data);
        setError('');
      } catch (error) {
        console.error('Error fetching feedback:', error);
        setError('Failed to load feedback');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters.email, filters.productId, filters.department]);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ email: '', productId: '', department: '' });
  };

  const exportFeedback = () => {
    const csvContent = [
      ['Name', 'Email', 'Department', 'Product ID', 'Rating', 'Comment', 'Timestamp'],
      ...feedback.map(f => [
        f.studentName,
        f.studentEmail,
        f.studentDepartment,
        f.tableId,
        f.rating,
        f.comment.replace(/,/g, ';'), // Replace commas to avoid CSV issues
        f.timestamp
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
    backgroundColor: '#8d8d8d',
    maxWidth: '200px',
    wordWrap: 'break-word'
  };

  const inputStyle: React.CSSProperties = {
    padding: '0.5rem',
    backgroundColor: '#373737',
    border: '2px inset #585858',
    color: 'white',
    fontFamily: 'var(--font-minecraft)',
    margin: '0.25rem'
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

  const exportButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#2E8B57'
  };

  const filterStyle: React.CSSProperties = {
    backgroundColor: '#7d7d7d',
    border: '4px solid',
    borderColor: '#c6c6c6 #585858 #585858 #c6c6c6',
    padding: '1rem',
    marginBottom: '1rem',
    fontFamily: 'var(--font-minecraft)',
    color: 'white'
  };

  return (
    <AdminRouteGuard>
      <main style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-minecraft)', color: 'white' }}>
            Feedback Viewer
          </h1>
          <div style={{ marginTop: '1rem' }}>
            <button onClick={exportFeedback} style={exportButtonStyle}>
              📊 Export CSV
            </button>
            <button onClick={() => router.push('/admin/dashboard')} style={buttonStyle}>
              📊 Dashboard
            </button>
            <button onClick={() => router.push('/admin/leaderboard')} style={buttonStyle}>
              🏆 Leaderboard
            </button>
            <button onClick={handleLogout} style={logoutButtonStyle}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={filterStyle}>
          <h3>Filters</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <div>
              <label>Email: </label>
              <input
                type="text"
                placeholder="Filter by email"
                value={filters.email}
                onChange={(e) => handleFilterChange('email', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label>Product ID: </label>
              <input
                type="text"
                placeholder="Filter by product"
                value={filters.productId}
                onChange={(e) => handleFilterChange('productId', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label>Department: </label>
              <input
                type="text"
                placeholder="Filter by department"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                style={inputStyle}
              />
            </div>
            <button onClick={clearFilters} style={buttonStyle}>
              Clear Filters
            </button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', color: 'white', fontFamily: 'var(--font-minecraft)' }}>
            <p>Loading feedback...</p>
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
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Department</th>
                  <th style={thStyle}>Product</th>
                  <th style={thStyle}>Rating</th>
                  <th style={thStyle}>Comment</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((entry, index) => (
                  <tr key={`${entry.studentEmail}-${entry.tableId}-${index}`}>
                    <td style={tdStyle}>{entry.studentName}</td>
                    <td style={tdStyle}>{entry.studentEmail}</td>
                    <td style={tdStyle}>{entry.studentDepartment}</td>
                    <td style={tdStyle}>{entry.tableId}</td>
                    <td style={tdStyle}>
                      {'⭐'.repeat(entry.rating)} ({entry.rating}/5)
                    </td>
                    <td style={tdStyle}>
                      {entry.comment || <em style={{ color: '#aaa' }}>No comment</em>}
                    </td>
                    <td style={tdStyle}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {feedback.length === 0 && !isLoading && !error && (
          <div style={{ 
            textAlign: 'center', 
            color: 'white', 
            fontFamily: 'var(--font-minecraft)',
            marginTop: '2rem'
          }}>
            <p>No feedback found matching your filters.</p>
          </div>
        )}

        {feedback.length > 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: 'white', 
            fontFamily: 'var(--font-minecraft)',
            marginTop: '1rem'
          }}>
            <p>Showing {feedback.length} feedback entries</p>
          </div>
        )}
      </main>
    </AdminRouteGuard>
  );
}
