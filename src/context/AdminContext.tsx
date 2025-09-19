'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface Admin {
  username: string;
  isAuthenticated: boolean;
}

interface AdminContextType {
  admin: Admin | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Admin credentials
const ADMIN_CREDENTIALS = {
  username: 'vcet-nsdc',
  password: 'AIDS@2025'
};

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing admin session on mount
  useEffect(() => {
    const checkStoredAdmin = () => {
      try {
        const storedAdmin = localStorage.getItem('admin_session');
        const sessionTimestamp = localStorage.getItem('admin_session_timestamp');
        
        if (storedAdmin && sessionTimestamp) {
          const adminData = JSON.parse(storedAdmin);
          const timestamp = parseInt(sessionTimestamp);
          const now = Date.now();
          const sessionTimeout = 12 * 60 * 60 * 1000; // 12 hours (half a day)
          
          // Check if session is still valid
          if (now - timestamp < sessionTimeout) {
            setAdmin(adminData);
          } else {
            // Session expired, clear it
            localStorage.removeItem('admin_session');
            localStorage.removeItem('admin_session_timestamp');
          }
        }
      } catch (error) {
        console.error('Error restoring admin session:', error);
        localStorage.removeItem('admin_session');
        localStorage.removeItem('admin_session_timestamp');
      } finally {
        setIsLoading(false);
      }
    };

    checkStoredAdmin();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const adminData = { username, isAuthenticated: true };
        setAdmin(adminData);
        localStorage.setItem('admin_session', JSON.stringify(adminData));
        localStorage.setItem('admin_session_timestamp', Date.now().toString());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error during admin login:', error);
      return false;
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_session_timestamp');
  };

  const isAdmin = admin?.isAuthenticated === true;

  return (
    <AdminContext.Provider value={{ admin, login, logout, isAdmin, isLoading }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
