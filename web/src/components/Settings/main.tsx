import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import {
  ActionIcon,
  alpha,
  Avatar,
  Box,
  Flex,
  Group,
  Popover,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Tooltip,
  Transition,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { IoSettingsSharp } from "react-icons/io5";
import {
  FaClapperboard,
  FaFireFlameCurved,
  FaGamepad,
  FaGasPump,
  FaLungs,
  FaMicrophone,
  FaMicrophoneSlash,
  FaOilCan,
  FaUser,
  FaWalkieTalkie,
  FaX,
} from "react-icons/fa6";
import {
  FaBrain,
  FaChevronDown,
  FaCompass,
  FaEye,
  FaHeartbeat,
  FaPalette,
  FaShieldAlt,
} from "react-icons/fa";
import { PiHamburgerFill, PiSeatbeltFill } from "react-icons/pi";
import { RiDrinks2Fill } from "react-icons/ri";
import { fetchNui } from "../../utils/fetchNui";
import { useNuiEvent } from "../../hooks/useNuiEvent";
import { useTransitionedValue } from "../../utils/useTransitionedValue";
import {
  MANTINE_HUD_COLORS,
  settingsStore,
  type CompassHudLayout,
  type CompassPosition,
  type HudIndicatorVisibility,
  type HudSettingsUpdate,
  type MantineHudColor,
  type PlayerHudLayout,
  type PlayerHudPosition,
  type StandardPlayerIndicatorId,
  type VehicleHudLayout,
  type VehicleIndicatorColorState,
  type VehicleIndicatorId,
  type VehicleIndicatorLayout,
  type VehicleStateColorIndicatorId,
  type VoiceColorState,
} from "../../stores/settings";

type SettingsPage =
  | "player"
  | "vehicle"
  | "compass"
  | "colors"
  | "visibility"
  | "cinematic";

type IndicatorGroup = "player" | "vehicle";

interface IndicatorDefinition<T extends string> {
  id: T;
  label: string;
  description: string;
  icon: ElementType;
}

const playerIndicators: Array<IndicatorDefinition<StandardPlayerIndicatorId>> = [
  {
    id: "health",
    label: "Health",
    description: "The player's current health",
    icon: FaHeartbeat,
  },
  {
    id: "armor",
    label: "Armor",
    description: "The player's current armor",
    icon: FaShieldAlt,
  },
  {
    id: "hunger",
    label: "Hunger",
    description: "The player's current hunger level",
    icon: PiHamburgerFill,
  },
  {
    id: "thirst",
    label: "Thirst",
    description: "The player's current thirst level",
    icon: RiDrinks2Fill,
  },
  {
    id: "stamina",
    label: "Stamina",
    description: "The player's current stamina level",
    icon: FaLungs,
  },
  {
    id: "stress",
    label: "Stress",
    description: "The player's current stress level",
    icon: FaBrain,
  },
];

const vehicleIndicators: Array<IndicatorDefinition<VehicleIndicatorId>> = [
  {
    id: "gear",
    label: "Gear",
    description: "The vehicle's current gear",
    icon: FaGamepad,
  },
  {
    id: "seatbelt",
    label: "Seatbelt",
    description: "The seatbelt status",
    icon: PiSeatbeltFill,
  },
  {
    id: "engine",
    label: "Engine",
    description: "The vehicle's engine status",
    icon: FaOilCan,
  },
  {
    id: "fuel",
    label: "Fuel",
    description: "The vehicle's fuel level",
    icon: FaGasPump,
  },
  {
    id: "nitrous",
    label: "Nitro",
    description: "The vehicle's nitrous status",
    icon: FaFireFlameCurved,
  },
];

const navItems: Array<{
  value: SettingsPage;
  label: string;
  description: string;
  icon: ElementType;
}> = [
  {
    value: "player",
    label: "Player",
    description: "Player settings and position",
    icon: FaUser,
  },
  {
    value: "vehicle",
    label: "Vehicle",
    description: "Speedometer and status",
    icon: FaGamepad,
  },
  {
    value: "compass",
    label: "Compass",
    description: "Compass and position",
    icon: FaCompass,
  },
  {
    value: "colors",
    label: "Colors",
    description: "Colors on indicators",
    icon: FaPalette,
  },
  {
    value: "visibility",
    label: "Visibility",
    description: "When indicators are visible",
    icon: FaEye,
  },
  {
    value: "cinematic",
    label: "Cinematic",
    description: "Settings",
    icon: FaClapperboard,
  },
];

const visibilityOptions: Array<{
  value: HudIndicatorVisibility;
  label: string;
  description: string;
}> = [
  {
    value: "always",
    label: "Always",
    description: "Indicator is always visible",
  },
  {
    value: "dynamic",
    label: "Dynamic",
    description: "Indicator is visible only when relevant",
  },
  {
    value: "hidden",
    label: "Hidden",
    description: "Indicator is never visible",
  },
];

const voiceStates: Array<{
  id: VoiceColorState;
  label: string;
  icon: ElementType;
}> = [
  { id: "inactive", label: "Inactive", icon: FaMicrophoneSlash },
  { id: "voice", label: "Voice", icon: FaMicrophone },
  { id: "radio", label: "Radio", icon: FaWalkieTalkie },
];

const seatbeltColorStates = [
  { id: "fastened", label: "Fastened" },
  { id: "unfastened", label: "Unfastened" },
] as const;

const vehicleLevelColorStates = [
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
] as const;

const Settings = () => {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const [activePage, setActivePage] = useState<SettingsPage>("player");
  const [colorGroup, setColorGroup] = useState<IndicatorGroup>("player");
  const [visibilityGroup, setVisibilityGroup] =
    useState<IndicatorGroup>("player");

  const settingsEnabled = settingsStore((state) => state.settingsEnabled);
  const hudEnabled = settingsStore((state) => state.hudEnabled);
  const cinematicBarsHeight = settingsStore(
    (state) => state.cinematicBarsHeight,
  );
  const player = settingsStore((state) => state.player);
  const vehicle = settingsStore((state) => state.vehicle);
  const compass = settingsStore((state) => state.compass);

  const updateSettings = settingsStore((state) => state.updateSettings);
  const setHudEnabled = settingsStore((state) => state.setHudEnabled);
  const setCinematicBarsHeight = settingsStore(
    (state) => state.setCinematicBarsHeight,
  );
  const setPlayerLayout = settingsStore((state) => state.setPlayerLayout);
  const setPlayerPosition = settingsStore((state) => state.setPlayerPosition);
  const setPlayerIndicator = settingsStore(
    (state) => state.setPlayerIndicator,
  );
  const setVoiceVisibility = settingsStore(
    (state) => state.setVoiceVisibility,
  );
  const setVoiceColor = settingsStore((state) => state.setVoiceColor);
  const setVehicleLayout = settingsStore((state) => state.setVehicleLayout);
  const setVehicleIndicatorLayout = settingsStore(
    (state) => state.setVehicleIndicatorLayout,
  );
  const setVehicleIndicator = settingsStore(
    (state) => state.setVehicleIndicator,
  );
  const setVehicleIndicatorStateColor = settingsStore(
    (state) => state.setVehicleIndicatorStateColor,
  );
  const setCompassLayout = settingsStore((state) => state.setCompassLayout);
  const setCompassPosition = settingsStore(
    (state) => state.setCompassPosition,
  );

  const smoothHeight = useTransitionedValue(cinematicBarsHeight, 250);
  const showCinematicBars = cinematicBarsHeight > 0 || smoothHeight > 0.1;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!opened || event.key !== "Escape") return;

      setOpened(false);
      void fetchNui("closeSettings");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [opened]);

  useEffect(() => {
    if (!settingsEnabled && opened) setOpened(false);
  }, [opened, settingsEnabled]);

  useNuiEvent<boolean>("TOGGLE_SETTINGS", (show) => {
    setOpened(show && settingsStore.getState().settingsEnabled);
  });

  useNuiEvent<HudSettingsUpdate>("UPDATE_SETTINGS", (data) => {
    updateSettings(data);
  });

  const selectStyles = useMemo(
    () => ({
      input: {
        height: 42,
        minHeight: 42,
        backgroundColor: theme.colors.dark[6],
        color: theme.colors.gray[0],
        border: "none",
        borderRadius: theme.radius.xs,
        boxShadow: `0 0 10px ${theme.colors.dark[6]}`,
      },
      dropdown: {
        backgroundColor: theme.colors.dark[6],
        border: "none",
        borderRadius: theme.radius.xs,
        boxShadow: `0 0 10px ${theme.colors.dark[8]}`,
        padding: "0.6vh",
      },
      option: {
        borderRadius: theme.radius.xs,
        color: theme.colors.gray[1],
        fontSize: 13,
      },
    }),
    [theme],
  );

  const themeColor = (color: MantineHudColor) =>
    theme.colors[color]?.[4] ?? theme.colors.blue[4];

  const closeSettings = () => {
    setOpened(false);
    void fetchNui("closeSettings");
  };

  const saveHudEnabled = (value: string | null) => {
    const enabled = value === "enabled";
    setHudEnabled(enabled);
    void fetchNui("setHudEnabled", { enabled });
  };

  const savePlayerLayout = (layout: PlayerHudLayout) => {
    setPlayerLayout(layout);
    void fetchNui("setHudLayout", { section: "player", layout });
  };

  const savePlayerPosition = (position: PlayerHudPosition) => {
    setPlayerPosition(position);
    void fetchNui("setHudPosition", { section: "player", position });
  };

  const saveVehicleLayout = (layout: VehicleHudLayout) => {
    setVehicleLayout(layout);
    void fetchNui("setHudLayout", { section: "vehicle", layout });
  };

  const saveVehicleIndicatorLayout = (layout: VehicleIndicatorLayout) => {
    setVehicleIndicatorLayout(layout);
    void fetchNui("setVehicleIndicatorLayout", { layout });
  };

  const saveCompassLayout = (layout: CompassHudLayout) => {
    setCompassLayout(layout);
    void fetchNui("setHudLayout", { section: "compass", layout });
  };

  const saveCompassPosition = (position: CompassPosition) => {
    setCompassPosition(position);
    void fetchNui("setHudPosition", { section: "compass", position });
  };

  const savePlayerIndicatorColor = (
    indicator: StandardPlayerIndicatorId,
    color: MantineHudColor,
  ) => {
    setPlayerIndicator(indicator, { color });
    void fetchNui("setIndicatorColor", {
      section: "player",
      indicator,
      color,
    });
  };

  const savePlayerIndicatorVisibility = (
    indicator: StandardPlayerIndicatorId,
    visibility: HudIndicatorVisibility,
  ) => {
    setPlayerIndicator(indicator, { visibility });
    void fetchNui("setIndicatorVisibility", {
      section: "player",
      indicator,
      visibility,
    });
  };

  const saveVoiceIndicatorVisibility = (
    visibility: HudIndicatorVisibility,
  ) => {
    setVoiceVisibility(visibility);
    void fetchNui("setIndicatorVisibility", {
      section: "player",
      indicator: "voice",
      visibility,
    });
  };

  const saveVoiceIndicatorColor = (
    state: VoiceColorState,
    color: MantineHudColor,
  ) => {
    setVoiceColor(state, color);
    void fetchNui("setVoiceIndicatorColor", { state, color });
  };

  const saveVehicleIndicatorColor = (
    indicator: VehicleIndicatorId,
    color: MantineHudColor,
  ) => {
    setVehicleIndicator(indicator, { color });
    void fetchNui("setIndicatorColor", {
      section: "vehicle",
      indicator,
      color,
    });
  };

  const saveVehicleIndicatorVisibility = (
    indicator: VehicleIndicatorId,
    visibility: HudIndicatorVisibility,
  ) => {
    setVehicleIndicator(indicator, { visibility });
    void fetchNui("setIndicatorVisibility", {
      section: "vehicle",
      indicator,
      visibility,
    });
  };

  const saveVehicleIndicatorStateColor = (
    indicator: VehicleStateColorIndicatorId,
    state: VehicleIndicatorColorState,
    color: MantineHudColor,
  ) => {
    setVehicleIndicatorStateColor(indicator, state, color);

    void fetchNui("setVehicleIndicatorStateColor", {
      indicator,
      state,
      color,
    });
  };

  const saveCinematicHeight = (value: string | null) => {
    const height = Number(value ?? 0);
    setCinematicBarsHeight(height);
    void fetchNui("setCinematicBars", { height });
  };

  const SettingRow = ({
    title,
    description,
    children,
  }: {
    title: string;
    description: string;
    children: ReactNode;
  }) => (
    <Flex
      justify="space-between"
      align="center"
      gap="1.4vh"
      p="1.05vh"
      style={{
        borderRadius: theme.radius.xs,
        backgroundColor: theme.colors.dark[7],
        boxShadow: `0 0 10px ${theme.colors.dark[7]}`,
      }}
    >
      <Stack gap={1} style={{ minWidth: 0 }}>
        <Text fz="1.4vh" fw={800} c="gray.0">
          {title}
        </Text>
        <Text fz="1.1vh" fw={500} c="dimmed">
          {description}
        </Text>
      </Stack>
      {children}
    </Flex>
  );

  const PreviewSquareStatus = ({
    value,
    color,
    Icon,
  }: {
    value: number;
    color: MantineHudColor;
    Icon: ElementType;
  }) => {
    const progressColor = `var(--mantine-color-${color}-light-hover)`;

    return (
      <Box
        style={{
          borderRadius: theme.radius.xs,
          border: `0.2vh solid ${alpha(theme.colors.dark[8], 1)}`,
          backgroundColor: theme.colors.dark[8],
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box pos="relative" w="3vh" h="3vh">
          <Box
            pos="absolute"
            inset={0}
            style={{
              backgroundColor: progressColor,
              borderRadius: theme.radius.xxs,
              border: `0.2vh solid ${alpha(theme.colors.dark[8], 0.7)}`,
              clipPath: `inset(${100 - value}% 0 0 0)`,
              zIndex: 0,
            }}
          />

          <ThemeIcon
            size="3vh"
            radius="xs"
            variant="light"
            color={color}
            style={{
              position: "relative",
              zIndex: 1,
              boxShadow: `0 0 10px ${progressColor}`,
            }}
          >
            <Icon size="2.2vh" />
          </ThemeIcon>
        </Box>
      </Box>
    );
  };

  const PreviewBarStatus = ({
    value,
    color,
    Icon,
  }: {
    value: number;
    color: MantineHudColor;
    Icon: ElementType;
  }) => {
    const shadowColor = themeColor(color);

    return (
      <Flex direction="column" align="center" gap="0.35vh" w="3.6vh">
        <Box
          w="3.6vh"
          h="3.1vh"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 0,
          }}
        >
          <Icon
            size="2.05vh"
            color="white"
            style={{ filter: `drop-shadow(0 0 4px ${theme.colors.gray[5]})` }}
          />
        </Box>

        <Box
          w="3.6vh"
          h="0.55vh"
          p="0.15vh"
          style={{
            borderRadius: "0.2vh",
            backgroundColor: theme.colors.dark[8],
            boxShadow: `0 0 10px ${theme.colors.dark[8]}`,
            overflow: "hidden",
          }}
        >
          <Box
            w={`${Math.max(0, Math.min(value, 100))}%`}
            h="100%"
            style={{
              borderRadius: "0.1vh",
              backgroundColor: shadowColor,
              boxShadow: `0 0 10px ${shadowColor}`,
            }}
          />
        </Box>
      </Flex>
    );
  };

  const PreviewCircleStatus = ({
    value,
    color,
    Icon,
  }: {
    value: number;
    color: MantineHudColor;
    Icon: ElementType;
  }) => {
    const progressColor = `var(--mantine-color-${color}-light-hover)`;
    const shadowColor = themeColor(color);

    return (
      <Box
        style={{
          borderRadius: "50%",
          boxShadow: `0 0 10px ${theme.colors.dark[8]}`,
          border: `0.2vh solid ${alpha(theme.colors.dark[8], 1)}`,
          backgroundColor: theme.colors.dark[8],
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box pos="relative" w="3.8vh" h="3.8vh">
          <Box
            pos="absolute"
            inset={0}
            style={{
              borderRadius: "50%",
              backgroundColor: progressColor,
              border: `0.2vh solid ${alpha(theme.colors.dark[8], 0.7)}`,
              clipPath: `inset(${100 - value}% 0 0 0)`,
              zIndex: 0,
            }}
          />

          <Avatar
            size="3.8vh"
            radius="xl"
            variant="light"
            color={color}
            style={{
              borderRadius: "50%",
              boxShadow: `0 0 10px ${progressColor}`,
              position: "relative",
              zIndex: 1,
            }}
          >
            <Icon
              size="2.3vh"
              style={{
                filter: `drop-shadow(0 0 4px ${alpha(shadowColor, 0.5)})`,
              }}
            />
          </Avatar>
        </Box>
      </Box>
    );
  };

  const previewStatuses = [
    {
      value: 92,
      color: player.indicators.health.color,
      icon: FaHeartbeat,
    },
    {
      value: 68,
      color: player.indicators.armor.color,
      icon: FaShieldAlt,
    },
    {
      value: 54,
      color: player.indicators.hunger.color,
      icon: PiHamburgerFill,
    },
    {
      value: 37,
      color: player.indicators.thirst.color,
      icon: RiDrinks2Fill,
    },
  ];

  const PlayerLayoutPreview = ({ layout }: { layout: PlayerHudLayout }) => {
    const PreviewStatus =
      layout === "minimal"
        ? PreviewBarStatus
        : layout === "circular"
          ? PreviewCircleStatus
          : PreviewSquareStatus;

    return (
      <Flex align="end" gap="0.65vh">
        {previewStatuses.map((status, index) => (
          <PreviewStatus
            key={index}
            value={status.value}
            color={status.color}
            Icon={status.icon}
          />
        ))}
      </Flex>
    );
  };

  const vehiclePreviewStatuses = [
    {
      value: 100,
      color: vehicle.indicators.seatbelt.colors.fastened,
      icon: PiSeatbeltFill,
    },
    {
      value: 58,
      color: vehicle.indicators.engine.colors.medium,
      icon: FaOilCan,
    },
    {
      value: 18,
      color: vehicle.indicators.fuel.colors.low,
      icon: FaGasPump,
    },
    {
      value: 42,
      color: vehicle.indicators.nitrous.color,
      icon: FaFireFlameCurved,
    },
  ];

  const VehicleIndicatorsPreview = ({
    layout,
  }: {
    layout: VehicleIndicatorLayout;
  }) => {
    const PreviewStatus =
      layout === "minimal"
        ? PreviewBarStatus
        : layout === "circular"
          ? PreviewCircleStatus
          : PreviewSquareStatus;

    return (
      <Flex align="end" justify="center" gap="0.55vh">
        {vehiclePreviewStatuses.map((status, index) => (
          <PreviewStatus
            key={index}
            value={status.value}
            color={status.color}
            Icon={status.icon}
          />
        ))}
      </Flex>
    );
  };

  const PreviewVehicleBars = () => (
    <Stack gap="0.45vh" align="stretch" w="100%" maw="18vh">
      <Flex align="end" justify="flex-start" gap="0.45vh">
        <Flex gap="0.16vh" mb="-0.35vh">
          {"086".split("").map((digit, index) => (
            <Text
              key={index}
              fz="3.2vh"
              fw={500}
              ff="digital-7"
              c={index < 1 ? "gray.4" : "blue.4"}
              lh={0.85}
              style={{
                display: "inline-block",
                fontVariantNumeric: "tabular-nums",
                textShadow:
                  index < 1
                    ? `0 0 8px ${theme.colors.gray[4]}`
                    : `0 0 8px ${theme.colors.blue[4]}`,
              }}
            >
              {digit}
            </Text>
          ))}
        </Flex>
        <Text fz="0.95vh" fw={800} c="gray.5">
          KMT
        </Text>
      </Flex>

      <Flex gap="0.18vh" w="100%" h="1.25vh">
        {Array.from({ length: 18 }).map((_, index) => {
          const active = index < 12;
          const color =
            index >= 15 ? theme.colors.blue[4] : theme.colors.gray[2];

          return (
            <Box
              key={index}
              style={{
                flex: 1,
                borderRadius: "0.16vh",
                backgroundColor: active ? color : theme.colors.dark[8],
                boxShadow: active ? `0 0 5px ${color}` : "none",
              }}
            />
          );
        })}
      </Flex>
    </Stack>
  );

  const PreviewSpeedometerColumn = () => {
    const maxRpm = 100;
    const rpm = 64;
    const gears = 8;
    const percentage = Math.max(0, Math.min((rpm / maxRpm) * 100, 100));
    const endAngle = -120 + (percentage / 100) * 240;

    const polarToCartesian = (
      centerX: number,
      centerY: number,
      radius: number,
      angleInDegrees: number,
    ) => {
      const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
      return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
      };
    };

    const createArc = (
      x: number,
      y: number,
      radius: number,
      startAngle: number,
      finishAngle: number,
    ) => {
      const start = polarToCartesian(x, y, radius, startAngle);
      const end = polarToCartesian(x, y, radius, finishAngle);
      const largeArcFlag = finishAngle - startAngle <= 180 ? "0" : "1";

      return [
        "M",
        start.x,
        start.y,
        "A",
        radius,
        radius,
        0,
        largeArcFlag,
        1,
        end.x,
        end.y,
      ].join(" ");
    };

    const createGearLine = (
      centerX: number,
      centerY: number,
      innerRadius: number,
      outerRadius: number,
      angle: number,
    ) => {
      const inner = polarToCartesian(centerX, centerY, innerRadius, angle);
      const outer = polarToCartesian(centerX, centerY, outerRadius, angle);
      return `M ${inner.x} ${inner.y} L ${outer.x} ${outer.y}`;
    };

    return (
      <Stack gap="0.15vh" align="center" w="100%">
        <Box pos="relative" w="14vh" h="12.5vh">
          <svg
            viewBox="-50 -50 100 100"
            preserveAspectRatio="xMidYMid meet"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <defs>
              <filter id="settings-speedometer-glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g filter="url(#settings-speedometer-glow)">
              <path
                d={createArc(0, 0, 40, -120, 120)}
                fill="none"
                stroke="#141517"
                strokeWidth="4"
              />
              <path
                d={createArc(0, 0, 40, -120, endAngle)}
                fill="none"
                stroke={theme.colors.blue[4]}
                strokeWidth="4"
              />
            </g>

            {Array.from({ length: gears }).map((_, index) => {
              const angle = -120 + (index * 240) / Math.max(gears - 1, 1);
              const textPosition = polarToCartesian(0, 0, 30, angle);

              return (
                <g key={`preview-gear-${index}`}>
                  <path
                    d={createGearLine(0, 0, 38, 42, angle)}
                    stroke="#dee2e6"
                    strokeWidth="2.1"
                    opacity="1"
                    strokeLinecap="round"
                  />
                  <text
                    x={textPosition.x}
                    y={textPosition.y}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fill="white"
                    fontSize="5"
                    fontWeight="bold"
                  >
                    {index + 1}
                  </text>
                </g>
              );
            })}
          </svg>

          <Flex
            direction="column"
            align="center"
            justify="center"
            pos="absolute"
            inset={0}
          >
            <Text fz="1.5vh" fw={700} c="white" lh={0.9}>
              000
            </Text>
            <Text fz="0.75vh" fw={700} c="gray.5" lh={1} tt="uppercase">
              MPH
            </Text>
          </Flex>
        </Box>
      </Stack>
    );
  };

  const PreviewCompassDefault = () => (
    <Stack gap="0.35vh" align="center" w="100%">
      <Text fz="0.8vh" fw={700} c="dimmed" tt="uppercase" lh={1}>
        Rockford Hills
      </Text>
      <Text
        fz="1.65vh"
        fw={900}
        c="blue.4"
        tt="uppercase"
        lh={1}
        style={{ textShadow: `0 0 8px ${theme.colors.blue[6]}` }}
      >
        N
      </Text>
      <Text fz="1.2vh" fw={900} c="gray.0" tt="uppercase" lh={1}>
        Palomino Ave
      </Text>
      <Text fz="0.85vh" fw={800} c="dimmed" tt="uppercase" lh={1}>
        Spanish Ave
      </Text>
    </Stack>
  );

  const PreviewCompassCompact = () => (
    <Flex align="center" justify="center" gap="1vh" w="100%">
      <Text fz="1.05vh" fw={900} c="gray.0" tt="uppercase" maw="8.4vh" truncate>
        Palomino Ave
      </Text>

      <Flex
        align="center"
        justify="center"
        gap="0.55vh"
        px="0.65vh"
        py="0.4vh"
        style={{
          borderRadius: theme.radius.xs,
          border: `0.2vh solid ${alpha(theme.colors.dark[8], 0.7)}`,
          backgroundColor: alpha(theme.colors.dark[8], 0.92),
          boxShadow: `0 0 10px ${theme.colors.dark[8]}`,
        }}
      >
        <Text fz="0.75vh" fw={900} c="gray.5" lh={1}>
          NW
        </Text>
        <Text fz="1.25vh" fw={900} c="gray.0" lh={1}>
          N
        </Text>
        <Text fz="0.75vh" fw={900} c="gray.5" lh={1}>
          NE
        </Text>
      </Flex>

      <Text fz="1.05vh" fw={900} c="gray.0" tt="uppercase" maw="8.4vh" truncate>
        Spanish Ave
      </Text>
    </Flex>
  );

  const LayoutCard = <T extends string>({
    value,
    current,
    title,
    description,
    preview,
    onSelect,
    previewHeight = "9.2vh",
  }: {
    value: T;
    current: T;
    title: string;
    description: string;
    preview: ReactNode;
    onSelect: (value: T) => void;
    previewHeight?: string;
  }) => {
    const selected = value === current;

    return (
      <UnstyledButton
        onClick={() => onSelect(value)}
        p="1.05vh"
        style={{
          minWidth: 0,
          borderRadius: theme.radius.xs,
          backgroundColor: selected
            ? alpha(theme.colors.blue[4], 0.1)
            : theme.colors.dark[7],
          outline: selected
            ? `0.18vh solid ${alpha(theme.colors.blue[4], 0.75)}`
            : "none",
          filter: selected
            ? `drop-shadow(0 0 4px ${alpha(theme.colors.blue[4], 0.45)})`
            : "none",
          transition: "background-color 160ms ease, filter 160ms ease",
        }}
      >
        <Stack gap="0.75vh">
          <Flex
            align="center"
            justify="center"
            p="0.8vh"
            style={{
              minHeight: previewHeight,
              borderRadius: theme.radius.xs,
              backgroundColor: theme.colors.dark[6],
              boxShadow: `0 0 10px ${theme.colors.dark[8]}`,
            }}
          >
            {preview}
          </Flex>

          <Stack gap={0}>
            <Text fz="1.35vh" fw={800} c={selected ? "blue.2" : "gray.0"}>
              {title}
            </Text>
            <Text fz="1.05vh" fw={500} c="dimmed">
              {description}
            </Text>
          </Stack>
        </Stack>
      </UnstyledButton>
    );
  };

  const ColorGridPicker = ({
    value,
    onChange,
    label,
  }: {
    value: MantineHudColor;
    onChange: (color: MantineHudColor) => void;
    label: string;
  }) => {
    const [pickerOpened, setPickerOpened] = useState(false);
    const selectedColor = themeColor(value);

    return (
      <Popover
        opened={pickerOpened}
        onChange={setPickerOpened}
        position="bottom-end"
        offset={7}
        shadow="md"
        withinPortal={false}
      >
        <Popover.Target>
          <UnstyledButton
            onClick={() => setPickerOpened((current) => !current)}
            px="0.65vh"
            py="0.55vh"
            style={{
              minWidth: "9.5vw",
              borderRadius: theme.radius.xs,
              backgroundColor: theme.colors.dark[6],
              boxShadow: `0 0 10px ${theme.colors.dark[6]}`,
            }}
          >
            <Group gap="0.65vh" justify="space-between" wrap="nowrap">
              <Group gap="0.65vh" wrap="nowrap">
                <Box
                  w="1.45vh"
                  h="1.45vh"
                  style={{
                    borderRadius: theme.radius.xxs,
                    backgroundColor: selectedColor,
                    boxShadow: `0 0 6px ${selectedColor}`,
                  }}
                />
                <Text fz="1.12vh" fw={800} c="gray.1" tt="capitalize">
                  {label}
                </Text>
              </Group>
              <FaChevronDown size="0.9vh" color={theme.colors.gray[5]} />
            </Group>
          </UnstyledButton>
        </Popover.Target>

        <Popover.Dropdown
          p="0.75vh"
          style={{
            border: "none",
            borderRadius: theme.radius.xs,
            backgroundColor: theme.colors.dark[6],
            boxShadow: `0 0 14px ${theme.colors.dark[9]}`,
          }}
        >
          <SimpleGrid cols={7} spacing="0.5vh" verticalSpacing="0.5vh">
            {MANTINE_HUD_COLORS.map((color) => {
              const swatch = themeColor(color);
              const selected = color === value;

              return (
                <Tooltip
                  key={color}
                  label={color.charAt(0).toUpperCase() + color.slice(1)}
                  withArrow
                >
                  <UnstyledButton
                    aria-label={`Velg ${color}`}
                    onClick={() => {
                      onChange(color);
                      setPickerOpened(false);
                    }}
                    style={{
                      width: "2.45vh",
                      height: "2.45vh",
                      padding: "0.22vh",
                      borderRadius: theme.radius.xs,
                      backgroundColor: theme.colors.dark[7],
                      outline: selected
                        ? `0.22vh solid ${theme.colors.blue[4]}`
                        : `0.14vh solid ${alpha(theme.colors.gray[6], 0.32)}`,
                      boxShadow: selected
                        ? `0 0 8px ${alpha(theme.colors.blue[4], 0.65)}`
                        : "none",
                      transition: "outline-color 140ms ease, box-shadow 140ms ease",
                    }}
                  >
                    <Box
                      w="100%"
                      h="100%"
                      style={{
                        borderRadius: theme.radius.xxs,
                        backgroundColor: swatch,
                        boxShadow: `0 0 5px ${alpha(swatch, 0.45)}`,
                      }}
                    />
                  </UnstyledButton>
                </Tooltip>
              );
            })}
          </SimpleGrid>
        </Popover.Dropdown>
      </Popover>
    );
  };

  const IndicatorIcon = ({
    icon: Icon,
    color,
  }: {
    icon: ElementType;
    color: MantineHudColor;
  }) => (
    <ThemeIcon
      size="3.5vh"
      radius="xs"
      variant="light"
      color={color}
      style={{ filter: `drop-shadow(0 0 4px ${alpha(themeColor(color), 0.45)})` }}
    >
      <Icon size="2.05vh" />
    </ThemeIcon>
  );

  const ColorIndicatorRow = ({
    label,
    description,
    icon,
    color,
    onColor,
  }: {
    label: string;
    description: string;
    icon: ElementType;
    color: MantineHudColor;
    onColor: (color: MantineHudColor) => void;
  }) => (
    <Flex
      align="center"
      justify="space-between"
      gap="1vh"
      p="0.8vh"
      style={{
        borderRadius: theme.radius.xs,
        backgroundColor: theme.colors.dark[7],
        boxShadow: `0 0 10px ${theme.colors.dark[7]}`,
      }}
    >
      <Group gap="0.8vh" wrap="nowrap">
        <IndicatorIcon icon={icon} color={color} />
        <Stack gap={0} style={{ minWidth: 0 }}>
          <Text fz="1.3vh" fw={800} c="gray.0">
            {label}
          </Text>
          <Text fz="1.02vh" fw={500} c="dimmed">
            {description}
          </Text>
        </Stack>
      </Group>

      <ColorGridPicker
        value={color}
        onChange={onColor}
        label={color}
      />
    </Flex>
  );

  const VehicleStateColorRow = ({
    label,
    description,
    icon,
    states,
    colors,
    onColor,
  }: {
    label: string;
    description: string;
    icon: ElementType;
    states: ReadonlyArray<{
      id: VehicleIndicatorColorState;
      label: string;
    }>;
    colors: Partial<Record<VehicleIndicatorColorState, MantineHudColor>>;
    onColor: (
      state: VehicleIndicatorColorState,
      color: MantineHudColor,
    ) => void;
  }) => {
    const previewColor = colors[states[0].id] ?? "gray";

    return (
      <Flex
        align="center"
        justify="space-between"
        gap="1vh"
        p="0.8vh"
        style={{
          borderRadius: theme.radius.xs,
          backgroundColor: theme.colors.dark[7],
          boxShadow: `0 0 10px ${theme.colors.dark[7]}`,
        }}
      >
        <Group gap="0.8vh" wrap="nowrap">
          <IndicatorIcon icon={icon} color={previewColor} />
          <Stack gap={0} style={{ minWidth: 0 }}>
            <Text fz="1.3vh" fw={800} c="gray.0">
              {label}
            </Text>
            <Text fz="1.02vh" fw={500} c="dimmed">
              {description}
            </Text>
          </Stack>
        </Group>

        <Group gap="0.55vh" wrap="nowrap">
          {states.map((state) => {
            const color = colors[state.id] ?? "gray";

            return (
              <Stack key={state.id} gap="0.2vh">
                <Text fz="0.9vh" fw={700} c="dimmed">
                  {state.label}
                </Text>
                <ColorGridPicker
                  value={color}
                  onChange={(nextColor) => onColor(state.id, nextColor)}
                  label={color}
                />
              </Stack>
            );
          })}
        </Group>
      </Flex>
    );
  };

  const VoiceColorRow = () => (
    <Stack
      gap="0.75vh"
      p="0.8vh"
      style={{
        borderRadius: theme.radius.xs,
        backgroundColor: theme.colors.dark[7],
        boxShadow: `0 0 10px ${theme.colors.dark[7]}`,
      }}
    >
      <Group gap="0.8vh" wrap="nowrap">
        <IndicatorIcon
          icon={FaMicrophone}
          color={player.indicators.voice.colors.voice}
        />
        <Stack gap={0}>
          <Text fz="1.3vh" fw={800} c="gray.0">
            Voice
          </Text>
          <Text fz="1.02vh" fw={500} c="dimmed">
            Customize colors for inactive, normal voice and radio
          </Text>
        </Stack>
      </Group>

      <SimpleGrid cols={3} spacing="0.65vh">
        {voiceStates.map(({ id, label, icon: Icon }) => {
          const color = player.indicators.voice.colors[id];

          return (
            <Group
              key={id}
              gap="0.55vh"
              wrap="nowrap"
              p="0.55vh"
              style={{
                borderRadius: theme.radius.xs,
                backgroundColor: theme.colors.dark[6],
              }}
            >
              <ThemeIcon size="2.8vh" radius="xs" variant="light" color={color}>
                <Icon size="1.55vh" />
              </ThemeIcon>
              <Stack gap="0.25vh" style={{ minWidth: 0, flex: 1 }}>
                <Text fz="1.02vh" fw={800} c="gray.2">
                  {label}
                </Text>
                <ColorGridPicker
                  value={color}
                  onChange={(next) => saveVoiceIndicatorColor(id, next)}
                  label={color}
                />
              </Stack>
            </Group>
          );
        })}
      </SimpleGrid>
    </Stack>
  );

  const VisibilitySelector = ({
    value,
    onChange,
  }: {
    value: HudIndicatorVisibility;
    onChange: (visibility: HudIndicatorVisibility) => void;
  }) => (
    <SimpleGrid cols={3} spacing="0.45vh" style={{ width: "26vw" }}>
      {visibilityOptions.map((option) => {
        const selected = value === option.value;

        return (
          <UnstyledButton
            key={option.value}
            onClick={() => onChange(option.value)}
            p="0.55vh"
            style={{
              borderRadius: theme.radius.xs,
              backgroundColor: selected
                ? alpha(theme.colors.blue[4], 0.1)
                : theme.colors.dark[6],
              outline: selected
                ? `0.18vh solid ${theme.colors.blue[4]}`
                : "none",
              boxShadow: selected
                ? `0 0 7px ${alpha(theme.colors.blue[4], 0.42)}`
                : `0 0 8px ${theme.colors.dark[6]}`,
            }}
          >
            <Stack gap={0}>
              <Text
                fz="1.06vh"
                fw={800}
                c={selected ? "blue.2" : "gray.1"}
              >
                {option.label}
              </Text>
              <Text fz="0.85vh" fw={500} c="dimmed" lineClamp={1}>
                {option.description}
              </Text>
            </Stack>
          </UnstyledButton>
        );
      })}
    </SimpleGrid>
  );

  const VisibilityIndicatorRow = ({
    label,
    description,
    icon,
    color,
    visibility,
    onVisibility,
  }: {
    label: string;
    description: string;
    icon: ElementType;
    color: MantineHudColor;
    visibility: HudIndicatorVisibility;
    onVisibility: (visibility: HudIndicatorVisibility) => void;
  }) => (
    <Flex
      align="center"
      justify="space-between"
      gap="1vh"
      p="0.8vh"
      style={{
        borderRadius: theme.radius.xs,
        backgroundColor: theme.colors.dark[7],
        boxShadow: `0 0 10px ${theme.colors.dark[7]}`,
      }}
    >
      <Group gap="0.8vh" wrap="nowrap">
        <IndicatorIcon icon={icon} color={color} />
        <Stack gap={0} style={{ minWidth: 0 }}>
          <Text fz="1.3vh" fw={800} c="gray.0">
            {label}
          </Text>
          <Text fz="1.02vh" fw={500} c="dimmed">
            {description}
          </Text>
        </Stack>
      </Group>

      <VisibilitySelector value={visibility} onChange={onVisibility} />
    </Flex>
  );

  const PageHeading = ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => (
    <Box>
      <Text fz="1.5vh" fw={900} c="gray.1">
        {title}
      </Text>
      <Text fz="1.08vh" fw={500} c="dimmed">
        {description}
      </Text>
    </Box>
  );

  const PlayerSettings = () => (
    <Stack gap="0.9vh">
      <SettingRow title="Show HUD" description="Choose whether the HUD should be visible">
        <Select
          value={hudEnabled ? "enabled" : "disabled"}
          onChange={saveHudEnabled}
          data={[
            { value: "enabled", label: "On" },
            { value: "disabled", label: "Off" },
          ]}
          w="11vw"
          allowDeselect={false}
          styles={selectStyles}
        />
      </SettingRow>

      <PageHeading
        title="Player Settings"
        description="Settings for the player HUD"
      />

      <SimpleGrid cols={3} spacing="0.8vh">
        <LayoutCard
          value="icons"
          current={player.layout}
          title="Square"
          description="Square layout"
          preview={<PlayerLayoutPreview layout="icons" />}
          onSelect={savePlayerLayout}
        />
        <LayoutCard
          value="minimal"
          current={player.layout}
          title="Minimal"
          description="Minimal layout with status bars"
          preview={<PlayerLayoutPreview layout="minimal" />}
          onSelect={savePlayerLayout}
        />
        <LayoutCard
          value="circular"
          current={player.layout}
          title="Circular"
          description="Circular status indicators"
          preview={<PlayerLayoutPreview layout="circular" />}
          onSelect={savePlayerLayout}
        />
      </SimpleGrid>

      <SettingRow
        title="Player HUD"
        description="Choose where player status indicators should be displayed"
      >
        <Select
          value={player.position}
          onChange={(value: string | null) =>
            value && savePlayerPosition(value as PlayerHudPosition)
          }
          data={[
            { value: "bottom-left", label: "Bottom left" },
            { value: "top-left", label: "Top left" },
            { value: "top-right", label: "Top right" },
            { value: "bottom-center", label: "Bottom center" },
          ]}
          w="13vw"
          allowDeselect={false}
          styles={selectStyles}
        />
      </SettingRow>
    </Stack>
  );

  const VehicleSettings = () => (
    <Stack gap="0.9vh">
      <PageHeading
        title="Vehicle HUD"
        description="Choose how the speedometer should be displayed"
      />

      <SimpleGrid cols={2} spacing="0.8vh">
        <LayoutCard
          value="digital"
          current={vehicle.layout}
          title="Minimal"
          description="Minimal digital speedometer"
          preview={<PreviewVehicleBars />}
          onSelect={saveVehicleLayout}
          previewHeight="13.4vh"
        />
        <LayoutCard
          value="dial"
          current={vehicle.layout}
          title="Speedometer"
          description="Dial speedometer"
          preview={<PreviewSpeedometerColumn />}
          onSelect={saveVehicleLayout}
          previewHeight="13.4vh"
        />
      </SimpleGrid>

      <PageHeading
        title="Vehicle Status"
        description="Customize your vehicle status indicators"
      />

      <SimpleGrid cols={3} spacing="0.8vh">
        <LayoutCard
          value="icons"
          current={vehicle.indicatorLayout}
          title="Square"
          description="Filled status icons"
          preview={<VehicleIndicatorsPreview layout="icons" />}
          onSelect={saveVehicleIndicatorLayout}
        />
        <LayoutCard
          value="minimal"
          current={vehicle.indicatorLayout}
          title="Minimal"
          description="Icon with thin lines"
          preview={<VehicleIndicatorsPreview layout="minimal" />}
          onSelect={saveVehicleIndicatorLayout}
        />
        <LayoutCard
          value="circular"
          current={vehicle.indicatorLayout}
          title="Circular"
          description="Round status icons"
          preview={<VehicleIndicatorsPreview layout="circular" />}
          onSelect={saveVehicleIndicatorLayout}
        />
      </SimpleGrid>
    </Stack>
  );

  const CompassSettings = () => (
    <Stack gap="0.9vh">
      <PageHeading
        title="Compass"
        description="Customize your compass layout"
      />

      <SimpleGrid cols={2} spacing="0.8vh">
        <LayoutCard
          value="full"
          current={compass.layout}
          title="Standard"
          description="Full compass layout with both streets and direction"
          preview={<PreviewCompassDefault />}
          onSelect={saveCompassLayout}
        />
        <LayoutCard
          value="compact"
          current={compass.layout}
          title="Compact"
          description="Streets with direction in the center"
          preview={<PreviewCompassCompact />}
          onSelect={saveCompassLayout}
        />
      </SimpleGrid>

      <SettingRow
        title="Compass Position"
        description="Choose where the compass should be displayed (top or bottom)"
      >
        <Select
          value={compass.position}
          onChange={(value: string | null) =>
            value && saveCompassPosition(value as CompassPosition)
          }
          data={[
            { value: "top-center", label: "Top Center" },
            { value: "bottom-center", label: "Bottom Center" },
          ]}
          w="13vw"
          allowDeselect={false}
          styles={selectStyles}
        />
      </SettingRow>
    </Stack>
  );

  const vehicleVisibilityColor = (
    indicator: VehicleIndicatorId,
  ): MantineHudColor => {
    switch (indicator) {
      case "seatbelt":
        return vehicle.indicators.seatbelt.colors.unfastened;
      case "engine":
        return vehicle.indicators.engine.colors.low;
      case "fuel":
        return vehicle.indicators.fuel.colors.low;
      case "gear":
        return vehicle.indicators.gear.color;
      case "nitrous":
        return vehicle.indicators.nitrous.color;
    }
  };

  const ColorsSettings = () => (
    <Stack gap="0.8vh" h="100%">
      <PageHeading
        title="Indicator Colors"
        description="Open a color picker on each indicator and choose"
      />

      <Tabs
        value={colorGroup}
        onChange={(value: string | null) =>
          setColorGroup((value as IndicatorGroup) ?? "player")
        }
        keepMounted={false}
        variant="pills"
        color="blue"
        style={{ minHeight: 0, flex: 1 }}
      >
        <Tabs.List
          grow
          p="0.35vh"
          style={{
            borderRadius: theme.radius.xs,
            backgroundColor: theme.colors.dark[7],
            boxShadow: `0 0 10px ${theme.colors.dark[7]}`,
          }}
        >
          <Tabs.Tab value="player" fw={800}>
            Player
          </Tabs.Tab>
          <Tabs.Tab value="vehicle" fw={800}>
            Vehicle
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="player" pt="0.75vh" h="calc(100% - 4.5vh)">
          <ScrollArea h="100%" scrollbarSize={5} offsetScrollbars>
            <Stack gap="0.65vh" pr="0.5vh" pb="0.5vh">
              <VoiceColorRow />
              {playerIndicators.map(({ id, label, description, icon }) => (
                <ColorIndicatorRow
                  key={id}
                  label={label}
                  description={description}
                  icon={icon}
                  color={player.indicators[id].color}
                  onColor={(color) => savePlayerIndicatorColor(id, color)}
                />
              ))}
            </Stack>
          </ScrollArea>
        </Tabs.Panel>

        <Tabs.Panel value="vehicle" pt="0.75vh" h="calc(100% - 4.5vh)">
          <ScrollArea h="100%" scrollbarSize={5} offsetScrollbars>
            <Stack gap="0.65vh" pr="0.5vh" pb="0.5vh">
              <ColorIndicatorRow
                label="Gear"
                description="The vehicle's current gear"
                icon={FaGamepad}
                color={vehicle.indicators.gear.color}
                onColor={(color) => saveVehicleIndicatorColor("gear", color)}
              />

              <VehicleStateColorRow
                label="Seatbelt"
                description="Colors for fastened and unfastened states"
                icon={PiSeatbeltFill}
                states={seatbeltColorStates}
                colors={vehicle.indicators.seatbelt.colors}
                onColor={(state, color) =>
                  saveVehicleIndicatorStateColor("seatbelt", state, color)
                }
              />

              <VehicleStateColorRow
                label="Engine"
                description="Colors based on the vehicle's engine health"
                icon={FaOilCan}
                states={vehicleLevelColorStates}
                colors={vehicle.indicators.engine.colors}
                onColor={(state, color) =>
                  saveVehicleIndicatorStateColor("engine", state, color)
                }
              />

              <VehicleStateColorRow
                label="Fuel"
                description="Colors based on the vehicle's fuel level"
                icon={FaGasPump}
                states={vehicleLevelColorStates}
                colors={vehicle.indicators.fuel.colors}
                onColor={(state, color) =>
                  saveVehicleIndicatorStateColor("fuel", state, color)
                }
              />

              <ColorIndicatorRow
                label="Nitro"
                description="The vehicle's nitrous status"
                icon={FaFireFlameCurved}
                color={vehicle.indicators.nitrous.color}
                onColor={(color) =>
                  saveVehicleIndicatorColor("nitrous", color)
                }
              />
            </Stack>
          </ScrollArea>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );

  const VisibilitySettings = () => (
    <Stack gap="0.8vh" h="100%">
      <PageHeading
        title="Indicator Visibility"
        description="Choose when each indicator should be visible"
      />

      <Tabs
        value={visibilityGroup}
        onChange={(value: string | null) =>
          setVisibilityGroup((value as IndicatorGroup) ?? "player")
        }
        keepMounted={false}
        variant="pills"
        color="blue"
        style={{ minHeight: 0, flex: 1 }}
      >
        <Tabs.List
          grow
          p="0.35vh"
          style={{
            borderRadius: theme.radius.xs,
            backgroundColor: theme.colors.dark[7],
            boxShadow: `0 0 10px ${theme.colors.dark[7]}`,
          }}
        >
          <Tabs.Tab value="player" fw={800}>
            Player
          </Tabs.Tab>
          <Tabs.Tab value="vehicle" fw={800}>
            Vehicle
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="player" pt="0.75vh" h="calc(100% - 4.5vh)">
          <ScrollArea h="100%" scrollbarSize={5} offsetScrollbars>
            <Stack gap="0.65vh" pr="0.5vh" pb="0.5vh">
              <VisibilityIndicatorRow
                label="Voice"
                description="Microphone, voice and radio indicators"
                icon={FaMicrophone}
                color={player.indicators.voice.colors.voice}
                visibility={player.indicators.voice.visibility}
                onVisibility={saveVoiceIndicatorVisibility}
              />

              {playerIndicators.map(({ id, label, description, icon }) => (
                <VisibilityIndicatorRow
                  key={id}
                  label={label}
                  description={description}
                  icon={icon}
                  color={player.indicators[id].color}
                  visibility={player.indicators[id].visibility}
                  onVisibility={(visibility) =>
                    savePlayerIndicatorVisibility(id, visibility)
                  }
                />
              ))}
            </Stack>
          </ScrollArea>
        </Tabs.Panel>

        <Tabs.Panel value="vehicle" pt="0.75vh" h="calc(100% - 4.5vh)">
          <ScrollArea h="100%" scrollbarSize={5} offsetScrollbars>
            <Stack gap="0.65vh" pr="0.5vh" pb="0.5vh">
              {vehicleIndicators.map(({ id, label, description, icon }) => (
                <VisibilityIndicatorRow
                  key={id}
                  label={label}
                  description={description}
                  icon={icon}
                  color={vehicleVisibilityColor(id)}
                  visibility={vehicle.indicators[id].visibility}
                  onVisibility={(visibility) =>
                    saveVehicleIndicatorVisibility(id, visibility)
                  }
                />
              ))}
            </Stack>
          </ScrollArea>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );

  const CinematicSettings = () => (
    <Stack gap="0.9vh">
      <PageHeading
        title="Cinema Mode"
        description="Add dark bars at the top and bottom of the screen"
      />

      <SettingRow
        title="Height"
        description="Choose the size of the dark cinema bars"
      >
        <Select
          value={String(cinematicBarsHeight)}
          onChange={saveCinematicHeight}
          data={[
            { value: "0", label: "Off" },
            { value: "5", label: "Small" },
            { value: "8", label: "Medium" },
            { value: "10", label: "Large" },
            { value: "15", label: "Extra Large" },
          ]}
          w="13vw"
          allowDeselect={false}
          styles={selectStyles}
        />
      </SettingRow>
    </Stack>
  );

  const ActivePage = () => {
    if (activePage === "player") return <PlayerSettings />;
    if (activePage === "vehicle") return <VehicleSettings />;
    if (activePage === "compass") return <CompassSettings />;
    if (activePage === "colors") return <ColorsSettings />;
    if (activePage === "visibility") return <VisibilitySettings />;
    return <CinematicSettings />;
  };

  return (
    <>
      {showCinematicBars && (
        <Box pos="fixed" inset={0} style={{ pointerEvents: "none", zIndex: 80 }}>
          <Box
            pos="absolute"
            top={0}
            w="100%"
            bg="black"
            style={{ height: `${smoothHeight}%` }}
          />
          <Box
            pos="absolute"
            bottom={0}
            w="100%"
            bg="black"
            style={{ height: `${smoothHeight}%` }}
          />
        </Box>
      )}

      <Transition
        mounted={opened && settingsEnabled}
        transition="slide-up"
        duration={250}
        timingFunction="ease"
      >
        {(transitionStyles: CSSProperties) => (
          <Flex
            pos="fixed"
            inset={0}
            align="center"
            justify="center"
            style={{
              pointerEvents: "none",
              zIndex: 200,
              ...transitionStyles,
            }}
          >
            <Box
              w="68vw"
              h="70vh"
              style={{
                pointerEvents: "auto",
                borderRadius: theme.radius.sm,
                backgroundColor: theme.colors.dark[8],
                boxShadow: `0 0 18px ${theme.colors.dark[9]}`,
                overflow: "hidden",
              }}
            >
              <Flex
                align="center"
                justify="space-between"
                p="0.85vh"
                style={{
                  backgroundColor: theme.colors.dark[7],
                  boxShadow: `0 0 10px ${theme.colors.dark[7]}`,
                }}
              >
                <Group gap="1vh">
                  <Box
                    style={{
                      borderRadius: theme.radius.xs,
                      border: `0.2vh solid ${alpha(theme.colors.dark[8], 1)}`,
                      backgroundColor: theme.colors.dark[8],
                      boxShadow: `0 0 12px ${alpha(theme.colors.dark[9], 0.55)}`,
                    }}
                  >
                    <ThemeIcon
                      size="5vh"
                      radius="xs"
                      variant="light"
                      color="blue"
                      style={{
                        border: `0.2vh solid ${alpha(theme.colors.dark[8], 0.5)}`,
                      }}
                    >
                      <IoSettingsSharp
                        size="3.2vh"
                        style={{
                          filter: `drop-shadow(0 0 4px ${alpha(theme.colors.blue[4], 0.45)})`,
                        }}
                      />
                    </ThemeIcon>
                  </Box>

                  <Stack gap="0.1vh">
                    <Text fz="2.2vh" fw={900} c="gray.0" lh={1.1}>
                      HUD
                    </Text>
                    <Text fz="1.45vh" fw={700} c="dimmed" lh={1.1}>
                      SETTINGS
                    </Text>
                  </Stack>
                </Group>

                <ActionIcon
                  variant="light"
                  color="red"
                  radius="xs"
                  size="3.5vh"
                  onClick={closeSettings}
                >
                  <FaX size="1.7vh" />
                </ActionIcon>
              </Flex>

              <Flex
                gap="1.2vh"
                p="1.2vh"
                h="calc(100% - 6.8vh)"
                style={{ backgroundColor: theme.colors.dark[8] }}
              >
                <Stack gap="0.7vh" w="12.5vw" style={{ flexShrink: 0 }}>
                  {navItems.map((item) => {
                    const active = activePage === item.value;
                    const Icon = item.icon;

                    return (
                      <UnstyledButton
                        key={item.value}
                        onClick={() => setActivePage(item.value)}
                        p="0.7vh"
                        style={{
                          borderRadius: theme.radius.xs,
                          backgroundColor: active
                            ? alpha(theme.colors.blue[4], 0.1)
                            : theme.colors.dark[7],
                          filter: active
                            ? `drop-shadow(0 0 4px ${alpha(theme.colors.blue[4], 0.45)})`
                            : "none",
                          transition:
                            "background-color 160ms ease, filter 160ms ease",
                        }}
                      >
                        <Group gap="0.8vh" wrap="nowrap">
                          <ThemeIcon
                            size="3.2vh"
                            radius="xs"
                            variant="light"
                            color={active ? "blue" : "gray"}
                          >
                            <Icon size="1.75vh" />
                          </ThemeIcon>
                          <Stack gap={0} style={{ minWidth: 0 }}>
                            <Text
                              fz="1.3vh"
                              fw={800}
                              c={active ? "blue.2" : "gray.1"}
                            >
                              {item.label}
                            </Text>
                            <Text fz="0.95vh" fw={500} c="dimmed" truncate>
                              {item.description}
                            </Text>
                          </Stack>
                        </Group>
                      </UnstyledButton>
                    );
                  })}
                </Stack>

                <Box style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
                  <ActivePage />
                </Box>
              </Flex>
            </Box>
          </Flex>
        )}
      </Transition>
    </>
  );
};

export default Settings;
