'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { 
  Zap, Bell, Eye, EyeOff, ChevronLeft, User, Camera, Check, Sun, Moon, 
  MapPin, Clock, Plus, Search, Globe, Calendar as CalendarIcon, Settings 
} from 'lucide-react';

// --- SUB-COMPONENTS ---

function HStack({ children, style = {}, ...props }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
        ...style
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
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '430px',
      height: '64px',
      backgroundColor: 'var(--card-surface)',
      borderTop: 'var(--border)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 50
    }}>
      {tabs.map(({ id, label, Icon }) => {
        // Highlight Explore tab if we are on Home, otherwise highlight active tab
        const isActive = currentView === id || (currentView === 'home' && id === 'explore');
        return (
          <button
            key={id}
            onClick={() => setView(id)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: isActive ? '#3B82F6' : '#64748B',
              cursor: 'pointer',
              width: '60px',
              position: 'relative'
            }}
          >
            {isActive && (
              <div style={{
                position: 'absolute',
                top: '-10px',
                width: '4px',
                height: '4px',
                backgroundColor: '#3B82F6',
                borderRadius: '2px'
              }} />
            )}
            <Icon size={24} />
            <span style={{ fontSize: '10px', fontWeight: 600 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function HomePage({ currentUser, displayName, theme, setTheme, setView }) {
  const userFirstName = displayName || currentUser?.user_metadata?.full_name || 'Athlete';
  
  const SPORTS = [
    { name: 'Football', emoji: '⚽', grad: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
    { name: 'Basketball', emoji: '🏀', grad: 'linear-gradient(135deg, #f97316, #ea580c)' },
    { name: 'Badminton', emoji: '🏸', grad: 'linear-gradient(135deg, #10b981, #059669)' },
    { name: 'Tennis', emoji: '🎾', grad: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    { name: 'Volleyball', emoji: '🏐', grad: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
    { name: 'Swimming', emoji: '🏊', grad: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
    { name: 'Table Tennis', emoji: '🏓', grad: 'linear-gradient(135deg, #ec4899, #db2777)' },
    { name: 'Running', emoji: '🏃', grad: 'linear-gradient(135deg, #f43f5e, #e11d48)' },
    { name: 'Other', emoji: '➕', grad: 'linear-gradient(135deg, #475569, #334155)' },
  ];

  const MOCK_ACTIVITIES = [
    { id: 1, sport: 'Badminton', emoji: '🏸', color: '#10b981', venue: 'MPSH 1', date: 'Sat, 12 Jul', time: '6:00 PM – 8:00 PM', diff: 'Intermediate', price: '5.00', slots: 2 },
    { id: 2, sport: 'Running', emoji: '🏃', color: '#e11d48', venue: 'University Cultural Centre', date: 'Sun, 13 Jul', time: '7:00 AM – 8:30 AM', diff: 'Beginner', price: '0.00', slots: 10 },
    { id: 3, sport: 'Football', emoji: '⚽', color: '#16213e', venue: 'Kent Ridge Paddock', date: 'Mon, 14 Jul', time: '8:00 PM – 10:00 PM', diff: 'Advanced', price: '8.50', slots: 4 },
  ];

  const getSlotBadge = (n) => {
    if (n <= 2) return { bg: '#FEF2F2', color: '#EF4444' };
    if (n <= 5) return { bg: '#FFFBEB', color: '#F59E0B' };
    return { bg: '#F0FDF4', color: '#10B981' };
  };

  const getDiffBadge = (diff) => {
    if (diff === 'Beginner') return { bg: '#F0FDF4', color: '#10B981' };
    if (diff === 'Intermediate') return { bg: '#EFF6FF', color: '#3B82F6' };
    if (diff === 'Advanced') return { bg: '#FFFBEB', color: '#F59E0B' };
    return { bg: '#FEF2F2', color: '#EF4444' };
  };

  return (
    <div className="page-transition" style={{ paddingBottom: '80px', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Header */}
      <div style={{
        position: 'sticky', top: 0, backgroundColor: 'var(--bg-page)', borderBottom: 'var(--border)',
        padding: '16px 20px', zIndex: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={20} color="#3B82F6" fill="#3B82F6" />
            <span style={{ fontSize: '20px', fontWeight: 800 }}>SportAnytime</span>
          </div>
          <p style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px', color: 'var(--text-primary)' }}>
            Hey {userFirstName} 👋
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Bell size={22} color="#64748B" />
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            {theme === 'dark' ? <Sun size={22} color="#64748B" /> : <Moon size={22} color="#64748B" />}
          </button>
        </div>
      </div>

      {/* Section 1: Host */}
      <div style={{ padding: '24px 20px 24px 20px', borderBottom: 'var(--border)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Hosting a Sport?</h2>
        <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', marginBottom: '16px' }}>
          You&apos;ve got the venue — find your players.
        </p>
        
        <HStack style={{ margin: '0 -20px', padding: '0 20px', gap: '10px' }}>
          {SPORTS.map(sport => (
            <div key={sport.name} onClick={() => setView('host')} style={{
              minWidth: '100px', height: '110px', borderRadius: '16px', background: sport.grad,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}>
              <span style={{ fontSize: '28px', marginBottom: '8px' }}>{sport.emoji}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>{sport.name}</span>
            </div>
          ))}
        </HStack>
        
        <button onClick={() => setView('host')} className="btn-primary" style={{ marginTop: '24px' }}>
          + Host an Activity
        </button>
      </div>

      {/* Section 2: Explore */}
      <div style={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Find a Game</h2>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>Jump into a game near you.</p>
          </div>
          <button onClick={() => setView('explore')} style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            See All →
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {MOCK_ACTIVITIES.map(act => {
            const slots = getSlotBadge(act.slots);
            const diff = getDiffBadge(act.diff);
            return (
              <div key={act.id} onClick={() => setView('explore')} style={{
                borderRadius: '16px', backgroundColor: 'var(--card-surface)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08)',
                border: 'var(--border)', borderLeft: `4px solid ${act.color}`,
                padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '20px' }}>{act.emoji}</span>
                    <span style={{ fontSize: '15px', fontWeight: 700 }}>{act.sport}</span>
                  </div>
                  <div style={{ background: slots.bg, color: slots.color, borderRadius: '999px', padding: '4px 10px', fontSize: '11px', fontWeight: 600 }}>
                    {act.slots} slots left
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}>
                  <MapPin size={14} />
                  <span style={{ fontSize: '14px' }}>{act.venue}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}>
                  <Clock size={14} />
                  <span style={{ fontSize: '14px' }}>{act.date} · {act.time}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                  <div style={{ background: diff.bg, color: diff.color, borderRadius: '999px', padding: '3px 10px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                    {act.diff}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    SGD {act.price} / person
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---

export default function Home() {
  const [theme, setTheme] = useState('dark');
  const [view, setView] = useState('auth'); 
  const [authTab, setAuthTab] = useState('login'); 
  
  // Auth Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [emailDomainError, setEmailDomainError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Onboarding State
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [selectedSports, setSelectedSports] = useState([]);
  const [customSport, setCustomSport] = useState('');
  const [skillLevels, setSkillLevels] = useState({});
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleEmailChange = (val) => {
    setEmail(val);
    if (val.length > 0 && !val.toLowerCase().endsWith('@u.nus.edu')) {
      setEmailDomainError(true);
    } else {
      setEmailDomainError(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { score: 0, color: 'transparent', label: '' };
    if (password.length < 6) return { score: 33, color: '#EF4444', label: 'Weak' };
    if (password.length < 10) return { score: 66, color: '#F59E0B', label: 'Medium' };
    return { score: 100, color: '#10B981', label: 'Strong' };
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (emailDomainError) {
      setAuthError('Please use a valid @u.nus.edu email address.');
      return;
    }

    setLoading(true);

    if (authTab === 'signup') {
      if (password !== confirmPassword) {
        setAuthError('Passwords do not match.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: fullName } }
      });

      if (error) {
        setAuthError(error.message);
      } else if (data?.user) {
        setCurrentUser(data.user);
        setDisplayName(fullName || '');
        setView('onboarding');
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email, password,
      });

      if (error) {
        setAuthError(error.message);
      } else if (data?.user) {
        setCurrentUser(data.user);
        setView('home');
      }
    }
    setLoading(false);
  };

  const toggleSportSelect = (sportName) => {
    if (selectedSports.includes(sportName)) {
      setSelectedSports(selectedSports.filter((s) => s !== sportName));
      const updated = { ...skillLevels };
      delete updated[sportName];
      setSkillLevels(updated);
    } else {
      setSelectedSports([...selectedSports, sportName]);
    }
  };

  const handleSkillSelect = (sportName, level) => {
    setSkillLevels({ ...skillLevels, [sportName]: level });
  };

  const handleOnboardingComplete = async () => {
    setIsFinishing(true);
    let finalSports = [...selectedSports];
    if (finalSports.includes('Other') && customSport.trim()) {
      finalSports = finalSports.filter((s) => s !== 'Other');
      finalSports.push(customSport.trim());
    }

    if (currentUser) {
      await supabase.from('profiles').upsert({
        id: currentUser.id,
        sports_interested: finalSports,
        difficulty_level: JSON.stringify(skillLevels),
      });
    }

    setTimeout(() => {
      setIsFinishing(false);
      setView('home');
    }, 400);
  };

  const strength = getPasswordStrength();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      
      {/* AUTH VIEW */}
      {view === 'auth' && (
        <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Theme Toggle Float for Auth Only */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              position: 'absolute', top: 16, right: 16, zIndex: 100, background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', cursor: 'pointer'
            }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <div style={{
            height: '40vh', background: 'linear-gradient(160deg, #0F172A 0%, #1E3A5F 50%, #0F172A 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '20px', textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Zap size={28} color="#3B82F6" fill="#3B82F6" />
              <span style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>SportAnytime</span>
            </div>
            <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '20px' }}>Find your game. Fill your team.</p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '20px', opacity: 0.8 }}>
              <span>⚽</span><span>🏀</span><span>🏸</span><span>🎾</span>
            </div>
          </div>

          <div style={{
            flex: 1, backgroundColor: 'var(--card-surface)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
            marginTop: '-24px', padding: '24px 20px 32px 20px', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', borderBottom: 'var(--border)', marginBottom: '24px', position: 'relative' }}>
              <button
                onClick={() => setAuthTab('login')}
                style={{
                  flex: 1, padding: '12px 0', background: 'none', border: 'none',
                  color: authTab === 'login' ? 'var(--text-primary)' : '#94A3B8',
                  fontWeight: authTab === 'login' ? 700 : 400, fontSize: '15px', cursor: 'pointer',
                  borderBottom: authTab === 'login' ? '2px solid #3B82F6' : '2px solid transparent',
                  transition: 'all 200ms ease'
                }}
              >
                Log In
              </button>
              <button
                onClick={() => setAuthTab('signup')}
                style={{
                  flex: 1, padding: '12px 0', background: 'none', border: 'none',
                  color: authTab === 'signup' ? 'var(--text-primary)' : '#94A3B8',
                  fontWeight: authTab === 'signup' ? 700 : 400, fontSize: '15px', cursor: 'pointer',
                  borderBottom: authTab === 'signup' ? '2px solid #3B82F6' : '2px solid transparent',
                  transition: 'all 200ms ease'
                }}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              {authTab === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>FULL NAME</label>
                  <input type="text" required placeholder="e.g. Alex Tan" className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>NUS EMAIL</label>
                <input type="email" required placeholder="e0123456@u.nus.edu" className="input-field" value={email} onChange={(e) => handleEmailChange(e.target.value)} />
                {emailDomainError && <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '6px' }}>SportAnytime is currently available to NUS students only.</p>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} required placeholder="••••••••" className="input-field" style={{ paddingRight: '48px' }} value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {authTab === 'signup' && password.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ height: '4px', width: '100%', backgroundColor: '#334155', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${strength.score}%`, backgroundColor: strength.color, transition: 'all 200ms ease' }} />
                    </div>
                  </div>
                )}
                {authTab === 'login' && (
                  <div style={{ textAlign: 'right', marginTop: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#3B82F6', cursor: 'pointer' }}>Forgot password?</span>
                  </div>
                )}
              </div>
              {authTab === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>CONFIRM PASSWORD</label>
                  <input type="password" required placeholder="••••••••" className="input-field" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              )}
              {authError && <p style={{ fontSize: '13px', color: '#EF4444', textAlign: 'center' }}>{authError}</p>}
              
              <button type="submit" disabled={loading || emailDomainError} className="btn-primary" style={{ marginTop: '8px' }}>
                {loading ? 'Processing...' : authTab === 'login' ? 'Log In' : 'Create Account'}
              </button>
              
              <p style={{ fontSize: '13px', color: '#64748B', textAlign: 'center', marginTop: '8px' }}>
                {authTab === 'login' ? "Don't have an account? " : "Already have an account? "}
                <span onClick={() => setAuthTab(authTab === 'login' ? 'signup' : 'login')} style={{ color: '#3B82F6', fontWeight: 600, cursor: 'pointer' }}>
                  {authTab === 'login' ? 'Sign Up' : 'Log In'}
                </span>
              </p>
              
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: 'var(--border)', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: '#94A3B8' }}>
                  By continuing you agree to our <span style={{ color: '#3B82F6' }}>Terms of Service</span> and <span style={{ color: '#3B82F6' }}>Privacy Policy</span>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ONBOARDING VIEW */}
      {view === 'onboarding' && (
        <div className="page-transition" style={{ minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            {onboardingStep > 1 ? (
              <button onClick={() => setOnboardingStep(onboardingStep - 1)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                <ChevronLeft size={24} />
              </button>
            ) : <div style={{ width: 24 }} />}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {[1, 2, 3].map((step) => (
                <div key={step} style={{
                  height: 8, borderRadius: 4, width: onboardingStep === step ? 24 : 8,
                  backgroundColor: onboardingStep === step ? '#3B82F6' : '#334155', transition: 'all 200ms ease'
                }} />
              ))}
            </div>
            <div style={{ width: 24 }} />
          </div>

          {onboardingStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>Set up your profile</h1>
              <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '32px' }}>This is what other players will see</p>
              
              <div style={{ alignSelf: 'center', position: 'relative', marginBottom: '32px' }}>
                <div style={{
                  width: 96, height: 96, borderRadius: '50%',
                  background: avatarUrl ? `url(${avatarUrl}) center/cover` : 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff'
                }}>
                  {!avatarUrl && <User size={40} />}
                </div>
                <label style={{
                  position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%',
                  backgroundColor: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#ffffff', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}>
                  <Camera size={14} />
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setAvatarUrl(URL.createObjectURL(e.target.files[0]));
                  }} />
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.06em', marginBottom: '8px' }}>DISPLAY NAME</label>
                <input type="text" placeholder="How should we call you?" className="input-field" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                <button disabled={displayName.trim().length < 2} className="btn-primary" onClick={() => setOnboardingStep(2)}>Continue</button>
              </div>
            </div>
          )}

          {onboardingStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>What do you play?</h1>
              <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>Select all that apply. You can change this later.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxHeight: '52vh', overflowY: 'auto', paddingRight: '4px' }}>
                {[
                  { name: 'Football', emoji: '⚽' }, { name: 'Basketball', emoji: '🏀' }, { name: 'Badminton', emoji: '🏸' },
                  { name: 'Tennis', emoji: '🎾' }, { name: 'Volleyball', emoji: '🏐' }, { name: 'Swimming', emoji: '🏊' },
                  { name: 'Table Tennis', emoji: '🏓' }, { name: 'Boxing', emoji: '🥊' }, { name: 'Gym / Weightlifting', emoji: '🏋️' },
                  { name: 'Yoga', emoji: '🧘' }, { name: 'Running', emoji: '🏃' }, { name: 'Billiards', emoji: '🎱' },
                  { name: 'Hockey', emoji: '🏒' }, { name: 'Gymnastics', emoji: '🤸' }, { name: 'Other', emoji: '➕' }
                ].map((sport) => {
                  const isSelected = selectedSports.includes(sport.name);
                  return (
                    <div key={sport.name} onClick={() => toggleSportSelect(sport.name)} style={{
                      height: 80, borderRadius: 16, backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--card-surface)',
                      border: isSelected ? '2px solid #3B82F6' : 'var(--border)', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer', transition: 'all 150ms ease'
                    }}>
                      {isSelected && <div style={{ position: 'absolute', top: 8, right: 8, color: '#3B82F6' }}><Check size={16} /></div>}
                      <span style={{ fontSize: '28px', marginBottom: '4px' }}>{sport.emoji}</span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: isSelected ? '#3B82F6' : 'var(--text-primary)' }}>{sport.name}</span>
                    </div>
                  );
                })}
              </div>

              {selectedSports.includes('Other') && (
                <div style={{ marginTop: '16px' }}>
                  <input type="text" placeholder="Enter custom sport name" className="input-field" value={customSport} onChange={(e) => setCustomSport(e.target.value)} />
                </div>
              )}

              <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                <button disabled={selectedSports.length === 0} className="btn-primary" onClick={() => setOnboardingStep(3)}>Continue</button>
              </div>
            </div>
          )}

          {onboardingStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>What&apos;s your level?</h1>
              <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>Be honest — it helps you find the right game.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '55vh', overflowY: 'auto' }}>
                {selectedSports.map((sportName) => {
                  const currentLevel = skillLevels[sportName];
                  return (
                    <div key={sportName} style={{ backgroundColor: 'var(--card-surface)', border: 'var(--border)', borderRadius: 16, padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700 }}>{sportName}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                        {['Beginner', 'Intermediate', 'Advanced', 'Professional'].map((level) => {
                          const isLevelSelected = currentLevel === level;
                          return (
                            <button key={level} type="button" onClick={() => handleSkillSelect(sportName, level)} style={{
                              height: 36, borderRadius: 999, border: isLevelSelected ? 'none' : 'var(--border)',
                              backgroundColor: isLevelSelected ? '#3B82F6' : 'transparent', color: isLevelSelected ? '#ffffff' : '#94A3B8',
                              fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 150ms ease'
                            }}>
                              {level}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                <button disabled={Object.keys(skillLevels).length < selectedSports.length} className="btn-primary" style={{ backgroundColor: isFinishing ? '#10B981' : '#3B82F6' }} onClick={handleOnboardingComplete}>
                  {isFinishing ? 'Success! 🎉' : "Let's Go 🚀"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DASHBOARD CORE APP (Home, Host, Explore, etc.) */}
      {view !== 'auth' && view !== 'onboarding' && (
        <>
          {view === 'home' && <HomePage currentUser={currentUser} displayName={displayName} theme={theme} setTheme={setTheme} setView={setView} />}
          {view === 'host' && <div style={{ padding: '80px 20px', textAlign: 'center' }}>Host Page Coming Soon (Step 7)</div>}
          {view === 'explore' && <div style={{ padding: '80px 20px', textAlign: 'center' }}>Explore Page Coming Soon (Step 8)</div>}
          {view === 'social' && <div style={{ padding: '80px 20px', textAlign: 'center' }}>Social Page Coming Soon (Step 9)</div>}
          {view === 'events' && <div style={{ padding: '80px 20px', textAlign: 'center' }}>Events Page Coming Soon (Step 10)</div>}
          {view === 'settings' && <div style={{ padding: '80px 20px', textAlign: 'center' }}>Settings Page Coming Soon (Step 11)</div>}
          
          {/* Persistent Bottom Nav */}
          <BottomNav currentView={view} setView={setView} />
        </>
      )}

    </div>
  );
}
