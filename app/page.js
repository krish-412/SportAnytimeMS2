'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { 
  Zap, Bell, Eye, EyeOff, ChevronLeft, ChevronRight, ChevronDown, User, Camera, Check, Sun, Moon, 
  MapPin, Clock, Plus, Search, Globe, Calendar as CalendarIcon, Settings,
  CheckCircle, CheckCircle2, Users, BarChart2, CreditCard, AlignLeft, SearchX, Smartphone, Heart,
  MessageCircle, Send, Paperclip
} from 'lucide-react';

// --- HELPER TO GENERATE LIVE PROTOTYPE MOCKS ---
const getMockActivities = () => {
  const today = new Date();
  const ymd = (d) => { const nd = new Date(d); return `${nd.getFullYear()}-${String(nd.getMonth()+1).padStart(2, '0')}-${String(nd.getDate()).padStart(2, '0')}`; };
  
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today); dayAfter.setDate(dayAfter.getDate() + 2);

  return [
    { id: 'mock-1', sport: 'Football', venue: 'Kent Ridge Paddock', date: ymd(tomorrow), start_time: '18:00', end_time: '20:00', total_players: 22, confirmed_players: 18, difficulty: 'Intermediate', fee: 5.00, host_name: 'Alex Tan', host_id: 'mock-alex', isMock: true, description: 'Casual kickabout. Bring dark and light shirts!' },
    { id: 'mock-2', sport: 'Badminton', venue: 'MPSH 1', date: ymd(today), start_time: '19:00', end_time: '21:00', total_players: 4, confirmed_players: 3, difficulty: 'Advanced', fee: 4.50, host_name: 'Jamie Ng', host_id: 'mock-jamie', isMock: true, description: 'Need one more for doubles.' },
    { id: 'mock-3', sport: 'Basketball', venue: 'UTown Sports Hall', date: ymd(dayAfter), start_time: '16:00', end_time: '18:00', total_players: 10, confirmed_players: 6, difficulty: 'Beginner', fee: 0.00, host_name: 'Taylor Wong', host_id: 'mock-taylor', isMock: true, description: 'Friendly game, beginners welcome.' }
  ];
};

// --- SUB-COMPONENTS ---

function HStack({ children, style = {}, ...props }) {
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'row', alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', ...style
      }}
      {...props}
    >
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
      {children}
    </div>
  );
}

