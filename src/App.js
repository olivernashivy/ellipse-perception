import React, { useState, useRef, useEffect } from 'react';
import { Save, RotateCcw, Database, HelpCircle, Share2, Tag, BookOpen, Users, X, Brain, Smile, Frown, Target, Zap, Heart, Eye, BarChart3, Lightbulb, Triangle, AlertTriangle, CheckCircle } from 'lucide-react';
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
  const [showInstructions, setShowInstructions] = useState(false);
  const [hoveredEllipse, setHoveredEllipse] = useState(null);
  const [showAppendix, setShowAppendix] = useState(false);
  const [isMultiTouch, setIsMultiTouch] = useState(false);
  const [lastHapticTime, setLastHapticTime] = useState(0);
  
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

  // Emotional state interpretation helpers
  const getTopDownInterpretation = () => {
    const ratio = topDownMajor / topDownMinor;
    const width = topDownMinor;
    
    // Vertical stretch = being suppressed/overwhelmed, taking on too much
    if (topDownMajor > 280 && ratio > 2.5) {
      return "Unterdrückt - Overly responsible, emotionally stretched thin";
    } else if (topDownMajor > 220 && ratio > 2) {
      return "Overwhelmed - Carrying too much mental burden";
    } else if (width < 80 && ratio > 1.8) {
      return "Compressed - Loss of mental flexibility and clarity";
    } else if (topDownMajor < 120) {
      return "Relaxed - Low mental pressure, breathing room";
    } else if (ratio < 1.5 && width > 120) {
      return "Flexible - Adaptive thinking, clear awareness";
    }
    return "Balanced - Healthy responsibility level";
  };

  const getBottomUpInterpretation = () => {
    const ratio = bottomUpMajor / bottomUpMinor;
    const height = bottomUpMinor;
    
    // Horizontal stretch = external pressure from environment
    if (bottomUpMajor > 280 && ratio > 2.5) {
      return "External overwhelm - Others taking too much space";
    } else if (bottomUpMajor > 220 && ratio > 2) {
      return "Scattered - Too much external input and pressure";
    } else if (height < 80) {
      return "Compressed self - Loss of self-awareness and grounding";
    } else if (height > 180 && ratio < 1.5) {
      return "Grounded - Strong sense of self, centered";
    } else if (bottomUpMinor > bottomUpMajor) {
      return "Focused inward - Clear self-awareness";
    }
    return "Balanced - Healthy boundary with environment";
  };

  // Get breathing animation class based on emotional intensity
  const getBottomUpBreatheClass = () => {
    if (isDragging === 'bottomUp') return ''; // No animation while dragging
    const ratio = bottomUpMajor / bottomUpMinor;
    if (bottomUpMajor > 280 && ratio > 2.5) {
      return 'ellipse-breathe-overwhelmed'; // Fast, irregular breathing
    } else if (bottomUpMajor > 220 && ratio > 2) {
      return 'ellipse-breathe-intense'; // Quick breathing
    } else if (bottomUpMinor > 180 || ratio < 1.5) {
      return 'ellipse-breathe-calm'; // Slow, deep breathing
    }
    return 'ellipse-breathe-neutral'; // Normal breathing
  };

  const getTopDownBreatheClass = () => {
    if (isDragging === 'topDown') return ''; // No animation while dragging
    const ratio = topDownMajor / topDownMinor;
    if (topDownMajor > 280 && ratio > 2.5) {
      return 'ellipse-breathe-overwhelmed'; // Fast, irregular breathing
    } else if (topDownMajor > 220 && ratio > 2) {
      return 'ellipse-breathe-intense'; // Quick breathing
    } else if (topDownMajor < 120 || ratio < 1.5) {
      return 'ellipse-breathe-calm'; // Slow, deep breathing
    }
    return 'ellipse-breathe-neutral'; // Normal breathing
  };

  // Handlers
  const handlePointerDown = (e, ellipse) => {
    e.preventDefault();
    setIsDragging(ellipse);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    
    // Support multi-touch for independent axis control
    let touches = [];
    if (e.touches && e.touches.length > 0) {
      // Multi-touch: map all touch points
      touches = Array.from(e.touches).map(touch => ({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      }));
      setIsMultiTouch(touches.length > 1);
    } else {
      // Single touch or mouse
      const clientX = e.clientX;
      const clientY = e.clientY;
      touches = [{
        x: clientX - rect.left,
        y: clientY - rect.top
      }];
      setIsMultiTouch(false);
    }

    // Calculate distances from center for each touch point
    const distances = touches.map(touch => ({
      dx: Math.abs(touch.x - centerX),
      dy: Math.abs(touch.y - centerY),
      rawX: touch.x - centerX,
      rawY: touch.y - centerY
    }));

    if (isDragging === 'bottomUp') {
      // Bottom-Up: Horizontal ellipse - independent control
      if (touches.length > 1) {
        // Multi-touch: independently control horizontal and vertical
        // Find horizontal and vertical extremes
        const maxDx = Math.max(...distances.map(d => d.dx));
        const maxDy = Math.max(...distances.map(d => d.dy));
        
        const newMajor = Math.max(50, Math.min(350, maxDx));
        const newMinor = Math.max(50, Math.min(250, maxDy));
        
        setBottomUpMajor(newMajor);
        setBottomUpMinor(newMinor);
      } else {
        // Single touch: traditional diagonal drag
        const dx = distances[0].dx;
        const dy = distances[0].dy;
        
        // Detect primary drag direction for more precise control
        const angle = Math.atan2(distances[0].rawY, distances[0].rawX);
        const isHorizontalDrag = Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle));
        
        if (isHorizontalDrag) {
          // Primarily horizontal drag - adjust major axis more
          const newMajor = Math.max(50, Math.min(350, dx));
          setBottomUpMajor(newMajor);
          // Minor axis follows with dampening
          const newMinor = Math.max(50, Math.min(250, dy * 0.3 + bottomUpMinor * 0.7));
          setBottomUpMinor(newMinor);
        } else {
          // Primarily vertical drag - adjust minor axis more
          const newMinor = Math.max(50, Math.min(250, dy));
          setBottomUpMinor(newMinor);
          // Major axis follows with dampening
          const newMajor = Math.max(50, Math.min(350, dx * 0.3 + bottomUpMajor * 0.7));
          setBottomUpMajor(newMajor);
        }
      }
      
      // Trigger stress-based haptic feedback (debounced)
      const now = Date.now();
      if (now - lastHapticTime > 200) { // Debounce: max once per 200ms
        const stressLevel = checkEmotionalStress();
        triggerHaptic(stressLevel);
        setLastHapticTime(now);
      }
      
    } else if (isDragging === 'topDown') {
      // Top-Down: Vertical ellipse - independent control
      if (touches.length > 1) {
        // Multi-touch: independently control vertical and horizontal
        const maxDx = Math.max(...distances.map(d => d.dx));
        const maxDy = Math.max(...distances.map(d => d.dy));
        
        const newMajor = Math.max(50, Math.min(350, maxDy));
        const newMinor = Math.max(50, Math.min(250, maxDx));
        
        setTopDownMajor(newMajor);
        setTopDownMinor(newMinor);
      } else {
        // Single touch: traditional diagonal drag
        const dx = distances[0].dx;
        const dy = distances[0].dy;
        
        // Detect primary drag direction for more precise control
        const angle = Math.atan2(distances[0].rawY, distances[0].rawX);
        const isVerticalDrag = Math.abs(Math.sin(angle)) > Math.abs(Math.cos(angle));
        
        if (isVerticalDrag) {
          // Primarily vertical drag - adjust major axis more
          const newMajor = Math.max(50, Math.min(350, dy));
          setTopDownMajor(newMajor);
          // Minor axis follows with dampening
          const newMinor = Math.max(50, Math.min(250, dx * 0.3 + topDownMinor * 0.7));
          setTopDownMinor(newMinor);
        } else {
          // Primarily horizontal drag - adjust minor axis more
          const newMinor = Math.max(50, Math.min(250, dx));
          setTopDownMinor(newMinor);
          // Major axis follows with dampening
          const newMajor = Math.max(50, Math.min(350, dy * 0.3 + topDownMajor * 0.7));
          setTopDownMajor(newMajor);
        }
      }
      
      // Trigger stress-based haptic feedback (debounced)
      const now = Date.now();
      if (now - lastHapticTime > 200) { // Debounce: max once per 200ms
        const stressLevel = checkEmotionalStress();
        triggerHaptic(stressLevel);
        setLastHapticTime(now);
      }
    }
  };

  const handlePointerUp = () => {
    setIsDragging(null);
    setIsMultiTouch(false);
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

  // Add haptic feedback for mobile with stress-based intensity
  const triggerHaptic = (stressLevel = 'normal') => {
    if (!navigator.vibrate) return;
    
    // Different vibration patterns based on emotional stress
    const patterns = {
      normal: 10,                    // Subtle feedback for regular interactions
      moderate: [20, 10, 20],        // Double pulse for moderate stress
      high: [30, 10, 30, 10, 30],    // Triple pulse for high stress
      extreme: [50, 30, 50, 30, 50]  // Intense pattern for extreme distortion
    };
    
    navigator.vibrate(patterns[stressLevel] || patterns.normal);
  };

  // Check for extreme distortion and trigger appropriate haptic feedback
  const checkEmotionalStress = () => {
    const bottomUpRatio = bottomUpMajor / bottomUpMinor;
    const topDownRatio = topDownMajor / topDownMinor;
    
    // Extreme distortion: both ratios very high or values at extremes
    if ((bottomUpRatio > 3.5 || topDownRatio > 3.5) || 
        (bottomUpMajor > 330 || topDownMajor > 330)) {
      return 'extreme';
    }
    
    // High stress: significant imbalance
    if ((bottomUpRatio > 2.5 || topDownRatio > 2.5) ||
        (bottomUpMajor > 280 || topDownMajor > 280)) {
      return 'high';
    }
    
    // Moderate stress: noticeable imbalance
    if ((bottomUpRatio > 2.0 || topDownRatio > 2.0) ||
        (bottomUpMajor > 230 || topDownMajor > 230)) {
      return 'moderate';
    }
    
    return 'normal';
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

        {/* Empathetic instruction panel */}
        {/* <div className="mb-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
          <div className="text-xs text-blue-300 space-y-1">
            <div className="font-semibold mb-1">💡 How to express your feeling:</div>
            <div>🟡 <span className="text-yellow-300">Horizontal (Yellow)</span>: Stretch sideways when you feel external pressure, loss of self, or scattered</div>
            <div>🟢 <span className="text-green-300">Vertical (Green)</span>: Stretch upward when overwhelmed, taking on too much responsibility</div>
            <div className="text-white/60 text-[10px] mt-2">Drag each ellipse independently to map your unique emotional state</div>
          </div>
        </div> */}

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

        {/* Canvas with hover info cards */}
        <div className="relative mb-6">
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
            bottomUpBreatheClass={getBottomUpBreatheClass()}
            topDownBreatheClass={getTopDownBreatheClass()}
          />
          
          {/* Multi-touch indicator */}
          {isMultiTouch && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-purple-500/80 backdrop-blur-sm border border-purple-400/60 rounded-full px-4 py-2 shadow-2xl animate-pulse z-20">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
                Multi-Touch Active
              </div>
            </div>
          )}

          {/* Instruction hint for multi-touch */}
          {isDragging && !isMultiTouch && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-indigo-500/70 backdrop-blur-sm border border-indigo-400/50 rounded-xl px-3 py-2 shadow-lg z-20">
              <div className="text-xs text-white/90 text-center">
                💡 Use two fingers for independent axis control
              </div>
            </div>
          )}

          {/* Extreme stress warning indicator */}
          {(() => {
            const stressLevel = checkEmotionalStress();
            if (stressLevel === 'extreme') {
              return (
                <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm border border-red-400/80 rounded-xl px-3 py-2 shadow-2xl animate-pulse z-20">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <span className="text-lg">⚠️</span>
                    Extreme Distortion
                  </div>
                </div>
              );
            } else if (stressLevel === 'high') {
              return (
                <div className="absolute top-4 right-4 bg-orange-500/80 backdrop-blur-sm border border-orange-400/60 rounded-xl px-3 py-2 shadow-lg z-20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <span>⚡</span>
                    High Stress
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>

        {/* Balance slider with hover instructions */}
        <div 
          className="relative mb-6"
          onMouseEnter={() => setShowInstructions(true)}
          onMouseLeave={() => setShowInstructions(false)}
        >
          {/* Empathetic instruction panel - shows on hover */}
          {showInstructions && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 bg-blue-500/20 backdrop-blur-md border border-blue-500/50 rounded-xl p-3 shadow-2xl animate-slideUp max-w-md">
              <div className="text-xs text-blue-200 space-y-1">
                <div className="font-semibold mb-1 text-white">💡 How to express your emotional state:</div>
                <div>🟡 <span className="text-yellow-300 font-medium">Bottom-Up (Yellow)</span>: React to external environment - stretch when others take too much space, compress when losing self-awareness</div>
                <div>🟢 <span className="text-green-300 font-medium">Top-Down (Green)</span>: Express internal burden - stretch upward when "unterdrückt" (suppressed/overwhelmed), narrow when losing mental flexibility</div>
                <div className="text-white/70 text-[10px] mt-2 pt-2 border-t border-white/20">Use multi-touch gestures to precisely adjust each ellipse independently and align with your feelings</div>
              </div>
            </div>
          )}

          <div className="h-10 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 rounded-full relative shadow-lg">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-14 bg-white rounded-full shadow-2xl transition-all duration-300"
              style={{ left: `${Math.max(0, Math.min(100, 50 + (balance - 1) * 25))}%`, filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 relative">
          {/* Bottom-Up metric card with hover */}
          <div 
            className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30 cursor-help transition-all hover:border-yellow-400/50 hover:shadow-xl hover:shadow-yellow-500/20"
            onMouseEnter={() => setHoveredEllipse('bottomUp')}
            onMouseLeave={() => setHoveredEllipse(null)}
          >
            <div className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ background: getGradientColor(bottomUpMajor, 'bottomUp') }} />
              Bottom-Up
            </div>
            <div className="text-sm space-y-1">
              <div>Eccentricity: <span className="font-bold">{eccBU.toFixed(3)}</span></div>
              <div className="text-xs text-white/50 mb-2">External environment pressure</div>
              <div className="text-xs text-yellow-300 mt-2 italic">
                {getBottomUpInterpretation()}
              </div>
            </div>
          </div>

          {/* Top-Down metric card with hover */}
          <div 
            className="bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-xl p-4 border border-green-500/30 cursor-help transition-all hover:border-green-400/50 hover:shadow-xl hover:shadow-green-500/20"
            onMouseEnter={() => setHoveredEllipse('topDown')}
            onMouseLeave={() => setHoveredEllipse(null)}
          >
            <div className="text-green-400 font-semibold mb-2 flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ background: getGradientColor(topDownMajor, 'topDown') }} />
              Top-Down
            </div>
            <div className="text-sm space-y-1">
              <div>Eccentricity: <span className="font-bold">{eccTD.toFixed(3)}</span></div>
              <div className="text-xs text-white/50 mb-2">Internal responsibility burden</div>
              <div className="text-xs text-green-300 mt-2 italic">
                {getTopDownInterpretation()}
              </div>
            </div>
          </div>

                    {/* Bottom-Up Info Card */}
          {hoveredEllipse === 'bottomUp' && (
            <div className="absolute left-0 top-full mt-2 max-w-xs bg-gradient-to-br from-yellow-500/30 to-orange-500/30 backdrop-blur-md border border-yellow-500/60 rounded-2xl p-4 shadow-2xl animate-slideIn z-20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
                <h4 className="font-bold text-yellow-300">Bottom-Up: External Environment</h4>
              </div>
              <div className="text-xs text-white/90 space-y-2">
                <div>
                  <span className="font-semibold text-yellow-200">What it represents:</span>
                  <div className="text-white/80 mt-1">Your relationship with the surrounding environment - how external pressures affect your sense of self</div>
                </div>
                <div className="border-t border-white/20 pt-2 space-y-1">
                  <div className="text-white/70">
                    <span className="font-medium">→ Horizontal (Width):</span> {bottomUpMajor.toFixed(0)}px
                  </div>
                  <div className="text-white/60 text-[10px] ml-3">
                    When others take too much responsibility or space in your environment
                  </div>
                  <div className="text-white/70 mt-1">
                    <span className="font-medium">↕ Vertical (Height):</span> {bottomUpMinor.toFixed(0)}px
                  </div>
                  <div className="text-white/60 text-[10px] ml-3">
                    Your sense of self, grounding, and self-awareness
                  </div>
                  <div className="text-white/70 mt-1">
                    <span className="font-medium">Ratio:</span> {(bottomUpMajor / bottomUpMinor).toFixed(2)} {(bottomUpMajor / bottomUpMinor) > 1.8 ? '⚠️ Compressed self' : bottomUpMinor > bottomUpMajor ? '✓ Grounded' : '○ Balanced'}
                  </div>
                </div>
                <div className="text-[10px] text-yellow-200/70 italic bg-yellow-500/10 p-2 rounded">
                  💡 <strong>Use multi-touch:</strong> Stretch horizontally when external pressure increases. Your vertical axis (self-awareness) may compress when overwhelmed by surroundings.
                </div>
              </div>
            </div>
          )}

          {/* Top-Down Info Card */}
          {hoveredEllipse === 'topDown' && (
            <div className="absolute right-0 top-full mt-2 max-w-xs bg-gradient-to-br from-green-500/30 to-cyan-500/30 backdrop-blur-md border border-green-500/60 rounded-2xl p-4 shadow-2xl animate-slideIn z-20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                <h4 className="font-bold text-green-300">Top-Down: Internal Responsibility</h4>
              </div>
              <div className="text-xs text-white/90 space-y-2">
                <div>
                  <span className="font-semibold text-green-200">What it represents:</span>
                  <div className="text-white/80 mt-1">Being "unterdrückt" (suppressed/overwhelmed) - how responsibility weighs on you internally</div>
                </div>
                <div className="border-t border-white/20 pt-2 space-y-1">
                  <div className="text-white/70">
                    <span className="font-medium">↕ Vertical (Height):</span> {topDownMajor.toFixed(0)}px
                  </div>
                  <div className="text-white/60 text-[10px] ml-3">
                    Mental burden and responsibility - being stretched thin emotionally
                  </div>
                  <div className="text-white/70 mt-1">
                    <span className="font-medium">→ Horizontal (Width):</span> {topDownMinor.toFixed(0)}px
                  </div>
                  <div className="text-white/60 text-[10px] ml-3">
                    Mental flexibility, clarity, and adaptive thinking
                  </div>
                  <div className="text-white/70 mt-1">
                    <span className="font-medium">Ratio:</span> {(topDownMajor / topDownMinor).toFixed(2)} {(topDownMajor / topDownMinor) > 2 ? '⚠️ Stretched thin' : topDownMinor > 120 ? '✓ Flexible' : '○ Balanced'}
                  </div>
                </div>
                <div className="text-[10px] text-green-200/70 italic bg-green-500/10 p-2 rounded">
                  💡 <strong>Use multi-touch:</strong> Stretch vertically when feeling overly responsible. Compression horizontally signals loss of mental flexibility and clarity.
                </div>
              </div>
            </div>
          )}

          {/* Top-Down Info Card */}
          {hoveredEllipse === 'topDown' && (
            <div className="absolute right-0 top-full mt-2 max-w-xs bg-gradient-to-br from-green-500/30 to-cyan-500/30 backdrop-blur-md border border-green-500/60 rounded-2xl p-4 shadow-2xl animate-slideIn z-20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                <h4 className="font-bold text-green-300">Top-Down Processing Details</h4>
              </div>
              <div className="text-xs text-white/90 space-y-2">
                <div>
                  <span className="font-semibold text-green-200">What it represents:</span>
                  <div className="text-white/80 mt-1">Mental burden and cognitive load - how much responsibility you're carrying</div>
                </div>
                <div className="border-t border-white/20 pt-2">
                  <div className="text-white/70">
                    <span className="font-medium">Height:</span> {topDownMajor.toFixed(0)}px - Mental burden/responsibility
                  </div>
                  <div className="text-white/70">
                    <span className="font-medium">Width:</span> {topDownMinor.toFixed(0)}px - Mental flexibility
                  </div>
                  <div className="text-white/70 mt-1">
                    <span className="font-medium">Ratio:</span> {(topDownMajor / topDownMinor).toFixed(2)} {(topDownMajor / topDownMinor) > 1.5 ? '(High mental burden)' : '(Balanced)'}
                  </div>
                </div>
                <div className="text-[10px] text-green-200/70 italic bg-green-500/10 p-2 rounded">
                  💡 Drag the green ellipse upward when feeling overwhelmed or taking on too much responsibility
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 mb-6 border border-purple-500/30">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Balance:</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {balance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Mathematical Appendix Section */}
        <div className="mb-6">
          <button
            onClick={() => setShowAppendix(!showAppendix)}
            className="w-full bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 border border-indigo-500/30 rounded-xl px-4 py-3 text-sm font-medium transition flex items-center justify-between gap-2 haptic-feedback"
          >
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-400" />
              <span className="text-white">Mathematical Foundation & Insights</span>
            </div>
            <span className="text-indigo-300 text-xs">
              {showAppendix ? '▲ Hide' : '▼ Show'}
            </span>
          </button>

          {showAppendix && (
            <div className="mt-3 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-4 space-y-4 animate-slideUp">
              {/* Mathematical Definition */}
              <div>
                <h3 className="text-sm font-bold text-indigo-300 mb-2 flex items-center gap-2">
                  <Triangle size={16} className="text-indigo-400" />
                  Ellipse Mathematics
                </h3>
                <div className="text-xs text-white/80 space-y-2">
                  <div className="bg-black/30 p-3 rounded-lg text-center">
                    <div className="text-indigo-200 font-mono text-sm">
                      x² / a² + y² / b² = 1
                    </div>
                  </div>
                  <div className="text-white/70">
                    <span className="font-semibold text-white">Where:</span>
                    <div className="ml-3 mt-1 space-y-1">
                      <div><span className="text-yellow-300">a</span> (horizontal axis) = External environment pressure / Freedom of movement</div>
                      <div><span className="text-green-300">b</span> (vertical axis) = Internal responsibility stress / Sense of self</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personalized Feedback */}
              <div className="border-t border-white/10 pt-3">
                <h3 className="text-sm font-bold text-indigo-300 mb-2 flex items-center gap-2">
                  <Lightbulb size={16} className="text-indigo-400" />
                  Personalized Insights
                </h3>
                <div className="space-y-2 text-xs text-white/80">
                  {/* Bottom-Up Analysis - Always show something */}
                  {(() => {
                    const buRatio = bottomUpMajor / bottomUpMinor;
                    
                    if (buRatio > 2.5) {
                      return (
                        <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-3">
                          <div className="font-semibold text-yellow-300 mb-1 flex items-center gap-1">
                            <AlertTriangle size={14} />
                            High External Pressure Detected
                          </div>
                          <div className="text-white/70 text-[11px]">
                            Your horizontal stretch indicates external overwhelm. Consider:
                            <ul className="ml-4 mt-1 space-y-0.5 list-disc">
                              <li>Setting boundaries with people taking too much space</li>
                              <li>Grounding exercises to restore sense of self</li>
                              <li>Mindful breathing: 4-7-8 technique</li>
                            </ul>
                          </div>
                        </div>
                      );
                    } else if (buRatio > 1.8) {
                      return (
                        <div className="bg-yellow-500/15 border border-yellow-500/30 rounded-lg p-3">
                          <div className="font-semibold text-yellow-300 mb-1 flex items-center gap-1">
                            <Eye size={14} />
                            Moderate External Influence
                          </div>
                          <div className="text-white/70 text-[11px]">
                            You're experiencing some external pressure. Tips:
                            <ul className="ml-4 mt-1 space-y-0.5 list-disc">
                              <li>Notice when others' needs overshadow your own</li>
                              <li>Practice saying "no" to maintain your energy</li>
                              <li>Short grounding breaks throughout the day</li>
                            </ul>
                          </div>
                        </div>
                      );
                    } else if (bottomUpMinor > bottomUpMajor * 0.9) {
                      return (
                        <div className="bg-yellow-400/20 border border-yellow-400/40 rounded-lg p-3">
                          <div className="font-semibold text-yellow-200 mb-1 flex items-center gap-1">
                            <CheckCircle size={14} />
                            Strong Self-Awareness
                          </div>
                          <div className="text-white/70 text-[11px]">
                            You're well-grounded in yourself. Keep it up:
                            <ul className="ml-4 mt-1 space-y-0.5 list-disc">
                              <li>Your sense of self is solid and centered</li>
                              <li>Continue your self-care practices</li>
                              <li>You're managing external pressures well</li>
                            </ul>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="bg-yellow-500/10 border border-yellow-500/25 rounded-lg p-3">
                          <div className="font-semibold text-yellow-300 mb-1 flex items-center gap-1">
                            <Target size={14} />
                            Stable External Processing
                          </div>
                          <div className="text-white/70 text-[11px]">
                            Your relationship with external environment is balanced:
                            <ul className="ml-4 mt-1 space-y-0.5 list-disc">
                              <li>Good boundaries with external demands</li>
                              <li>Maintain awareness of your personal space</li>
                              <li>Notice early signs of external pressure</li>
                            </ul>
                          </div>
                        </div>
                      );
                    }
                  })()}

                  {/* Top-Down Analysis - Always show something */}
                  {(() => {
                    const tdRatio = topDownMajor / topDownMinor;
                    
                    if (tdRatio > 2.5) {
                      return (
                        <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-3">
                          <div className="font-semibold text-green-300 mb-1 flex items-center gap-1">
                            <AlertTriangle size={14} />
                            "Unterdrückt" - Overwhelmed by Responsibility
                          </div>
                          <div className="text-white/70 text-[11px]">
                            You're emotionally stretched thin. Try:
                            <ul className="ml-4 mt-1 space-y-0.5 list-disc">
                              <li>Delegate tasks - you don't have to carry everything</li>
                              <li>Progressive muscle relaxation</li>
                              <li>Take 5-minute breaks every hour</li>
                            </ul>
                          </div>
                        </div>
                      );
                    } else if (tdRatio > 1.8) {
                      return (
                        <div className="bg-green-500/15 border border-green-500/30 rounded-lg p-3">
                          <div className="font-semibold text-green-300 mb-1 flex items-center gap-1">
                            <Zap size={14} />
                            Elevated Mental Burden
                          </div>
                          <div className="text-white/70 text-[11px]">
                            You're carrying notable responsibility. Remember:
                            <ul className="ml-4 mt-1 space-y-0.5 list-disc">
                              <li>It's okay to ask for help</li>
                              <li>Prioritize tasks - not everything is urgent</li>
                              <li>Take micro-breaks to reset mental clarity</li>
                            </ul>
                          </div>
                        </div>
                      );
                    } else if (topDownMajor < 150) {
                      return (
                        <div className="bg-green-400/20 border border-green-400/40 rounded-lg p-3">
                          <div className="font-semibold text-green-200 mb-1 flex items-center gap-1">
                            <Heart size={14} />
                            Relaxed Mental State
                          </div>
                          <div className="text-white/70 text-[11px]">
                            Low mental pressure - excellent for creativity:
                            <ul className="ml-4 mt-1 space-y-0.5 list-disc">
                              <li>Great time for creative thinking</li>
                              <li>Enjoy this breathing room</li>
                              <li>Consider tackling challenging tasks now</li>
                            </ul>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="bg-green-500/10 border border-green-500/25 rounded-lg p-3">
                          <div className="font-semibold text-green-300 mb-1 flex items-center gap-1">
                            <CheckCircle size={14} />
                            Healthy Responsibility Level
                          </div>
                          <div className="text-white/70 text-[11px]">
                            Your mental burden is well-managed:
                            <ul className="ml-4 mt-1 space-y-0.5 list-disc">
                              <li>Good balance between work and rest</li>
                              <li>Maintain flexible thinking patterns</li>
                              <li>Monitor stress levels proactively</li>
                            </ul>
                          </div>
                        </div>
                      );
                    }
                  })()}

                  {/* Overall Balance Assessment */}
                  {(() => {
                    if (balance > 2.5 || balance < 0.4) {
                      return (
                        <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3">
                          <div className="font-semibold text-red-300 mb-1 flex items-center gap-1">
                            <AlertTriangle size={14} />
                            Significant Imbalance Detected
                          </div>
                          <div className="text-white/70 text-[11px]">
                            Your perception systems are out of sync. Priority actions:
                            <ul className="ml-4 mt-1 space-y-0.5 list-disc">
                              <li>Consider professional support or counseling</li>
                              <li>Reach out to trusted friends or family</li>
                              <li>Use the breathing exercise feature below</li>
                            </ul>
                          </div>
                        </div>
                      );
                    } else if (Math.abs(1 - balance) < 0.3) {
                      return (
                        <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-3">
                          <div className="font-semibold text-blue-300 mb-1 flex items-center gap-1">
                            <CheckCircle size={14} />
                            Excellent Overall Balance
                          </div>
                          <div className="text-white/70 text-[11px]">
                            Both systems working in harmony:
                            <ul className="ml-4 mt-1 space-y-0.5 list-disc">
                              <li>External and internal processing aligned</li>
                              <li>Continue your current wellness practices</li>
                              <li>Save this state for future reference</li>
                            </ul>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

            
            
            </div>
          )}
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
