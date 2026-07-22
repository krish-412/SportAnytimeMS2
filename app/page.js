'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { 
  Zap, Eye, EyeOff, ChevronLeft, User, Camera, Check, Sun, Moon 
} from 'lucide-react';

const SPORTS_LIST = [
  { id: 'football', name: 'Football', emoji: '⚽' },
  { id: 'basketball', name: 'Basketball', emoji: '🏀' },
  { id: 'badminton', name: 'Badminton', emoji: '🏸' },
  { id: 'tennis', name: 'Tennis', emoji: '🎾' },
  { id: 'volleyball', name: 'Volleyball', emoji: '🏐' },
  { id: 'swimming', name: 'Swimming', emoji: '🏊' },
  { id: 'table_tennis', name: 'Table Tennis', emoji: '🏓' },
  { id: 'boxing', name: 'Boxing', emoji: '🥊' },
  { id: 'gym', name: 'Gym / Weightlifting', emoji: '🏋️' },
  { id: 'yoga', name: 'Yoga', emoji: '🧘' },
  { id: 'running', name: 'Running', emoji: '🏃' },
  { id: 'billiards', name: 'Billiards', emoji: '🎱' },
  { id: 'hockey', name: 'Hockey', emoji: '🏒' },
  { id: 'gymnastics', name: 'Gymnastics', emoji: '🤸' },
  { id: 'other', name: 'Other', emoji: '➕' },
];

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];

