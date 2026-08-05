import React, { useState } from 'react';
import {
  ArrowLeft,
  Shield,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Database,
  Server,
  Activity,
  Search,
  Check,
  Zap,
  RefreshCw,
  HardDrive,
  Cpu,
  Smartphone,
  CheckCheck,
  FileCode,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PullToRefresh } from '../components/common/PullToRefresh';

export const AdminView: React.FC = () => {
  const { goBack, openSuccessModal, refreshData, campaigns, groups } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'verifications' | 'infrastructure'>('overview');

  // Reported items state
  const [reports, setReports] = useState([
    {
      id: 'rep_001',
      resourceType: 'post',
      resourceId: 'pst_001',
      author: 'Civic_Troll_99',
      reason: 'Harassment or bullying',
      details: 'Repeated offensive remarks in Nakivubo channel',
      timestamp: '15 mins ago',
      status: 'pending',
    },
    {
      id: 'rep_002',
      resourceType: 'campaign',
      resourceId: 'cmp_003',
      author: 'Anon_User_42',
      reason: 'False or misleading information',
      details: 'Unverified budget numbers for borehole renovation',
      timestamp: '1 hour ago',
      status: 'pending',
    },
    {
      id: 'rep_003',
      resourceType: 'user',
      resourceId: 'usr_888',
      author: 'Spam_Bot_01',
      reason: 'Spam',
      details: 'Automated referral link posting across groups',
      timestamp: '3 hours ago',
      status: 'pending',
    },
  ]);

  // Verification requests state
  const [verificationQueue, setVerificationQueue] = useState([
    {
      id: 'ver_001',
      name: 'David Musoke',
      role: 'Community Leader',
      organization: 'Kampala Youth Environmental Initiative',
      submittedAt: 'Yesterday',
      docType: 'National ID & NGO License',
    },
    {
      id: 'ver_002',
      name: 'Dr. Jane Kigozi',
      role: 'Health Advocate',
      organization: 'Uganda Public Health Volunteers',
      submittedAt: '2 days ago',
      docType: 'Medical Council Certification',
    },
  ]);

  const [infraLogFilter, setInfraLogFilter] = useState('');

  const handleDismissReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    openSuccessModal('Report Dismissed', 'The report flag has been cleared without taking penalty action.');
  };

  const handleTakeDown = (id: string, resourceType: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    openSuccessModal('Content Removed', `The reported ${resourceType} was taken down and moderation notification sent.`);
  };

  const handleApproveVerification = (id: string, name: string) => {
    setVerificationQueue((prev) => prev.filter((v) => v.id !== id));
    openSuccessModal('Verification Approved', `${name} has been granted verified civic leader badge.`);
  };

  const handleRejectVerification = (id: string) => {
    setVerificationQueue((prev) => prev.filter((v) => v.id !== id));
    openSuccessModal('Verification Rejected', 'Request rejected. Feedback sent to user.');
  };

  return (
    <PullToRefresh onRefresh={refreshData} className="min-h-full">
      <div className="p-4 sm:p-6 space-y-5 pb-28 max-w-md mx-auto text-slate-300 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={goBack}
              className="p-2 rounded-xl bg-[#0F1219] text-slate-400 hover:text-white border border-slate-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" /> Admin Command Centre
              </h1>
              <p className="text-[10px] text-slate-500 font-mono">Platform Moderation & System Metrics</p>
            </div>
          </div>
          <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE
          </span>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-[#0F1219] rounded-2xl border border-slate-800 text-[11px] font-mono">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'reports', label: `Queue (${reports.length})`, icon: AlertTriangle },
            { id: 'verifications', label: `Verify (${verificationQueue.length})`, icon: CheckCircle2 },
            { id: 'infrastructure', label: 'Infra', icon: Server },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="truncate max-w-full">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Vital Stats Cards */}
            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="bg-[#0F1219] p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Active Campaigns</span>
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <p className="text-xl font-bold text-white">{campaigns.length}</p>
                <p className="text-[10px] text-emerald-400">+12% this week</p>
              </div>

              <div className="bg-[#0F1219] p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Community Groups</span>
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <p className="text-xl font-bold text-white">{groups.length}</p>
                <p className="text-[10px] text-emerald-400">100% active</p>
              </div>

              <div className="bg-[#0F1219] p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Pending Reports</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-xl font-bold text-amber-400">{reports.length}</p>
                <p className="text-[10px] text-slate-500">Requires review</p>
              </div>

              <div className="bg-[#0F1219] p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Redis Cache Hit</span>
                  <Zap className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <p className="text-xl font-bold text-teal-400">99.4%</p>
                <p className="text-[10px] text-slate-500">Sub-millisecond latency</p>
              </div>
            </div>

            {/* Quick Action Hub */}
            <div className="bg-[#0F1219] p-4 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Admin Health Controls
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  onClick={() => openSuccessModal('Cache Flushed', 'Redis feed key cache cleared and recalculated.')}
                  className="p-3 bg-[#0A0C10] hover:bg-slate-800 border border-slate-800 rounded-xl text-left space-y-1 transition-colors"
                >
                  <div className="flex items-center gap-2 text-blue-400 font-bold">
                    <RefreshCw className="w-3.5 h-3.5" /> Purge Feed Cache
                  </div>
                  <p className="text-[10px] text-slate-500">Recalculate ranking metrics</p>
                </button>

                <button
                  onClick={() => openSuccessModal('Indices Optimized', 'PostgreSQL campaign and member B-Tree indexes analyzed.')}
                  className="p-3 bg-[#0A0C10] hover:bg-slate-800 border border-slate-800 rounded-xl text-left space-y-1 transition-colors"
                >
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Database className="w-3.5 h-3.5" /> Analyze PG Indexes
                  </div>
                  <p className="text-[10px] text-slate-500">Reindex queries</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MODERATION REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Flagged Items Requiring Action</span>
              <span className="text-slate-500">{reports.length} total</span>
            </div>

            {reports.length === 0 ? (
              <div className="p-8 text-center bg-[#0F1219] rounded-2xl border border-slate-800 space-y-2">
                <CheckCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-white">All Reports Cleared</p>
                <p className="text-[11px] text-slate-500">Community safety guidelines are well maintained.</p>
              </div>
            ) : (
              reports.map((r) => (
                <div key={r.id} className="bg-[#0F1219] p-4 rounded-2xl border border-slate-800 space-y-3 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold uppercase">
                      {r.resourceType} report
                    </span>
                    <span className="text-[10px] text-slate-500">{r.timestamp}</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white">{r.reason}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{r.details}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Reported User: @{r.author}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleDismissReport(r.id)}
                      className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs"
                    >
                      Dismiss Flag
                    </button>
                    <button
                      onClick={() => handleTakeDown(r.id, r.resourceType)}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-red-900/40"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Take Down
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: VERIFICATION QUEUE */}
        {activeTab === 'verifications' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Civic Badge Identity Applications</span>
              <span className="text-slate-500">{verificationQueue.length} pending</span>
            </div>

            {verificationQueue.length === 0 ? (
              <div className="p-8 text-center bg-[#0F1219] rounded-2xl border border-slate-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-blue-400 mx-auto" />
                <p className="text-xs font-bold text-white">No Pending Verification Requests</p>
                <p className="text-[11px] text-slate-500">All identity applications have been processed.</p>
              </div>
            ) : (
              verificationQueue.map((v) => (
                <div key={v.id} className="bg-[#0F1219] p-4 rounded-2xl border border-slate-800 space-y-3 font-mono">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {v.name} <span className="text-[10px] text-blue-400">({v.role})</span>
                      </h4>
                      <p className="text-[10px] text-slate-400">{v.organization}</p>
                    </div>
                    <span className="text-[10px] text-slate-500">{v.submittedAt}</span>
                  </div>

                  <div className="p-2.5 bg-[#0A0C10] rounded-xl border border-slate-800 text-[10px] text-slate-300 flex items-center justify-between">
                    <span className="text-slate-400">Attached Proof:</span>
                    <span className="font-bold text-teal-400">{v.docType}</span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleRejectVerification(v.id)}
                      className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveVerification(v.id, v.name)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-blue-900/40"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve Badge
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: INFRASTRUCTURE & BACKEND HEALTH */}
        {activeTab === 'infrastructure' && (
          <div className="space-y-4 font-mono text-xs">
            {/* Database & Service Nodes Status */}
            <div className="bg-[#0F1219] p-4 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-400" /> Database & Cluster Topology
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-[#0A0C10] rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="font-bold text-white text-[11px]">PostgreSQL 16 Primary</p>
                      <p className="text-[9px] text-slate-500">Indexed Relational Store</p>
                    </div>
                  </div>
                  <span className="text-emerald-400 text-[10px] font-bold">HEALTHY (14/50 Conns)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#0A0C10] rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="font-bold text-white text-[11px]">Cassandra Cluster (3 Nodes)</p>
                      <p className="text-[9px] text-slate-500">Distributed Discussion Logs</p>
                    </div>
                  </div>
                  <span className="text-emerald-400 text-[10px] font-bold">NORMAL (QUORUM)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#0A0C10] rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-teal-400" />
                    <div>
                      <p className="font-bold text-white text-[11px]">Redis Cluster (Memory 256MB)</p>
                      <p className="text-[9px] text-slate-500">Pub/Sub & Rate Limiter</p>
                    </div>
                  </div>
                  <span className="text-emerald-400 text-[10px] font-bold">ACTIVE (1,420 Keys)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#0A0C10] rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="font-bold text-white text-[11px]">PWA Service Worker</p>
                      <p className="text-[9px] text-slate-500">Offline Shell & Sync Engine</p>
                    </div>
                  </div>
                  <span className="text-emerald-400 text-[10px] font-bold">REGISTERED (v1.4)</span>
                </div>
              </div>
            </div>

            {/* Microservice Query Log Feed */}
            <div className="bg-[#0F1219] p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-teal-400" /> Live Audit Logs
                </h3>
                <span className="text-[9px] text-slate-500">Auto-scrolling</span>
              </div>

              <div className="bg-[#0A0C10] p-3 rounded-xl border border-slate-800 h-36 overflow-y-auto space-y-1.5 text-[10px] text-slate-400">
                <p><span className="text-blue-400">[POSTGRES]</span> SELECT * FROM campaigns WHERE category='Environment' (4ms)</p>
                <p><span className="text-purple-400">[CASSANDRA]</span> INSERT INTO discussion_posts (group_id, post_id, body) VALUES ('grp_001', ...) (2ms)</p>
                <p><span className="text-teal-400">[REDIS]</span> GET feed:campaigns:trending &gt; HIT (0.4ms)</p>
                <p><span className="text-amber-400">[PWA_SW]</span> Fetch event hijacked for /offline.html fallback (cached)</p>
                <p><span className="text-emerald-400">[AUTH_MW]</span> Bearer token verified for usr_001 (role: leader)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PullToRefresh>
  );
};
