import { memo, useMemo } from "react";
import { Flex, Text, Transition, useMantineTheme, Box, alpha, Avatar, RingProgress } from "@mantine/core";
import { motion } from "framer-motion";
import { useNuiEvent } from "../../hooks/useNuiEvent";
import { useTransitionedValue } from "../../utils/useTransitionedValue";
import { StatsStore, VehicleStore } from "../../typings/stats";
import { statsStore, vehicleStore } from "../../stores/stats";
import { settingsStore, type PlayerHudPosition } from "../../stores/settings";
import { FaBrain, FaLungs, FaWalkieTalkie, FaMicrophone, FaMicrophoneSlash, FaFireFlameCurved, FaGasPump, FaOilCan  } from "react-icons/fa6";
import { PiHamburgerFill, PiSeatbeltFill } from "react-icons/pi";
import { FaHeartbeat, FaShieldAlt } from "react-icons/fa";
import { RiDrinks2Fill } from "react-icons/ri";
import { HelicopterGauge } from "./helicopter";

type PlayerStatusIndicator = "square" | "bar" | "circle" | "segmented" | "segmented-bar";
type VehicleHudStyle = "bars" | "speedometer" | "speedometer-column";

const playerHudPositionStyles: Record<PlayerHudPosition, React.CSSProperties> = {
  "bottom-left": {
    position: "fixed",
    left: "1vw",
    right: "auto",
    top: "auto",
    bottom: "1vh",
    transform: "none",
  },
  "top-left": {
    position: "fixed",
    left: "1vw",
    right: "auto",
    top: "1.7vh",
    bottom: "auto",
    transform: "none",
  },
  "top-right": {
    position: "fixed",
    left: "auto",
    right: "1vw",
    top: "1.7vh",
    bottom: "auto",
    transform: "none",
  },
  "bottom-center": {
    position: "fixed",
    left: "50%",
    right: "auto",
    top: "auto",
    bottom: "1vh",
    transform: "translateX(-50%)",
  },
};

const getPlayerHudTransition = (position: PlayerHudPosition) => {
  if (position === "top-right") return "slide-left" as const;
  if (position === "bottom-center") return "slide-up" as const;
  return "slide-right" as const;
};

const statColorMap: Record<string, string> = {
  red: 'var(--mantine-color-red-light-hover)',
  blue: 'var(--mantine-color-blue-light-hover)',
  green: 'var(--mantine-color-green-light-hover)',
  yellow: 'var(--mantine-color-yellow-light-hover)',
  orange: 'var(--mantine-color-orange-light-hover)',
  cyan: 'var(--mantine-color-cyan-light-hover)',
  gray: 'var(--mantine-color-gray-light-hover)',
  violet: 'var(--mantine-color-violet-light-hover)'
};

