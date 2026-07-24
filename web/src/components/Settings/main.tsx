import { useEffect, useState } from "react";
import {
  SimpleGrid,
  Box,
  Flex,
  Group,
  Select,
  Stack,
  Text,
  ThemeIcon,
  Transition,
  Tabs,
  UnstyledButton,
  alpha,
  useMantineTheme,
  Avatar,
} from "@mantine/core";
import { IoSettingsSharp } from "react-icons/io5";
import { FaClapperboard, FaFireFlameCurved, FaGamepad, FaGasPump, FaOilCan, FaUser, FaX  } from "react-icons/fa6";
import { FaCompass, FaHeartbeat, FaShieldAlt } from "react-icons/fa";
import { PiHamburgerFill, PiSeatbeltFill } from "react-icons/pi";
import { RiDrinks2Fill } from "react-icons/ri";
import { fetchNui } from "../../utils/fetchNui";
import { useTransitionedValue } from "../../utils/useTransitionedValue";
import { useNuiEvent } from "../../hooks/useNuiEvent";
import {
  settingsStore,
  type CompassPosition,
  type PlayerHudPosition,
  type PlayerStatusIndicator,
} from "../../stores/settings";

type SettingsPage = "player" | "vehicle" | "compass" | "cinematic";
type VehicleHudStyle = "bars" | "speedometer" | "speedometer-column";
type CompassHudStyle = "default" | "compact";

const navItems: {
  value: SettingsPage;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    value: "player",
    label: "Player",
    description: "Settings",
    icon: FaUser,
  },
  {
    value: "vehicle",
    label: "Vehicle",
    description: "Settings",
    icon: FaGamepad,
  },
  {
    value: "compass",
    label: "Compass",
    description: "Settings",
    icon: FaCompass,
  },
  {
    value: "cinematic",
    label: "Cinematic",
    description: "Settings",
    icon: FaClapperboard,
  },
];