export default function Home() {
  const [theme, setTheme] = useState('dark');
  const [view, setView] = useState('auth'); // 'auth' | 'onboarding' | 'dashboard'
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'signup'
  
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

  // Email validation rule
  const handleEmailChange = (val) => {
    setEmail(val);
    if (val.length > 0 && !val.toLowerCase().endsWith('@u.nus.edu')) {
      setEmailDomainError(true);
    } else {
      setEmailDomainError(false);
    }
  };

  // Password strength logic
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
        email,
        password,
        options: { data: { full_name: fullName } }
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
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
      } else if (data?.user) {
        setCurrentUser(data.user);
        setView('dashboard');
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
      setView('dashboard');
    }, 400);
  };

  const strength = getPasswordStrength();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Theme Toggle Float */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 100,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50%',
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          cursor: 'pointer'
        }}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* SCREEN 1: AUTHENTICATION */}
      {view === 'auth' && (
        <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Top 40% Hero Section */}
          <div style={{
            height: '40vh',
            background: 'linear-gradient(160deg, #0F172A 0%, #1E3A5F 50%, #0F172A 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Zap size={28} color="#3B82F6" fill="#3B82F6" />
              <span style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                SportAnytime
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '20px' }}>
              Find your game. Fill your team.
            </p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '20px', opacity: 0.8 }}>
              <span>⚽</span><span>🏀</span><span>🏸</span><span>🎾</span>
            </div>
          </div>

          {/* Bottom 60% Form Sheet */}
          <div style={{
            flex: 1,
            backgroundColor: 'var(--card-surface)',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            marginTop: '-24px',
            padding: '24px 20px 32px 20px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Tab Switcher */}
            <div style={{ display: 'flex', borderBottom: 'var(--border)', marginBottom: '24px', position: 'relative' }}>
              <button
                onClick={() => setAuthTab('login')}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  background: 'none',
                  border: 'none',
                  color: authTab === 'login' ? 'var(--text-primary)' : '#94A3B8',
                  fontWeight: authTab === 'login' ? 700 : 400,
                  fontSize: '15px',
                  cursor: 'pointer',
                  borderBottom: authTab === 'login' ? '2px solid #3B82F6' : '2px solid transparent',
                  transition: 'all 200ms ease'
                }}
              >
                Log In
              </button>
              <button
                onClick={() => setAuthTab('signup')}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  background: 'none',
                  border: 'none',
                  color: authTab === 'signup' ? 'var(--text-primary)' : '#94A3B8',
                  fontWeight: authTab === 'signup' ? 700 : 400,
                  fontSize: '15px',
                  cursor: 'pointer',
                  borderBottom: authTab === 'signup' ? '2px solid #3B82F6' : '2px solid transparent',
                  transition: 'all 200ms ease'
                }}
              >
                Sign Up
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              {authTab === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Tan"
                    className="input-field"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                  NUS EMAIL
                </label>
                <input
                  type="email"
                  required
                  placeholder="e0123456@u.nus.edu"
                  className="input-field"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                />
                {emailDomainError && (
                  <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '6px' }}>
                    SportAnytime is currently available to NUS students only.
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                  PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="input-field"
                    style={{ paddingRight: '48px' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      cursor: 'pointer'
                    }}
                  >
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
                    <a href="#" style={{ fontSize: '13px', color: '#3B82F6', textDecoration: 'none' }}>
                      Forgot password?
                    </a>
                  </div>
                )}
              </div>

              {authTab === 'signup' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                    CONFIRM PASSWORD
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="input-field"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}

              {authError && (
                <p style={{ fontSize: '13px', color: '#EF4444', textAlign: 'center' }}>
                  {authError}
                </p>
              )}

              <button type="submit" disabled={loading || emailDomainError} className="btn-primary" style={{ marginTop: '8px' }}>
                {loading ? 'Processing...' : authTab === 'login' ? 'Log In' : 'Create Account'}
              </button>

              <p style={{ fontSize: '13px', color: '#64748B', textAlign: 'center', marginTop: '8px' }}>
                {authTab === 'login' ? "Don't have an account? " : "Already have an account? "}
                <span
                  onClick={() => setAuthTab(authTab === 'login' ? 'signup' : 'login')}
                  style={{ color: '#3B82F6', fontWeight: 600, cursor: 'pointer' }}
                >
                  {authTab === 'login' ? 'Sign Up' : 'Log In'}
                </span>
              </p>

              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: 'var(--border)', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: '#94A3B8' }}>
                  By continuing you agree to our{' '}
                  <span style={{ color: '#3B82F6' }}>Terms of Service</span> and{' '}
                  <span style={{ color: '#3B82F6' }}>Privacy Policy</span>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCREEN 2: ONBOARDING */}
      {view === 'onboarding' && (
        <div className="page-transition" style={{ minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          {/* Top Progress Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            {onboardingStep > 1 ? (
              <button
                onClick={() => setOnboardingStep(onboardingStep - 1)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <ChevronLeft size={24} />
              </button>
            ) : <div style={{ width: 24 }} />}

            {/* Dots */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  style={{
                    height: 8,
                    borderRadius: 4,
                    width: onboardingStep === step ? 24 : 8,
                    backgroundColor: onboardingStep === step ? '#3B82F6' : '#334155',
                    transition: 'all 200ms ease'
                  }}
                />
              ))}
            </div>
            <div style={{ width: 24 }} />
          </div>

          {/* STEP 1: Profile Photo & Display Name */}
          {onboardingStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>Set up your profile</h1>
              <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '32px' }}>This is what other players will see</p>

              <div style={{ alignSelf: 'center', position: 'relative', marginBottom: '32px' }}>
                <div style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  background: avatarUrl ? `url(${avatarUrl}) center/cover` : 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  {!avatarUrl && <User size={40} />}
                </div>
                <label style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: '#3B82F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}>
                  <Camera size={14} />
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAvatarUrl(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                  />
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  DISPLAY NAME
                </label>
                <input
                  type="text"
                  placeholder="How should we call you?"
                  className="input-field"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                <button
                  disabled={displayName.trim().length < 2}
                  className="btn-primary"
                  onClick={() => setOnboardingStep(2)}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Sport Selection */}
          {onboardingStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>What do you play?</h1>
              <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>Select all that apply. You can change this later.</p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                maxHeight: '52vh',
                overflowY: 'auto',
                paddingRight: '4px'
              }}>
                {SPORTS_LIST.map((sport) => {
                  const isSelected = selectedSports.includes(sport.name);
                  return (
                    <div
                      key={sport.id}
                      onClick={() => toggleSportSelect(sport.name)}
                      style={{
                        height: 80,
                        borderRadius: 16,
                        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--card-surface)',
                        border: isSelected ? '2px solid #3B82F6' : 'var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 150ms ease'
                      }}
                    >
                      {isSelected && (
                        <div style={{ position: 'absolute', top: 8, right: 8, color: '#3B82F6' }}>
                          <Check size={16} />
                        </div>
                      )}
                      <span style={{ fontSize: '28px', marginBottom: '4px' }}>{sport.emoji}</span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: isSelected ? '#3B82F6' : 'var(--text-primary)' }}>
                        {sport.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {selectedSports.includes('Other') && (
                <div style={{ marginTop: '16px' }}>
                  <input
                    type="text"
                    placeholder="Enter custom sport name"
                    className="input-field"
                    value={customSport}
                    onChange={(e) => setCustomSport(e.target.value)}
                  />
                </div>
              )}

              <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                <button
                  disabled={selectedSports.length === 0}
                  className="btn-primary"
                  onClick={() => setOnboardingStep(3)}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Skill Level */}
          {onboardingStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>What's your level?</h1>
              <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>Be honest — it helps you find the right game.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '55vh', overflowY: 'auto' }}>
                {selectedSports.map((sportName) => {
                  const sportObj = SPORTS_LIST.find((s) => s.name === sportName) || { emoji: '🏅' };
                  const currentLevel = skillLevels[sportName];

                  return (
                    <div
                      key={sportName}
                      style={{
                        backgroundColor: 'var(--card-surface)',
                        border: 'var(--border)',
                        borderRadius: 16,
                        padding: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '20px' }}>{sportObj.emoji}</span>
                        <span style={{ fontSize: '15px', fontWeight: 700 }}>{sportName}</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                        {DIFFICULTY_LEVELS.map((level) => {
                          const isLevelSelected = currentLevel === level;
                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() => handleSkillSelect(sportName, level)}
                              style={{
                                height: 36,
                                borderRadius: 999,
                                border: isLevelSelected ? 'none' : 'var(--border)',
                                backgroundColor: isLevelSelected ? '#3B82F6' : 'transparent',
                                color: isLevelSelected ? '#ffffff' : '#94A3B8',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 150ms ease'
                              }}
                            >
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
                <button
                  disabled={Object.keys(skillLevels).length < selectedSports.length}
                  className="btn-primary"
                  style={{ backgroundColor: isFinishing ? '#10B981' : '#3B82F6' }}
                  onClick={handleOnboardingComplete}
                >
                  {isFinishing ? 'Success! 🎉' : "Let's Go 🚀"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DASHBOARD PLACEHOLDER (Ready for Step 6) */}
      {view === 'dashboard' && (
        <div className="page-transition" style={{ padding: '32px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>Welcome to SportAnytime!</h1>
          <p style={{ fontSize: '15px', color: '#94A3B8', marginBottom: '32px' }}>
            Your account and athletic preferences have been saved securely to Supabase.
          </p>
          <div style={{ padding: '20px', backgroundColor: 'var(--card-surface)', borderRadius: '16px', border: 'var(--border)' }}>
            <p style={{ fontSize: '14px', color: '#10B981', fontWeight: 600 }}>
              ✅ Authentication & Onboarding Complete
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
