// src/pages/profile/components/avatar/AvatarAssets.tsx
import type { BodyId, EyesId, MouthId } from './avatar.types';

// ============================================================================
// BODY COMPONENTS (5 variants)
// ============================================================================

interface BodyProps {
  size?: number;
}

export const BodyRound: React.FC<BodyProps> = ({ size = 512 }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {/* Head */}
    <div
      style={{
        position: 'absolute',
        top: '8%',
        width: '65%',
        height: '42%',
        background: 'linear-gradient(135deg, #FF9A8B 0%, #FF6A88 100%)',
        borderRadius: '50%',
        boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.1)',
      }}
    />
    {/* Body */}
    <div
      style={{
        position: 'absolute',
        bottom: '5%',
        width: '70%',
        height: '55%',
        background: 'linear-gradient(135deg, #FF9A8B 0%, #FF6A88 100%)',
        borderRadius: '50% 50% 45% 45%',
        boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.1)',
      }}
    />
  </div>
);

export const BodySquare: React.FC<BodyProps> = ({ size = 512 }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {/* Head */}
    <div
      style={{
        position: 'absolute',
        top: '10%',
        width: '55%',
        height: '38%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20%',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2), inset -5px -5px 10px rgba(0,0,0,0.15)',
      }}
    />
    {/* Body */}
    <div
      style={{
        position: 'absolute',
        bottom: '8%',
        width: '65%',
        height: '52%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '15%',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2), inset -5px -5px 10px rgba(0,0,0,0.15)',
      }}
    />
  </div>
);

export const BodyBean: React.FC<BodyProps> = ({ size = 512 }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {/* Single bean shape with distinct head area */}
    <div
      style={{
        position: 'absolute',
        top: '5%',
        width: '68%',
        height: '90%',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        borderRadius: '45% 45% 48% 48% / 55% 55% 45% 45%',
        boxShadow: 'inset -8px -8px 20px rgba(0,0,0,0.12)',
      }}
    />
    {/* Head highlight */}
    <div
      style={{
        position: 'absolute',
        top: '10%',
        width: '50%',
        height: '35%',
        background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 60%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }}
    />
  </div>
);

export const BodyTriangle: React.FC<BodyProps> = ({ size = 512 }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {/* Head circle */}
    <div
      style={{
        position: 'absolute',
        top: '8%',
        width: '60%',
        height: '40%',
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        borderRadius: '50%',
        boxShadow: 'inset -6px -6px 15px rgba(0,0,0,0.1)',
      }}
    />
    {/* Triangular body */}
    <div
      style={{
        position: 'absolute',
        bottom: '5%',
        width: '0',
        height: '0',
        borderLeft: `${size * 0.4}px solid transparent`,
        borderRight: `${size * 0.4}px solid transparent`,
        borderBottom: `${size * 0.5}px solid #00d2ff`,
        filter: 'drop-shadow(0px -4px 8px rgba(0,0,0,0.15))',
      }}
    />
  </div>
);

