'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { 
  Zap, Bell, Eye, EyeOff, ChevronLeft, User, Camera, Check, Sun, Moon, 
  MapPin, Clock, Plus, Search, Globe, Calendar as CalendarIcon, Settings,
  CheckCircle, CheckCircle2, Users, BarChart2, CreditCard, AlignLeft, SearchX, Smartphone
} from 'lucide-react';

// --- SUB-COMPONENTS ---

function HStack({ children, style = {}, ...props }) {
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'row', alignItems: 'center',
        overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch', ...style
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
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: '430px', height: '64px', backgroundColor: 'var(--card-surface)',
      borderTop: 'var(--border)', display: 'flex', justifyContent: 'space-around',
      alignItems: 'center', paddingBottom: 'env(safe-area-inset-bottom)', zIndex: 50
    }}>
      {tabs.map(({ id, label, Icon }) => {
        const isActive = currentView === id || (currentView === 'home' && id === 'explore');
        return (
          <button
            key={id} onClick={() => setView(id)}
            style={{
              background: 'none', border: 'none', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '4px',
              color: isActive ? '#3B82F6' : '#64748B', cursor: 'pointer', width: '60px', position: 'relative'
            }}
          >
            {isActive && (
              <div style={{ position: 'absolute', top: '-10px', width: '4px', height: '4px', backgroundColor: '#3B82F6', borderRadius: '2px' }} />
            )}
            <Icon size={24} />
            <span style={{ fontSize: '10px', fontWeight: 600 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

const GLOBAL_SPORTS = [
  'Football', 'Basketball', 'Badminton', 'Tennis', 'Volleyball', 
  'Swimming', 'Table Tennis', 'Boxing', 'Gym / Weightlifting', 
  'Yoga', 'Running', 'Billiards', 'Hockey', 'Gymnastics', 'Other'
];

const SPORT_COLORS = {
  'Football': '#16213e', 'Basketball': '#f97316', 'Badminton': '#10b981',
  'Tennis': '#f59e0b', 'Volleyball': '#8b5cf6', 'Swimming': '#06b6d4',
  'Table Tennis': '#ec4899', 'Running': '#f43f5e', 'Other': '#3B82F6'
};

const SPORT_EMOJIS = {
  'Football': '⚽', 'Basketball': '🏀', 'Badminton': '🏸', 'Tennis': '🎾',
  'Volleyball': '🏐', 'Swimming': '🏊', 'Table Tennis': '🏓', 'Boxing': '🥊',
  'Gym / Weightlifting': '🏋️', 'Yoga': '🧘', 'Running': '🏃', 'Billiards': '🎱',
  'Hockey': '🏒', 'Gymnastics': '🤸', 'Other': '➕'
};

const SPORT_GRADIENTS = {
  'Football': 'linear-gradient(135deg, #1a1a2e, #16213e)',
  'Basketball': 'linear-gradient(135deg, #f97316, #ea580c)',
  'Badminton': 'linear-gradient(135deg, #10b981, #059669)',
  'Tennis': 'linear-gradient(135deg, #f59e0b, #d97706)',
  'Volleyball': 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  'Swimming': 'linear-gradient(135deg, #06b6d4, #0891b2)',
  'Table Tennis': 'linear-gradient(135deg, #ec4899, #db2777)',
  'Running': 'linear-gradient(135deg, #f43f5e, #e11d48)',
  'Other': 'linear-gradient(135deg, #475569, #334155)'
};

// --- EXPLORE & BOOKING FLOW ---

function ExplorePage({ onSelectActivity }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sportFilter, setSportFilter] = useState('All Sports');

  useEffect(() => {
    fetchActivities();
  }, [selectedDate, sportFilter]);

  const fetchActivities = async () => {
    setLoading(true);
    let query = supabase.from('activities').select('*').order('start_time', { ascending: true });
    
    if (selectedDate) {
      query = query.eq('date', selectedDate);
    }
    if (sportFilter !== 'All Sports') {
      query = query.eq('sport', sportFilter);
    }

    const { data } = await query;
    setActivities(data || []);
    setLoading(false);
  };

  // Generate 14-day slider
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
    const numStr = d.getDate();
    return { iso, dayStr, numStr };
  });

  return (
    <div className="page-transition" style={{ paddingBottom: '80px' }}>
      {/* Sticky Header */}
      <div style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-page)', borderBottom: 'var(--border)', padding: '16px 20px', zIndex: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800 }}>Explore</h1>
      </div>

      {/* Date Slider */}
      <div style={{ position: 'sticky', top: '57px', backgroundColor: 'var(--bg-page)', zIndex: 39, borderBottom: 'var(--border)', padding: '12px 0' }}>
        <HStack style={{ padding: '0 20px', gap: '8px' }}>
          {days.map((d) => {
            const isSel = selectedDate === d.iso;
            return (
              <button
                key={d.iso}
                onClick={() => setSelectedDate(d.iso)}
                style={{
                  minWidth: '52px', height: '64px', borderRadius: '16px', border: isSel ? 'none' : 'var(--border)',
                  backgroundColor: isSel ? '#3B82F6' : 'transparent', color: isSel ? '#ffffff' : 'var(--text-primary)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 500, color: isSel ? '#ffffff' : '#94A3B8' }}>{d.dayStr}</span>
                <span style={{ fontSize: '18px', fontWeight: 700, marginTop: '2px' }}>{d.numStr}</span>
              </button>
            );
          })}
        </HStack>
      </div>

      {/* Filter Bar */}
      <div style={{ padding: '12px 0', borderBottom: 'var(--border)' }}>
        <HStack style={{ padding: '0 20px', gap: '8px' }}>
          <select 
            value={sportFilter} 
            onChange={(e) => setSportFilter(e.target.value)}
            style={{
              height: '34px', borderRadius: '999px', padding: '0 14px', fontSize: '13px', fontWeight: 500,
              backgroundColor: sportFilter !== 'All Sports' ? '#3B82F6' : 'var(--card-surface)',
              color: sportFilter !== 'All Sports' ? '#ffffff' : '#94A3B8', border: 'var(--border)', outline: 'none'
            }}
          >
            <option value="All Sports">All Sports</option>
            {GLOBAL_SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </HStack>
      </div>

      {/* Activity List */}
      <div style={{ padding: '20px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748B', paddingTop: '40px' }}>Loading activities...</p>
        ) : activities.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '60px', textAlign: 'center' }}>
            <SearchX size={48} color="#334155" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>No activities on this day</h3>
            <p style={{ fontSize: '13px', color: '#94A3B8' }}>Try a different date or adjust your filters</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activities.map((act) => {
              const slotsLeft = act.total_players - act.confirmed_players;
              const color = SPORT_COLORS[act.sport] || '#3B82F6';
              const emoji = SPORT_EMOJIS[act.sport] || '🏅';

              return (
                <div
                  key={act.id}
                  onClick={() => onSelectActivity(act)}
                  style={{
                    borderRadius: '16px', backgroundColor: 'var(--card-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    border: 'var(--border)', borderLeft: `4px solid ${color}`, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '20px' }}>{emoji}</span>
                      <span style={{ fontSize: '15px', fontWeight: 700 }}>{act.sport}</span>
                    </div>
                    <div style={{
                      backgroundColor: slotsLeft <= 2 ? '#FEF2F2' : slotsLeft <= 5 ? '#FFFBEB' : '#F0FDF4',
                      color: slotsLeft <= 2 ? '#EF4444' : slotsLeft <= 5 ? '#F59E0B' : '#10B981',
                      borderRadius: '999px', padding: '4px 10px', fontSize: '11px', fontWeight: 600
                    }}>
                      {slotsLeft} slots left
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}>
                    <MapPin size={14} />
                    <span style={{ fontSize: '14px' }}>{act.venue}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}>
                    <Clock size={14} />
                    <span style={{ fontSize: '14px' }}>{act.date} · {act.start_time} - {act.end_time}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', backgroundColor: '#EFF6FF', color: '#3B82F6', textTransform: 'uppercase' }}>
                      {act.difficulty}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      SGD {parseFloat(act.fee).toFixed(2)} / person
                    </span>
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

function ActivityDetailPage({ activity, onBack, onProceedToBooking }) {
  const emoji = SPORT_EMOJIS[activity.sport] || '🏅';
  const grad = SPORT_GRADIENTS[activity.sport] || 'linear-gradient(135deg, #3B82F6, #1E3A5F)';
  const slotsLeft = activity.total_players - activity.confirmed_players;
  const isFull = slotsLeft <= 0;

  return (
    <div className="page-transition" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '90px' }}>
      {/* Hero Section */}
      <div style={{ height: '200px', background: grad, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <button onClick={onBack} style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
          <ChevronLeft size={24} />
        </button>
        <span style={{ fontSize: '48px', marginBottom: '8px' }}>{emoji}</span>
        <h1 style={{ fontSize: '22px', fontWeight: 800 }}>{activity.sport}</h1>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MapPin size={20} color="#3B82F6" />
          <span style={{ fontSize: '16px', fontWeight: 600 }}>{activity.venue}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Clock size={20} color="#3B82F6" />
          <span style={{ fontSize: '15px', color: '#64748B' }}>{activity.date} · {activity.start_time} - {activity.end_time}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CreditCard size={20} color="#3B82F6" />
          <span style={{ fontSize: '15px', fontWeight: 600 }}>SGD {parseFloat(activity.fee).toFixed(2)} per person</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BarChart2 size={20} color="#3B82F6" />
          <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', backgroundColor: '#EFF6FF', color: '#3B82F6', textTransform: 'uppercase' }}>
            {activity.difficulty}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users size={20} color="#3B82F6" />
          <span style={{ fontSize: '15px', color: '#64748B' }}>{activity.confirmed_players} / {activity.total_players} players confirmed</span>
        </div>

        {/* Slot Progress Bar */}
        <div style={{ width: '100%', height: '8px', backgroundColor: '#334155', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(activity.confirmed_players / activity.total_players) * 100}%`, backgroundColor: isFull ? '#EF4444' : '#3B82F6', transition: 'all 200ms ease' }} />
        </div>

        {activity.description && (
          <div style={{ backgroundColor: 'var(--card-surface)', padding: '16px', borderRadius: '16px', border: 'var(--border)', marginTop: '8px' }}>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5 }}>{activity.description}</p>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', padding: '16px 20px', backgroundColor: 'var(--card-surface)', borderTop: 'var(--border)', zIndex: 50 }}>
        <button 
          onClick={onProceedToBooking}
          className="btn-primary" 
          style={{ backgroundColor: isFull ? '#F59E0B' : '#3B82F6' }}
        >
          {isFull ? 'Join Waitlist' : "See Who's Playing →"}
        </button>
      </div>
    </div>
  );
}

function PaymentPage({ activity, currentUser, onBack, onSuccess }) {
  const [method, setMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    // Insert Booking Record
    const { error } = await supabase.from('bookings').insert({
      activity_id: activity.id,
      user_id: currentUser.id
    });

    if (!error) {
      // Increment confirmed_players in activities table
      await supabase.from('activities').update({
        confirmed_players: activity.confirmed_players + 1
      }).eq('id', activity.id);

      onSuccess();
    } else {
      alert('Booking failed or you already joined this activity.');
    }
    setLoading(false);
  };

  return (
    <div className="page-transition" style={{ minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}>
          <ChevronLeft size={24} />
        </button>
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: 700, marginRight: '24px' }}>Complete Booking</h1>
      </div>

      {/* Summary Card */}
      <div style={{ backgroundColor: 'var(--card-surface)', borderRadius: '16px', padding: '16px', border: 'var(--border)', marginBottom: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{activity.sport} @ {activity.venue}</div>
        <div style={{ fontSize: '14px', color: '#64748B' }}>{activity.date} · {activity.start_time}</div>
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#3B82F6', marginTop: '12px' }}>SGD {parseFloat(activity.fee).toFixed(2)}</div>
      </div>

      <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Choose Payment Method</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {[
          { id: 'apple', label: 'Apple Pay', Icon: Smartphone, color: '#F1F5F9' },
          { id: 'paylah', label: 'PayLah!', Icon: Smartphone, color: '#EF4444' },
          { id: 'card', label: 'Credit / Debit Card', Icon: CreditCard, color: '#3B82F6' }
        ].map((m) => (
          <div
            key={m.id}
            onClick={() => setMethod(m.id)}
            style={{
              borderRadius: '16px', padding: '16px', border: method === m.id ? '1.5px solid #3B82F6' : 'var(--border)',
              backgroundColor: method === m.id ? 'rgba(59,130,246,0.06)' : 'var(--card-surface)',
              display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer'
            }}
          >
            <m.Icon size={20} color={m.color} />
            <span style={{ fontSize: '15px', fontWeight: 600, flex: 1 }}>{m.label}</span>
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {method === m.id && <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#3B82F6' }} />}
            </div>
          </div>
        ))}
      </div>

      {method === 'card' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <input className="input-field" placeholder="1234 5678 9012 3456" defaultValue="4242 •••• •••• 4242" />
          <div style={{ display: 'flex', gap: '12px' }}>
            <input className="input-field" placeholder="MM/YY" defaultValue="12/28" />
            <input className="input-field" placeholder="CVV" defaultValue="123" />
          </div>
        </div>
      )}

      <button onClick={handlePay} disabled={loading} className="btn-primary" style={{ marginTop: 'auto' }}>
        {loading ? 'Processing...' : `Pay SGD ${parseFloat(activity.fee).toFixed(2)}`}
      </button>
    </div>
  );
}

function HostPage({ currentUser, defaultSport, setView }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sport, setSport] = useState(defaultSport || '');
  const [venue, setVenue] = useState('');
  const [customVenue, setCustomVenue] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [totalPlayers, setTotalPlayers] = useState('');
  const [confirmedPlayers, setConfirmedPlayers] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [fee, setFee] = useState('');
  const [description, setDescription] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const isTimeValid = startTime && endTime && endTime > startTime;
  const isPlayersValid = parseInt(confirmedPlayers) >= 0 && parseInt(confirmedPlayers) < parseInt(totalPlayers);
  const isFormComplete = sport && venue && (venue !== 'Other (type below)' || customVenue) && 
                         date && isTimeValid && totalPlayers >= 2 && isPlayersValid && difficulty && fee !== '';

  const finalVenue = venue === 'Other (type below)' ? customVenue : venue;

  const handlePostActivity = async () => {
    setIsSubmitting(true);
    const { data: activityData, error: activityError } = await supabase.from('activities').insert({
      host_id: currentUser.id,
      sport,
      venue: finalVenue,
      date,
      start_time: startTime,
      end_time: endTime,
      total_players: parseInt(totalPlayers),
      confirmed_players: parseInt(confirmedPlayers),
      difficulty,
      fee: parseFloat(fee),
      description
    }).select().single();

    if (!activityError && activityData) {
      await supabase.from('chats').insert({ activity_id: activityData.id });
      setStep(3);
    }
    setIsSubmitting(false);
  };

  if (step === 3) {
    return (
      <div className="page-transition" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center', minHeight: '100vh' }}>
        <CheckCircle size={64} color="#10B981" style={{ marginBottom: '24px' }} />
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Activity Posted!</h1>
        <p style={{ fontSize: '16px', color: '#64748B', marginBottom: '40px' }}>
          Waiting for {parseInt(totalPlayers) - parseInt(confirmedPlayers)} more players...
        </p>
        <button onClick={() => setView('events')} className="btn-primary" style={{ marginBottom: '12px' }}>
          View My Events
        </button>
        <button onClick={() => setView('home')} className="btn-primary" style={{ backgroundColor: 'transparent', border: '1.5px solid #3B82F6', color: '#3B82F6', boxShadow: 'none' }}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: 'var(--border)' }}>
        <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}>
          <ChevronLeft size={24} />
        </button>
        <h1 style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: 700, marginRight: '24px' }}>Host an Activity</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#3B82F6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
          {step === 2 ? <Check size={14} /> : 1}
        </div>
        <div style={{ width: '40px', height: '2px', backgroundColor: step === 2 ? '#10B981' : '#334155', margin: '0 8px' }} />
        <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: step === 2 ? '#3B82F6' : 'transparent', border: step === 2 ? 'none' : '2px solid #334155', color: step === 2 ? 'white' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
          2
        </div>
        <div style={{ width: '40px', height: '2px', backgroundColor: '#334155', margin: '0 8px' }} />
        <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #334155', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
          3
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>SPORT</label>
              <select className="input-field" value={sport} onChange={(e) => setSport(e.target.value)}>
                <option value="" disabled>Select a sport</option>
                {GLOBAL_SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>VENUE</label>
              <select className="input-field" value={venue} onChange={(e) => setVenue(e.target.value)}>
                <option value="" disabled>Select a venue</option>
                {["UTown Sports Hall", "MPSH 1", "MPSH 2", "MPSH 3", "MPSH 4", "MPSH 5", "MPSH 6", "The Deck", "University Cultural Centre", "Kent Ridge Paddock", "Other (type below)"].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              {venue === 'Other (type below)' && (
                <input type="text" className="input-field" placeholder="Enter custom venue name" value={customVenue} onChange={(e) => setCustomVenue(e.target.value)} style={{ marginTop: '8px' }} />
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>DATE</label>
              <input type="date" className="input-field" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>START TIME</label>
                <input type="time" className="input-field" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>END TIME</label>
                <input type="time" className="input-field" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>TOTAL PLAYERS</label>
                <input type="number" min="2" placeholder="e.g. 10" className="input-field" value={totalPlayers} onChange={(e) => setTotalPlayers(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>CONFIRMED</label>
                <input type="number" min="0" placeholder="e.g. 4" className="input-field" value={confirmedPlayers} onChange={(e) => setConfirmedPlayers(e.target.value)} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>DIFFICULTY LEVEL</label>
              <div style={{ display: 'flex', gap: '4px', height: '40px' }}>
                {['Beginner', 'Intermediate', 'Advanced', 'Professional'].map((level) => (
                  <button key={level} onClick={() => setDifficulty(level)} style={{
                    flex: 1, borderRadius: '999px', fontSize: '10px', fontWeight: 600, cursor: 'pointer',
                    border: difficulty === level ? 'none' : '1px solid #334155',
                    backgroundColor: difficulty === level ? '#3B82F6' : 'transparent',
                    color: difficulty === level ? '#ffffff' : '#64748B'
                  }}>{level}</button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>FEE PER PERSON</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: '#64748B', fontWeight: 600 }}>SGD</span>
                <input type="number" step="0.01" min="0" placeholder="0.00" className="input-field" style={{ paddingLeft: '60px' }} value={fee} onChange={(e) => setFee(e.target.value)} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>DESCRIPTION (OPTIONAL)</label>
              <textarea 
                className="input-field" 
                maxLength={300}
                style={{ height: 'auto', padding: '16px', resize: 'none' }} 
                rows={4} 
                placeholder="Add any extra details..."
                value={description} onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button onClick={() => setStep(2)} disabled={!isFormComplete} className="btn-primary" style={{ marginTop: '16px' }}>
              Review Activity →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="page-transition">
            <div style={{ backgroundColor: 'var(--card-surface)', borderRadius: '16px', padding: '16px', border: 'var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#64748B' }}>Sport</span>
                <span style={{ fontSize: '15px', fontWeight: 700 }}>{sport}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#64748B' }}>Venue</span>
                <span style={{ fontSize: '15px', fontWeight: 600 }}>{finalVenue}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#64748B' }}>Date</span>
                <span style={{ fontSize: '15px', fontWeight: 600 }}>{date}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#64748B' }}>Time</span>
                <span style={{ fontSize: '15px', fontWeight: 600 }}>{startTime} - {endTime}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#64748B' }}>Fee</span>
                <span style={{ fontSize: '15px', fontWeight: 600 }}>SGD {parseFloat(fee).toFixed(2)}</span>
              </div>
            </div>

            <button onClick={handlePostActivity} disabled={isSubmitting} className="btn-primary" style={{ marginTop: '24px', marginBottom: '12px' }}>
              {isSubmitting ? 'Posting...' : 'Post Activity'}
            </button>
            <button onClick={() => setStep(1)} disabled={isSubmitting} className="btn-primary" style={{ backgroundColor: 'transparent', border: '1.5px solid #3B82F6', color: '#3B82F6', boxShadow: 'none' }}>
              Edit Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function HomePage({ currentUser, displayName, theme, setTheme, setView, setHostDefaultSport }) {
  const userFirstName = displayName || currentUser?.user_metadata?.full_name || 'Athlete';

  return (
    <div className="page-transition" style={{ paddingBottom: '80px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-page)', borderBottom: 'var(--border)', padding: '16px 20px', zIndex: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={20} color="#3B82F6" fill="#3B82F6" />
            <span style={{ fontSize: '20px', fontWeight: 800 }}>SportAnytime</span>
          </div>
          <p style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px' }}>Hey {userFirstName} 👋</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Bell size={22} color="#64748B" />
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            {theme === 'dark' ? <Sun size={22} color="#64748B" /> : <Moon size={22} color="#64748B" />}
          </button>
        </div>
      </div>

      <div style={{ padding: '24px 20px', borderBottom: 'var(--border)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Hosting a Sport?</h2>
        <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', marginBottom: '16px' }}>You&apos;ve got the venue — find your players.</p>
        
        <HStack style={{ margin: '0 -20px', padding: '0 20px', gap: '10px' }}>
          {GLOBAL_SPORTS.slice(0, 8).map(s => (
            <div key={s} onClick={() => { setHostDefaultSport(s); setView('host'); }} style={{
              minWidth: '100px', height: '110px', borderRadius: '16px', background: SPORT_GRADIENTS[s] || 'linear-gradient(135deg, #3B82F6, #1E3A5F)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}>
              <span style={{ fontSize: '28px', marginBottom: '8px' }}>{SPORT_EMOJIS[s]}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>{s}</span>
            </div>
          ))}
        </HStack>
        
        <button onClick={() => { setHostDefaultSport(''); setView('host'); }} className="btn-primary" style={{ marginTop: '24px' }}>
          + Host an Activity
        </button>
      </div>

      <div style={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Find a Game</h2>
          <button onClick={() => setView('explore')} style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            See All →
          </button>
        </div>
        <p style={{ fontSize: '13px', color: '#64748B' }}>Tap &quot;See All →&quot; or use the Explore tab below to browse all live activities.</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [theme, setTheme] = useState('dark');
  const [view, setView] = useState('auth'); 
  const [authTab, setAuthTab] = useState('login'); 
  const [hostDefaultSport, setHostDefaultSport] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [subView, setSubView] = useState('list'); // 'list' | 'detail' | 'payment' | 'booking_success'
  
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

  const toggleSportSelect = (sportName) => {
    if (selectedSports.includes(sportName)) {
      setSelectedSports(selectedSports.filter((s) => s !== sportName));
    } else {
      setSelectedSports([...selectedSports, sportName]);
    }
  };

  const handleOnboardingComplete = async () => {
    setIsFinishing(true);
    if (currentUser) {
      await supabase.from('profiles').upsert({
        id: currentUser.id,
        sports_interested: selectedSports,
        difficulty_level: JSON.stringify(skillLevels),
      });
    }
    setTimeout(() => { setIsFinishing(false); setView('home'); }, 400);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      
      {/* AUTH VIEW */}
      {view === 'auth' && (
        <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <div style={{ height: '40vh', background: 'linear-gradient(160deg, #0F172A 0%, #1E3A5F 50%, #0F172A 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Zap size={28} color="#3B82F6" fill="#3B82F6" />
              <span style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>SportAnytime</span>
            </div>
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>Find your game. Fill your team.</p>
          </div>

          <div style={{ flex: 1, backgroundColor: 'var(--card-surface)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', marginTop: '-24px', padding: '24px 20px', display: 'flex', flexDirection: 'column' }}>
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              {authTab === 'signup' && (
                <input type="text" required placeholder="Full Name" className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              )}
              <input type="email" required placeholder="e0123456@u.nus.edu" className="input-field" value={email} onChange={(e) => handleEmailChange(e.target.value)} />
              <input type="password" required placeholder="••••••••" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="submit" disabled={loading} className="btn-primary">
                {authTab === 'login' ? 'Log In' : 'Create Account'}
              </button>
              <p style={{ fontSize: '13px', color: '#64748B', textAlign: 'center' }}>
                <span onClick={() => setAuthTab(authTab === 'login' ? 'signup' : 'login')} style={{ color: '#3B82F6', cursor: 'pointer' }}>
                  {authTab === 'login' ? 'Need an account? Sign Up' : 'Have an account? Log In'}
                </span>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* ONBOARDING VIEW */}
      {view === 'onboarding' && (
        <div className="page-transition" style={{ padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>Set up profile</h1>
          <input type="text" placeholder="Display Name" className="input-field" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{ marginBottom: '16px' }} />
          <button className="btn-primary" onClick={handleOnboardingComplete}>Finish & Go to App 🚀</button>
        </div>
      )}

      {/* DASHBOARD CORE APP */}
      {view !== 'auth' && view !== 'onboarding' && (
        <>
          {view === 'home' && <HomePage currentUser={currentUser} displayName={displayName} theme={theme} setTheme={setTheme} setView={setView} setHostDefaultSport={setHostDefaultSport} />}
          {view === 'host' && <HostPage currentUser={currentUser} defaultSport={hostDefaultSport} setView={setView} />}
          
          {view === 'explore' && (
            <>
              {subView === 'list' && (
                <ExplorePage onSelectActivity={(act) => { setSelectedActivity(act); setSubView('detail'); }} />
              )}
              {subView === 'detail' && selectedActivity && (
                <ActivityDetailPage activity={selectedActivity} onBack={() => setSubView('list')} onProceedToBooking={() => setSubView('payment')} />
              )}
              {subView === 'payment' && selectedActivity && (
                <PaymentPage activity={selectedActivity} currentUser={currentUser} onBack={() => setSubView('detail')} onSuccess={() => setSubView('booking_success')} />
              )}
              {subView === 'booking_success' && (
                <div className="page-transition" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center', minHeight: '100vh' }}>
                  <CheckCircle2 size={64} color="#10B981" style={{ marginBottom: '24px' }} />
                  <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>You&apos;re In! 🎉</h1>
                  <p style={{ fontSize: '15px', color: '#64748B', marginBottom: '32px' }}>Your spot is locked in. Get ready to play!</p>
                  <button onClick={() => { setSubView('list'); setView('events'); }} className="btn-primary">
                    View in Events
                  </button>
                </div>
              )}
            </>
          )}

          {view === 'social' && <div style={{ padding: '80px 20px', textAlign: 'center' }}>Social Page Coming Soon (Step 9)</div>}
          {view === 'events' && <div style={{ padding: '80px 20px', textAlign: 'center' }}>Events Page Coming Soon (Step 10)</div>}
          {view === 'settings' && <div style={{ padding: '80px 20px', textAlign: 'center' }}>Settings Page Coming Soon (Step 11)</div>}
          
          {view !== 'host' && subView === 'list' && <BottomNav currentView={view} setView={setView} />}
        </>
      )}

    </div>
  );
}
