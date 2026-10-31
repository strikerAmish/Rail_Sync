import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Bell, Radio, CheckCircle2, LogOut, User,
  ShieldCheck, Clock, MapPin, Activity, X, Zap, ArrowRight,
  SlidersHorizontal, Check, Plus
} from 'lucide-react';
import { OperationalEvent } from '../types';
import { getEventCategory } from './MiddleColumn';
import { TelemetryBellDrawer } from './TelemetryBellDrawer';
import { CORRIDOR_SECTIONS } from '../data/corridorData';

interface TopHeaderProps {
  events: OperationalEvent[];
  selectedEvent: OperationalEvent | null;
  ambientNotifications: string[];
  activeView: 'workspace' | 'audit' | 'overview' | 'today' | 'chaos' | 'messages';
  selectedSectionId: string;
  onSelectSection?: (secId: string) => void;
  onLogout?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onOpenNewRequisition?: () => void;
  onOpenWorkRequest?: () => void;
  workRequestBtnRef?: React.RefObject<HTMLButtonElement | null>;
  unreadMessagesCount?: number;
  currentUser?: { username: string; name: string; role: string; station: string } | null;
  onSelectEvent?: (e: OperationalEvent) => void;
  onNavigateMessages?: () => void;
  messages?: any[];
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  events = [],
  selectedEvent,
  ambientNotifications,
  activeView,
  selectedSectionId,
  onSelectSection,
  onLogout,
  searchQuery = '',
  onSearchChange,
  onOpenNewRequisition,
  onOpenWorkRequest,
  workRequestBtnRef,
  unreadMessagesCount = 0,
  currentUser,
  onSelectEvent,
  onNavigateMessages,
  messages = [],
}) => {
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = currentUser?.name || 'IIT_Patna';
  const displayRole = currentUser?.role || 'Station Master Desk';
  const displayInitials = displayName
    .split(/[\s_]+/)
    .filter(Boolean)
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'IP';

  const opNotifs = ambientNotifications.filter(n => !n.includes('INITIAL_SNAPSHOT'));
  const pendingCount = events.filter(e => getEventCategory(e) === 1).length;
  const totalAlerts = pendingCount + unreadMessagesCount;


  const sectionObj = CORRIDOR_SECTIONS.find(s => s.id === selectedSectionId);
  const sectionLabel = sectionObj ? sectionObj.shortName : 'All Sections';


  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header
        style={{
          height: 56,
          flexShrink: 0,
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          gap: 16,
          zIndex: 30,
        }}
      >
        {/* ── Left: Dynamic Context Path (Clutter-Free) ────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {activeView === 'workspace' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                Station Master Decision Portal
              </span>
              {selectedEvent && (
                <>
                  <span style={{ color: '#CBD5E1', fontSize: 12 }}>/</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: '#475569',
                      fontWeight: 600,
                    }}
                  >
                    {selectedEvent.id}
                  </span>
                </>
              )}
            </div>
          )}

          {activeView === 'audit' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                Statutory Audit Ledger
              </span>
              <span style={{ color: '#CBD5E1', fontSize: 12 }}>/</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#065F46',
                  background: '#ECFDF5',
                  padding: '2px 8px',
                  borderRadius: 6,
                  border: '1px solid #A7F3D0',
                }}
              >
                S3 WORM Legal Hold Active
              </span>
            </div>
          )}

          {activeView === 'overview' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                Corridor Operations Overview
              </span>
              <span style={{ color: '#CBD5E1', fontSize: 12 }}>/</span>
              <span style={{ fontSize: 12, color: '#64748B' }}>
                Danapur &amp; DDU Division (ECR)
              </span>
            </div>
          )}

          {activeView === 'today' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                Today at a glance
              </span>
            </div>
          )}

          {activeView === 'chaos' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                SRE &amp; Chaos Suite
              </span>
            </div>
          )}



          {activeView === 'messages' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                Messages
              </span>
              <span style={{ color: '#CBD5E1', fontSize: 12 }}>/</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#1D4ED8',
                  background: '#EFF6FF',
                  padding: '2px 8px',
                  borderRadius: 6,
                  border: '1px solid #BFDBFE',
                }}
              >
                Two-Way Station Master Clarification Desk
              </span>
            </div>
          )}
        </div>

        {/* ── Center: Search + Section Dropdown on the Right of Search ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260, maxWidth: 540 }}>
          {/* Search bar */}
          <div
            className="search-bar"
            style={{
              flex: 1,
              minWidth: 180,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 12px',
              height: 38,
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <Search size={14} color="#64748B" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by Event ID, Section, Dept, Station..."
              id="global-search"
              value={searchQuery || ''}
              onChange={e => onSearchChange && onSearchChange(e.target.value)}
              style={{
                flex: 1,
                minWidth: 80,
                border: 'none',
                outline: 'none',
                fontSize: 12.5,
                background: 'transparent',
                color: '#0F172A',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange && onSearchChange('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#94A3B8' }}
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Section Dropdown on the Right of Search */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <MapPin size={13} color="#2563EB" style={{ position: 'absolute', left: 10, pointerEvents: 'none' }} />
            <select
              value={selectedSectionId}
              onChange={e => onSelectSection && onSelectSection(e.target.value)}
              id="header-section-filter"
              style={{
                height: 38,
                paddingLeft: 30,
                paddingRight: 12,
                borderRadius: 8,
                border: '1.5px solid #BFDBFE',
                background: '#EFF6FF',
                color: '#1D4ED8',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
                maxWidth: 220,
              }}
              title="Corridor Section Filter"
            >
              {CORRIDOR_SECTIONS.map(s => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Right: Live Feed + Bell + Profile ────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {/* Work Request Action Button */}
          {(onOpenWorkRequest || onOpenNewRequisition) && (
            <button
              ref={workRequestBtnRef}
              onClick={onOpenWorkRequest || onOpenNewRequisition}
              id="top-work-request-btn"
              role="button"
              aria-label="Create Work Request"
              aria-haspopup="dialog"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '0 13px',
                height: 34,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}
              title="Create new Work Request (Statutory Approval Wizard)"
            >
              <Plus size={15} color="#fff" strokeWidth={2.5} />
              <span>Work Request</span>
            </button>
          )}

          

          {/* Notification Bell */}
          <button
            onClick={() => setBellOpen(true)}
            style={{
              position: 'relative',
              width: 36,
              height: 36,
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#F8FAFC';
              (e.currentTarget as HTMLElement).style.borderColor = '#CBD5E1';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '#FFFFFF';
              (e.currentTarget as HTMLElement).style.borderColor = '#E2E8F0';
            }}
            title="Notifications"
            id="notification-bell"
          >
            <Bell size={16} color="#475569" />
            {totalAlerts > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  minWidth: 16,
                  height: 16,
                  padding: '0 4px',
                  borderRadius: 10,
                  background: unreadMessagesCount > 0 ? '#DC2626' : '#2563EB',
                  border: '2px solid #FFFFFF',
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {totalAlerts > 9 ? '9+' : totalAlerts}
              </span>
            )}
          </button>

          {/* ── Interactive Profile Block with Dropdown ── */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <div
              onClick={() => setProfileOpen(!profileOpen)}
              id="user-profile-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '4px 10px',
                borderRadius: 8,
                border: profileOpen ? '1px solid #2563EB' : '1px solid #E2E8F0',
                background: profileOpen ? '#EFF6FF' : '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                if (!profileOpen) e.currentTarget.style.borderColor = '#CBD5E1';
              }}
              onMouseLeave={e => {
                if (!profileOpen) e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                {displayInitials}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                  {displayName}
                </div>
                <div style={{ fontSize: 10, color: '#64748B', lineHeight: 1.2 }}>
                  {displayRole}
                </div>
              </div>
            </div>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: 290,
                  background: '#FFFFFF',
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  padding: 14,
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: '1px solid #E2E8F0' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#fff',
                    }}
                  >
                    {displayInitials}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                      {displayName}
                    </div>
                    <div style={{ fontSize: 11, color: '#2563EB', fontWeight: 600 }}>
                      {displayRole}
                    </div>
                    <div style={{ fontSize: 10, color: '#64748B' }}>
                      Operating ID: ECR-SM-5481
                    </div>
                  </div>
                </div>

                {/* Duty Details */}
                <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '10px 12px', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                    <MapPin size={12} color="#2563EB" />
                    <span>Station: <strong>Patna Jn &amp; Danapur Control</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                    <ShieldCheck size={12} color="#16A34A" />
                    <span>Desk: <strong>Interlocking &amp; Block Panel #01</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                    <Clock size={12} color="#D97706" />
                    <span>Shift: <strong>Day Shift (08:00 – 16:00 hrs)</strong></span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (onLogout) onLogout();
                  }}
                  id="logout-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 7,
                    border: '1px solid #FECACA',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#DC2626';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#FEF2F2';
                    e.currentTarget.style.color = '#DC2626';
                  }}
                >
                  <LogOut size={13} />
                  Sign Out / Switch Operator
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      

      <TelemetryBellDrawer
        isOpen={bellOpen}
        onClose={() => setBellOpen(false)}
        notifications={ambientNotifications}
        events={events}
        messages={messages}
        unreadMessagesCount={unreadMessagesCount}
        onSelectPendingEvent={(evt) => {
          setBellOpen(false);
          if (onSelectEvent) onSelectEvent(evt);
        }}
        onNavigateToMessages={() => {
          setBellOpen(false);
          if (onNavigateMessages) onNavigateMessages();
        }}
      />
    </>
  );
};
