import { memo, useId, useMemo } from "react";
import { Box, alpha, useMantineTheme } from "@mantine/core";
import { motion } from "framer-motion";

type HelicopterGaugeProps = {
  airspeed: number;
  altitude: number;
  pitch: number;
  roll: number;
  speedUnit?: string;
  altitudeUnit?: string;
};

const CENTER_X = 180;
const CENTER_Y = 112;
const HORIZON_RADIUS = 102;
const TAPE_CENTER_Y = 142;
const TAPE_SPACING = 18;

const springTransition = {
  type: "spring" as const,
  stiffness: 95,
  damping: 21,
  mass: 0.7,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(Number.isFinite(value) ? value : 0, min), max);

const getTapeTicks = (value: number, step: number, radius = 7) => {
  const base = Math.floor(value / step) * step;

  return Array.from({ length: radius * 2 + 1 }, (_, index) => {
    const tickValue = base + (index - radius) * step;

    return {
      value: tickValue,
      y: TAPE_CENTER_Y + ((value - tickValue) / step) * TAPE_SPACING,
    };
  }).filter((tick) => tick.value >= 0 && tick.y >= 31 && tick.y <= 205);
};

export const HelicopterGauge = memo(function HelicopterGauge({
  airspeed,
  altitude,
  pitch,
  roll,
  speedUnit = "KMT",
  altitudeUnit = "M",
}: HelicopterGaugeProps) {
  const theme = useMantineTheme();
  const instanceId = useId().replace(/:/g, "");
  const horizonClipId = `helicopter-horizon-${instanceId}`;
  const airspeedClipId = `helicopter-airspeed-${instanceId}`;
  const altitudeClipId = `helicopter-altitude-${instanceId}`;
  const glowId = `helicopter-glow-${instanceId}`;

  const safeAirspeed = Math.max(0, Number.isFinite(airspeed) ? airspeed : 0);
  const safeAltitude = Math.max(0, Number.isFinite(altitude) ? altitude : 0);
  const safePitch = clamp(pitch, -45, 45);
  const safeRoll = clamp(roll, -90, 90);

  const airspeedTicks = useMemo(
    () => getTapeTicks(safeAirspeed, 10),
    [safeAirspeed],
  );
  const altitudeTicks = useMemo(
    () => getTapeTicks(safeAltitude, 100),
    [safeAltitude],
  );
  const pitchMarks = useMemo(
    () => Array.from({ length: 17 }, (_, index) => (index - 8) * 5).filter(Boolean),
    [],
  );
  const rollMarks = useMemo(
    () => [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60],
    [],
  );

  const blue = theme.colors.blue[4];
  const lightBlue = theme.colors.blue[2];
  const panel = alpha(theme.colors.dark[9], 0.88);
  const muted = theme.colors.gray[5];
  const bright = theme.colors.gray[1];

  return (
    <Box
      role="img"
      aria-label={`Helicopter instruments. Airspeed ${Math.round(safeAirspeed)} ${speedUnit}, altitude ${Math.round(safeAltitude)} ${altitudeUnit}, pitch ${Math.round(safePitch)} degrees, roll ${Math.round(safeRoll)} degrees.`}
      style={{
        width: "38vh",
        height: "23.75vh",
        minWidth: 300,
        minHeight: 187,
        userSelect: "none",
        pointerEvents: "none",
        filter: `drop-shadow(0 0 12px ${alpha(theme.colors.dark[9], 0.82)})`,
      }}
    >
      <svg
        viewBox="0 0 360 225"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%", overflow: "visible" }}
      >
        <defs>
          <clipPath id={horizonClipId}>
            <circle cx={CENTER_X} cy={CENTER_Y} r={HORIZON_RADIUS} />
          </clipPath>
          <clipPath id={airspeedClipId}>
            <rect x="0" y="31" width="73" height="174" rx="4" />
          </clipPath>
          <clipPath id={altitudeClipId}>
            <rect x="287" y="31" width="73" height="174" rx="4" />
          </clipPath>
          <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="2" y="22" width="70" height="190" rx="5" fill={panel} />
        <rect x="288" y="22" width="70" height="190" rx="5" fill={panel} />

        <text x="2" y="15" fill={bright} fontSize="10" fontWeight="800" letterSpacing="0.8">
          AIRSPEED
        </text>
        <text x="288" y="15" fill={bright} fontSize="10" fontWeight="800" letterSpacing="0.8">
          ALTITUDE
        </text>

        <g clipPath={`url(#${airspeedClipId})`}>
          <line x1="62" y1="31" x2="62" y2="205" stroke={alpha(muted, 0.35)} strokeWidth="1" />
          {airspeedTicks.map((tick) => {
            const major = tick.value % 20 === 0;

            return (
              <g key={`airspeed-${tick.value}`}>
                <line
                  x1={major ? 51 : 55}
                  y1={tick.y}
                  x2="66"
                  y2={tick.y}
                  stroke={major ? bright : muted}
                  strokeWidth={major ? 1.5 : 1}
                  opacity={major ? 0.9 : 0.62}
                />
                {major && (
                  <text
                    x="46"
                    y={tick.y + 3}
                    fill={theme.colors.gray[3]}
                    fontSize="8"
                    fontWeight="700"
                    textAnchor="end"
                  >
                    {tick.value}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        <g clipPath={`url(#${altitudeClipId})`}>
          <line x1="298" y1="31" x2="298" y2="205" stroke={alpha(muted, 0.35)} strokeWidth="1" />
          {altitudeTicks.map((tick) => {
            const major = tick.value % 200 === 0;

            return (
              <g key={`altitude-${tick.value}`}>
                <line
                  x1="294"
                  y1={tick.y}
                  x2={major ? 309 : 305}
                  y2={tick.y}
                  stroke={major ? bright : muted}
                  strokeWidth={major ? 1.5 : 1}
                  opacity={major ? 0.9 : 0.62}
                />
                {major && (
                  <text
                    x="314"
                    y={tick.y + 3}
                    fill={theme.colors.gray[3]}
                    fontSize="8"
                    fontWeight="700"
                  >
                    {tick.value}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        <path
          d="M2 99 H49 L61 112 L49 125 H2 Z"
          fill={alpha(theme.colors.blue[4], 1)}
          stroke="none"
          strokeWidth="1.5"
          filter={`url(#${glowId})`}
        />
        <text
          x="27"
          y="117"
          fill={'white'}
          fontSize="14"
          fontWeight="900"
          textAnchor="middle"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {Math.round(safeAirspeed)}
        </text>

        <path
          d="M358 99 H311 L299 112 L311 125 H358 Z"
          fill={alpha(theme.colors.blue[4], 1)}
          strokeWidth="1.5"
          filter={`url(#${glowId})`}
        />
        <text
          x="334"
          y="117"
          fill={'white'}
          fontSize="14"
          fontWeight="900"
          textAnchor="middle"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {Math.round(safeAltitude)}
        </text>

        <circle cx={CENTER_X} cy={CENTER_Y} r={HORIZON_RADIUS + 3} fill={theme.colors.dark[9]} />
        <g clipPath={`url(#${horizonClipId})`}>
          <motion.g
            initial={false}
            animate={{ rotate: -safeRoll }}
            transition={springTransition}
            style={{ transformOrigin: `${CENTER_X}px ${CENTER_Y}px` }}
          >
            <motion.g
              initial={false}
              animate={{ y: safePitch * 1.8 }}
              transition={springTransition}
            >
              <rect
                x="70"
                y="-320"
                width="220"
                height={CENTER_Y + 320}
                fill={alpha(theme.colors.blue[7], 0.56)}
              />
              <rect
                x="70"
                y={CENTER_Y}
                width="220"
                height="430"
                fill={theme.colors.dark[7]}
              />
              <line
                x1="70"
                y1={CENTER_Y}
                x2="290"
                y2={CENTER_Y}
                stroke={bright}
                strokeWidth="1.6"
              />

              {pitchMarks.map((mark) => {
                const y = CENTER_Y - mark * 1.8;
                const isLabelled = mark % 10 === 0;
                const width = mark % 20 === 0 ? 44 : isLabelled ? 34 : 18;

                return (
                  <g key={`pitch-${mark}`} opacity={isLabelled ? 0.85 : 0.55}>
                    <line
                      x1={CENTER_X - width / 2}
                      y1={y}
                      x2={CENTER_X + width / 2}
                      y2={y}
                      stroke={bright}
                      strokeWidth={isLabelled ? 1.2 : 0.9}
                      strokeDasharray={mark < 0 ? "7 3" : undefined}
                    />
                    {isLabelled && (
                      <>
                        <text
                          x={CENTER_X - width / 2 - 7}
                          y={y + 2.5}
                          fill={theme.colors.gray[3]}
                          fontSize="6.5"
                          fontWeight="700"
                          textAnchor="end"
                        >
                          {Math.abs(mark)}
                        </text>
                        <text
                          x={CENTER_X + width / 2 + 7}
                          y={y + 2.5}
                          fill={theme.colors.gray[3]}
                          fontSize="6.5"
                          fontWeight="700"
                        >
                          {Math.abs(mark)}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </motion.g>
          </motion.g>

          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={HORIZON_RADIUS}
            fill="none"
            stroke={alpha(theme.colors.gray[0], 0.08)}
            strokeWidth="1"
          />
        </g>

        {rollMarks.map((mark) => {
          const major = mark % 30 === 0;

          return (
            <g key={`roll-${mark}`} transform={`rotate(${mark} ${CENTER_X} ${CENTER_Y})`}>
              <line
                x1={CENTER_X}
                y1={CENTER_Y - HORIZON_RADIUS + 1}
                x2={CENTER_X}
                y2={CENTER_Y - HORIZON_RADIUS + (major ? 10 : 7)}
                stroke={major ? bright : muted}
                strokeWidth={major ? 1.5 : 1}
              />
            </g>
          );
        })}

        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={HORIZON_RADIUS}
          fill="none"
          stroke={theme.colors.dark[8]}
          strokeWidth="5"
        />
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={HORIZON_RADIUS + 2}
          fill="none"
          strokeWidth="1"
        />

        <path
          d={`M ${CENTER_X - 6} ${CENTER_Y - HORIZON_RADIUS + 4} L ${CENTER_X} ${CENTER_Y - HORIZON_RADIUS + 14} L ${CENTER_X + 6} ${CENTER_Y - HORIZON_RADIUS + 4} Z`}
          fill={blue}
          filter={`url(#${glowId})`}
        />

        <path
          d={`M ${CENTER_X - 44} ${CENTER_Y} H ${CENTER_X - 12} L ${CENTER_X - 6} ${CENTER_Y + 6}`}
          fill="none"
          stroke={bright}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={`M ${CENTER_X + 44} ${CENTER_Y} H ${CENTER_X + 12} L ${CENTER_X + 6} ${CENTER_Y + 6}`}
          fill="none"
          stroke={bright}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={`M ${CENTER_X - 7} ${CENTER_Y + 6} L ${CENTER_X} ${CENTER_Y} L ${CENTER_X + 7} ${CENTER_Y + 6}`}
          fill="none"
          stroke={blue}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${glowId})`}
        />
        <circle cx={CENTER_X} cy={CENTER_Y} r="2.4" fill={lightBlue} />
      </svg>
    </Box>
  );
});
