import React, { useState } from 'react';
import {
  Bell, X, Clock, Radio, Activity, AlertTriangle, CheckSquare,
  MessageSquare, ArrowRight, ShieldCheck, User, MapPin
} from 'lucide-react';
import { OperationalEvent } from '../types';
import { ChatMessage } from '../hooks/useChatStore';
import { getEventCategory, getEventDept } from './MiddleColumn';

interface TelemetryBellDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: string[];
  events?: OperationalEvent[];
  messages?: ChatMessage[];
  unreadMessagesCount?: number;
  onSelectPendingEvent?: (e: OperationalEvent) => void;
  onNavigateToMessages?: () => void;
}

export const TelemetryBellDrawer: React.FC<TelemetryBellDrawerProps> = ({
  isOpen,
  onClose,
  notifications = [],
  events = [],
  messages = [],
  unreadMessagesCount = 0,
  onSelectPendingEvent,
  onNavigateToMessages,
}) => {
  if (!isOpen) return null;

  // Filter pending approvals (Tab 1 requisitions)
  const pendingApprovals = events.filter(e => getEventCategory(e) === 1);
  const opNotifs = notifications.filter(n => !n.includes('INITIAL_SNAPSHOT'));

  const [activeTab, setActiveTab] = useState<'pending' | 'messages' | 'telemetry'>(
    pendingApprovals.length > 0 ? 'pending' : (unreadMessagesCount > 0 ? 'messages' : 'pending')
  );

  const getDeptColor = (dept: string) => {
    switch (dept) {
      case 'OHE': return { bg: '#FEF3C7', border: '#FDE68A', text: '#B45309' };
      case 'CIVIL_P_WAY': return { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' };
      case 'S_AND_T': return { bg: '#F3E8FF', border: '#E9D5FF', text: '#7E22CE' };
      case 'MECHANICAL_CW': return { bg: '#FFEDD5', border: '#FED7AA', text: '#C2410C' };
      case 'SAFETY': return { bg: '#FEE2E2', border: '#FECACA', text: '#DC2626' };
      default: return { bg: '#F1F5F9', border: '#E2E8F0', text: '#475569' };
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        className="slide-in-right"
        style={{
          width: 440,
          maxWidth: '100%',
          height: '100%',
          background: '#FFFFFF',
          borderLeft: '1px solid #CBD5E1',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          style={{
            height: 60,
            padding: '0 20px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            background: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: '#EFF6FF',
                border: '1.5px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={16} color="#2563EB" />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
                Notifications &amp; Alerts
                {(pendingApprovals.length > 0 || unreadMessagesCount > 0) && (
                  <span
                    style={{
                      background: '#DC2626',
                      color: '#FFFFFF',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 10,
                    }}
                  >
                    {pendingApprovals.length + unreadMessagesCount}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: '#64748B' }}>
                Pending statutory approvals &amp; departmental messages
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 7,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
            onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}
            title="Close notifications"
          >
            <X size={15} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            padding: '4px 12px 0',
            gap: 6,
          }}
        >
          <button
            onClick={() => setActiveTab('pending')}
            style={{
              flex: 1,
              padding: '10px 8px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'pending' ? '2px solid #2563EB' : '2px solid transparent',
              color: activeTab === 'pending' ? '#1D4ED8' : '#64748B',
              fontSize: 12,
              fontWeight: activeTab === 'pending' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            <CheckSquare size={14} color={activeTab === 'pending' ? '#2563EB' : '#64748B'} />
            <span>Pending Approvals</span>
            {pendingApprovals.length > 0 && (
              <span
                style={{
                  background: activeTab === 'pending' ? '#2563EB' : '#E2E8F0',
                  color: activeTab === 'pending' ? '#FFFFFF' : '#475569',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 10,
                }}
              >
                {pendingApprovals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            style={{
              flex: 1,
              padding: '10px 8px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'messages' ? '2px solid #2563EB' : '2px solid transparent',
              color: activeTab === 'messages' ? '#1D4ED8' : '#64748B',
              fontSize: 12,
              fontWeight: activeTab === 'messages' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            <MessageSquare size={14} color={activeTab === 'messages' ? '#2563EB' : '#64748B'} />
            <span>Messages</span>
            {unreadMessagesCount > 0 && (
              <span
                style={{
                  background: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 10,
                }}
              >
                {unreadMessagesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            style={{
              padding: '10px 10px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'telemetry' ? '2px solid #2563EB' : '2px solid transparent',
              color: activeTab === 'telemetry' ? '#1D4ED8' : '#64748B',
              fontSize: 12,
              fontWeight: activeTab === 'telemetry' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              transition: 'all 0.15s ease',
            }}
            title="Live Corridor Telemetry"
          >
            <Radio size={13} color={activeTab === 'telemetry' ? '#2563EB' : '#64748B'} />
            <span>Live Stream</span>
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          
          {/* 1. Pending Approvals Tab */}
          {activeTab === 'pending' && (
            <>
              {pendingApprovals.length === 0 ? (
                <div
                  style={{
                    height: 240,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: 10,
                  }}
                >
                  <ShieldCheck size={36} color="#16A34A" />
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                    All Clear: No Pending Requisitions
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B', maxWidth: 280, lineHeight: 1.5 }}>
                    All statutory requisitions on Danapur corridor have received required clearances.
                  </div>
                </div>
              ) : (
                pendingApprovals.map((e) => {
                  const dept = getEventDept(e);
                  const color = getDeptColor(dept);
                  return (
                    <div
                      key={e.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: '1px solid #E2E8F0',
                        background: '#FFFFFF',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={ev => (ev.currentTarget.style.borderColor = '#93C5FD')}
                      onMouseLeave={ev => (ev.currentTarget.style.borderColor = '#E2E8F0')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              background: color.bg,
                              border: `1px solid ${color.border}`,
                              color: color.text,
                              padding: '2px 7px',
                              borderRadius: 4,
                            }}
                          >
                            {dept}
                          </span>
                          <span style={{ fontSize: 11.5, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#0F172A' }}>
                            {e.id}
                          </span>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#D97706', background: '#FEF3C7', padding: '1px 6px', borderRadius: 4 }}>
                          Awaiting Approval
                        </span>
                      </div>

                      <div style={{ fontSize: 12, color: '#334155', fontWeight: 500, lineHeight: 1.4 }}>
                        {e.description || 'Railway Maintenance Block Requisition'}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#64748B', borderTop: '1px dashed #F1F5F9', paddingTop: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={11} color="#64748B" />
                          <span>{e.track_id || 'MAIN'} • KM {e.km_start}–{e.km_end}</span>
                        </div>
                        <button
                          onClick={() => {
                            onClose();
                            if (onSelectPendingEvent) onSelectPendingEvent(e);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '4px 10px',
                            borderRadius: 6,
                            background: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            color: '#1D4ED8',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={ev => (ev.currentTarget.style.background = '#DBEAFE')}
                          onMouseLeave={ev => (ev.currentTarget.style.background = '#EFF6FF')}
                        >
                          <span>Review &amp; Approve</span>
                          <ArrowRight size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* 2. Messages Tab */}
          {activeTab === 'messages' && (
            <>
              {messages.length === 0 ? (
                <div
                  style={{
                    height: 240,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: 10,
                  }}
                >
                  <MessageSquare size={36} color="#CBD5E1" />
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                    No Messages Yet
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B', maxWidth: 260, lineHeight: 1.5 }}>
                    Station Master clarification queries and departmental dispatches will appear here.
                  </div>
                </div>
              ) : (
                messages.slice(0, 15).map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => {
                      onClose();
                      if (onNavigateToMessages) onNavigateToMessages();
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1px solid #E2E8F0',
                      background: msg.status === 'delivered' ? '#F8FAFC' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={ev => (ev.currentTarget.style.borderColor = '#93C5FD')}
                    onMouseLeave={ev => (ev.currentTarget.style.borderColor = '#E2E8F0')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>
                          {msg.sender}
                        </span>
                        {msg.department && (
                          <span style={{ fontSize: 9.5, fontWeight: 600, background: '#EFF6FF', color: '#1D4ED8', padding: '1px 5px', borderRadius: 4 }}>
                            {msg.department}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'monospace' }}>
                        {msg.timestamp}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.4 }}>
                      {msg.text}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: '#2563EB', display: 'flex', alignItems: 'center', gap: 3 }}>
                        Reply in Messages Desk <ArrowRight size={10} />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* 3. Live Telemetry Stream Tab */}
          {activeTab === 'telemetry' && (
            <>
              {opNotifs.length === 0 ? (
                <div
                  style={{
                    height: 240,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: 10,
                  }}
                >
                  <Activity size={36} color="#CBD5E1" />
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                    No Telemetry Events Yet
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B', maxWidth: 240, lineHeight: 1.5 }}>
                    Real-time WebSocket events from the corridor will stream here.
                  </div>
                </div>
              ) : (
                opNotifs.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      background: '#FFFFFF',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4, fontSize: 10, fontFamily: 'monospace', color: '#2563EB' }}>
                      <Clock size={10} /> Live Telemetry
                    </div>
                    <p style={{ margin: 0, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#334155', lineHeight: 1.5, wordBreak: 'break-word' }}>
                      {item}
                    </p>
                  </div>
                ))
              )}
            </>
          )}

        </div>

        {/* Footer */}
        <div
          style={{
            padding: '10px 20px',
            borderTop: '1px solid #E2E8F0',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            color: '#64748B',
          }}
        >
          <span>RailSync Station Master Control</span>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#94A3B8' }}>Danapur Division (ECR)</span>
        </div>
      </div>
    </div>
  );
};
