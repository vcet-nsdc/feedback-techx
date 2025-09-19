'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAdmin, isLoading: authLoading } = useAdmin();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAdmin) {
      router.push('/admin/dashboard');
    }
  }, [isAdmin, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(username, password);
      if (success) {
        router.push('/admin/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formStyle: React.CSSProperties = {
    maxWidth: '400px',
    margin: '10vh auto',
    padding: '2rem',
    backgroundColor: '#c6c6c6',
    border: '4px solid',
    borderColor: '#e0e0e0 #585858 #585858 #e0e0e0',
    color: '#333'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    backgroundColor: '#373737',
    border: '2px inset #585858',
    color: 'white',
    boxSizing: 'border-box',
    fontFamily: 'var(--font-minecraft)',
    appearance: 'none'
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#5E8D4A',
    color: 'white',
    border: '4px outset #a0a0a0',
    fontSize: '1.25rem',
    fontFamily: 'var(--font-minecraft)',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.7 : 1
  };

  if (authLoading) {
    return (
      <div style={{ textAlign: 'center', fontFamily: 'var(--font-minecraft)', color: 'white', marginTop: '20vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div style={{ textAlign: 'center', fontFamily: 'var(--font-minecraft)', color: 'white', marginTop: '20vh' }}>
        <p>Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <main style={{ padding: '2rem' }}>
      <div style={formStyle}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Admin Login</h1>
        {error && (
          <div style={{ 
            backgroundColor: '#ff4444', 
            color: 'white', 
            padding: '0.5rem', 
            marginBottom: '1rem',
            textAlign: 'center',
            fontFamily: 'var(--font-minecraft)'
          }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading} style={buttonStyle}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </main>
  );
}