function BottomNav({ currentView, setView }) {
  const tabs = [
    { id: 'host', label: 'Host', Icon: Plus },
    { id: 'explore', label: 'Explore', Icon: Search },
    { id: 'social', label: 'Social', Icon: Globe },
    { id: 'events', label: 'Events', Icon: CalendarIcon },
    { id: 'settings', label: 'Settings', Icon: Settings },
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', height: '64px', backgroundColor: 'var(--card-surface)',
      borderTop: 'var(--border)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 'env(safe-area-inset-bottom)', zIndex: 50
    }}>
      {tabs.map(({ id, label, Icon }) => {
        const isActive = currentView === id || (currentView === 'home' && id === 'explore');
        return (
          <button key={id} onClick={() => setView(id)} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', color: isActive ? '#3B82F6' : '#64748B', cursor: 'pointer', width: '60px', position: 'relative' }}>
            {isActive && (<div style={{ position: 'absolute', top: '-10px', width: '4px', height: '4px', backgroundColor: '#3B82F6', borderRadius: '2px' }} />)}
            <Icon size={24} />
            <span style={{ fontSize: '10px', fontWeight: 600 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ShareModal({ isOpen, onShare, onDismiss, actionText }) {
  if (!isOpen) return null;
  return (
    <div className="page-transition" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ backgroundColor: 'var(--card-surface)', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '340px', textAlign: 'center', border: 'var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        <Globe size={48} color="#3B82F6" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Share to Community?</h3>
        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px', lineHeight: 1.5 }}>Let your followers know you {actionText} to get more people in the game.</p>
        <button onClick={onShare} className="btn-primary" style={{ marginBottom: '12px' }}>Share to Feed</button>
        <button onClick={onDismiss} className="btn-primary" style={{ backgroundColor: 'transparent', border: '1.5px solid #334155', color: '#94A3B8', boxShadow: 'none' }}>Keep it Private</button>
      </div>
    </div>
  );
}

function ToggleSwitch({ isOn, onToggle }) {
  return (
    <div onClick={onToggle} style={{ width: '44px', height: '24px', borderRadius: '12px', backgroundColor: isOn ? '#3B82F6' : '#334155', display: 'flex', alignItems: 'center', padding: '2px', cursor: 'pointer', transition: 'background-color 200ms' }}>
      <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#ffffff', transform: isOn ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 200ms ease', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
    </div>
  );
}

const GLOBAL_SPORTS = ['Football', 'Basketball', 'Badminton', 'Tennis', 'Volleyball', 'Swimming', 'Table Tennis', 'Boxing', 'Gym / Weightlifting', 'Yoga', 'Running', 'Billiards', 'Hockey', 'Gymnastics', 'Other'];
const SPORT_COLORS = { 'Football': '#16213e', 'Basketball': '#f97316', 'Badminton': '#10b981', 'Tennis': '#f59e0b', 'Volleyball': '#8b5cf6', 'Swimming': '#06b6d4', 'Table Tennis': '#ec4899', 'Running': '#f43f5e', 'Other': '#3B82F6' };
const SPORT_EMOJIS = { 'Football': '⚽', 'Basketball': '🏀', 'Badminton': '🏸', 'Tennis': '🎾', 'Volleyball': '🏐', 'Swimming': '🏊', 'Table Tennis': '🏓', 'Boxing': '🥊', 'Gym / Weightlifting': '🏋️', 'Yoga': '🧘', 'Running': '🏃', 'Billiards': '🎱', 'Hockey': '🏒', 'Gymnastics': '🤸', 'Other': '➕' };
const SPORT_GRADIENTS = { 'Football': 'linear-gradient(135deg, #1a1a2e, #16213e)', 'Basketball': 'linear-gradient(135deg, #f97316, #ea580c)', 'Badminton': 'linear-gradient(135deg, #10b981, #059669)', 'Tennis': 'linear-gradient(135deg, #f59e0b, #d97706)', 'Volleyball': 'linear-gradient(135deg, #8b5cf6, #7c3aed)', 'Swimming': 'linear-gradient(135deg, #06b6d4, #0891b2)', 'Table Tennis': 'linear-gradient(135deg, #ec4899, #db2777)', 'Running': 'linear-gradient(135deg, #f43f5e, #e11d48)', 'Other': 'linear-gradient(135deg, #475569, #334155)' };

// --- SETTINGS & EDIT PROFILE COMPONENTS ---
function SettingsPage({ theme, setTheme, setSubView, currentUser, displayName, avatarUrl, onLogout }) {
  const [showLogout, setShowLogout] = useState(false);
  const [notifs, setNotifs] = useState({ reminders: true, slots: true, waitlist: true, ratings: true });
  const [privacy, setPrivacy] = useState({ hostVisibility: 'Public', joinPrivate: false });

  const Row = ({ label, right, hideBorder }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: hideBorder ? 'none' : '1px solid var(--border)' }}>
      <span style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 500 }}>{label}</span>
      {right}
    </div>
  );

  return (
    <div className="page-transition" style={{ paddingBottom: '80px', minHeight: '100vh', padding: '20px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Settings</h1>
      
      <div style={{ backgroundColor: 'var(--card-surface)', borderRadius: '16px', border: 'var(--border)', padding: '16px', display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: avatarUrl ? `url(${avatarUrl}) center/cover` : 'linear-gradient(135deg, #3B82F6, #1E3A5F)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginRight: '16px' }}>
          {!avatarUrl && <User size={28} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: 700 }}>{displayName || currentUser?.user_metadata?.full_name || 'Athlete'}</div>
        </div>
        <button onClick={() => setSubView('edit_profile')} style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          Edit Profile →
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--card-surface)', borderRadius: '16px', border: 'var(--border)', padding: '0 16px', marginBottom: '24px' }}>
        <Row label="Dark Mode" hideBorder right={<ToggleSwitch isOn={theme === 'dark'} onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />} />
      </div>

      <div style={{ backgroundColor: 'var(--card-surface)', borderRadius: '16px', border: 'var(--border)', padding: '0 16px', marginBottom: '24px' }}>
        <Row label="Host Announcements" right={
          <div style={{ position: 'relative' }}>
            <select value={privacy.hostVisibility} onChange={e => setPrivacy({...privacy, hostVisibility: e.target.value})} style={{ appearance: 'none', background: 'var(--bg-page)', border: 'var(--border)', color: 'var(--text-primary)', padding: '6px 32px 6px 12px', borderRadius: '999px', fontSize: '13px', outline: 'none', fontWeight: 600 }}>
              <option value="Public">Public</option><option value="Followers">Followers Only</option><option value="Private">Private</option>
            </select>
            <ChevronDown size={14} color="#64748B" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        } />
        <Row label="Hide Joined Games" hideBorder right={<ToggleSwitch isOn={privacy.joinPrivate} onToggle={() => setPrivacy({...privacy, joinPrivate: !privacy.joinPrivate})} />} />
      </div>

      <div style={{ backgroundColor: 'var(--card-surface)', borderRadius: '16px', border: 'var(--border)', padding: '0 16px', marginBottom: '24px' }}>
        <Row label="Activity Reminders" right={<ToggleSwitch isOn={notifs.reminders} onToggle={() => setNotifs({...notifs, reminders: !notifs.reminders})} />} />
        <Row label="New Slot Notifications" right={<ToggleSwitch isOn={notifs.slots} onToggle={() => setNotifs({...notifs, slots: !notifs.slots})} />} />
        <Row label="Waitlist Alerts" right={<ToggleSwitch isOn={notifs.waitlist} onToggle={() => setNotifs({...notifs, waitlist: !notifs.waitlist})} />} />
        <Row label="Post-Game Rating Prompts" hideBorder right={<ToggleSwitch isOn={notifs.ratings} onToggle={() => setNotifs({...notifs, ratings: !notifs.ratings})} />} />
      </div>

      <div style={{ backgroundColor: 'var(--card-surface)', borderRadius: '16px', border: 'var(--border)', padding: '0 16px', marginBottom: '24px' }}>
        <Row label="Payment Methods" right={<ChevronRight size={20} color="#64748B" />} />
        <Row label="Privacy Policy" right={<ChevronRight size={20} color="#64748B" />} />
        <Row label="Terms of Service" hideBorder right={<ChevronRight size={20} color="#64748B" />} />
      </div>

      <div style={{ backgroundColor: 'var(--card-surface)', borderRadius: '16px', border: '1px solid #FCA5A5', padding: '0 16px', marginBottom: '24px' }}>
        <div onClick={() => setShowLogout(true)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', cursor: 'pointer' }}>
          <span style={{ fontSize: '15px', color: '#EF4444', fontWeight: 600 }}>Log Out</span>
        </div>
      </div>

      {showLogout && (
        <div className="page-transition" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--card-surface)', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '300px', textAlign: 'center', border: 'var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Log Out</h3>
            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px', lineHeight: 1.5 }}>Are you sure you want to log out?</p>
            <button onClick={onLogout} className="btn-primary" style={{ marginBottom: '12px', backgroundColor: '#EF4444', border: 'none' }}>Log Out</button>
            <button onClick={() => setShowLogout(false)} className="btn-primary" style={{ backgroundColor: 'var(--card-surface)', border: '1.5px solid #334155', color: '#94A3B8', boxShadow: 'none' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function EditProfilePage({ currentUser, displayName, setDisplayName, avatarUrl, setAvatarUrl, selectedSports, setSelectedSports, skillLevels, setSkillLevels, onBack }) {
  const [loading, setLoading] = useState(false);
  const [localName, setLocalName] = useState(displayName || currentUser?.user_metadata?.full_name || '');
  const [localSports, setLocalSports] = useState([...selectedSports]);
  const [localSkills, setLocalSkills] = useState({...skillLevels});
  const [localAvatar, setLocalAvatar] = useState(avatarUrl);

  const toggleSportSelect = (sportName) => {
    if (localSports.includes(sportName)) {
      setLocalSports(localSports.filter((s) => s !== sportName));
      const updated = { ...localSkills }; delete updated[sportName]; setLocalSkills(updated);
    } else { setLocalSports([...localSports, sportName]); }
  };

  const handleSkillSelect = (sportName, level) => setLocalSkills({ ...localSkills, [sportName]: level });

  const handleSave = async () => {
    setLoading(true);
    setDisplayName(localName); setSelectedSports(localSports); setSkillLevels(localSkills); setAvatarUrl(localAvatar);
    await supabase.from('profiles').upsert({ id: currentUser.id, sports_interested: localSports, difficulty_level: JSON.stringify(localSkills) });
    setLoading(false);
    onBack();
  };

  return (
    <div className="page-transition" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: 'var(--border)', backgroundColor: 'var(--bg-page)', position: 'sticky', top: 0, zIndex: 40 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}><ChevronLeft size={24} /></button>
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: 700 }}>Edit Profile</h1>
        <button onClick={handleSave} disabled={loading} style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: '15px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>{loading ? 'Saving...' : 'Save'}</button>
      </div>

      <div style={{ padding: '24px 20px' }}>
        <div style={{ alignSelf: 'center', position: 'relative', marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: localAvatar ? `url(${localAvatar}) center/cover` : 'linear-gradient(135deg, #3B82F6, #1E3A5F)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
            {!localAvatar && <User size={40} />}
          </div>
          <label style={{ position: 'absolute', bottom: 0, right: 'calc(50% - 48px)', width: 28, height: 28, borderRadius: '50%', backgroundColor: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            <Camera size={14} />
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files && e.target.files[0]) setLocalAvatar(URL.createObjectURL(e.target.files[0])); }} />
          </label>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.06em', marginBottom: '8px' }}>DISPLAY NAME</label>
          <input type="text" className="input-field" value={localName} onChange={(e) => setLocalName(e.target.value)} />
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.06em', marginBottom: '16px' }}>SPORTS</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {['Football', 'Basketball', 'Badminton', 'Tennis', 'Volleyball', 'Swimming', 'Running', 'Other'].map((sport) => {
              const isSelected = localSports.includes(sport);
              return (
                <div key={sport} onClick={() => toggleSportSelect(sport)} style={{ height: 60, borderRadius: 16, backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--card-surface)', border: isSelected ? '2px solid #3B82F6' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer', transition: 'all 150ms ease' }}>
                  {isSelected && <div style={{ position: 'absolute', top: 6, right: 6, color: '#3B82F6' }}><Check size={14} /></div>}
                  <span style={{ fontSize: '14px', fontWeight: 600, color: isSelected ? '#3B82F6' : 'var(--text-primary)' }}>{sport}</span>
                </div>
              );
            })}
          </div>
        </div>

        {localSports.length > 0 && (
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.06em', marginBottom: '16px' }}>SKILL LEVELS</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {localSports.map((sportName) => {
                const currentLevel = localSkills[sportName];
                return (
                  <div key={sportName} style={{ backgroundColor: 'var(--card-surface)', border: 'var(--border)', borderRadius: 16, padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700 }}>{sportName}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      {['Beginner', 'Intermediate', 'Advanced', 'Professional'].map((level) => {
                        const isLevelSelected = currentLevel === level;
                        return (
                          <button key={level} type="button" onClick={() => handleSkillSelect(sportName, level)} style={{ height: 36, borderRadius: 999, border: isLevelSelected ? 'none' : 'var(--border)', backgroundColor: isLevelSelected ? '#3B82F6' : 'transparent', color: isLevelSelected ? '#ffffff' : '#94A3B8', fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 150ms ease' }}>
                            {level}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- CHAT PAGE ---
function ChatPage({ activity, currentUser, onBack }) {
  const hostName = activity.host_name || "Alex Tan";
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! Looking forward to the session.", isMe: false, sender: hostName, time: "10:00 AM" },
    { id: 2, text: "See you guys there!", isMe: false, sender: "Taylor Wong", time: "10:05 AM" }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), text: input, isMe: true, sender: currentUser?.user_metadata?.full_name || 'Me', time: 'Now' }]);
    setInput('');
  };

  return (
    <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-page)' }}>
      <div style={{ padding: '16px 20px', borderBottom: 'var(--border)', display: 'flex', alignItems: 'center', backgroundColor: 'var(--card-surface)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}><ChevronLeft size={24} /></button>
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: '16px', fontWeight: 700, marginRight: '24px' }}>{activity.sport} · {activity.venue}</h1>
      </div>
      <div style={{ backgroundColor: 'var(--card-surface)', padding: '6px 20px', textAlign: 'center', borderBottom: 'var(--border)' }}>
        <span style={{ fontSize: '12px', color: '#94A3B8' }}>{activity.total_players} participants · {activity.date} · {activity.start_time}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.isMe ? 'flex-end' : 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', maxWidth: '80%' }}>
              {!msg.isMe && (
                <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#1E3A5F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{msg.sender.charAt(0)}</span>
                </div>
              )}
              <div style={{ backgroundColor: msg.isMe ? '#3B82F6' : 'var(--card-surface)', color: msg.isMe ? '#ffffff' : 'var(--text-primary)', padding: '12px 16px', borderRadius: msg.isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', border: msg.isMe ? 'none' : 'var(--border)', fontSize: '14px', lineHeight: 1.4 }}>
                {msg.text}
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', paddingLeft: msg.isMe ? 0 : '36px' }}>
              {msg.sender} {msg.sender === hostName ? '👑' : ''} · {msg.time}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} style={{ padding: '16px 20px', borderTop: 'var(--border)', backgroundColor: 'var(--card-surface)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Paperclip size={20} color="#64748B" />
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message the group..." style={{ flex: 1, height: '40px', borderRadius: '999px', backgroundColor: 'var(--input-bg)', border: 'var(--border)', padding: '0 16px', fontSize: '14px', color: 'var(--text-primary)', outline: 'none' }} />
        <button type="submit" disabled={!input.trim()} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3B82F6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: input.trim() ? 1 : 0.5, transition: 'opacity 200ms', cursor: 'pointer' }}>
          <Send size={18} color="#ffffff" style={{ position: 'relative', right: '1px', top: '1px' }}/>
        </button>
      </form>
    </div>
  );
}

// --- EVENTS PAGE ---
function EventsPage({ theme, setTheme, currentUser, onJoinActivity, onOpenChat, joinedMocks }) {
  const [tab, setTab] = useState('upcoming');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [activities, setActivities] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEvents(); }, [tab]);

  const fetchEvents = async () => {
    setLoading(true);
    const { data: acts } = await supabase.from('activities').select('*');
    const { data: bks } = await supabase.from('bookings').select('activity_id').eq('user_id', currentUser.id);
    const allActs = [...(acts || []), ...getMockActivities()];
    setActivities(allActs);
    setMyBookings(bks ? bks.map(b => b.activity_id) : []);
    setLoading(false);
  };

  const actualTodayIso = new Date().toISOString().split('T')[0];
  const now = new Date();
  const personal = [];
  const community = [];

  activities.forEach(act => {
    const actDate = new Date(`${act.date}T${act.start_time}`);
    const isPast = actDate < now;
    const isHost = act.host_id === currentUser.id;
    const isPlayer = myBookings.includes(act.id) || joinedMocks.includes(act.id);
    
    if (isHost || isPlayer) personal.push({ ...act, isPast, role: isHost ? 'Host' : 'Player' });
    else community.push({ ...act, isPast });
  });

  const getDayStatus = (isoString) => {
    const pOnDay = personal.filter(e => e.date === isoString && (tab === 'upcoming' ? !e.isPast : e.isPast));
    const cOnDay = community.filter(e => e.date === isoString && (tab === 'upcoming' ? !e.isPast : e.isPast));
    if (pOnDay.length > 0 && cOnDay.length > 0) return 'both';
    if (pOnDay.length > 0) return 'personal';
    if (cOnDay.length > 0) return 'community';
    return 'none';
  };

  const year = currentDate.getFullYear(); const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate(); const firstDayOfMonth = new Date(year, month, 1).getDay();
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1)); const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const renderDays = () => {
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => <div key={`blank-${i}`} />);
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const isoString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const status = getDayStatus(isoString);
      const isSelected = selectedDay === isoString;
      const isToday = isoString === actualTodayIso;

      return (
        <div key={dayNum} onClick={() => { if (status !== 'none') setSelectedDay(isSelected ? null : isoString); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '48px', cursor: status !== 'none' ? 'pointer' : 'default' }}>
          <div style={{ width: '36px', height: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: (status === 'personal' || status === 'both' || isSelected) ? '#3B82F6' : 'transparent', borderBottom: (status === 'none' && isToday && !isSelected) ? '2px solid #3B82F6' : 'none', color: (status === 'personal' || status === 'both' || isSelected) ? '#ffffff' : (status === 'community' ? 'var(--text-primary)' : '#94A3B8'), fontSize: (status === 'personal' || status === 'both' || isSelected) ? '18px' : (status === 'community' ? '16px' : '14px'), fontWeight: (status === 'personal' || status === 'both' || isSelected) ? 800 : (status === 'community' ? 600 : 400), position: 'relative' }}>
            <span style={{ position: 'relative', top: (status === 'community' || status === 'both') ? '-2px' : '0' }}>{dayNum}</span>
            {status === 'both' && <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#ffffff', position: 'absolute', bottom: 4 }} />}
            {status === 'community' && !isSelected && <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#94A3B8', position: 'absolute', bottom: 4 }} />}
          </div>
        </div>
      );
    });
    return [...blanks, ...days];
  };

  const personalOnDay = selectedDay ? personal.filter(e => e.date === selectedDay && (tab === 'upcoming' ? !e.isPast : e.isPast)) : [];
  const communityOnDay = selectedDay ? community.filter(e => e.date === selectedDay && (tab === 'upcoming' ? !e.isPast : e.isPast)) : [];

  return (
    <div className="page-transition" style={{ paddingBottom: '80px', minHeight: '100vh' }}>
      <div style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-page)', borderBottom: 'var(--border)', padding: '16px 20px', zIndex: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800 }}>My Events</h1>
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          {theme === 'dark' ? <Sun size={22} color="#64748B" /> : <Moon size={22} color="#64748B" />}
        </button>
      </div>

      <div style={{ display: 'flex', borderBottom: 'var(--border)', position: 'relative' }}>
        <button onClick={() => { setTab('upcoming'); setSelectedDay(null); }} style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', color: tab === 'upcoming' ? 'var(--text-primary)' : '#94A3B8', fontWeight: tab === 'upcoming' ? 700 : 400, fontSize: '15px', cursor: 'pointer', borderBottom: tab === 'upcoming' ? '2px solid #3B82F6' : '2px solid transparent', transition: 'all 200ms ease' }}>Upcoming</button>
        <button onClick={() => { setTab('past'); setSelectedDay(null); }} style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', color: tab === 'past' ? 'var(--text-primary)' : '#94A3B8', fontWeight: tab === 'past' ? 700 : 400, fontSize: '15px', cursor: 'pointer', borderBottom: tab === 'past' ? '2px solid #3B82F6' : '2px solid transparent', transition: 'all 200ms ease' }}>Past</button>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ backgroundColor: 'var(--card-surface)', borderRadius: '16px', padding: '16px', border: 'var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><ChevronLeft size={20} /></button>
            <span style={{ fontSize: '15px', fontWeight: 700 }}>{currentDate.toLocaleString('default', { month: 'long' })} {year}</span>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><ChevronRight size={20} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (<span key={i} style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>{day}</span>))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>{renderDays()}</div>
        </div>
      </div>

      {loading && <p style={{ textAlign: 'center', color: '#64748B' }}>Syncing events...</p>}

      {selectedDay && (personalOnDay.length > 0 || communityOnDay.length > 0) && (
        <div className="page-transition" style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '24px', overflow: 'hidden' }}>
          
          {personalOnDay.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 600, color: '#3B82F6', textTransform: 'uppercase', borderLeft: '2px solid #3B82F6', paddingLeft: '8px' }}>My Activities</h3>
              {personalOnDay.map(act => {
                const isHost = act.role === 'Host';
                const bgLight = isHost ? '#EFF6FF' : '#F0FDF4'; const bgDark = isHost ? '#1E3A5F' : '#1A3A2E'; const accent = isHost ? '#3B82F6' : '#10B981';

                return (
                  <div key={act.id} style={{ borderRadius: '16px', backgroundColor: theme === 'dark' ? bgDark : bgLight, border: 'var(--border)', borderLeft: `4px solid ${accent}`, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}><span style={{ fontSize: '18px' }}>{SPORT_EMOJIS[act.sport] || '🏅'}</span><span style={{ fontSize: '15px', fontWeight: 700 }}>{act.sport}</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B', fontSize: '13px' }}><MapPin size={12} /> {act.venue}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B', fontSize: '13px', marginTop: '2px' }}><Clock size={12} /> {act.start_time} - {act.end_time}</div>
                      </div>
                      <div style={{ backgroundColor: isHost ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)', color: accent, borderRadius: '999px', padding: '4px 10px', fontSize: '11px', fontWeight: 700 }}>{act.role}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', backgroundColor: '#EFF6FF', color: '#3B82F6', textTransform: 'uppercase' }}>{act.difficulty}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{act.confirmed_players} / {act.total_players} joined</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button onClick={() => onOpenChat(act)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '36px', borderRadius: '999px', border: 'var(--border)', backgroundColor: 'var(--card-surface)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                        <MessageCircle size={14} color="#3B82F6" /> Chat
                      </button>
                      {act.isPast && (
                        <button style={{ flex: 1, height: '36px', borderRadius: '999px', border: 'none', backgroundColor: '#F59E0B', color: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Rate Team</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {communityOnDay.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', borderLeft: '2px solid #334155', paddingLeft: '8px' }}>Also Happening</h3>
              {communityOnDay.map((act) => {
                const slotsLeft = act.total_players - act.confirmed_players;
                return (
                  <div key={act.id} style={{ borderRadius: '16px', backgroundColor: 'var(--card-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: 'var(--border)', borderLeft: `4px solid ${SPORT_COLORS[act.sport] || '#3B82F6'}`, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ fontSize: '20px' }}>{SPORT_EMOJIS[act.sport] || '🏅'}</span><span style={{ fontSize: '15px', fontWeight: 700 }}>{act.sport}</span></div>
                      <div style={{ backgroundColor: slotsLeft <= 2 ? '#FEF2F2' : slotsLeft <= 5 ? '#FFFBEB' : '#F0FDF4', color: slotsLeft <= 2 ? '#EF4444' : slotsLeft <= 5 ? '#F59E0B' : '#10B981', borderRadius: '999px', padding: '4px 10px', fontSize: '11px', fontWeight: 600 }}>{slotsLeft} slots left</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}><MapPin size={14} /><span style={{ fontSize: '14px' }}>{act.venue}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}><Clock size={14} /><span style={{ fontSize: '14px' }}>{act.start_time} - {act.end_time}</span></div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', backgroundColor: '#EFF6FF', color: '#3B82F6', textTransform: 'uppercase' }}>{act.difficulty}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>SGD {parseFloat(act.fee).toFixed(2)} / person</span>
                    </div>
                    <button onClick={() => onJoinActivity(act)} style={{ marginTop: '8px', background: 'transparent', border: '1.5px solid #3B82F6', color: '#3B82F6', borderRadius: '999px', height: '40px', fontSize: '13px', fontWeight: 600, width: '100%', cursor: 'pointer' }}>Join Activity →</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- SOCIAL PAGE ---
function SocialPage({ theme, setTheme }) {
  const [tab, setTab] = useState('foryou');
  const [likedPosts, setLikedPosts] = useState({});
  const [followingUsers, setFollowingUsers] = useState({});

  const MOCK_FEED = [
    { id: 1, user: 'Alex Tan', time: '2h ago', text: 'joined a Football match', activity: { sport: 'Football', venue: 'Kent Ridge Paddock', date: 'Jul 14' } },
    { id: 2, user: 'Jamie Ng', time: '4h ago', text: 'hosted a new Badminton session', activity: { sport: 'Badminton', venue: 'MPSH 1', date: 'Jul 12' } },
    { id: 3, user: 'Taylor Wong', time: '5h ago', text: 'completed their 10th game on SportAnytime 🎉', activity: null },
    { id: 4, user: 'Sam Ong', time: '1d ago', text: 'earned the Reliable Host badge ✓', activity: null },
    { id: 5, user: 'Jordan Lee', time: '1d ago', text: 'reached Advanced level in Basketball 📈', activity: null },
  ];

  const handleLike = (id) => setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  const handleFollow = (user) => setFollowingUsers(prev => ({ ...prev, [user]: !prev[user] }));
  const displayFeed = tab === 'foryou' ? MOCK_FEED : MOCK_FEED.filter(post => followingUsers[post.user]);

  return (
    <div className="page-transition" style={{ paddingBottom: '80px', minHeight: '100vh' }}>
      <div style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-page)', borderBottom: 'var(--border)', padding: '16px 20px', zIndex: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800 }}>Community</h1>
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Sun size={22} color="#64748B" /></button>
      </div>
      <div style={{ display: 'flex', borderBottom: 'var(--border)', position: 'relative' }}>
        <button onClick={() => setTab('foryou')} style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', color: tab === 'foryou' ? 'var(--text-primary)' : '#94A3B8', fontWeight: tab === 'foryou' ? 700 : 400, fontSize: '15px', cursor: 'pointer', borderBottom: tab === 'foryou' ? '2px solid #3B82F6' : '2px solid transparent', transition: 'all 200ms ease' }}>For You</button>
        <button onClick={() => setTab('following')} style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', color: tab === 'following' ? 'var(--text-primary)' : '#94A3B8', fontWeight: tab === 'following' ? 700 : 400, fontSize: '15px', cursor: 'pointer', borderBottom: tab === 'following' ? '2px solid #3B82F6' : '2px solid transparent', transition: 'all 200ms ease' }}>Following</button>
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {tab === 'following' && displayFeed.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '60px', textAlign: 'center' }}>
            <Users size={48} color="#334155" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>You&apos;re not following anyone yet</h3>
            <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5, maxWidth: '250px' }}>Find players from activity rosters and follow them to see their activity here.</p>
          </div>
        ) : (
          displayFeed.map((post) => (
            <div key={post.id} style={{ borderRadius: '16px', backgroundColor: 'var(--card-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: 'var(--border)', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #1E3A5F)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginRight: '12px' }}><User size={20} /></div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>{post.user}</span><span style={{ fontSize: '13px', color: '#94A3B8' }}> · {post.time}</span>
                </div>
                <button onClick={() => handleFollow(post.user)} style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 150ms ease', border: followingUsers[post.user] ? 'none' : '1px solid #3B82F6', backgroundColor: followingUsers[post.user] ? '#1E3A5F' : 'transparent', color: '#3B82F6' }}>
                  {followingUsers[post.user] ? 'Following' : 'Follow'}
                </button>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: post.activity ? '12px' : '16px' }}><span style={{ fontWeight: 600 }}>{post.user}</span> {post.text}</div>
              {post.activity && (
                <div style={{ backgroundColor: 'var(--input-bg)', borderRadius: '8px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '14px' }}>{SPORT_EMOJIS[post.activity.sport]}</span><span style={{ fontSize: '12px', color: '#64748B' }}>{post.activity.venue} · {post.activity.date}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}>
                <button onClick={() => handleLike(post.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'transform 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275)', transform: likedPosts[post.id] ? 'scale(1.1)' : 'scale(1)' }}>
                  <Heart size={20} color={likedPosts[post.id] ? '#EF4444' : '#64748B'} fill={likedPosts[post.id] ? '#EF4444' : 'transparent'} />
                </button>
                <span style={{ fontSize: '13px' }}>{likedPosts[post.id] ? 1 : 0}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// --- EXPLORE & FLOWS ---
function ExplorePage({ onSelectActivity, joinedMocks }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sportFilter, setSportFilter] = useState('All Sports');

  useEffect(() => { fetchActivities(); }, [selectedDate, sportFilter]);

  const fetchActivities = async () => {
    setLoading(true);
    let query = supabase.from('activities').select('*').order('start_time', { ascending: true });
    if (selectedDate) query = query.eq('date', selectedDate);
    if (sportFilter !== 'All Sports') query = query.eq('sport', sportFilter);
    const { data } = await query;

    let mocks = getMockActivities();
    if (selectedDate) mocks = mocks.filter(m => m.date === selectedDate);
    if (sportFilter !== 'All Sports') mocks = mocks.filter(m => m.sport === sportFilter);

    setActivities([...(data || []), ...mocks].sort((a,b) => a.start_time.localeCompare(b.start_time)));
    setLoading(false);
  };

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
    const numStr = d.getDate();
    return { iso, dayStr, numStr };
  });

  return (
    <div className="page-transition" style={{ paddingBottom: '80px' }}>
      <div style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-page)', borderBottom: 'var(--border)', padding: '16px 20px', zIndex: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800 }}>Explore</h1>
      </div>
      <div style={{ position: 'sticky', top: '57px', backgroundColor: 'var(--bg-page)', zIndex: 39, borderBottom: 'var(--border)', padding: '12px 0' }}>
        <HStack style={{ padding: '0 20px', gap: '8px' }}>
          {days.map((d) => {
            const isSel = selectedDate === d.iso;
            return (
              <button key={d.iso} onClick={() => setSelectedDate(d.iso)} style={{ minWidth: '52px', height: '64px', borderRadius: '16px', border: isSel ? 'none' : 'var(--border)', backgroundColor: isSel ? '#3B82F6' : 'transparent', color: isSel ? '#ffffff' : 'var(--text-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span style={{ fontSize: '11px', fontWeight: 500, color: isSel ? '#ffffff' : '#94A3B8' }}>{d.dayStr}</span>
                <span style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px' }}>{d.numStr}</span>
              </button>
            );
          })}
        </HStack>
      </div>
      <div style={{ padding: '12px 0', borderBottom: 'var(--border)' }}>
        <HStack style={{ padding: '0 20px', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <select value={sportFilter} onChange={(e) => setSportFilter(e.target.value)} className="input-field" style={{ height: '34px', borderRadius: '999px', padding: '0 40px 0 14px', fontSize: '13px', fontWeight: 500, backgroundColor: sportFilter !== 'All Sports' ? '#3B82F6' : 'var(--card-surface)', color: sportFilter !== 'All Sports' ? '#ffffff' : '#94A3B8', border: 'var(--border)', outline: 'none', appearance: 'none' }}>
              <option value="All Sports">All Sports</option>
              {GLOBAL_SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={14} color={sportFilter !== 'All Sports' ? '#ffffff' : '#94A3B8'} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </HStack>
      </div>
      <div style={{ padding: '20px' }}>
        {loading ? <p style={{ textAlign: 'center', color: '#64748B', paddingTop: '40px' }}>Loading activities...</p> : activities.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '60px', textAlign: 'center' }}>
            <SearchX size={48} color="#334155" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>No activities on this day</h3>
            <p style={{ fontSize: '13px', color: '#94A3B8' }}>Try a different date or adjust your filters</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activities.map((act) => {
              const slotsLeft = act.total_players - act.confirmed_players;
              return (
                <div key={act.id} onClick={() => onSelectActivity(act)} style={{ borderRadius: '16px', backgroundColor: 'var(--card-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: 'var(--border)', borderLeft: `4px solid ${SPORT_COLORS[act.sport] || '#3B82F6'}`, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ fontSize: '20px' }}>{SPORT_EMOJIS[act.sport] || '🏅'}</span><span style={{ fontSize: '15px', fontWeight: 700 }}>{act.sport}</span></div>
                    <div style={{ backgroundColor: slotsLeft <= 2 ? '#FEF2F2' : slotsLeft <= 5 ? '#FFFBEB' : '#F0FDF4', color: slotsLeft <= 2 ? '#EF4444' : slotsLeft <= 5 ? '#F59E0B' : '#10B981', borderRadius: '999px', padding: '4px 10px', fontSize: '11px', fontWeight: 600 }}>{slotsLeft} slots left</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}><MapPin size={14} /><span style={{ fontSize: '14px' }}>{act.venue}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}><Clock size={14} /><span style={{ fontSize: '14px' }}>{act.start_time} - {act.end_time}</span></div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', backgroundColor: '#EFF6FF', color: '#3B82F6', textTransform: 'uppercase' }}>{act.difficulty}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>SGD {parseFloat(act.fee).toFixed(2)} / person</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityDetailPage({ activity, onBack, onProceedToPlayers }) {
  const isFull = (activity.total_players - activity.confirmed_players) <= 0;
  return (
    <div className="page-transition" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '90px' }}>
      <div style={{ height: '200px', background: SPORT_GRADIENTS[activity.sport] || 'linear-gradient(135deg, #3B82F6, #1E3A5F)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <button onClick={onBack} style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}><ChevronLeft size={24} /></button>
        <span style={{ fontSize: '48px', marginBottom: '8px' }}>{SPORT_EMOJIS[activity.sport] || '🏅'}</span>
        <h1 style={{ fontSize: '22px', fontWeight: 800 }}>{activity.sport}</h1>
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><MapPin size={20} color="#3B82F6" /><span style={{ fontSize: '16px', fontWeight: 600 }}>{activity.venue}</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Clock size={20} color="#3B82F6" /><span style={{ fontSize: '15px', color: '#64748B' }}>{activity.date} · {activity.start_time} - {activity.end_time}</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CreditCard size={20} color="#3B82F6" /><span style={{ fontSize: '15px', fontWeight: 600 }}>SGD {parseFloat(activity.fee).toFixed(2)} per person</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><BarChart2 size={20} color="#3B82F6" /><span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', backgroundColor: '#EFF6FF', color: '#3B82F6', textTransform: 'uppercase' }}>{activity.difficulty}</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Users size={20} color="#3B82F6" /><span style={{ fontSize: '15px', color: '#64748B' }}>{activity.confirmed_players} / {activity.total_players} players confirmed</span></div>
        <div style={{ width: '100%', height: '8px', backgroundColor: '#334155', borderRadius: '999px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${(activity.confirmed_players / activity.total_players) * 100}%`, backgroundColor: isFull ? '#EF4444' : '#3B82F6', transition: 'all 200ms ease' }} /></div>
        {activity.description && <div style={{ backgroundColor: 'var(--card-surface)', padding: '16px', borderRadius: '16px', border: 'var(--border)', marginTop: '8px' }}><p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5 }}>{activity.description}</p></div>}
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', padding: '16px 20px', backgroundColor: 'var(--card-surface)', borderTop: 'var(--border)', zIndex: 50 }}>
        <button onClick={onProceedToPlayers} className="btn-primary" style={{ backgroundColor: isFull ? '#F59E0B' : '#3B82F6' }}>{isFull ? 'Join Waitlist' : "See Who's Playing →"}</button>
      </div>
    </div>
  );
}

function PlayersPage({ activity, onBack, onProceedToPayment }) {
  let baseNames = ["Jordan Lee", "Taylor Wong", "Morgan Chen", "Casey Lim", "Riley Goh", "Jamie Ng", "Cameron Teo", "Sam Ong", "Drew Chua", "Jesse Koh"];
  if (activity.isMock && activity.host_name) baseNames.unshift(activity.host_name);
  else baseNames.unshift("Alex Tan");

  const dummyPlayers = baseNames.slice(0, activity?.confirmed_players || 0);

  return (
    <div className="page-transition" style={{ minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column', paddingBottom: '90px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}><ChevronLeft size={24} /></button>
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: 700, marginRight: '24px' }}>Who's Playing</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {dummyPlayers.map((name, i) => (
          <div key={i} style={{ borderRadius: '16px', backgroundColor: 'var(--card-surface)', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: 'var(--border)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #1E3A5F)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: '12px' }}><User size={28} /></div>
            <span style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>{name}</span>
            <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', backgroundColor: '#EFF6FF', color: '#3B82F6', textTransform: 'uppercase', marginBottom: '8px' }}>{activity.difficulty}</span>
            <span style={{ fontSize: '13px', color: '#F59E0B', fontWeight: 600 }}>⚡ {Math.floor(Math.random() * 20) + 70}</span>
          </div>
        ))}
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', padding: '16px 20px', backgroundColor: 'var(--card-surface)', borderTop: 'var(--border)', zIndex: 50 }}>
        <button onClick={onProceedToPayment} className="btn-primary">Confirm My Slot</button>
      </div>
    </div>
  );
}

function PaymentPage({ activity, currentUser, onBack, onSuccess, setJoinedMocks }) {
  const [method, setMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    if (activity.isMock) {
      setJoinedMocks(prev => [...prev, activity.id]);
      onSuccess();
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('bookings').insert({ activity_id: activity.id, user_id: currentUser.id });
    if (!error) {
      await supabase.from('activities').update({ confirmed_players: activity.confirmed_players + 1 }).eq('id', activity.id);
      onSuccess();
    } else { alert('Booking failed or you already joined this activity.'); }
    setLoading(false);
  };

  return (
    <div className="page-transition" style={{ minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}><ChevronLeft size={24} /></button>
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: 700, marginRight: '24px' }}>Complete Booking</h1>
      </div>
      <div style={{ backgroundColor: 'var(--card-surface)', borderRadius: '16px', padding: '16px', border: 'var(--border)', marginBottom: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{activity.sport} @ {activity.venue}</div>
        <div style={{ fontSize: '14px', color: '#64748B' }}>{activity.date} · {activity.start_time}</div>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#3B82F6', marginTop: '12px' }}>SGD {parseFloat(activity.fee).toFixed(2)}</div>
      </div>
      <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Choose Payment Method</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {[{ id: 'apple', label: 'Apple Pay', Icon: Smartphone, color: '#F1F5F9' }, { id: 'paylah', label: 'PayLah!', Icon: Smartphone, color: '#EF4444' }, { id: 'card', label: 'Credit / Debit Card', Icon: CreditCard, color: '#3B82F6' }].map((m) => (
          <div key={m.id} onClick={() => setMethod(m.id)} style={{ borderRadius: '16px', padding: '16px', border: method === m.id ? '1.5px solid #3B82F6' : 'var(--border)', backgroundColor: method === m.id ? 'rgba(59,130,246,0.06)' : 'var(--card-surface)', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <m.Icon size={20} color={m.color} /><span style={{ fontSize: '15px', fontWeight: 600, flex: 1 }}>{m.label}</span>
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{method === m.id && <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#3B82F6' }} />}</div>
          </div>
        ))}
      </div>
      {method === 'card' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <input className="input-field" placeholder="1234 5678 9012 3456" defaultValue="4242 •••• •••• 4242" />
          <div style={{ display: 'flex', gap: '12px' }}><input className="input-field" placeholder="MM/YY" defaultValue="12/28" /><input className="input-field" placeholder="CVV" defaultValue="123" /></div>
        </div>
      )}
      <button onClick={handlePay} disabled={loading} className="btn-primary" style={{ marginTop: 'auto' }}>{loading ? 'Processing...' : `Pay SGD ${parseFloat(activity.fee).toFixed(2)}`}</button>
    </div>
  );
}

// --- MAIN APP ---
export default function Home() {
  const [theme, setTheme] = useState('dark');
  const [view, setView] = useState('auth'); 
  const [authTab, setAuthTab] = useState('login'); 
  const [hostDefaultSport, setHostDefaultSport] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [subView, setSubView] = useState('list');
  const [showShareModal, setShowShareModal] = useState(false);
  const [joinedMocks, setJoinedMocks] = useState([]);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [emailDomainError, setEmailDomainError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [onboardingStep, setOnboardingStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [selectedSports, setSelectedSports] = useState([]);
  const [skillLevels, setSkillLevels] = useState({});

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);

  const handleEmailChange = (val) => {
    setEmail(val);
    setEmailDomainError(val.length > 0 && !val.toLowerCase().endsWith('@u.nus.edu'));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (emailDomainError) return;
    setLoading(true);
    if (authTab === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      if (error) setAuthError(error.message);
      else if (data?.user) { setCurrentUser(data.user); setDisplayName(fullName || ''); setView('onboarding'); }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
      else if (data?.user) { setCurrentUser(data.user); setView('home'); }
    }
    setLoading(false);
  };

  const handleOnboardingComplete = async () => {
    if (currentUser) {
      await supabase.from('profiles').upsert({ id: currentUser.id, sports_interested: selectedSports, difficulty_level: JSON.stringify(skillLevels) });
    }
    setView('home');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setView('auth');
    setSubView('list');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        [data-theme='dark'] input[type="date"]::-webkit-calendar-picker-indicator,
        [data-theme='dark'] input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(1); }
        [data-theme='light'] input[type="date"]::-webkit-calendar-picker-indicator,
        [data-theme='light'] input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(47%) sepia(11%) saturate(760%) hue-rotate(184deg) brightness(94%) contrast(86%); }
        select.input-field::-ms-expand { display: none; }
      `}} />

      {view === 'auth' && (
        <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <div style={{ height: '40vh', background: 'linear-gradient(160deg, #0F172A 0%, #1E3A5F 50%, #0F172A 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}><Zap size={28} color="#3B82F6" fill="#3B82F6" /><span style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>SportAnytime</span></div>
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>Find your game. Fill your team.</p>
          </div>
          <div style={{ flex: 1, backgroundColor: 'var(--card-surface)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', marginTop: '-24px', padding: '24px 20px', display: 'flex', flexDirection: 'column' }}>
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              {authTab === 'signup' && <input type="text" required placeholder="Full Name" className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} />}
              <input type="email" required placeholder="e0123456@u.nus.edu" className="input-field" value={email} onChange={(e) => handleEmailChange(e.target.value)} />
              <input type="password" required placeholder="••••••••" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="submit" disabled={loading} className="btn-primary">{authTab === 'login' ? 'Log In' : 'Create Account'}</button>
              <p style={{ fontSize: '13px', color: '#64748B', textAlign: 'center' }}><span onClick={() => setAuthTab(authTab === 'login' ? 'signup' : 'login')} style={{ color: '#3B82F6', cursor: 'pointer' }}>{authTab === 'login' ? 'Need an account? Sign Up' : 'Have an account? Log In'}</span></p>
            </form>
          </div>
        </div>
      )}

      {view === 'onboarding' && (
        <div className="page-transition" style={{ padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>Set up profile</h1>
          <input type="text" placeholder="Display Name" className="input-field" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{ marginBottom: '16px' }} />
          <button className="btn-primary" onClick={handleOnboardingComplete}>Finish & Go to App 🚀</button>
        </div>
      )}

      {view !== 'auth' && view !== 'onboarding' && (
        <>
          {view === 'home' && <HomePage currentUser={currentUser} displayName={displayName} theme={theme} setTheme={setTheme} setView={setView} setHostDefaultSport={setHostDefaultSport} />}
          {view === 'host' && <HostPage currentUser={currentUser} defaultSport={hostDefaultSport} setView={setView} />}
          {view === 'social' && <SocialPage theme={theme} setTheme={setTheme} />}
          {view === 'events' && (
            <>
              {subView === 'list' && (
                <EventsPage 
                  theme={theme} setTheme={setTheme} currentUser={currentUser} joinedMocks={joinedMocks}
                  onJoinActivity={(act) => { setSelectedActivity(act); setSubView('detail'); setView('explore'); }}
                  onOpenChat={(act) => { setSelectedActivity(act); setSubView('chat'); }}
                />
              )}
              {subView === 'chat' && selectedActivity && (
                <ChatPage activity={selectedActivity} currentUser={currentUser} onBack={() => setSubView('list')} />
              )}
            </>
          )}
          {view === 'explore' && (
            <>
              {subView === 'list' && <ExplorePage onSelectActivity={(act) => { setSelectedActivity(act); setSubView('detail'); }} joinedMocks={joinedMocks} />}
              {subView === 'detail' && selectedActivity && <ActivityDetailPage activity={selectedActivity} onBack={() => setSubView('list')} onProceedToPlayers={() => setSubView('players')} />}
              {subView === 'players' && selectedActivity && <PlayersPage activity={selectedActivity} onBack={() => setSubView('detail')} onProceedToPayment={() => setSubView('payment')} />}
              {subView === 'payment' && selectedActivity && <PaymentPage activity={selectedActivity} currentUser={currentUser} setJoinedMocks={setJoinedMocks} onBack={() => setSubView('players')} onSuccess={() => { setSubView('booking_success'); setShowShareModal(true); }} />}
              {subView === 'booking_success' && (
                <div className="page-transition" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center', minHeight: '100vh' }}>
                  <CheckCircle2 size={64} color="#10B981" style={{ marginBottom: '24px' }} />
                  <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>You&apos;re In! 🎉</h1>
                  <p style={{ fontSize: '15px', color: '#64748B', marginBottom: '32px' }}>Your spot is locked in. Get ready to play!</p>
                  <button onClick={() => { setSubView('list'); setView('events'); }} className="btn-primary">View in Events</button>
                  <ShareModal isOpen={showShareModal} actionText="joined a session" onShare={() => setShowShareModal(false)} onDismiss={() => setShowShareModal(false)} />
                </div>
              )}
            </>
          )}
          {view === 'settings' && (
            <>
              {subView === 'list' && <SettingsPage theme={theme} setTheme={setTheme} setSubView={setSubView} currentUser={currentUser} displayName={displayName} avatarUrl={avatarUrl} onLogout={handleLogout} />}
              {subView === 'edit_profile' && <EditProfilePage currentUser={currentUser} displayName={displayName} setDisplayName={setDisplayName} avatarUrl={avatarUrl} setAvatarUrl={setAvatarUrl} selectedSports={selectedSports} setSelectedSports={setSelectedSports} skillLevels={skillLevels} setSkillLevels={setSkillLevels} onBack={() => setSubView('list')} />}
            </>
          )}
          
          {view !== 'host' && subView === 'list' && <BottomNav currentView={view} setView={setView} />}
        </>
      )}
    </div>
  );
}
