import React from 'react';
import { X, Brain, Waves, Puzzle, Scale, Palette } from 'lucide-react';

const tutorialSteps = [
  {
    title: "Welcome to Your Perception Explorer",
    icon: Brain,
    content: "This tool helps you visualize and understand your feelings through the science of perception. Think of it as a mirror for your inner emotional state.",
    example: "Ever felt like your mind is racing? Or maybe you're stuck in overthinking? Let's explore that visually."
  },
  {
    title: "Understanding Bottom-Up Processing",
    icon: Waves,
    content: "The horizontal (yellow/orange) ellipse represents sensory input - what your body feels directly from the environment.",
    example: "Like waiting at a red traffic light feeling every second tick by, or the overwhelming noise in a crowded cafe. When this ellipse is wide and thin, it means your senses are on high alert."
  },
  {
    title: "Understanding Top-Down Processing",
    icon: Puzzle,
    content: "The vertical (green/cyan) ellipse represents your expectations, thoughts, and mental filters - how your mind interprets what you sense.",
    example: "Like when you're focused on work and don't hear someone calling you, or when you expect to see a friend and mistake a stranger for them. A tall, narrow ellipse means strong mental control."
  },
  {
    title: "Finding Your Balance",
    icon: Scale,
    content: "The balance between these two shows your current state. Are you overwhelmed by sensations? Or locked in your thoughts?",
    example: "Perfect balance is rare! Most times we lean one way. That's okay - awareness is the first step to managing your emotional state."
  },
  {
    title: "How to Use This Tool",
    icon: Palette,
    content: "Drag the colored dots or the ellipses themselves to adjust. Try to match your current feeling. Then save it with a note about what you're experiencing.",
    example: "You can use this to: track anxiety patterns, understand your focus levels, or share with friends to compare how you perceive the same situation differently."
  }
];

const Tutorial = ({ tutorialStep, setTutorialStep, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-3xl p-8 border-2 border-purple-500/50 backdrop-blur-xl">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              {React.createElement(tutorialSteps[tutorialStep].icon, { size: 32, className: "text-purple-400" })}
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                {tutorialSteps[tutorialStep].title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition"
              aria-label="Close tutorial"
            >
              <X size={28} />
            </button>
          </div>
          
          <div className="space-y-4 text-white/90">
            <p className="text-lg leading-relaxed">
              {tutorialSteps[tutorialStep].content}
            </p>
            
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <span className="text-2xl">💡</span>
                <div>
                  <div className="font-semibold text-yellow-300 mb-1">Real-Life Example:</div>
                  <p className="text-sm text-white/80">{tutorialSteps[tutorialStep].example}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          <div className="flex gap-2">
            {tutorialSteps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === tutorialStep ? 'w-8 bg-purple-400' : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-3">
            {tutorialStep > 0 && (
              <button
                onClick={() => setTutorialStep(tutorialStep - 1)}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition"
              >
                Back
              </button>
            )}
            
            {tutorialStep < tutorialSteps.length - 1 ? (
              <button
                onClick={() => setTutorialStep(tutorialStep + 1)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold transition"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-xl font-semibold transition"
              >
                Get Started! 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
