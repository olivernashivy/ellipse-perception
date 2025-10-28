import React, { useState, useEffect } from 'react';
import { Wind } from 'lucide-react';

const BreathingExercise = ({ balance }) => {
  const [showExercise, setShowExercise] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const [breathingCount, setBreathingCount] = useState(0);

  useEffect(() => {
    if (!showExercise) return;
    
    const phases = balance < 0.7 
      ? ['inhale', 'hold', 'exhale', 'hold'] // Calming for sensory overload
      : ['inhale', 'hold', 'exhale']; // Energizing for overthinking
      
    const durations = balance < 0.7
      ? [4000, 7000, 8000, 2000] // 4-7-8 breathing for calm
      : [4000, 4000, 4000]; // Box breathing for focus
    
    let phaseIndex = 0;
    
    const cycle = () => {
      setBreathingPhase(phases[phaseIndex]);
      
      const timer = setTimeout(() => {
        phaseIndex = (phaseIndex + 1) % phases.length;
        if (phaseIndex === 0) {
          setBreathingCount(prev => prev + 1);
        }
        if (breathingCount < 5) {
          cycle();
        } else {
          setShowExercise(false);
          setBreathingCount(0);
        }
      }, durations[phaseIndex]);
      
      return () => clearTimeout(timer);
    };
    
    cycle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showExercise, breathingCount]);

  const getPhaseText = () => {
    switch(breathingPhase) {
      case 'inhale': return 'Breathe In';
      case 'exhale': return 'Breathe Out';
      case 'hold': return 'Hold';
      default: return '';
    }
  };

  const getPhaseColor = () => {
    switch(breathingPhase) {
      case 'inhale': return 'from-blue-500 to-cyan-500';
      case 'exhale': return 'from-green-500 to-emerald-500';
      case 'hold': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (showExercise) {
    return (
      <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-8">
            <div 
              className={`w-64 h-64 mx-auto rounded-full bg-gradient-to-br ${getPhaseColor()} animate-pulse flex items-center justify-center shadow-2xl`}
              style={{
                animation: breathingPhase === 'inhale' ? 'breatheIn 4s ease-in-out' : 
                          breathingPhase === 'exhale' ? 'breatheOut 4s ease-in-out' : 'none'
              }}
            >
              <div className="text-white">
                <Wind size={48} className="mx-auto mb-4" />
                <div className="text-3xl font-bold">{getPhaseText()}</div>
              </div>
            </div>
          </div>
          
          <div className="text-white/70 mb-4">
            Cycle {breathingCount + 1} of 5
          </div>
          
          <button
            onClick={() => {
              setShowExercise(false);
              setBreathingCount(0);
            }}
            className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition text-white font-semibold"
          >
            Exit Exercise
          </button>
        </div>
      </div>
    );
  }

  // Floating button - positioned bottom-right, away from ellipse center
  return (
    <button
      onClick={() => setShowExercise(true)}
      className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 transition-all hover:scale-105 z-40 haptic-feedback font-semibold"
      aria-label="Start breathing exercise"
      title="Breathing Exercise"
    >
      <Wind size={20} />
      <span className="hidden sm:inline">Breathe</span>
    </button>
  );
};

export default BreathingExercise;
