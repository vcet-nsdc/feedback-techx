'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import PortalAnimation from '@/components/PortalAnimation';

// 1. Define the list of department options
const departmentOptions = [
  "AI-DS", "CSE-DS", "COMPS", "EXTC", "MECH",
  "VLSI", "IT", "CIVIL", "MMS"
];

export default function WelcomePage() {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();
  const { user, login, logout, isLoading } = useUser();
  const [isEnteringPortal, setIsEnteringPortal] = useState(false);

  // Auto-redirect if user is already logged in
  useEffect(() => {
    if (!isLoading && user) {
      // Check if user has already completed all feedback
      const userFeedbackKey = `submittedFeedback_${user.email}`;
      const submittedFeedback = JSON.parse(localStorage.getItem(userFeedbackKey) || '[]');
      const hasCompleted = submittedFeedback.length >= 25;
      
      if (hasCompleted) {
        router.push('/finish');
      } else {
        router.push('/labs');
      }
    }
  }, [user, isLoading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !department) { // Also check if department is selected
      alert('Please fill in all details, including department.');
      return;
    }
    
    // Check if user has already completed all feedback
    const userFeedbackKey = `submittedFeedback_${email}`;
    const submittedFeedback = JSON.parse(localStorage.getItem(userFeedbackKey) || '[]');
    const hasCompleted = submittedFeedback.length >= 25;
    
    login({ name, department, email });
    setIsEnteringPortal(true);
    
    setTimeout(() => {
      if (hasCompleted) {
        router.push('/finish');
      } else {
        router.push('/labs');
      }
    }, 2500);
  };

  const formStyle: React.CSSProperties = { maxWidth: '500px', margin: '10vh auto', padding: '2rem', backgroundColor: '#c6c6c6', border: '4px solid', borderColor: '#e0e0e0 #585858 #585858 #e0e0e0', color: '#333' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.75rem', marginBottom: '1rem', backgroundColor: '#373737', border: '2px inset #585858', color: 'white', boxSizing: 'border-box', fontFamily: 'var(--font-minecraft)', appearance: 'none' };
  const buttonStyle: React.CSSProperties = { width: '100%', padding: '1rem', backgroundColor: '#5E8D4A', color: 'white', border: '4px outset #a0a0a0', fontSize: '1.25rem', fontFamily: 'var(--font-minecraft)' };

  // Show loading state while checking for existing user
  if (isLoading) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ color: 'white', fontFamily: 'var(--font-minecraft)', fontSize: '1.5rem' }}>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  // Show logout option if user is already logged in
  if (user) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={formStyle}>
          <h1 style={{ textAlign: 'center' }}>Welcome Back!</h1>
          <p style={{ textAlign: 'center', color: '#555', marginBottom: '2rem' }}>
            You are logged in as: <strong>{user.name}</strong> ({user.email})
          </p>
          <p style={{ textAlign: 'center', color: '#555', marginBottom: '2rem' }}>
            Department: <strong>{user.department}</strong>
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => {
                if (user) {
                  const userFeedbackKey = `submittedFeedback_${user.email}`;
                  const submittedFeedback = JSON.parse(localStorage.getItem(userFeedbackKey) || '[]');
                  const hasCompleted = submittedFeedback.length >= 25;
                  
                  if (hasCompleted) {
                    router.push('/finish');
                  } else {
                    router.push('/labs');
                  }
                }
              }}
              style={buttonStyle}
            >
              Continue to Portal
            </button>
            <button 
              onClick={() => router.push('/leaderboard')}
              style={{
                ...buttonStyle,
                backgroundColor: '#FFD700',
                color: '#000',
                fontWeight: 'bold'
              }}
            >
              🏆 Leaderboard
            </button>
            <button 
              onClick={logout}
              style={{
                ...buttonStyle,
                backgroundColor: '#8B0000'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {isEnteringPortal && <PortalAnimation />}
    
      <main style={{ padding: '2rem' }}>
        <div style={formStyle}>
          <h1 style={{ textAlign: 'center' }}>Welcome to TechX Feedback</h1>
          <p style={{ textAlign: 'center', color: '#555', marginBottom: '2rem' }}>Please enter your details to continue</p>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Name..." value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} required />
            
            {/* 2. Replace the department input with a select dropdown */}
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={inputStyle}
              required
            >
              <option value="" disabled>Select Department...</option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <input type="email" placeholder="Email..." value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
            <button type="submit" style={buttonStyle}>
              Enter Portal
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
