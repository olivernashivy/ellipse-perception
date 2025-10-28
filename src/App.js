import React, { useState, useRef, useEffect } from 'react';
import { Save, RotateCcw, Database, HelpCircle, Share2, Tag, BookOpen, Users, X, Brain, Smile, Frown, Target, Zap, Heart, Eye } from 'lucide-react';
import Tutorial from './components/Tutorial';
import SaveDialog from './components/SaveDialog';
import EllipseCanvas from './components/EllipseCanvas';
import AdminPanel from './components/AdminPanel';
import LocationAnalysis from './components/LocationAnalysis';
import BreathingExercise from './components/BreathingExercise';

const EllipsePerceptionApp = () => {
  // State management
  const [bottomUpMajor, setBottomUpMajor] = useState(200);
  const [bottomUpMinor, setBottomUpMinor] = useState(100);
  const [topDownMajor, setTopDownMajor] = useState(200);
  const [topDownMinor, setTopDownMinor] = useState(100);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLocationAnalysis, setShowLocationAnalysis] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [configurations, setConfigurations] = useState([]);
  const [gpsPosition, setGpsPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(null);
  const [currentEmotion, setCurrentEmotion] = useState('');
  const [currentNotes, setCurrentNotes] = useState('');
  const [tutorialStep, setTutorialStep] = useState(0);
  
  // Canvas references
  const svgRef = useRef(null);
  const canvasWidth = 600;
  const canvasHeight = 500;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  // Emotion presets
  const emotionPresets = [
    { name: 'Calm', icon: Smile, bottomUpMajor: 200, bottomUpMinor: 180, topDownMajor: 200, topDownMinor: 180 },
    { name: 'Anxious', icon: Frown, bottomUpMajor: 300, bottomUpMinor: 80, topDownMajor: 150, topDownMinor: 120 },
    { name: 'Focused', icon: Target, bottomUpMajor: 150, bottomUpMinor: 120, topDownMajor: 280, topDownMinor: 100 },
    { name: 'Overwhelmed', icon: Zap, bottomUpMajor: 320, bottomUpMinor: 70, topDownMajor: 100, topDownMinor: 90 },
    { name: 'Relaxed', icon: Heart, bottomUpMajor: 220, bottomUpMinor: 200, topDownMajor: 180, topDownMinor: 170 },
    { name: 'Alert', icon: Eye, bottomUpMajor: 280, bottomUpMinor: 100, topDownMajor: 240, topDownMinor: 90 },
  ];

  // Initialize
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
    
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', '#000000');
    
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsPosition({
            lat: position.coords.latitude.toFixed(6),
            lon: position.coords.longitude.toFixed(6)
          });
        },
        (error) => console.log('GPS not available:', error)
      );
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('ellipseConfigurations');
    if (saved) {
      setConfigurations(JSON.parse(saved));
    }
  }, []);

  // Calculations
  const calculateEccentricity = (major, minor) => {
    if (major <= minor) return 0;
    return Math.sqrt(1 - Math.pow(minor / major, 2));
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getLocationGroup = () => {
    if (!gpsPosition) return [];
    
    return configurations.filter(config => {
      if (!config.gps) return false;
      const distance = calculateDistance(
        parseFloat(gpsPosition.lat), parseFloat(gpsPosition.lon),
        parseFloat(config.gps.lat), parseFloat(config.gps.lon)
      );
      return distance < 1;
    });
  };

  // Computed values
  const balance = (bottomUpMajor / bottomUpMinor) / (topDownMajor / topDownMinor);
  const eccBU = calculateEccentricity(bottomUpMajor, bottomUpMinor);
  const eccTD = calculateEccentricity(topDownMajor, topDownMinor);

  const getGradientColor = (value, type) => {
    if (type === 'bottomUp') {
      const hue = 45 + (value / 350) * 30;
      return `hsl(${hue}, 100%, 60%)`;
    } else {
      const hue = 120 + (value / 350) * 60;
      return `hsl(${hue}, 80%, 55%)`;
    }
  };

  const getBalanceColor = (bal) => {
    if (bal > 2.5) return '#ff6b6b';
    if (bal < 0.4) return '#ff6b6b';
    if (Math.abs(1 - bal) < 0.2) return '#6bcb77';
    return '#ffd93d';
  };

  // Handlers
  const handlePointerDown = (e, ellipse) => {
    e.preventDefault();
    setIsDragging(ellipse);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const dx = Math.abs(x - centerX);
    const dy = Math.abs(y - centerY);

    if (isDragging === 'bottomUp') {
      const newMajor = Math.max(50, Math.min(350, dx));
      const newMinor = Math.max(50, Math.min(250, dy));
      setBottomUpMajor(newMajor);
      setBottomUpMinor(newMinor);
      
      const coupling = 350 - (newMajor - 50);
      setTopDownMajor(Math.max(50, Math.min(350, coupling)));
      const ratio = newMinor / 100;
      setTopDownMinor(Math.max(50, Math.min(250, 100 / ratio)));
    } else if (isDragging === 'topDown') {
      const newMajor = Math.max(50, Math.min(350, dy));
      const newMinor = Math.max(50, Math.min(250, dx));
      setTopDownMajor(newMajor);
      setTopDownMinor(newMinor);
      
      const coupling = 350 - (newMajor - 50);
      setBottomUpMajor(Math.max(50, Math.min(350, coupling)));
      const ratio = newMinor / 100;
      setBottomUpMinor(Math.max(50, Math.min(250, 100 / ratio)));
    }
  };

  const handlePointerUp = () => {
    setIsDragging(null);
  };

  // Configuration management
  const saveConfiguration = () => {
    setShowSaveDialog(true);
  };

  const confirmSaveConfiguration = () => {
    const config = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      gps: gpsPosition,
      bottomUp: { major: bottomUpMajor, minor: bottomUpMinor },
      topDown: { major: topDownMajor, minor: topDownMinor },
      balance: balance,
      eccentricities: { bottomUp: eccBU, topDown: eccTD },
      emotion: currentEmotion,
      notes: currentNotes
    };
    
    const newConfigs = [...configurations, config];
    setConfigurations(newConfigs);
    localStorage.setItem('ellipseConfigurations', JSON.stringify(newConfigs));
    
    setShowSaveDialog(false);
    setCurrentEmotion('');
    setCurrentNotes('');
    setShowLocationAnalysis(true);
  };

  const resetConfiguration = () => {
    setBottomUpMajor(200);
    setBottomUpMinor(100);
    setTopDownMajor(200);
    setTopDownMinor(100);
    setCurrentEmotion('');
    setCurrentNotes('');
  };

  const applyEmotionPreset = (preset) => {
    setBottomUpMajor(preset.bottomUpMajor);
    setBottomUpMinor(preset.bottomUpMinor);
    setTopDownMajor(preset.topDownMajor);
    setTopDownMinor(preset.topDownMinor);
    setCurrentEmotion(preset.name);
  };

  const deleteConfiguration = (id) => {
    const newConfigs = configurations.filter(c => c.id !== id);
    setConfigurations(newConfigs);
    localStorage.setItem('ellipseConfigurations', JSON.stringify(newConfigs));
  };

  const clearAllData = () => {
    if (window.confirm('Delete all saved data?')) {
      setConfigurations([]);
      localStorage.removeItem('ellipseConfigurations');
    }
  };

  const shareConfiguration = () => {
    const shareText = `My Perception State

Bottom-Up (Sensory): ${eccBU.toFixed(3)}
Top-Down (Mental): ${eccTD.toFixed(3)}
Balance: ${balance.toFixed(2)}
${currentEmotion ? `Feeling: ${currentEmotion}` : ''}

Explore your own perception at: ${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Perception State',
        text: shareText,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Configuration copied to clipboard!');
    }
  };

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  // Add haptic feedback for mobile
  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10); // 10ms vibration
    }
  };

  const handleButtonClick = (callback) => {
    triggerHaptic();
    callback();
  };

  // Conditional renders
  if (showLocationAnalysis) {
    return (
      <div className="min-h-screen bg-black p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto pt-safe pb-safe">
          <LocationAnalysis 
            locationGroup={getLocationGroup()}
            getBalanceColor={getBalanceColor}
            onClose={() => setShowLocationAnalysis(false)}
          />
        </div>
      </div>
    );
  }

  if (showTutorial) {
    return <Tutorial 
      tutorialStep={tutorialStep}
      setTutorialStep={setTutorialStep}
      onClose={closeTutorial}
    />;
  }

  if (showSaveDialog) {
    return <SaveDialog 
      currentEmotion={currentEmotion}
      setCurrentEmotion={setCurrentEmotion}
      currentNotes={currentNotes}
      setCurrentNotes={setCurrentNotes}
      onSave={confirmSaveConfiguration}
      onCancel={() => setShowSaveDialog(false)}
    />;
  }

  if (showAdmin) {
    return <AdminPanel
      configurations={configurations}
      onClose={() => setShowAdmin(false)}
      onDelete={deleteConfiguration}
      onClearAll={clearAllData}
      getBalanceColor={getBalanceColor}
    />;
  }

  // Main app view
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
            <Brain size={32} className="text-purple-400" />
            Perception Explorer
          </h1>
          <button
            onClick={() => setShowTutorial(true)}
            className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition text-white"
            aria-label="Show tutorial"
          >
            <HelpCircle size={24} />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={18} className="text-purple-400" />
            <span className="text-sm font-semibold text-white/90">Quick Presets:</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {emotionPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleButtonClick(() => applyEmotionPreset(preset))}
                className="flex-shrink-0 bg-gradient-to-br from-purple-600/30 to-blue-600/30 hover:from-purple-600/50 hover:to-blue-600/50 border border-white/20 rounded-xl px-4 py-2 text-sm font-medium transition whitespace-nowrap flex items-center gap-2 haptic-feedback hover-lift text-white"
              >
                {React.createElement(preset.icon, { size: 16, className: "text-white" })}
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {currentEmotion && (
          <div className="mb-4 bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/30 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-pink-400" />
              <span className="font-semibold text-pink-300">Current: {currentEmotion}</span>
            </div>
            <button
              onClick={() => setCurrentEmotion('')}
              className="text-white/60 hover:text-white transition"
              aria-label="Clear emotion"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <EllipseCanvas
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          centerX={centerX}
          centerY={centerY}
          bottomUpMajor={bottomUpMajor}
          bottomUpMinor={bottomUpMinor}
          topDownMajor={topDownMajor}
          topDownMinor={topDownMinor}
          isDragging={isDragging}
          svgRef={svgRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          getGradientColor={getGradientColor}
        />

        <div className="h-10 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 rounded-full relative mb-6 shadow-lg">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-14 bg-white rounded-full shadow-2xl transition-all duration-300"
            style={{ left: `${Math.max(0, Math.min(100, 50 + (balance - 1) * 25))}%`, filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
            <div className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ background: getGradientColor(bottomUpMajor, 'bottomUp') }} />
              Bottom-Up
            </div>
            <div className="text-sm space-y-1">
              <div>Eccentricity: <span className="font-bold">{eccBU.toFixed(3)}</span></div>
              <div className="text-xs text-white/50">Stimulus-driven</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-xl p-4 border border-green-500/30">
            <div className="text-green-400 font-semibold mb-2 flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ background: getGradientColor(topDownMajor, 'topDown') }} />
              Top-Down
            </div>
            <div className="text-sm space-y-1">
              <div>Eccentricity: <span className="font-bold">{eccTD.toFixed(3)}</span></div>
              <div className="text-xs text-white/50">Concept-driven</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 mb-6 border border-purple-500/30">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Balance:</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {balance.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => handleButtonClick(saveConfiguration)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow-lg haptic-feedback hover-lift"
            aria-label="Save configuration"
          >
            <Save size={20} />
            Save
          </button>
          <button
            onClick={() => handleButtonClick(resetConfiguration)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow-lg haptic-feedback hover-lift"
            aria-label="Reset configuration"
          >
            <RotateCcw size={20} />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => handleButtonClick(shareConfiguration)}
            className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow-lg haptic-feedback hover-lift"
            aria-label="Share configuration"
          >
            <Share2 size={18} />
            Share
          </button>
          <button
            onClick={() => handleButtonClick(() => setShowAdmin(true))}
            className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow-lg border border-white/10 haptic-feedback hover-lift"
            aria-label="Open admin panel"
          >
            <Database size={18} />
            History ({configurations.length})
          </button>
        </div>

        {gpsPosition && getLocationGroup().length > 0 && (
          <button
            onClick={() => handleButtonClick(() => setShowLocationAnalysis(true))}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow-lg animate-bounce haptic-feedback hover-lift"
            aria-label="View location analysis"
          >
            <Users size={20} />
            Location Analysis ({getLocationGroup().length} users nearby)
          </button>
        )}

        {gpsPosition && (
          <div className="mt-4 text-center text-sm text-white/40 font-mono bg-black/40 rounded-lg py-2 border border-white/5">
            📍 {gpsPosition.lat}°, {gpsPosition.lon}°
          </div>
        )}
      </div>

      {/* Floating Breathing Exercise Button - Bottom Right Corner */}
      <BreathingExercise balance={balance} />
    </div>
  );
};

export default EllipsePerceptionApp;