const StatIndicator = ({
  value,
  color,
  Icon,
  size = 'md'
}: {
  value: number;
  color: string;
  Icon: React.ElementType;
  size?: 'sm' | 'md';
}) => {
  const theme = useMantineTheme();

  const progressColor = statColorMap[color] || 'var(--mantine-color-blue-light-hover)';
  const shadowColor = theme.colors[color]?.[4] || theme.colors.blue[4];
  const avatarSize = size === 'sm' ? '3.1vh' : '3.5vh';
  const iconSize = size === 'sm' ? '2.6vh' : '2.8vh';

  return (
    <Box
      style={{
        borderRadius: theme.radius.xs,
        boxShadow: `0 0 10px ${theme.colors.dark[8]}`,
        border: `0.2vh solid ${alpha(theme.colors.dark[8], 1)}`,
        backgroundColor: theme.colors.dark[8],
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        style={{
          position: 'relative',
          width: avatarSize,
          height: avatarSize,
        }}
      >
        <Box
          bg={progressColor}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: theme.radius.xxs,
            border: `0.2vh solid ${alpha(theme.colors.dark[8], 0.7)}`,
            clipPath: `inset(${100 - value}% 0 0 0)`,
            zIndex: 0,
          }}
        />

        <Avatar
          size={avatarSize}
          radius="xs"
          variant="light"
          color={color}
          style={{
            borderRadius: theme.radius.xs,
            boxShadow: `0 0 10px ${progressColor}`,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Icon size={iconSize} style={{ filter: `drop-shadow(0 0 4px ${alpha(shadowColor, 0.5)})` }} />
        </Avatar>
      </Box>
    </Box>
  );
};

const BarStatIndicator = ({
  value,
  color,
  Icon,
  size = 'md'
}: {
  value: number;
  color: string;
  Icon: React.ElementType;
  size?: 'sm' | 'md';
}) => {
  const theme = useMantineTheme();
  const progressColor = statColorMap[color] || 'var(--mantine-color-blue-light-hover)';
  const shadowColor = theme.colors[color]?.[4] || theme.colors.blue[4];
  const iconSize = size === 'sm' ? '2.1vh' : '2.35vh';
  const iconBoxSize = size === 'sm' ? '2.8vh' : '3.1vh';
  const barWidth = size === 'sm' ? '3.4vh' : '3.8vh';

  return (
    <Flex
      direction="column"
      align="center"
      gap="0.35vh"
      style={{
        width: barWidth,
      }}
    >
      <Box
        style={{
          width: iconBoxSize,
          height: iconBoxSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          size={iconSize}
          color={'white'}
          style={{
            filter: `drop-shadow(0 0 4px ${theme.colors.gray[5]})`
          }}
        />
      </Box>

      <Box
        style={{
          width: '100%',
          height: '0.85vh',
          borderRadius: '0.2vh',
          backgroundColor: theme.colors.dark[8],
          border: `0.2vh solid ${theme.colors.dark[8]}`,
          boxShadow: `0 0 10px ${theme.colors.dark[8]}`,
        }}
      >
        <Box
          style={{
            width: `${Math.max(0, Math.min(value, 100))}%`,
            height: '100%',
            borderRadius: '0.1vh',
            backgroundColor: shadowColor,
            boxShadow: `0 0 10px ${shadowColor}`,
            transition: 'width 0.25s ease',
          }}
        />
      </Box>
    </Flex>
  );
};

const CircleStatIndicator = ({
  value,
  color,
  Icon,
  size = "md",
}: {
  value: number;
  color: string;
  Icon: React.ElementType;
  size?: "sm" | "md";
}) => {
  const theme = useMantineTheme();
  const clampedValue = Math.max(0, Math.min(value, 100));

  const progressColor = statColorMap[color] || 'var(--mantine-color-blue-light-hover)';
  const shadowColor = theme.colors[color]?.[4] || theme.colors.blue[4];
  const avatarSize = size === 'sm' ? '3.1vh' : '3.8vh';
  const iconSize = size === 'sm' ? '2.6vh' : '2.3vh';

  return (
    <Box
      style={{
        borderRadius: '50%',
        boxShadow: `0 0 10px ${theme.colors.dark[8]}`,
        border: `0.2vh solid ${alpha(theme.colors.dark[8], 1)}`,
        backgroundColor: theme.colors.dark[8],
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        style={{
          position: 'relative',
          width: avatarSize,
          height: avatarSize,
        }}
      >
        <Box
          bg={progressColor}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: `0.2vh solid ${alpha(theme.colors.dark[8], 0.7)}`,
            clipPath: `inset(${100 - value}% 0 0 0)`,
            zIndex: 0,
          }}
        />

        <Avatar
          size={avatarSize}
          radius="xs"
          variant="light"
          color={color}
          style={{
            borderRadius: '50%',
            boxShadow: `0 0 10px ${progressColor}`,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Icon size={iconSize} style={{ filter: `drop-shadow(0 0 4px ${alpha(shadowColor, 0.5)})` }} />
        </Avatar>
      </Box>
    </Box>
  );
};

const SegmentedStatusBar = ({
  value,
  color,
}: {
  value: number;
  color: string;
}) => {
  const theme = useMantineTheme();
  const clampedValue = Math.max(0, Math.min(value, 100));
  const segmentCount = 5;
  const shadowColor = theme.colors[color]?.[4] || theme.colors.blue[4];

  return (
    <Box
      style={{
        width: "25vh",
        height: "1.4vh",
        padding: "0.18vh",
        borderRadius: "0.18vh",
        backgroundColor: alpha(theme.colors.dark[8], 1),
        boxShadow: `0 0 10px ${theme.colors.dark[8]}`,
        overflow: "hidden",
      }}
    >
      <Flex gap="0.16vh" h="100%">
        {Array.from({ length: segmentCount }).map((_, index) => {
          const segmentSize = 100 / segmentCount;
          const segmentStart = index * segmentSize;
          const segmentFill = Math.max(0, Math.min((clampedValue - segmentStart) / segmentSize, 1));

          return (
            <Box
              key={index}
              style={{
                flex: 1,
                height: "100%",
                borderRadius: "0.08vh",
                backgroundColor: theme.colors.dark[6],
                overflow: "hidden",
              }}
            >
              <Box
                style={{
                  width: `${segmentFill * 100}%`,
                  height: "100%",
                  backgroundColor: shadowColor,
                  boxShadow: segmentFill > 0 ? `0 0 8px ${shadowColor}` : "none",
                  transition: "width 0.25s ease",
                }}
              />
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
};

const PlainStatusBar = ({
  value,
  color,
}: {
  value: number;
  color: string;
}) => {
  const theme = useMantineTheme();
  const clampedValue = Math.max(0, Math.min(value, 100));
  const shadowColor = theme.colors[color]?.[4] || theme.colors.blue[4];

  return (
    <Box
      style={{
        width: "25vh",
        height: "1.4vh",
        padding: "0.18vh",
        borderRadius: "0.18vh",
        backgroundColor: alpha(theme.colors.dark[8], 1),
        boxShadow: `0 0 10px ${theme.colors.dark[8]}`,
        overflow: "hidden",
      }}
    >
      <Box
        style={{
          width: `${clampedValue}%`,
          height: "100%",
          borderRadius: "0.08vh",
          backgroundColor: shadowColor,
          boxShadow: clampedValue > 0 ? `0 0 8px ${shadowColor}` : "none",
          transition: "width 0.25s ease",
        }}
      />
    </Box>
  );
};

const StatBox = ({
  value,
  color,
  Icon,
  size = 'md',
  indicator = "square"
}: {
  value: number;
  color: string;
  Icon: React.ElementType;
  size?: 'sm' | 'md';
  indicator?: PlayerStatusIndicator;
}) => (
  <Flex direction="column" align="center">
    {indicator === "bar" ? (
      <BarStatIndicator value={value} color={color} Icon={Icon} size={size} />
    ) : indicator === "circle" ? (
      <CircleStatIndicator value={value} color={color} Icon={Icon} size={size} />
    ) : (
      <StatIndicator value={value} color={color} Icon={Icon} size={size} />
    )}
  </Flex>
);

const VoiceIcon = ({
  voiceLevel,
  talking,
  size = "2vh",
  color = "white",
  style,
}: {
  voiceLevel: number;
  talking: string | boolean;
  size?: string | number;
  color?: string;
  style?: React.CSSProperties;
}) => {
  if (!talking) {
    return <FaMicrophoneSlash size={size} color={color} style={style} />;
  }

  if (talking === "voice") {
    return <FaMicrophone size={size} color={color} style={style} />;
  }

  return <FaWalkieTalkie size={size} color={color} style={style} />;
};

const GearIcon = ({
  gear,
  size,
  style,
}: {
  gear: string | number;
  size?: string | number;
  style?: React.CSSProperties;
}) => {
  const theme = useMantineTheme();
  return (
    <Text
      fw={900}
      fz="2vh"
      lh={1}
      c="blue.2"
      style={{
        ...style,
        textShadow: `0 0 4px ${theme.colors.blue[2]}`,
      }}
    >
      {gear}
    </Text>
  );
};

const getVoiceProgress = (voiceLevel: number) => {
  if (voiceLevel === 1.5) return 25;
  if (voiceLevel === 3.0) return 50;
  return 100;
};

const getVoiceColor = (talking: string | boolean) => {
  if (!talking) return 'gray';
  if (talking === 'voice') return 'orange';
  return 'orange';
};

const getFuelColor = (fuel: number) => {
  if (fuel > 50) return "green";
  if (fuel > 20) return "yellow";
  return "red";
};

const getEngineColor = (engineHealth: number) => {
  if (engineHealth > 70) return "green";
  if (engineHealth > 30) return "yellow";
  return "red";
};

const VEHICLE_HUD_WIDTH = "28vh";

const SpeedometerGauge = memo(function SpeedometerGauge({
  speed,
  rpm,
  speedUnit,
  gear,
}: {
  speed: number;
  rpm: number;
  gear: string | number;
  speedUnit: "KMT" | "MPH";
}) {
  const maxRpm = 100;
  const gears = 8;
  const theme = useMantineTheme();
  const percentage = useMemo(() => {
    const normalizedRpm = rpm > 1 ? rpm : rpm * 100;
    return Math.max(0, Math.min((normalizedRpm / maxRpm) * 100, 100));
  }, [rpm]);

  const polarToCartesian = useMemo(
    () => (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
      const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

      return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
      };
    },
    []
  );

  const createArc = useMemo(
    () => (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
      const start = polarToCartesian(x, y, radius, startAngle);
      const end = polarToCartesian(x, y, radius, endAngle);
      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

      return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y].join(" ");
    },
    [polarToCartesian]
  );

  const createGearLine = useMemo(
    () => (centerX: number, centerY: number, innerRadius: number, outerRadius: number, angle: number) => {
      const inner = polarToCartesian(centerX, centerY, innerRadius, angle);
      const outer = polarToCartesian(centerX, centerY, outerRadius, angle);

      return `M ${inner.x} ${inner.y} L ${outer.x} ${outer.y}`;
    },
    [polarToCartesian]
  );

  const gearLines = useMemo(
    () =>
      [...Array(gears)].map((_, i) => {
        const angle = -120 + (i * 240) / Math.max(gears - 1, 1);
        const textPosition = polarToCartesian(0, 0, 33, angle);

        return (
          <g key={`gear-${i}`}>
            <path
              d={createGearLine(0, 0, 37, 43, angle)}
              stroke="#ced4da"
              strokeWidth="1"
              opacity="1"
            />
            <text
              x={textPosition.x}
              y={textPosition.y}
              textAnchor="middle"
              alignmentBaseline="middle"
              fill="#ced4da"
              fontSize="3"
              fontWeight="bold"
            >
              {i + 1}
            </text>
          </g>
        );
      }),
    [createGearLine, polarToCartesian]
  );

  const speedDisplay = useMemo(() => {
    const speedStr = String(Math.round(speed)).padStart(3, '0');
    return speedStr.split('').map((digit, index) => {
      const isLeadingZero =
        speed < 100 &&
        digit === '0' &&
        index < speedStr.length - 1;
      const isActive = speed >= 100 || !isLeadingZero;

      return (
        <Text
          key={index}
          size="4.5vh"
          ta="center"
          style={{
            textShadow: isActive
              ? `0 0 10px ${theme.colors.gray[2]}`
              : `0 0 10px ${theme.colors.gray[4]}`,
            display: 'inline-block',
          }}
          fw={500}
          c={isActive ? theme.colors.gray[2] : theme.colors.gray[4]}
        >
          {digit}
        </Text>
      );
    });
  }, [speed, theme]);

  return (
    <Box
      style={{
        position: "relative",
        width: "30vh",
        height: "30vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "-7vh",
        userSelect: "none",
        zIndex: 0,
      }}
    >
      <svg
        viewBox="-50 -50 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

          <path d={createArc(0, 0, 40, -120, 120)} fill="none" stroke="#141517" strokeWidth="4" />
          <motion.path
            filter="url(#glow)"
            d={createArc(0, 0, 40, -120, 120)}
            fill="none"
            strokeWidth="4"
            pathLength={1}
            strokeDasharray={1}
            initial={false}
            animate={{ strokeDashoffset: 1 - percentage / 100 }}
            transition={{ type: "tween", ease: "linear", duration: 0.15 }}
            style={{
              stroke: percentage >= 90 ? "#ff8787" : percentage >= 85 ? "#4dabf7" : "#4dabf7",
            }}
          />

        {gearLines}
      </svg>

      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{
          position: "absolute",
          inset: 0,
          textAlign: "center",
        }}
      >
        <Flex
          gap="0.5vh"
          style={{
            justifyContent: "end",
          }}
        >
          {speedDisplay}
        </Flex>
        <Text
          fz="1.8vh"
          fw={600}
          c="gray.3"
          lh={1}
          tt="uppercase"
          style={{
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {speedUnit}
        </Text>
      </Flex>
    </Box>
  );
});

const RpmBars = ({ rpm }: { rpm: number }) => {
  const theme = useMantineTheme();

  const totalBars = 18;
  const minBars = 3;

  const normalizedRpm = Math.max(0, Math.min(rpm > 1 ? rpm / 100 : rpm, 1));

  const activeBars = Math.max(
    minBars,
    Math.round(normalizedRpm * totalBars)
  );

  return (
    <Box
      style={{
        width: "100%",
        height: "3.2vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.35vh",
        borderRadius: theme.radius.sm,
        boxSizing: "border-box",
      }}
    >
      <Flex
        align="center"
        justify="start"
        gap="0.35vh"
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {Array.from({ length: totalBars }).map((_, index) => {
          const isActive = index < activeBars;

          const activeColor =
            index >= 15
              ? alpha(theme.colors.blue[4], 1)
              : alpha(theme.colors.gray[2], 1);

          return (
            <Box
              key={index}
              style={{
                flex: 1,
                height: "100%",
                borderRadius: "0.2vh",
                backgroundColor: theme.colors.dark[8],
                position: "relative",
                boxSizing: "border-box",
              }}
            >
              {isActive && (
                <Box
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: activeColor,
                    border: `0.2vh solid ${alpha(theme.colors.dark[8], 0.3)}`,
                    filter: `drop-shadow(0 0 2px ${activeColor})`,
                    borderRadius: "0.2vh",
                    transition:
                      "background-color 0.15s ease, opacity 0.15s ease",
                  }}
                />
              )}
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
};

export default function CombinedHud() {
  const theme = useMantineTheme();

  const { open: playerOpen, health, armor, hunger, thirst, stress, stamina, voice, talking } = statsStore();
  const {
    open: vehicleOpen,
    isHelicopter,
    speed,
    altitude,
    pitch,
    roll,
    rpm,
    currentGear,
    speedUnit,
    fuel,
    engineHealth,
    seatbelt,
    nos,
    harness,
  } = vehicleStore();
  const playerStatusIndicator = settingsStore(
    (state) => state.playerStatusIndicator
  );
  const playerHudPosition = settingsStore(
    (state) => state.playerHudPosition ?? "bottom-left"
  ) as PlayerHudPosition;
  const vehicleHudStyle = settingsStore(
    (state: any) => state.vehicleHudStyle ?? "bars"
  ) as VehicleHudStyle;

  useNuiEvent<Partial<StatsStore>>('UPDATE_STATS', (data) => {
    statsStore.setState(data);
  });

  useNuiEvent<Partial<VehicleStore>>("UPDATE_VEHICLE", (data) => {
    vehicleStore.setState(data);
  });

  const smoothStamina = useTransitionedValue(stamina, 250);
  const smoothHealth = useTransitionedValue(health, 250);
  const smoothArmor = useTransitionedValue(armor, 250);
  const smoothHunger = useTransitionedValue(hunger, 250);
  const smoothThirst = useTransitionedValue(thirst, 250);
  const smoothStress = useTransitionedValue(stress, 250);
  const smoothMappedVoice = useTransitionedValue(getVoiceProgress(voice), 250);

  const smoothSpeed = useTransitionedValue(speed, 250);
  const smoothAltitude = useTransitionedValue(altitude, 300);
  const smoothEngineHealth = useTransitionedValue(engineHealth, 250);
  const smoothFuel = useTransitionedValue(fuel, 250);
  const smoothNos = useTransitionedValue(nos, 250);
  const smoothSeatbelt = useTransitionedValue(seatbelt ? 100 : 50, 250);

  const smoothRpm = useTransitionedValue(rpm, 150);

  const speedDisplay = useMemo(() => {
    const speedStr = String(Math.round(smoothSpeed)).padStart(3, '0');
    return speedStr.split('').map((digit, index) => {
      const isLeadingZero =
        smoothSpeed < 100 &&
        digit === '0' &&
        index < speedStr.length - 1;
      const isActive = smoothSpeed >= 100 || !isLeadingZero;

      return (
        <Text
          key={index}
          size="8vh"
          ta="center"
          style={{
            textShadow: isActive
              ? `0 0 10px ${theme.colors.blue[4]}`
              : `0 0 10px ${theme.colors.gray[4]}`,
            display: 'inline-block',
          }}
          fw={500}
          ff="digital-7"
          c={isActive ? theme.colors.blue[4] : theme.colors.gray[4]}
        >
          {digit}
        </Text>
      );
    });
  }, [smoothSpeed, theme]);

  const vehicleStatusIndicator: PlayerStatusIndicator =
    playerStatusIndicator === "segmented"
      ? "square"
      : playerStatusIndicator === "segmented-bar"
        ? "bar"
        : playerStatusIndicator;

  const VehicleStatusRow = ({
    justify = "start",
    includeGear = true,
  }: {
    justify?: "start" | "center";
    includeGear?: boolean;
  }) => (
    <Flex
      align={vehicleStatusIndicator === "bar" ? "end" : "start"}
      justify={justify}
      gap="0.7vh"
    >
      {includeGear && (
        <StatBox
          Icon={(props: any) => (
            <GearIcon
              {...props}
              gear={currentGear}
            />
          )}
          value={100}
          color="blue"
          indicator={vehicleStatusIndicator}
        />
      )}

      <StatBox
        Icon={PiSeatbeltFill}
        value={smoothSeatbelt}
        color={seatbelt || harness ? "green" : "red"}
        indicator={vehicleStatusIndicator}
      />

      <StatBox
        Icon={FaOilCan}
        value={smoothEngineHealth}
        color={getEngineColor(engineHealth)}
        indicator={vehicleStatusIndicator}
      />

      <StatBox
        Icon={FaGasPump}
        value={smoothFuel}
        color={getFuelColor(fuel)}
        indicator={vehicleStatusIndicator}
      />

      {nos > 0 && (
        <StatBox
          Icon={FaFireFlameCurved}
          value={smoothNos}
          color="violet"
          indicator={vehicleStatusIndicator}
        />
      )}
    </Flex>
  );

  const isSpeedometerColumn = vehicleHudStyle === "speedometer-column";
  const isSegmentedPlayerHud = playerStatusIndicator === "segmented";
  const isSegmentedBarPlayerHud = playerStatusIndicator === "segmented-bar";

  const PlayerIconStatuses = ({
    indicator = "square",
  }: {
    indicator?: PlayerStatusIndicator;
  }) => (
    <Flex align="end" gap="0.7vh">
      <StatBox
        value={smoothMappedVoice}
        color={getVoiceColor(talking)}
        indicator={indicator}
        Icon={(props: any) => (
          <VoiceIcon
            {...props}
            voiceLevel={voice}
            talking={talking}
          />
        )}
      />

      <StatBox
        value={smoothHunger}
        color="orange"
        Icon={PiHamburgerFill}
        indicator={indicator}
      />

      <StatBox
        value={smoothThirst}
        color="cyan"
        Icon={RiDrinks2Fill}
        indicator={indicator}
      />

      {stamina < 100 && (
        <StatBox
          value={smoothStamina}
          color="blue"
          Icon={FaLungs}
          indicator={indicator}
        />
      )}

      {smoothStress > 0 && (
        <StatBox
          value={smoothStress}
          color="violet"
          Icon={FaBrain}
          indicator={indicator}
        />
      )}
    </Flex>
  );

  const SegmentedBars = () => (
    <Flex direction="column" gap="0.25vh" align="start" justify={'start'}>
      <SegmentedStatusBar value={smoothArmor} color="blue" />
      <PlainStatusBar value={smoothHealth} color="red" />
    </Flex>
  );

  return (
    <>
      <div style={{
        position: 'fixed',
        right: '1vw',
        bottom: '1vh',
        zIndex: 100,
      }}>
  <Transition mounted={vehicleOpen} transition="slide-left" duration={300} timingFunction="ease">
    {(transStyles) => (
    <Flex
      direction="column"
      align={isHelicopter || isSpeedometerColumn ? "center" : "stretch"}
      gap={isHelicopter || isSpeedometerColumn ? "0.35vh" : "0.7vh"}
      style={{
        width: isHelicopter ? "38vh" : isSpeedometerColumn ? "30vh" : VEHICLE_HUD_WIDTH,
        ...transStyles,
      }}
    >
      {isHelicopter ? (
        <>
          <HelicopterGauge
            airspeed={smoothSpeed}
            altitude={smoothAltitude}
            pitch={pitch}
            roll={roll}
          />
          <VehicleStatusRow justify="center" includeGear={true} />
        </>
      ) : isSpeedometerColumn ? (
        <>
          <SpeedometerGauge
            speed={smoothSpeed}
            rpm={smoothRpm}
            gear={currentGear}
            speedUnit={speedUnit}
          />
          <VehicleStatusRow justify="center" includeGear={true} />
        </>
      ) : (
        <>
          {/* SPEED */}
          <Flex
            justify="start"
            align="start"
            style={{
              width: "100%",
            }}
          >
            <Flex align="end" justify="end" direction={'row'} gap="1vh">
              <Flex
                gap="0.5vh"
                mb="-1vh"
                style={{
                  justifyContent: "end",
                }}
              >
                {speedDisplay}
              </Flex>
              <Text fz="lg" c="gray" fw={700}>
                {speedUnit}
              </Text>
            </Flex>
          </Flex>

          <RpmBars rpm={smoothRpm} />
          <VehicleStatusRow />
        </>
      )}
      </Flex>
    )}
  </Transition>
      </div>

      <div
        style={{
          ...playerHudPositionStyles[playerHudPosition],
          zIndex: 100,
          pointerEvents: "none",
        }}
      >
        <Transition
          mounted={playerOpen}
          transition={getPlayerHudTransition(playerHudPosition)}
          duration={300}
          timingFunction="ease"
        >
          {(transStyles) => (
            <Flex
              align="end"
              gap="1.1vh"
              style={{
                position: "relative",
                ...transStyles,
              }}
            >

              {isSegmentedPlayerHud ? (
                <Flex align="start" gap="0.7vh">
                  <Flex direction="column" gap="0.7vh" justify={'start'} align={'start'}>
                    <SegmentedBars />
                    <PlayerIconStatuses indicator="square" />
                  </Flex>
                </Flex>
              ) : isSegmentedBarPlayerHud ? (
                <Flex
                  align="start"
                  gap="0.7vh"
                  p="0.45vh"
                >
                  <SegmentedBars />
                  <PlayerIconStatuses indicator="square" />
                </Flex>
              ) : (
                <Flex align="end" gap="0.7vh">
                  <StatBox
                    value={smoothMappedVoice}
                    color={getVoiceColor(talking)}
                    indicator={playerStatusIndicator}
                    Icon={(props: any) => (
                      <VoiceIcon
                        {...props}
                        voiceLevel={voice}
                        talking={talking}
                      />
                    )}
                  />

                  <StatBox
                    value={smoothHealth}
                    color="red"
                    Icon={FaHeartbeat}
                    indicator={playerStatusIndicator}
                  />

                  {smoothArmor > 0 && (
                    <StatBox
                      value={smoothArmor}
                      color="blue"
                      Icon={FaShieldAlt}
                      indicator={playerStatusIndicator}
                    />
                  )}

                  <StatBox
                    value={smoothHunger}
                    color="orange"
                    Icon={PiHamburgerFill}
                    indicator={playerStatusIndicator}
                  />

                  <StatBox
                    value={smoothThirst}
                    color="cyan"
                    Icon={RiDrinks2Fill}
                    indicator={playerStatusIndicator}
                  />

                  {stamina < 100 && (
                    <StatBox
                      value={smoothStamina}
                      color="blue"
                      Icon={FaLungs}
                      indicator={playerStatusIndicator}
                    />
                  )}

                  {smoothStress > 0 && (
                    <StatBox
                      value={smoothStress}
                      color="violet"
                      Icon={FaBrain}
                      indicator={playerStatusIndicator}
                    />
                  )}
                </Flex>
              )}
            </Flex>
          )}
        </Transition>
      </div>
    </>
  );
}
