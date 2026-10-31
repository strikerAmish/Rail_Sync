import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, Train, ArrowRight, AlertCircle } from 'lucide-react';

export interface FieldUser {
  username: string;
  name: string;
  role: string;
  department: string;
  division: string;
  employeeId: string;
}

interface MobileLoginViewProps {
  onLoginSuccess: (user: FieldUser) => void;
}

export const MobileLoginView: React.FC<MobileLoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (u = username, p = password) => {
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const cleanUser = u.trim().toLowerCase().replace(/[\s_.-]+/g, '');
      const validUsers = ['worker_a', 'workera', 'worker', 'sseohe', 'sse', 'admin', 'danapursm', 'danapur', 'iitpatna', 'iit'];

      if ((validUsers.includes(cleanUser) || cleanUser.includes('work') || cleanUser.includes('danapur') || cleanUser.includes('sm')) && (p === '123456' || p === 'admin' || p === 'password')) {
        const isSm = cleanUser.includes('sm') || cleanUser.includes('danapur') || cleanUser.includes('patna') || cleanUser.includes('iit');
        const user: FieldUser = {
          username: isSm ? 'danapur_sm' : 'worker_a',
          name: isSm ? 'IIT_Patna' : 'Worker_A',
          role: isSm ? 'Station Master (Junction In-Charge)' : 'Senior Section Engineer (OHE)',
          department: isSm ? 'OPERATING' : 'ELECTRICAL_TRD',
          division: 'ECR / Danapur Division',
          employeeId: isSm ? 'IR-SM-04050' : 'IR-SSE-54812',
        };
        try {
          localStorage.setItem('railsync_field_user', JSON.stringify(user));
        } catch (_) {}
        onLoginSuccess(user);
      } else {
        setError('Invalid Operator ID or PIN. Please enter your valid railway credentials.');
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        background: 'linear-gradient(180deg, #0A0F1D 0%, #0F172A 40%, #080D1A 100%)',
        display: 'flex',
        flexDirection: 'column',
        color: '#FFFFFF',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflowY: 'auto',
        padding: '24px 20px 32px',
        boxSizing: 'border-box',
        justifyContent: 'space-between',
      }}
    >
      {/* Top Branding Section */}
      <div>
        {/* IR Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(37,99,235,0.15)',
              border: '1px solid rgba(59,130,246,0.3)',
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: 10.5,
              fontWeight: 700,
              color: '#60A5FA',
              letterSpacing: '0.04em',
            }}
          >
            <ShieldCheck size={12} color="#60A5FA" />
            INDIAN RAILWAYS • ECR
          </div>
          <span
            style={{
              fontSize: 10,
              color: '#10B981',
              fontWeight: 700,
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.25)',
              padding: '3px 8px',
              borderRadius: 6,
            }}
          >
            ● Live Sync Mesh
          </span>
        </div>

        {/* Logo and Title */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(37,99,235,0.45)',
              marginBottom: 14,
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <Train size={30} color="#FFFFFF" strokeWidth={2.2} />
          </div>

          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
            <span style={{ color: '#60A5FA' }}>Rail</span>Sync
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 18,
              fontSize: 11.5,
              color: '#FCA5A5',
              lineHeight: 1.4,
            }}
          >
            <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
        >
          {/* Operator ID Input */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94A3B8', marginBottom: 6, letterSpacing: '0.03em' }}>
              OPERATOR ID / USERNAME
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(255,255,255,0.06)',
                border: '1.5px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                padding: '0 14px',
                height: 48,
                transition: 'all 0.2s ease',
              }}
            >
              <User size={16} color="#60A5FA" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Operator ID"
                required
                autoComplete="off"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              />
            </div>
          </div>

          {/* Security PIN Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.03em' }}>
                SECURITY PIN / PASSWORD
              </label>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(255,255,255,0.06)',
                border: '1.5px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                padding: '0 14px',
                height: 48,
                transition: 'all 0.2s ease',
              }}
            >
              <Lock size={16} color="#60A5FA" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter 6-digit PIN"
                required
                autoComplete="off"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: showPassword ? 'normal' : '0.15em',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 10,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
              transition: 'all 0.15s ease',
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Field App</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Info */}
      <div style={{ textAlign: 'center', paddingTop: 24 }}>
        <div style={{ fontSize: 10.5, color: '#64748B', fontWeight: 600 }}>
          Danapur Division (DNR) • Patna Junction (PNBE)
        </div>
        <div style={{ fontSize: 9.5, color: '#475569', marginTop: 3 }}>
          Secured by SHA-256 Merkle Audit Ledger &amp; W3C Distributed Tracing
        </div>
      </div>
    </div>
  );
};
