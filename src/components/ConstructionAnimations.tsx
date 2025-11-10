import React from 'react';

interface ConstructionAnimationsProps {
  type?: 'login' | 'dashboard';
}

const ConstructionAnimations: React.FC<ConstructionAnimationsProps> = ({ type = 'dashboard' }) => {
  // Generate random sand particles
  const sandParticles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10,
    size: 2 + Math.random() * 3
  }));

  // Generate building construction elements
  const buildingElements = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: 10 + (i * 12),
    delay: Math.random() * 3,
    height: 40 + Math.random() * 60
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Falling Sand Particles */}
      <div className="absolute inset-0">
        {sandParticles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-amber-300/40"
            style={{
              left: `${particle.left}%`,
              top: '-10px',
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animation: `fallingSand ${particle.duration}s linear infinite`,
              animationDelay: `${particle.delay}s`,
              boxShadow: `0 0 ${particle.size * 2}px rgba(217, 119, 6, 0.3)`
            }}
          />
        ))}
      </div>

      {/* Building Construction Animation */}
      {type === 'dashboard' && (
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-15">
          {buildingElements.map((building) => (
            <div
              key={building.id}
              className="absolute bottom-0 bg-gradient-to-t from-gray-700 via-gray-600 to-gray-500 border-l-2 border-r-2 border-gray-800"
              style={{
                left: `${building.left}%`,
                width: '8%',
                height: `${building.height}%`,
                animation: `buildUp 4s ease-out forwards`,
                animationDelay: `${building.delay}s`,
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)',
                '--building-height': `${building.height}%`
              } as React.CSSProperties}
            >
              {/* Building windows */}
              <div className="absolute inset-2 grid grid-cols-2 gap-1">
                {Array.from({ length: Math.floor(building.height / 10) }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-yellow-300/30 rounded-sm"
                    style={{
                      animation: `windowLight ${2 + Math.random()}s ease-in-out infinite`,
                      animationDelay: `${building.delay + i * 0.2}s`
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Construction Crane Animation (for login page) */}
      {type === 'login' && (
        <div className="absolute top-10 right-10 w-32 h-64 opacity-10">
          <div className="relative h-full">
            {/* Crane base */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-16 bg-gray-700 rounded-t-lg" />
            {/* Crane arm */}
            <div
              className="absolute bottom-12 left-1/2 w-24 h-1 bg-gray-600 transform origin-left"
              style={{
                transform: 'rotate(-20deg)',
                animation: 'craneSwing 8s ease-in-out infinite'
              }}
            >
              <div className="absolute right-0 top-0 w-2 h-2 bg-gray-800 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Add CSS animations */}
      <style>{`
        @keyframes fallingSand {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.8;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes buildUp {
          0% {
            height: 0%;
            opacity: 0;
            transform: scaleY(0);
          }
          50% {
            opacity: 0.3;
          }
          100% {
            height: 100%;
            opacity: 0.15;
            transform: scaleY(1);
          }
        }

        @keyframes windowLight {
          0%, 100% {
            opacity: 0.2;
            background-color: rgba(251, 191, 36, 0.2);
          }
          50% {
            opacity: 0.6;
            background-color: rgba(251, 191, 36, 0.5);
          }
        }

        @keyframes craneSwing {
          0%, 100% {
            transform: rotate(-20deg);
          }
          50% {
            transform: rotate(20deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ConstructionAnimations;