const Settings = () => {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const [activePage, setActivePage] = useState<SettingsPage>("player");
  const [playerSettingsTab, setPlayerSettingsTab] = useState<string | null>("style");

  const {
    hudDisabled,
    cinematicBarsHeight,
    playerStatusIndicator,
    playerHudPosition = "bottom-left",
    compassPosition = "top-center",
    setHudDisabled,
    setCinematicBarsHeight,
    setPlayerStatusIndicator,
    setPlayerHudPosition,
    vehicleHudStyle = "bars",
    setVehicleHudStyle,
    compassStyle = "default",
    setCompassStyle,
    setCompassPosition,
  } = settingsStore();

  const smoothHeight = useTransitionedValue(cinematicBarsHeight, 250);
  const showCinematicBars = cinematicBarsHeight > 0 || smoothHeight > 0.1;

    useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!opened || event.key !== 'Escape') return;

      setOpened(false);
      void fetchNui('closeSettings');
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setOpened, opened]);


  const darkShadow = `0 0 12px ${alpha(theme.colors.dark[9], 0.55)}`;

  const selectStyles = {
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
      boxShadow: `0 0 10px ${theme.colors.dark[6]}`,
      padding: '0.6vh',
    },
    option: {
      borderRadius: theme.radius.xs,
      color: theme.colors.gray[1],
      fontSize: 13,
    },
  };

  const handleBarsToggle = (value: string | null) => {
    const heightValue = value ? Number(value) : 0;

    setCinematicBarsHeight(heightValue);
    fetchNui("toggleCinematicBars", {
      enabled: heightValue !== 0,
      height: heightValue,
    });
  };

  const handleHudToggle = (value: string | null) => {
    const enabled = value === "enabled";

    setHudDisabled(enabled);
    fetchNui("setHudDisabled", { enabled });
  };

  const handlePlayerStatusIndicator = (value: PlayerStatusIndicator) => {
    setPlayerStatusIndicator(value);
    fetchNui("setPlayerStatusIndicator", { style: value });
  };

  const handlePlayerHudPosition = (value: PlayerHudPosition) => {
    setPlayerHudPosition(value);
    fetchNui("setPlayerHudPosition", { position: value });
  };

  const handleCompassPosition = (value: CompassPosition) => {
    setCompassPosition(value);
    fetchNui("setCompassPosition", { position: value });
  };

  const handleVehicleHudStyle = (value: VehicleHudStyle) => {
    if (setVehicleHudStyle) {
      setVehicleHudStyle(value);
    } else {
      settingsStore.setState({ vehicleHudStyle: value } as any);
    }

    fetchNui("setVehicleHudStyle", { style: value });
  };

  const handleCompassStyle = (value: CompassHudStyle) => {
    if (setCompassStyle) {
      setCompassStyle(value);
    } else {
      settingsStore.setState({ compassStyle: value } as any);
    }

    fetchNui("setCompassStyle", { style: value });
  };

  const handleClose = () => {
    setOpened(false);
    fetchNui("closeSettings");
  };

  useNuiEvent("TOGGLE_SETTINGS", (data: boolean) => {
    setOpened(data);
  });

  useNuiEvent(
    "UPDATE_SETTINGS",
    (data: {
      hudDisabled?: boolean;
      playerStatusIndicator?: PlayerStatusIndicator;
      playerHudPosition?: PlayerHudPosition;
      vehicleHudStyle?: VehicleHudStyle;
      compassStyle?: CompassHudStyle;
      compassPosition?: CompassPosition;
    }) => {
      settingsStore.getState().updateSettings(data);
    },
  );

  const HeaderIcon = () => (
    <Box
      style={{
        borderRadius: theme.radius.xs,
        border: `0.2vh solid ${alpha(theme.colors.dark[8], 1)}`,
        backgroundColor: theme.colors.dark[8],
        boxShadow: darkShadow,
      }}
    >
      <ThemeIcon
        size={'5vh'}
        radius="xs"
        variant="light"
        color="blue"
        style={{
          border: `0.2vh solid ${alpha(theme.colors.dark[8], 0.5)}`,
        }}
      >
        <IoSettingsSharp size={'4vh'} style={{ filter: `drop-shadow(0 0 4px ${alpha(theme.colors.blue[4], 0.45)})` }} />
      </ThemeIcon>
    </Box>
  );

  const NavButton = ({
    item,
  }: {
    item: (typeof navItems)[number];
  }) => {
    const Icon = item.icon;
    const active = activePage === item.value;

    return (
      <UnstyledButton
        onClick={() => setActivePage(item.value)}
        style={{
          width: "100%",
          borderRadius: theme.radius.xs,
          backgroundColor: active ? alpha(theme.colors.blue[4], 0.1) : theme.colors.dark[7],
          filter: active ? `drop-shadow(0 0 4px ${alpha(theme.colors.blue[4], 0.45)})` : 'none',
              padding: '0.7vh',
          transition: "background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
        }}
      >
        <Group gap={'1vh'} wrap="nowrap">
          <ThemeIcon
            size={'3.4vh'}
            radius="xs"
            variant="light"
            color={active ? "blue.4" : "gray.4"}
          >
            <Icon size={'2.2vh'} />
          </ThemeIcon>

          <Box style={{ minWidth: 0 }}>
            <Text fz={'1.45vh'} fw={700} c={active ? "blue.2" : "gray.1"} truncate>
              {item.label}
            </Text>
            <Text fz={'1.1vh'} fw={500} c="dimmed" truncate>
              {item.description}
            </Text>
          </Box>
        </Group>
      </UnstyledButton>
    );
  };

  const SettingRow = ({
    title,
    description,
    children,
  }: {
    title: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <Flex
      justify="space-between"
      align="center"
      gap={18}
      style={{
        width: "100%",
        padding: '1.15vh',
        borderRadius: theme.radius.xs,
        backgroundColor: theme.colors.dark[7],
        boxShadow: `0 0 10px ${theme.colors.dark[7]}`,
      }}
    >
      <Stack gap={1} style={{ minWidth: 0 }}>
        <Text fz={'1.45vh'} fw={800} c="gray.0">
          {title}
        </Text>
        <Text fz={'1.15vh'} fw={500} c="dimmed">
          {description}
        </Text>
      </Stack>

      {children}
    </Flex>
  );

  const previewStatuses = [
    { value: 92, color: "red", icon: FaHeartbeat },
    { value: 68, color: "blue", icon: FaShieldAlt },
    { value: 54, color: "orange", icon: PiHamburgerFill },
    { value: 37, color: "cyan", icon: RiDrinks2Fill },
  ];

  const getPreviewColor = (color: string) => {
    const colorMap: Record<string, string> = {
      red: "var(--mantine-color-red-light-hover)",
      green: "var(--mantine-color-green-light-hover)",
      blue: "var(--mantine-color-blue-light-hover)",
      orange: "var(--mantine-color-orange-light-hover)",
      cyan: "var(--mantine-color-cyan-light-hover)",
      gray: "var(--mantine-color-gray-light-hover)",
    };

    return colorMap[color] || "var(--mantine-color-blue-light-hover)";
  };

    const getPreviewShadowColor = (color: string) => {
      const colorMap: Record<string, string> = {
        red: "var(--mantine-color-red-light-hover)",
        blue: "var(--mantine-color-blue-light-hover)",
        orange: "var(--mantine-color-orange-light-hover)",
        cyan: "var(--mantine-color-cyan-light-hover)",
        gray: "var(--mantine-color-gray-light-hover)",
      };

    return theme.colors[color]?.[4] || theme.colors.blue[4];
  };

  const PreviewSquareStatus = ({
    value,
    color,
    Icon,
  }: {
    value: number;
    color: string;
    Icon: React.ElementType;
  }) => {
    const progressColor = getPreviewColor(color);

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
        <Box
          style={{
            position: "relative",
            width: "3vh",
            height: "3vh",
          }}
        >
          <Box
            style={{
              position: "absolute",
              inset: 0,
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
  color: string;
  Icon: React.ElementType;
}) => {
  const progressColor = getPreviewColor(color);
  const shadowColor = getPreviewShadowColor(color);

  const barWidth = "3.6vh";
  const iconSlotSize = "2.9vh";
  const iconRowHeight = "3.1vh";
  const iconSize = "2.05vh";

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
          width: barWidth,
          height: iconRowHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 0,
        }}
      >
        <Box
          style={{
            width: iconSlotSize,
            height: iconSlotSize,
            borderRadius: theme.radius.xs,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 0,
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
      </Box>

      <Box
        style={{
          width: barWidth,
          height: "0.55vh",
          padding: "0.15vh",
          borderRadius: '0.2vh',
          backgroundColor: theme.colors.dark[8],
          boxShadow: `0 0 10px ${theme.colors.dark[8]}`,
          overflow: "hidden",
        }}
      >
        <Box
          style={{
            width: `${Math.max(0, Math.min(value, 100))}%`,
            height: "100%",
            borderRadius: '0.1vh',
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
    color: string;
    Icon: React.ElementType;
  }) => {
    const progressColor = getPreviewColor(color);
    const shadowColor = getPreviewShadowColor(color);
    const clampedValue = Math.max(0, Math.min(value, 100));
    const avatarSize = '3.8vh';
    const iconSize = '2.3vh';

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

  const PreviewSegmentedBar = ({
    value,
    color,
  }: {
    value: number;
    color: string;
  }) => {
    const shadowColor = getPreviewShadowColor(color);
    const clampedValue = Math.max(0, Math.min(value, 100));
    const segmentCount = 5;

    return (
      <Box
        style={{
          width: "14vh",
          height: "1vh",
          padding: "0.16vh",
          borderRadius: "0.16vh",
          backgroundColor: alpha(theme.colors.dark[8], 0.96),
          overflow: "hidden",
        }}
      >
        <Flex gap="0.14vh" h="100%">
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
                  borderRadius: "0.07vh",
                  backgroundColor: theme.colors.dark[6],
                  overflow: "hidden",
                }}
              >
                <Box
                  style={{
                    width: `${segmentFill * 100}%`,
                    height: "100%",
                    backgroundColor: shadowColor,
                    boxShadow: segmentFill > 0 ? `0 0 6px ${shadowColor}` : "none",
                  }}
                />
              </Box>
            );
          })}
        </Flex>
      </Box>
    );
  };

  const PreviewPlainBar = ({
    value,
    color,
  }: {
    value: number;
    color: string;
  }) => {
    const shadowColor = getPreviewShadowColor(color);
    const clampedValue = Math.max(0, Math.min(value, 100));

    return (
      <Box
        style={{
          width: "14vh",
          height: "1vh",
          padding: "0.16vh",
          borderRadius: "0.16vh",
          backgroundColor: alpha(theme.colors.dark[8], 0.96),
          overflow: "hidden",
        }}
      >
        <Box
          style={{
            width: `${clampedValue}%`,
            height: "100%",
            borderRadius: "0.07vh",
            backgroundColor: shadowColor,
            boxShadow: clampedValue > 0 ? `0 0 6px ${shadowColor}` : "none",
          }}
        />
      </Box>
    );
  };

  const PreviewSegmentedBars = () => (
    <Stack gap="0.22vh">
      <PreviewSegmentedBar value={68} color="blue" />
      <PreviewPlainBar value={92} color="red" />
    </Stack>
  );

  const PreviewSegmentedStackHud = () => (
    <Stack gap="0.55vh" align="center">
      <PreviewSegmentedBars />
      <Flex align="end" gap="0.45vh">
        {previewStatuses.slice(2).map((status, index) => (
          <PreviewSquareStatus
            key={index}
            value={status.value}
            color={status.color}
            Icon={status.icon}
          />
        ))}
      </Flex>
    </Stack>
  );

  const PreviewSegmentedBarHud = () => (
    <Flex
      align="center"
      gap="0.5vh"
      p="0.4vh"
    >
      <PreviewSegmentedBars />
      <Flex align="end" gap="0.42vh">
        {previewStatuses.slice(2).map((status, index) => (
          <PreviewSquareStatus
            key={index}
            value={status.value}
            color={status.color}
            Icon={status.icon}
          />
        ))}
      </Flex>
    </Flex>
  );

  const PreviewCircleHud = () => (
    <Flex align="end" gap="0.55vh">
      {previewStatuses.map((status, index) => (
        <PreviewCircleStatus
          key={index}
          value={status.value}
          color={status.color}
          Icon={status.icon}
        />
      ))}
    </Flex>
  );

  const HudPreviewCard = ({
    value,
    title,
    description,
    children,
  }: {
    value: PlayerStatusIndicator;
    title: string;
    description: string;
    children?: React.ReactNode;
  }) => {
    const active = playerStatusIndicator === value;
    const PreviewStatus = value === "bar" ? PreviewBarStatus : PreviewSquareStatus;

    return (
      <UnstyledButton
        onClick={() => handlePlayerStatusIndicator(value)}
        style={{
          flex: 1,
          minWidth: 0,
          padding: "1.15vh",
          borderRadius: theme.radius.xs,
          backgroundColor: active ? alpha(theme.colors.blue[4], 0.1) : theme.colors.dark[7],
          filter: active ? `drop-shadow(0 0 4px ${alpha(theme.colors.blue[4], 0.45)})` : "none",
          transition: "background-color 160ms ease, filter 160ms ease",
        }}
      >
        <Stack gap="0.8vh">
          <Flex
            align="center"
            justify="center"
            p="1vh"
            style={{
              minHeight: "8.6vh",
              borderRadius: theme.radius.xs,
              backgroundColor: theme.colors.dark[6],
              boxShadow: `0 0 10px ${theme.colors.dark[8]}`,
            }}
          >
            {children ?? (
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
            )}
          </Flex>

          <Stack gap={0}>
            <Text fz="1.4vh" fw={800} c={active ? "blue.2" : "gray.0"}>
              {title}
            </Text>
            <Text fz="1.1vh" fw={500} c="dimmed">
              {description}
            </Text>
          </Stack>
        </Stack>
      </UnstyledButton>
    );
  };

  const PlayerSettings = () => (
    <Stack gap="1vh">
      <SettingRow title="Show HUD" description="Choose whether to show or hide the HUD">
        <Select
          value={hudDisabled ? "enabled" : "disabled"}
          onChange={handleHudToggle}
          data={[
            { value: "enabled", label: "Enabled" },
            { value: "disabled", label: "Disabled" },
          ]}
          w={210}
          allowDeselect={false}
          styles={selectStyles}
        />
      </SettingRow>

      <Tabs
        value={playerSettingsTab}
        onChange={setPlayerSettingsTab}
        keepMounted={false}
        color="blue"
        variant="pills"
      >
        <Tabs.List
          grow
          p="0.4vh"
          style={{
            borderRadius: theme.radius.xs,
            backgroundColor: theme.colors.dark[7],
            boxShadow: `0 0 10px ${theme.colors.dark[7]}`,
          }}
        >
          <Tabs.Tab value="style" fw={800}>
            Style
          </Tabs.Tab>
          <Tabs.Tab value="position" fw={800}>
            Position
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="style" pt="1vh">
          <Stack gap="0.7vh">
            <Box>
              <Text fz="1.45vh" fw={800} c="gray.1">
                Status Design
              </Text>
              <Text fz="1.1vh" fw={500} c="dimmed">
                Customize your status indicator design
              </Text>
            </Box>

            <SimpleGrid cols={3}>
              <HudPreviewCard
                value="square"
                title="Square"
                description="Classic square status indicators"
              />
              <HudPreviewCard
                value="bar"
                title="Minimalist"
                description="Minimalist bar status indicators"
              />
              <HudPreviewCard
                value="circle"
                title="Circle"
                description="Circle status indicators"
              >
                <PreviewCircleHud />
              </HudPreviewCard>
            </SimpleGrid>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="position" pt="1vh">
          <Stack gap="1vh">
            <SettingRow
              title="Player HUD"
              description="Choose where player status indicators should be displayed"
            >
              <Select
                value={playerHudPosition}
                onChange={(value) => {
                  if (value) {
                    handlePlayerHudPosition(value as PlayerHudPosition);
                  }
                }}
                data={[
                  { value: "bottom-left", label: "Bottom left" },
                  { value: "top-left", label: "Top left" },
                  { value: "top-right", label: "Top right" },
                  { value: "bottom-center", label: "Bottom center" },
                ]}
                w={210}
                allowDeselect={false}
                styles={selectStyles}
              />
            </SettingRow>

            <SettingRow
              title="Compass"
              description="Choose where the compass should be displayed"
            >
              <Select
                value={compassPosition}
                onChange={(value) => {
                  if (value) {
                    handleCompassPosition(value as CompassPosition);
                  }
                }}
                data={[
                  { value: "top-center", label: "Top center" },
                  { value: "bottom-center", label: "Bottom center" },
                ]}
                w={210}
                allowDeselect={false}
                styles={selectStyles}
              />
            </SettingRow>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );

  const vehiclePreviewStatuses = [
    { value: 100, color: "green", icon: PiSeatbeltFill },
    { value: 78, color: "green", icon: FaOilCan },
    { value: 64, color: "yellow", icon: FaGasPump },
    { value: 42, color: "violet", icon: FaFireFlameCurved },
  ];

  const PreviewVehicleStatuses = () => (
    <Flex align="center" justify="center" gap="0.55vh">
      {vehiclePreviewStatuses.map((status, index) => (
        <PreviewSquareStatus
          key={index}
          value={status.value}
          color={status.color}
          Icon={status.icon}
        />
      ))}
    </Flex>
  );

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
                textShadow: index < 1 ? `0 0 8px ${theme.colors.gray[4]}` : `0 0 8px ${theme.colors.blue[4]}`,
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
          const color = index >= 15 ? theme.colors.blue[4] : theme.colors.gray[2];

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
    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
      const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

      return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
      };
    };

    const createArc = (x: number, y: number, radius: number, startAngle: number, finishAngle: number) => {
      const start = polarToCartesian(x, y, radius, startAngle);
      const end = polarToCartesian(x, y, radius, finishAngle);
      const largeArcFlag = finishAngle - startAngle <= 180 ? "0" : "1";

      return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y].join(" ");
    };

    const createGearLine = (centerX: number, centerY: number, innerRadius: number, outerRadius: number, angle: number) => {
      const inner = polarToCartesian(centerX, centerY, innerRadius, angle);
      const outer = polarToCartesian(centerX, centerY, outerRadius, angle);

      return `M ${inner.x} ${inner.y} L ${outer.x} ${outer.y}`;
    };

    return (
      <Stack gap="0.15vh" align="center" w="100%">
        <Box
          style={{
            position: "relative",
            width: "14vh",
            height: "12.5vh",
          }}
        >
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
            style={{
              position: "absolute",
              inset: 0,
            }}
          >
            <Text
              fz="1.5vh"
              fw={700}
              c="white"
              lh={0.9}
            >
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

  const VehicleHudPreviewCard = ({
    value,
    title,
    description,
    children,
  }: {
    value: VehicleHudStyle;
    title: string;
    description: string;
    children: React.ReactNode;
  }) => {
    const active = vehicleHudStyle === value;

    return (
      <UnstyledButton
        onClick={() => handleVehicleHudStyle(value)}
        style={{
          flex: 1,
          minWidth: 0,
          padding: "1.15vh",
          borderRadius: theme.radius.xs,
          backgroundColor: active ? alpha(theme.colors.blue[4], 0.1) : theme.colors.dark[7],
          filter: active ? `drop-shadow(0 0 4px ${alpha(theme.colors.blue[4], 0.45)})` : "none",
          transition: "background-color 160ms ease, filter 160ms ease",
        }}
      >
        <Stack gap="0.8vh">
          <Flex
            align="center"
            justify="center"
            p="1vh"
            style={{
              minHeight: "13.4vh",
              borderRadius: theme.radius.xs,
              backgroundColor: theme.colors.dark[6],
              boxShadow: `0 0 10px ${theme.colors.dark[8]}`,
            }}
          >
            {children}
          </Flex>

          <Stack gap={0}>
            <Text fz="1.4vh" fw={800} c={active ? "blue.2" : "gray.0"}>
              {title}
            </Text>
            <Text fz="1.1vh" fw={500} c="dimmed">
              {description}
            </Text>
          </Stack>
        </Stack>
      </UnstyledButton>
    );
  };

  const VehicleSettings = () => (
    <Stack gap="0.7vh">
      <Box>
        <Text fz="1.45vh" fw={800} c="gray.1">
          Vehicle HUD
        </Text>
        <Text fz="1.1vh" fw={500} c="dimmed">
          Customize your vehicle HUD
        </Text>
      </Box>

      <Flex gap="1vh">
        <VehicleHudPreviewCard
          value="bars"
          title="Minimalist"
          description="Perfect for minimalist HUD designs"
        >
          <PreviewVehicleBars />
        </VehicleHudPreviewCard>

        <VehicleHudPreviewCard
          value="speedometer-column"
          title="Speedometer"
          description="Speedometer HUD"
        >
          <PreviewSpeedometerColumn />
        </VehicleHudPreviewCard>
      </Flex>
    </Stack>
  );

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

  const CompassPreviewCard = ({
    value,
    title,
    description,
    children,
  }: {
    value: CompassHudStyle;
    title: string;
    description: string;
    children: React.ReactNode;
  }) => {
    const active = compassStyle === value;

    return (
      <UnstyledButton
        onClick={() => handleCompassStyle(value)}
        style={{
          flex: 1,
          minWidth: 0,
          padding: "1.15vh",
          borderRadius: theme.radius.xs,
          backgroundColor: active ? alpha(theme.colors.blue[4], 0.1) : theme.colors.dark[7],
          filter: active ? `drop-shadow(0 0 4px ${alpha(theme.colors.blue[4], 0.45)})` : "none",
          transition: "background-color 160ms ease, filter 160ms ease",
        }}
      >
        <Stack gap="0.8vh">
          <Flex
            align="center"
            justify="center"
            p="1vh"
            style={{
              minHeight: "8.6vh",
              borderRadius: theme.radius.xs,
              backgroundColor: theme.colors.dark[6],
              boxShadow: `0 0 10px ${theme.colors.dark[8]}`,
            }}
          >
            {children}
          </Flex>

          <Stack gap={0}>
            <Text fz="1.4vh" fw={800} c={active ? "blue.2" : "gray.0"}>
              {title}
            </Text>
            <Text fz="1.1vh" fw={500} c="dimmed">
              {description}
            </Text>
          </Stack>
        </Stack>
      </UnstyledButton>
    );
  };

  const CompassSettings = () => (
    <Stack gap="0.7vh">
      <Box>
        <Text fz="1.45vh" fw={800} c="gray.1">
          Compass Settings
        </Text>
        <Text fz="1.1vh" fw={500} c="dimmed">
          Customize your compass HUD
        </Text>
      </Box>

      <Flex gap="1vh">
        <CompassPreviewCard
          value="default"
          title="Standard"
          description="Standard compass HUD"
        >
          <PreviewCompassDefault />
        </CompassPreviewCard>

        <CompassPreviewCard
          value="compact"
          title="Compact"
          description="Compact compass HUD"
        >
          <PreviewCompassCompact />
        </CompassPreviewCard>
      </Flex>
    </Stack>
  );

  const CinematicSettings = () => (
    <Stack gap={12}>
      <SettingRow title="Cinematic Mode" description="Toggle cinematic bars for a cinematic experience">
        <Select
          value={cinematicBarsHeight.toString()}
          onChange={handleBarsToggle}
          data={[
            { value: "0", label: "Enabled" },
            { value: "10", label: "Disabled" },
          ]}
          w={210}
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
    return <CinematicSettings />;
  };

  return (
    <>
      {showCinematicBars && (
        <Box
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 80,
          }}
        >
          <Box
            style={{
              height: `${smoothHeight}%`,
              width: "100%",
              backgroundColor: "#000000",
              position: "absolute",
              top: 0,
            }}
          />
          <Box
            style={{
              height: `${smoothHeight}%`,
              width: "100%",
              backgroundColor: "#000000",
              position: "absolute",
              bottom: 0,
            }}
          />
        </Box>
      )}

      <Transition mounted={opened} transition="slide-up" duration={250} timingFunction="ease">
        {(transitionStyles) => (
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
              style={{
                width: '58vw',
                height: '58vh',
                borderRadius: theme.radius.sm,
                pointerEvents: "auto",
                ...transitionStyles,
              }}
            >
              <Flex
                align="center"
                justify="space-between"
                p={'0.8vh'}
                style={{
                  backgroundColor: theme.colors.dark[7],
                  boxShadow: `0 8px 18px ${alpha(theme.colors.dark[9], 0.2)}`,
                }}
              >
                <Group gap={12}>
                  <HeaderIcon />

                  <Stack gap={'0.1vh'}>
                    <Text fz={'2.2vh'} fw={900} c="gray.0" lh={1.1}>
                      HUD
                    </Text>
                    <Text fz={'1.75vh'} fw={700} c="dimmed" lh={1.1}>
                      SETTINGS
                    </Text>
                  </Stack>
                </Group>
              </Flex>

              <Flex
                gap={'1.2vh'}
                p={'1.2vh'}
                h="calc(100% - 6.8vh)"
                style={{
                  backgroundColor: theme.colors.dark[8],
                }}
              >
                <Stack
                  gap={'1vh'}
                  style={{
                    width: '12vw',
                    flexShrink: 0,
                  }}
                >
                  {navItems.map((item) => (
                    <NavButton key={item.value} item={item} />
                  ))}
                </Stack>

                <Box
                  style={{
                    flex: 1,
                    minHeight: '36vh',
                    borderRadius: theme.radius.xs,
                    backgroundColor: theme.colors.dark[8],
                  }}
                >
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
