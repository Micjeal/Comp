import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Upload, Megaphone, ShieldCheck, FileText, Check, AlertCircle, Users, Calendar, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { CampaignCategory, GoalType } from '../types';

export const CreateWizardView: React.FC = () => {
  const {
    goBack,
    createCampaign,
    createGroup,
    createEvent,
    setCurrentView,
    openSuccessModal,
    setActiveCampaignId,
    setActiveGroupId,
    setActiveEventId,
  } = useApp();
  const { user } = useAuth();

  // Creation Type: campaign | group | event
  const [createType, setCreateType] = useState<'campaign' | 'group' | 'event'>('campaign');
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Common Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CampaignCategory>('Environment');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Kampala, Uganda');
  const [isOnline, setIsOnline] = useState(false);
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000');

  // Campaign Goal State
  const [goalType, setGoalType] = useState<GoalType>('signatures');
  const [goalValue, setGoalValue] = useState<number>(500);
  const [unitLabel, setUnitLabel] = useState('signatures');

  // Group State
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  // Event State
  const [venue, setVenue] = useState('Community Grounds, Kampala');
  const [startTime, setStartTime] = useState('2026-08-20T09:00');
  const [endTime, setEndTime] = useState('2026-08-20T12:00');
  const [capacity, setCapacity] = useState<number>(100);

  // Safety & Error State
  const [confirmedSafety, setConfirmedSafety] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories: CampaignCategory[] = [
    'Education',
    'Environment',
    'Health',
    'Youth',
    'Community support',
    'Culture',
    'Volunteering',
    'Human Rights',
  ];

  const goalTypes: { type: GoalType; label: string; desc: string }[] = [
    { type: 'signatures', label: 'Petitions & Signatures', desc: 'Collect verified citizen petition signers' },
    { type: 'volunteers', label: 'Volunteer Mobilization', desc: 'Recruit community cleanup or event volunteers' },
    { type: 'attendance', label: 'Event Attendance', desc: 'Organize workshops, rallies, or town halls' },
    { type: 'fundraising', label: 'Community Fundraising', desc: 'Raise funds for local public primary school equipment' },
    { type: 'awareness', label: 'Civic Awareness', desc: 'Promote public literacy, environmental awareness' },
  ];

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title/name.');
      return;
    }
    setError(null);
    if (createType === 'campaign') {
      setStep(2);
    } else {
      setStep(3); // Direct review & save
    }
  };

  const handlePublish = async () => {
    if (!confirmedSafety) {
      setError('You must confirm that this creation complies with Community Safety & Anti-Discrimination Standards.');
      return;
    }

    if (createType === 'campaign') {
      const newCampaign = await createCampaign({
        title,
        category,
        summary: summary || title,
        description,
        location,
        isOnline,
        coverUrl,
        goalType,
        goalValue,
        unitLabel,
        ownerId: user?.id,
        ownerName: user?.fullName,
        ownerAvatar: user?.avatarUrl,
        organizerName: user?.fullName,
        organizerAvatar: user?.avatarUrl,
      });

      setActiveCampaignId(newCampaign.id);
      openSuccessModal(
        'Campaign Created & Stored!',
        'Your civic campaign is now safely saved in the database and visible to community supporters.',
        'View My Campaign',
        () => setCurrentView('campaign-detail')
      );
    } else if (createType === 'group') {
      const newGroup = await createGroup({
        name: title,
        category,
        description: description || summary || 'Community discussion and action group.',
        location,
        visibility,
        coverUrl,
        ownerId: user?.id,
        adminName: user?.fullName,
      });

      setActiveGroupId(newGroup.id);
      openSuccessModal(
        'Community Group Created & Stored!',
        'Your group is now stored in the database. Members can join and start discussions.',
        'View My Group',
        () => setCurrentView('group-detail')
      );
    } else if (createType === 'event') {
      const newEvent = await createEvent({
        title,
        category,
        description: description || summary || 'Community gathering and interactive event.',
        venue,
        isOnline,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        capacity,
        coverUrl,
        organizerId: user?.id,
        organizerName: user?.fullName,
        organizerAvatar: user?.avatarUrl,
      });

      setActiveEventId(newEvent.id);
      openSuccessModal(
        'Community Event Created & Stored!',
        'Your event is now stored in the database. Community members can register to attend.',
        'View Event Details',
        () => setCurrentView('event-detail')
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-300 p-4 sm:p-6 pb-24 max-w-md mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <button onClick={goBack} className="p-2 rounded-xl bg-[#0F1219] text-slate-400 hover:text-white border border-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold text-white capitalize">Create {createType}</h1>
        <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
          {createType === 'campaign' ? `Step ${step} of 3` : `Step ${step === 1 ? '1' : '2'} of 2`}
        </span>
      </div>

      {/* Creation Type Switcher */}
      {step === 1 && (
        <div className="bg-[#0F1219] p-1.5 rounded-2xl border border-slate-800 grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => {
              setCreateType('campaign');
              setError(null);
            }}
            className={`py-2 px-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
              createType === 'campaign'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Campaign</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCreateType('group');
              setError(null);
            }}
            className={`py-2 px-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
              createType === 'group'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Group</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCreateType('event');
              setError(null);
            }}
            className={`py-2 px-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
              createType === 'event'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Event</span>
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300 shadow-sm shadow-blue-500/50"
          style={{
            width: `${createType === 'campaign' ? (step / 3) * 100 : step === 1 ? 50 : 100}%`,
          }}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Basic Information */}
      {step === 1 && (
        <form onSubmit={handleNextStep1} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              {createType === 'campaign' ? 'Campaign Title' : createType === 'group' ? 'Group Name' : 'Event Title'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                createType === 'campaign'
                  ? 'e.g. Wetland Drainage Cleanup Initiative'
                  : createType === 'group'
                  ? 'e.g. Kampala Eco Youth Network'
                  : 'e.g. Saturday Community Cleanup Town Hall'
              }
              className="w-full p-3 bg-[#0F1219] text-xs text-white placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CampaignCategory)}
              className="w-full p-3 bg-[#0F1219] text-xs text-white rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#0F1219] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {createType === 'campaign' && (
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Short Summary</label>
              <input
                type="text"
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief 1-2 sentence overview for campaign cards..."
                className="w-full p-3 bg-[#0F1219] text-xs text-white placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Detailed Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the background, community goals, and participation plan..."
              className="w-full p-3 bg-[#0F1219] text-xs text-white placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          {createType === 'event' ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Venue / Address</label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Centenary Park Conference Hall"
                  className="w-full p-3 bg-[#0F1219] text-xs text-white rounded-xl border border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Start Time</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2.5 bg-[#0F1219] text-xs font-mono text-white rounded-xl border border-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Max Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#0F1219] text-xs font-mono text-white rounded-xl border border-slate-800"
                  />
                </div>
              </div>
            </div>
          ) : createType === 'group' ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Kampala, Uganda"
                  className="w-full p-3 bg-[#0F1219] text-xs text-white rounded-xl border border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                  className="w-full p-3 bg-[#0F1219] text-xs text-white rounded-xl border border-slate-800"
                >
                  <option value="public">Public (Open Join)</option>
                  <option value="private">Private (Approval Needed)</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Kampala, Uganda"
                  className="w-full p-3 bg-[#0F1219] text-xs text-white rounded-xl border border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Type</label>
                <button
                  type="button"
                  onClick={() => setIsOnline(!isOnline)}
                  className={`w-full p-3 text-xs font-mono font-bold rounded-xl border transition-colors ${
                    isOnline
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-[#0F1219] text-slate-300 border-slate-800'
                  }`}
                >
                  {isOnline ? 'Online / Virtual' : 'Physical Location'}
                </button>
              </div>
            </div>
          )}

          {/* Cover Image URL selector */}
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Cover Image URL</label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="flex-1 p-3 bg-[#0F1219] text-xs text-white rounded-xl border border-slate-800"
              />
              <div className="w-12 h-10 rounded-xl overflow-hidden border border-slate-800 shrink-0">
                <img src={coverUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-500 shadow-lg shadow-blue-900/40 transition-all"
          >
            {createType === 'campaign' ? 'Continue to Goal Setup' : 'Review & Store in Database'}
          </button>
        </form>
      )}

      {/* STEP 2: Goal Configuration (Campaign Only) */}
      {step === 2 && createType === 'campaign' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Select Campaign Goal Type</label>
            <div className="space-y-2">
              {goalTypes.map((gt) => (
                <div
                  key={gt.type}
                  onClick={() => {
                    setGoalType(gt.type);
                    setUnitLabel(gt.type === 'fundraising' ? 'UGX' : gt.type);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    goalType === gt.type
                      ? 'bg-blue-500/10 border-blue-500 text-white shadow-sm'
                      : 'bg-[#0F1219] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-white">{gt.label}</p>
                    {goalType === gt.type && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{gt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Target Value</label>
              <input
                type="number"
                value={goalValue}
                onChange={(e) => setGoalValue(Number(e.target.value))}
                className="w-full p-3 bg-[#0F1219] text-xs font-mono font-bold text-white rounded-xl border border-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Unit Label</label>
              <input
                type="text"
                value={unitLabel}
                onChange={(e) => setUnitLabel(e.target.value)}
                placeholder="e.g. signatures / UGX"
                className="w-full p-3 bg-[#0F1219] text-xs font-mono font-bold text-white rounded-xl border border-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 bg-[#0F1219] text-slate-300 rounded-xl border border-slate-800 font-bold text-xs hover:bg-slate-800"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-500 shadow-lg shadow-blue-900/40"
            >
              Review Campaign
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Safety Compliance */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-[#0F1219] p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                {category}
              </span>
              <span className="text-xs font-mono text-slate-400 capitalize">{createType}</span>
            </div>

            <h3 className="text-base font-bold text-white">{title || `Untitled ${createType}`}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{description || summary}</p>

            {createType === 'campaign' && (
              <div className="p-3 bg-[#0A0C10] rounded-xl border border-slate-800 text-xs font-mono text-blue-400">
                Target Goal: {goalValue} {unitLabel}
              </div>
            )}
            {createType === 'group' && (
              <div className="p-3 bg-[#0A0C10] rounded-xl border border-slate-800 text-xs font-mono text-purple-400">
                Visibility: {visibility} • Location: {location}
              </div>
            )}
            {createType === 'event' && (
              <div className="p-3 bg-[#0A0C10] rounded-xl border border-slate-800 text-xs font-mono text-teal-400">
                Venue: {venue} • Capacity: {capacity} attendees
              </div>
            )}
          </div>

          {/* Safety Compliance Mandate */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>Community Safety & Anti-Discrimination Standards</span>
            </div>

            <p className="text-[11px] text-amber-200/80 leading-relaxed font-normal">
              CommunityConnect strictly enforces guidelines against discrimination, harassment, or unlawful conduct.
            </p>

            <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmedSafety}
                onChange={(e) => setConfirmedSafety(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 bg-[#0A0C10] border-slate-700"
              />
              <span className="text-xs font-bold text-white leading-tight">
                I confirm that this content is lawful, peaceful, and complies with all Community Standards.
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 bg-[#0F1219] text-slate-300 rounded-xl border border-slate-800 font-bold text-xs hover:bg-slate-800"
            >
              Edit Details
            </button>

            <button
              onClick={handlePublish}
              className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-500 shadow-lg shadow-blue-900/40 transition-all active:scale-95"
            >
              Publish & Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