export const BodyHexagon: React.FC<BodyProps> = ({ size = 512 }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {/* Head hexagon */}
    <div
      style={{
        position: 'absolute',
        top: '10%',
        width: '58%',
        height: '36%',
        background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    />
    {/* Body hexagon */}
    <div
      style={{
        position: 'absolute',
        bottom: '6%',
        width: '70%',
        height: '54%',
        background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    />
  </div>
);

// ============================================================================
// EYES COMPONENTS (5 variants)
// ============================================================================

interface EyesProps {
  size?: number;
}

export const EyesRound: React.FC<EyesProps> = ({ size = 137 }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      gap: '25%',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {/* Left eye */}
    <div
      style={{
        width: '35%',
        height: '70%',
        background: 'white',
        borderRadius: '50%',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '50%',
          height: '50%',
          background: '#2c3e50',
          borderRadius: '50%',
          top: '25%',
          left: '25%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '35%',
            height: '35%',
            background: 'white',
            borderRadius: '50%',
            top: '20%',
            left: '20%',
          }}
        />
      </div>
    </div>
    {/* Right eye */}
    <div
      style={{
        width: '35%',
        height: '70%',
        background: 'white',
        borderRadius: '50%',
        position: 'relative',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '50%',
          height: '50%',
          background: '#2c3e50',
          borderRadius: '50%',
          top: '25%',
          left: '25%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '35%',
            height: '35%',
            background: 'white',
            borderRadius: '50%',
            top: '20%',
            left: '20%',
          }}
        />
      </div>
    </div>
  </div>
);

export const EyesSleepy: React.FC<EyesProps> = ({ size = 137 }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      gap: '25%',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {/* Left eye */}
    <div
      style={{
        width: '35%',
        height: '35%',
        background: '#2c3e50',
        borderRadius: '50% 50% 50% 50% / 20% 20% 80% 80%',
        position: 'relative',
      }}
    />
    {/* Right eye */}
    <div
      style={{
        width: '35%',
        height: '35%',
        background: '#2c3e50',
        borderRadius: '50% 50% 50% 50% / 20% 20% 80% 80%',
        position: 'relative',
      }}
    />
  </div>
);

export const EyesWide: React.FC<EyesProps> = ({ size = 137 }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      gap: '20%',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {/* Left eye */}
    <div
      style={{
        width: '38%',
        height: '85%',
        background: 'white',
        borderRadius: '50%',
        position: 'relative',
        border: '3px solid #2c3e50',
        boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '60%',
          height: '60%',
          background: '#2c3e50',
          borderRadius: '50%',
          top: '20%',
          left: '20%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '30%',
            height: '30%',
            background: 'white',
            borderRadius: '50%',
            top: '15%',
            left: '15%',
          }}
        />
      </div>
    </div>
    {/* Right eye */}
    <div
      style={{
        width: '38%',
        height: '85%',
        background: 'white',
        borderRadius: '50%',
        position: 'relative',
        border: '3px solid #2c3e50',
        boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '60%',
          height: '60%',
          background: '#2c3e50',
          borderRadius: '50%',
          top: '20%',
          left: '20%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '30%',
            height: '30%',
            background: 'white',
            borderRadius: '50%',
            top: '15%',
            left: '15%',
          }}
        />
      </div>
    </div>
  </div>
);

export const EyesPixel: React.FC<EyesProps> = ({ size = 137 }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      gap: '25%',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {/* Left eye - blocky pixel style */}
    <div
      style={{
        width: '32%',
        height: '60%',
        background: '#2c3e50',
        position: 'relative',
        boxShadow: '0 0 0 3px rgba(255,255,255,0.3)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '40%',
          height: '40%',
          background: '#3498db',
          top: '15%',
          left: '15%',
        }}
      />
    </div>
    {/* Right eye */}
    <div
      style={{
        width: '32%',
        height: '60%',
        background: '#2c3e50',
        position: 'relative',
        boxShadow: '0 0 0 3px rgba(255,255,255,0.3)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '40%',
          height: '40%',
          background: '#3498db',
          top: '15%',
          left: '15%',
        }}
      />
    </div>
  </div>
);

export const EyesShades: React.FC<EyesProps> = ({ size = 137 }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      gap: '12%',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}
  >
    {/* Bridge */}
    <div
      style={{
        position: 'absolute',
        width: '15%',
        height: '8%',
        background: '#2c3e50',
        top: '42%',
        left: '42.5%',
        borderRadius: '4px',
      }}
    />
    {/* Left lens */}
    <div
      style={{
        width: '40%',
        height: '65%',
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        borderRadius: '20%',
        position: 'relative',
        boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '25%',
          height: '25%',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          top: '20%',
          left: '20%',
        }}
      />
    </div>
    {/* Right lens */}
    <div
      style={{
        width: '40%',
        height: '65%',
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        borderRadius: '20%',
        position: 'relative',
        boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '25%',
          height: '25%',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          top: '20%',
          left: '20%',
        }}
      />
    </div>
  </div>
);

// ============================================================================
// MOUTH COMPONENTS (5 variants)
// ============================================================================

interface MouthProps {
  size?: number;
}

export const MouthSmile: React.FC<MouthProps> = ({ size = 108 }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <div
      style={{
        width: '75%',
        height: '60%',
        border: '4px solid #2c3e50',
        borderColor: '#2c3e50 transparent transparent transparent',
        borderRadius: '0 0 100% 100%',
        transform: 'translateY(-20%)',
      }}
    />
  </div>
);

export const MouthFrown: React.FC<MouthProps> = ({ size = 108 }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <div
      style={{
        width: '70%',
        height: '55%',
        border: '4px solid #2c3e50',
        borderColor: 'transparent transparent #2c3e50 transparent',
        borderRadius: '100% 100% 0 0',
        transform: 'translateY(20%)',
      }}
    />
  </div>
);

export const MouthOpen: React.FC<MouthProps> = ({ size = 108 }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <div
      style={{
        width: '45%',
        height: '65%',
        background: '#2c3e50',
        borderRadius: '50%',
        position: 'relative',
        boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.3)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '60%',
          height: '40%',
          background: '#e74c3c',
          borderRadius: '50%',
          bottom: '10%',
          left: '20%',
        }}
      />
    </div>
  </div>
);

export const MouthSmirk: React.FC<MouthProps> = ({ size = 108 }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <div
      style={{
        width: '70%',
        height: '50%',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '4px',
          background: '#2c3e50',
          borderRadius: '2px',
          transform: 'rotate(-8deg)',
          transformOrigin: 'left center',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '0',
          top: '-2px',
          width: '30%',
          height: '25%',
          border: '4px solid #2c3e50',
          borderColor: '#2c3e50 transparent transparent transparent',
          borderRadius: '0 0 100% 100%',
        }}
      />
    </div>
  </div>
);

export const MouthTeeth: React.FC<MouthProps> = ({ size = 108 }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <div
      style={{
        width: '70%',
        height: '35%',
        background: '#2c3e50',
        borderRadius: '8px',
        position: 'relative',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* Teeth */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: '100%',
            background: 'white',
            borderRight: i < 4 ? '2px solid #2c3e50' : 'none',
          }}
        />
      ))}
    </div>
  </div>
);

// ============================================================================
// COMPONENT MAPS
// ============================================================================

export const BODY_COMPONENTS: Record<BodyId, React.FC<BodyProps>> = {
  round: BodyRound,
  square: BodySquare,
  bean: BodyBean,
  triangle: BodyTriangle,
  hexagon: BodyHexagon,
};

export const EYES_COMPONENTS: Record<EyesId, React.FC<EyesProps>> = {
  round: EyesRound,
  sleepy: EyesSleepy,
  wide: EyesWide,
  pixel: EyesPixel,
  shades: EyesShades,
};

export const MOUTH_COMPONENTS: Record<MouthId, React.FC<MouthProps>> = {
  smile: MouthSmile,
  frown: MouthFrown,
  open: MouthOpen,
  smirk: MouthSmirk,
  teeth: MouthTeeth,
};
