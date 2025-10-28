import React from 'react';
import { Save, Smile, Frown, Target, Zap, Heart, Eye } from 'lucide-react';

const emotionPresets = [
  { name: 'Calm & Balanced', icon: Smile },
  { name: 'Anxious', icon: Frown },
  { name: 'Focused', icon: Target },
  { name: 'Overwhelmed', icon: Zap },
  { name: 'Relaxed', icon: Heart },
  { name: 'Alert', icon: Eye },
];

const SaveDialog = ({ currentEmotion, setCurrentEmotion, currentNotes, setCurrentNotes, onSave, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 border border-white/20 text-white">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
          <Save size={28} className="text-blue-400" />
          Save Your Perception State
        </h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-white/90">
              How are you feeling? (Optional)
            </label>
            <input
              type="text"
              value={currentEmotion}
              onChange={(e) => setCurrentEmotion(e.target.value)}
              placeholder="e.g., Anxious, Calm, Focused..."
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-white/90">
              Quick Presets:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {emotionPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setCurrentEmotion(preset.name)}
                  className="bg-white/10 hover:bg-purple-600/40 border border-white/30 rounded-lg px-3 py-2 text-sm transition flex items-center gap-2 justify-center text-white font-medium"
                >
                  {React.createElement(preset.icon, { size: 16, className: "text-white" })}
                  <span className="text-white">{preset.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-white/90">
              Add Reflection Notes (Optional)
            </label>
            <textarea
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
              placeholder="What triggered this feeling? What are you doing right now? Any insights?"
              rows="4"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-500 transition resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl transition text-white font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-3 rounded-xl font-semibold transition text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveDialog;
