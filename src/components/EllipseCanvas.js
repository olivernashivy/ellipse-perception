import React from 'react';

const EllipseCanvas = ({
  canvasWidth,
  canvasHeight,
  centerX,
  centerY,
  bottomUpMajor,
  bottomUpMinor,
  topDownMajor,
  topDownMinor,
  isDragging,
  svgRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  getGradientColor
}) => {
  return (
    <div
      className="relative rounded-2xl mb-6 touch-none overflow-hidden border border-white/10"
      style={{ 
        width: '100%', 
        height: '500px',
        background: 'radial-gradient(circle at center, #1a1a2e 0%, #000000 100%)'
      }}
      onMouseMove={onPointerMove}
      onMouseUp={onPointerUp}
      onMouseLeave={onPointerUp}
      onTouchMove={onPointerMove}
      onTouchEnd={onPointerUp}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="bottomUpGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: getGradientColor(bottomUpMajor, 'bottomUp'), stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: getGradientColor(bottomUpMajor, 'bottomUp'), stopOpacity: 0 }} />
          </radialGradient>
          <radialGradient id="topDownGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: getGradientColor(topDownMajor, 'topDown'), stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: getGradientColor(topDownMajor, 'topDown'), stopOpacity: 0 }} />
          </radialGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Bottom-Up Ellipse */}
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={bottomUpMajor}
          ry={bottomUpMinor}
          fill="url(#bottomUpGradient)"
          stroke={getGradientColor(bottomUpMajor, 'bottomUp')}
          strokeWidth="3"
          filter="url(#glow)"
          style={{ cursor: isDragging === 'bottomUp' ? 'grabbing' : 'grab' }}
          onMouseDown={(e) => onPointerDown(e, 'bottomUp')}
          onTouchStart={(e) => onPointerDown(e, 'bottomUp')}
        />

        {/* Top-Down Ellipse */}
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={topDownMinor}
          ry={topDownMajor}
          fill="url(#topDownGradient)"
          stroke={getGradientColor(topDownMajor, 'topDown')}
          strokeWidth="3"
          filter="url(#glow)"
          style={{ cursor: isDragging === 'topDown' ? 'grabbing' : 'grab' }}
          onMouseDown={(e) => onPointerDown(e, 'topDown')}
          onTouchStart={(e) => onPointerDown(e, 'topDown')}
        />

        {/* Intersection Area */}
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={Math.min(bottomUpMinor, topDownMinor)}
          ry={Math.min(bottomUpMinor, topDownMinor)}
          fill="rgba(255, 255, 255, 0.05)"
          stroke="white"
          strokeWidth="1"
          strokeDasharray="5,5"
          opacity="0.5"
          pointerEvents="none"
        />

        {/* Interactive Control Points */}
        <circle
          cx={centerX + bottomUpMajor}
          cy={centerY}
          r="10"
          fill={getGradientColor(bottomUpMajor, 'bottomUp')}
          filter="url(#glow)"
          style={{ cursor: 'grab' }}
          onMouseDown={(e) => onPointerDown(e, 'bottomUp')}
          onTouchStart={(e) => onPointerDown(e, 'bottomUp')}
        />
        <circle
          cx={centerX}
          cy={centerY - topDownMajor}
          r="10"
          fill={getGradientColor(topDownMajor, 'topDown')}
          filter="url(#glow)"
          style={{ cursor: 'grab' }}
          onMouseDown={(e) => onPointerDown(e, 'topDown')}
          onTouchStart={(e) => onPointerDown(e, 'topDown')}
        />
      </svg>
    </div>
  );
};

export default EllipseCanvas;
