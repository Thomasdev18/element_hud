import {
  Box,
  Flex,
  Text,
  Transition,
  alpha,
  useMantineTheme,
} from "@mantine/core";
import { useMemo } from "react";
import { useNuiEvent } from "../../hooks/useNuiEvent";
import { compassStore } from "../../stores/stats";
import {
  settingsStore,
  type CompassHudLayout,
  type PlayerHudLayout,
} from "../../stores/settings";
import type { CompassStore } from "../../typings/stats";

const COMPASS_DIRECTIONS = [
  "N",
  "NE",
  "E",
  "SE",
  "S",
  "SW",
  "W",
  "NW",
] as const;

type CompassDirection = (typeof COMPASS_DIRECTIONS)[number];

const BOTTOM_PLAYER_HUD_CLEARANCE: Record<PlayerHudLayout, string> = {
  icons: "6.5vh",
  minimal: "7.5vh",
  circular: "6.8vh",
};

function getCompactDirection(direction?: string) {
  const normalizedDirection = (direction || "N").toUpperCase();
  const index = COMPASS_DIRECTIONS.indexOf(
    normalizedDirection as CompassDirection,
  );

  if (index === -1) {
    return {
      previous: "NW",
      current: normalizedDirection,
      next: "NE",
    };
  }

  return {
    previous:
      COMPASS_DIRECTIONS[
        (index - 1 + COMPASS_DIRECTIONS.length) %
          COMPASS_DIRECTIONS.length
      ],
    current: COMPASS_DIRECTIONS[index],
    next: COMPASS_DIRECTIONS[(index + 1) % COMPASS_DIRECTIONS.length],
  };
}

function getBottomPlayerHudClearance(layout: PlayerHudLayout) {
  return BOTTOM_PLAYER_HUD_CLEARANCE[layout];
}

export const Compass = () => {
  const theme = useMantineTheme();
  const { open, currentStreet, nextStreet, direction, zone } = compassStore();

  const compassLayout = settingsStore(
    (state) => state.compass.layout,
  ) as CompassHudLayout;

  const compassPosition = settingsStore(
    (state) => state.compass.position,
  );

  const playerLayout = settingsStore(
    (state) => state.player.layout,
  ) as PlayerHudLayout;

  const playerPosition = settingsStore(
    (state) => state.player.position,
  );

  useNuiEvent<Partial<CompassStore>>("UPDATE_COMPASS", (data) => {
    compassStore.setState(data);
  });

  const compactDirection = useMemo(
    () => getCompactDirection(direction),
    [direction],
  );

  const isCompact = compassLayout === "compact";
  const isBottomCenter = compassPosition === "bottom-center";
  const sharesBottomCenterWithPlayer =
    isBottomCenter && playerPosition === "bottom-center";

  const bottomOffset = sharesBottomCenterWithPlayer
    ? getBottomPlayerHudClearance(playerLayout)
    : "1.7vh";

  return (
    <Transition
      mounted={open}
      transition={isBottomCenter ? "slide-up" : "slide-down"}
      duration={300}
      timingFunction="ease"
    >
      {(transitionStyles) => (
        <Box
          pos="fixed"
          style={{
            top: isBottomCenter ? undefined : "1.7vh",
            bottom: isBottomCenter ? bottomOffset : undefined,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 999,
            pointerEvents: "none",
            ...transitionStyles,
          }}
        >
          {isCompact ? (
            <Flex
              align="center"
              justify="center"
              gap="1.6vh"
              style={{
                width: "46vh",
              }}
            >
              <Text
                size="1.35vh"
                fw={900}
                ta="right"
                truncate
                style={{
                  width: "14vh",
                  lineHeight: 1,
                  color: "rgba(255, 255, 255, 0.95)",
                  textShadow: "0 0 8px rgba(0, 0, 0, 0.55)",
                  textTransform: "uppercase",
                }}
              >
                {currentStreet || "N/A"}
              </Text>

              <Flex
                align="center"
                justify="center"
                gap="0.7vh"
                px="0.8vh"
                py="0.55vh"
                style={{
                  flexShrink: 0,
                  borderRadius: theme.radius.xs,
                  border: `0.2vh solid ${theme.colors.dark[8]}`,
                  backgroundColor: theme.colors.dark[8],
                  boxShadow: `0 0 10px ${theme.colors.dark[8]}`,
                }}
              >
                <Text size="0.85vh" fw={900} c="gray.5" lh={1}>
                  {compactDirection.previous}
                </Text>

                <Text
                  size="1.55vh"
                  fw={900}
                  lh={1}
                  style={{
                    color: theme.colors.gray[0],
                    textShadow: `0 0 6px ${alpha(
                      theme.colors.gray[0],
                      0.45,
                    )}`,
                  }}
                >
                  {compactDirection.current}
                </Text>

                <Text size="0.85vh" fw={900} c="gray.5" lh={1}>
                  {compactDirection.next}
                </Text>
              </Flex>

              <Text
                size="1.35vh"
                fw={900}
                ta="left"
                truncate
                style={{
                  width: "14vh",
                  lineHeight: 1,
                  color: "rgba(255, 255, 255, 0.95)",
                  textShadow: "0 0 8px rgba(0, 0, 0, 0.55)",
                  textTransform: "uppercase",
                }}
              >
                {nextStreet || ""}
              </Text>
            </Flex>
          ) : (
            <Flex
              direction="column"
              align="center"
              justify="center"
              gap="0.45vh"
              style={{
                width: "39vh",
              }}
            >
              <Text
                size="0.95vh"
                fw={700}
                ta="center"
                style={{
                  lineHeight: 1,
                  color: "rgba(255, 255, 255, 0.65)",
                  textTransform: "uppercase",
                }}
              >
                {zone || "N/A"}
              </Text>

              <Text
                size="1.8vh"
                fw={900}
                ta="center"
                style={{
                  lineHeight: 1,
                  color: theme.colors.blue[4],
                  textShadow: `0 0 8px ${theme.colors.blue[6]}`,
                  textTransform: "uppercase",
                }}
              >
                {direction || "N/A"}
              </Text>

              <Text
                size="1.5vh"
                fw={900}
                ta="center"
                truncate
                style={{
                  width: "36vh",
                  lineHeight: 1,
                  color: "rgba(255, 255, 255, 0.95)",
                  textTransform: "uppercase",
                }}
              >
                {currentStreet || "N/A"}
              </Text>

              <Text
                size="1vh"
                fw={800}
                ta="center"
                truncate
                style={{
                  width: "30vh",
                  lineHeight: 1,
                  color: "rgba(255, 255, 255, 0.75)",
                  textTransform: "uppercase",
                }}
              >
                {nextStreet || ""}
              </Text>
            </Flex>
          )}
        </Box>
      )}
    </Transition>
  );
};
