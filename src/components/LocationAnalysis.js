import React from 'react';
import { Users, Map, Battery, Waves as WavesIcon, Shield, Zap } from 'lucide-react';

const LocationAnalysis = ({ locationGroup, getBalanceColor, onClose }) => {
  if (locationGroup.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Users size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-white/60">No other measurements at this location</p>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl transition text-white font-semibold"
        >
          Close
        </button>
      </div>
    );
  }

  // Calculate averages
  const avgBalance = locationGroup.reduce((sum, c) => sum + c.balance, 0) / locationGroup.length;
  const avgBottomUpMajor = locationGroup.reduce((sum, c) => sum + c.bottomUp.major, 0) / locationGroup.length;
  const avgTopDownMajor = locationGroup.reduce((sum, c) => sum + c.topDown.major, 0) / locationGroup.length;
  
  // Group by balance types
  const topDownDominant = locationGroup.filter(c => c.balance > 1.5).length;
  const balanced = locationGroup.filter(c => Math.abs(1 - c.balance) < 0.5).length;
  const bottomUpDominant = locationGroup.filter(c => c.balance < 0.67).length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-2xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <Map size={32} className="text-blue-400" />
          <div>
            <h3 className="text-xl font-bold">Location Analysis</h3>
            <p className="text-sm text-white/70">
              {locationGroup.length} measurement{locationGroup.length !== 1 ? 's' : ''} in this area
            </p>
          </div>
        </div>

        {/* Visual average ellipses */}
        <div className="relative bg-black/40 rounded-xl" style={{ height: '300px' }}>
          <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
            {/* All measurements as overlay */}
            {locationGroup.map((config, idx) => (
              <g key={idx} opacity="0.15">
                <ellipse
                  cx="200" cy="150"
                  rx={config.bottomUp.major * 0.5}
                  ry={config.bottomUp.minor * 0.5}
                  fill="none"
                  stroke="#ffd93d"
                  strokeWidth="1"
                />
                <ellipse
                  cx="200" cy="150"
                  rx={config.topDown.minor * 0.5}
                  ry={config.topDown.major * 0.5}
                  fill="none"
                  stroke="#6bcb77"
                  strokeWidth="1"
                />
              </g>
            ))}
            
            {/* Average ellipses */}
            <ellipse
              cx="200" cy="150"
              rx={avgBottomUpMajor * 0.5}
              ry={(locationGroup.reduce((sum, c) => sum + c.bottomUp.minor, 0) / locationGroup.length) * 0.5}
              fill="none"
              stroke="#ffd93d"
              strokeWidth="3"
              opacity="0.9"
            />
            <ellipse
              cx="200" cy="150"
              rx={(locationGroup.reduce((sum, c) => sum + c.topDown.minor, 0) / locationGroup.length) * 0.5}
              ry={avgTopDownMajor * 0.5}
              fill="none"
              stroke="#6bcb77"
              strokeWidth="3"
              opacity="0.9"
            />
            
            <text x="200" y="290" textAnchor="middle" fill="white" fontSize="12" opacity="0.7">
              Average Perception Pattern
            </text>
          </svg>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-red-500/20 rounded-xl p-4 text-center border border-red-500/30">
            <div className="text-3xl font-bold text-red-400">{topDownDominant}</div>
            <div className="text-xs mt-1 text-white/70">Top-Down</div>
          </div>
          <div className="bg-green-500/20 rounded-xl p-4 text-center border border-green-500/30">
            <div className="text-3xl font-bold text-green-400">{balanced}</div>
            <div className="text-xs mt-1 text-white/70">Balanced</div>
          </div>
          <div className="bg-yellow-500/20 rounded-xl p-4 text-center border border-yellow-500/30">
            <div className="text-3xl font-bold text-yellow-400">{bottomUpDominant}</div>
            <div className="text-xs mt-1 text-white/70">Bottom-Up</div>
          </div>
        </div>

        <div className="mt-6 bg-black/40 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">Average Balance:</span>
            <span className="font-bold text-lg">{avgBalance.toFixed(2)}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-500"
              style={{ 
                width: `${Math.min(100, (avgBalance / 3) * 100)}%`,
                background: `linear-gradient(90deg, ${getBalanceColor(avgBalance)}, ${getBalanceColor(avgBalance)}88)`
              }}
            />
          </div>
        </div>

        {/* Interpretation */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h4 className="font-semibold mb-2 text-blue-300 flex items-center gap-2">
            <Map size={18} />
            Location Interpretation
          </h4>
          <p className="text-sm text-white/80">
            {avgBalance > 1.5 ? 
              `This location shows conceptual thinking dominance. ${topDownDominant} of ${locationGroup.length} people show Top-Down processing. This could indicate an environment with high cognitive demands.` :
              avgBalance < 0.67 ?
              `This location shows increased sensory processing. ${bottomUpDominant} of ${locationGroup.length} people prefer Bottom-Up processes. Possibly a stimulation-rich environment.` :
              `Balanced processing pattern at this location. ${balanced} of ${locationGroup.length} people show balanced cognitive processing. Harmonious environmental conditions.`
            }
          </p>
        </div>

        {/* Emotional Protection & Energy Level */}
        <div className="mt-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-5">
          <h4 className="font-semibold mb-3 text-purple-300 flex items-center gap-2">
            <Shield size={20} />
            Emotional Protection & Energy Requirements
          </h4>
          
          <div className="space-y-4 text-sm text-white/90">
            <div className="bg-black/30 rounded-lg p-4">
              <div className="font-semibold text-pink-300 mb-2 flex items-center gap-2">
                <Battery size={18} />
                Energy Level Requirements:
              </div>
              <p>
                {avgBalance > 2 ? 
                  `This place requires HIGH mental energy (Top-Down Dominance). Strong conceptual filtering means: people must actively control their perception and suppress stimuli. Recommendation: Plan conscious breaks, as continuous cognitive control is exhausting.` :
                  avgBalance > 1.2 ?
                  `Moderate energy expenditure through slight Top-Down preference. The place demands structured thinking but still allows flexibility. Ideal for productive work with occasional creative phases.` :
                  avgBalance < 0.5 ?
                  `LOW filtering power, HIGH stimulus openness (Bottom-Up Dominance). This place floods with sensory impressions. Energy is needed to avoid being overwhelmed. Recommendation: Use conscious boundaries and focusing techniques.` :
                  `Balanced energy flow. The location enables natural regulation between openness and protection. Optimal conditions for emotional stability.`
                }
              </p>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <div className="font-semibold text-cyan-300 mb-2 flex items-center gap-2">
                <WavesIcon size={18} />
                Collective Perception Field:
              </div>
              <p>
                The ellipse overlay shows the "emotional climate" of the place. 
                {avgBalance > 1.5 ? 
                  ` The narrow horizontal shapes signal: Here things are filtered, controlled, bounded. ${topDownDominant} people have raised protection barriers - possibly a stressful or demanding environment.` :
                  avgBalance < 0.67 ?
                  ` The wide horizontal shapes show: Open perception dominates. ${bottomUpDominant} people are permeable to impressions - either an inspiring or overstimulating place.` :
                  ` The circular overlay suggests harmonious balance. People feel safe enough here to be open, but not overwhelmed.`
                }
              </p>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <div className="font-semibold text-green-300 mb-2 flex items-center gap-2">
                <Shield size={18} className="text-green-400" />
                Protection Barrier Recommendation:
              </div>
              <p>
                Based on {locationGroup.length} measurements:
                {avgBalance > 2 ? 
                  ` This place demands strong mental boundaries. If you feel exhausted, it's not your fault - the environment requires constant Top-Down regulation. Conscious relaxation elsewhere is essential.` :
                  avgBalance < 0.5 ?
                  ` Conscious shielding is needed here. The Bottom-Up dominance shows: many let everything in unfiltered. If you're sensitive, establish clear energetic boundaries (breathing techniques, mental visualization).` :
                  ` This place supports natural self-regulation. The balance allows you to intuitively decide when to open up and when to protect yourself.`
                }
              </p>
            </div>

            <div className="bg-gradient-to-r from-yellow-500/20 to-red-500/20 rounded-lg p-4 border border-yellow-500/40">
              <div className="font-semibold text-yellow-300 mb-2 flex items-center gap-2">
                <Zap size={18} />
                Your Adaptation Strategy:
              </div>
              <p className="text-xs">
                Compare YOUR ellipse with the average. Large deviation = more energy needed to adapt. 
                Small deviation = you naturally resonate with the place. 
                Use this insight for emotional self-care: Take conscious breaks at mismatched locations!
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl transition text-white font-semibold"
      >
        Close
      </button>
    </div>
  );
};

export default LocationAnalysis;
