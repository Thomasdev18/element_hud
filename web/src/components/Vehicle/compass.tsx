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
  type CompassHudStyle,
  type CompassPosition,
  type PlayerHudPosition,
  type PlayerStatusIndicator,
} from "../../stores/settings";
import { CompassStore } from "../../typings/stats";

const compassDirections = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

function getCompactDirection(direction?: string) {
  const normalizedDirection = (direction || "N").toUpperCase();
  const index = compassDirections.indexOf(normalizedDirection);

  if (index === -1) {
    return {
      previous: "NW",
      current: normalizedDirection,
      next: "NE",
    };
  }

  return {
    previous:
      compassDirections[
        (index - 1 + compassDirections.length) % compassDirections.length
      ],
    current: compassDirections[index],
    next: compassDirections[(index + 1) % compassDirections.length],
  };
}

function getBottomPlayerHudClearance(indicator: PlayerStatusIndicator) {
  if (indicator === "segmented" || indicator === "segmented-bar") {
    return "10.5vh";
  }

  if (indicator === "bar") {
    return "7.5vh";
  }

  return "6.5vh";
}

export const Compass = () => {
  const theme = useMantineTheme();
  const { open, currentStreet, nextStreet, direction, zone } = compassStore();

  const compassStyle = settingsStore(
    (state) => state.compassStyle ?? "default",
  ) as CompassHudStyle;
  const compassPosition = settingsStore(
    (state) => state.compassPosition ?? "top-center",
  ) as CompassPosition;
  const playerHudPosition = settingsStore(
    (state) => state.playerHudPosition ?? "bottom-left",
  ) as PlayerHudPosition;
  const playerStatusIndicator = settingsStore(
    (state) => state.playerStatusIndicator,
  );

  useNuiEvent<Partial<CompassStore>>("UPDATE_COMPASS", (data) => {
    compassStore.setState(data);
  });

  const compactDirection = useMemo(
    () => getCompactDirection(direction),
    [direction],
  );

  const isCompact = compassStyle === "compact";
  const isBottomCenter = compassPosition === "bottom-center";
  const sharesBottomCenterWithPlayer =
    isBottomCenter && playerHudPosition === "bottom-center";

  const bottomOffset = sharesBottomCenterWithPlayer
    ? getBottomPlayerHudClearance(playerStatusIndicator)
    : "1.7vh";

  return (
    <Transition
      mounted={open}
      transition={isBottomCenter ? "slide-up" : "slide-down"}
      duration={300}
      timingFunction="ease"
    >
      {(transStyles) => (
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
            ...transStyles,
          }}
        >
          {isCompact ? (
            <Flex
              align="center"
              justify="center"
              gap="1.6vh"
              style={{
                minWidth: "46vh",
              }}
            >
              <Text
                size="1.35vh"
                fw={900}
                ta="left"
                style={{
                  lineHeight: 1,
                  color: "rgba(255,255,255,0.95)",
                  textShadow: "0 0 8px rgba(0,0,0,0.55)",
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
                  borderRadius: theme.radius.xs,
                  border: `0.2vh solid ${alpha(theme.colors.dark[8], 1)}`,
                  backgroundColor: alpha(theme.colors.dark[8], 1),
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
                style={{
                  lineHeight: 1,
                  color: "rgba(255,255,255,0.95)",
                  textShadow: "0 0 8px rgba(0,0,0,0.55)",
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
                  color: "rgba(255,255,255,0.65)",
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
                  color: "rgba(255,255,255,0.95)",
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
                  color: "rgba(255,255,255,0.75)",
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