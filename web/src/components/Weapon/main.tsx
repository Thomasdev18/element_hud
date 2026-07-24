import { Progress, Group, Text, Box, useMantineTheme, ThemeIcon, Transition, Flex, Stack } from '@mantine/core';
import { FaGun } from "react-icons/fa6";
import { useAmmoStore } from '../../stores/weapon';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import { AmmoState } from '../../typings/weapon';
import { useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

export function WeaponHud() {
  const theme = useMantineTheme();
  const { open, currentAmmo, totalAmmo } = useAmmoStore();
  const [displayAmmo, setDisplayAmmo] = useState(0);
  const [displayTotalAmmo, setDisplayTotalAmmo] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  const { ammo } = useSpring({
    ammo: displayAmmo,
    from: { ammo: 0 },
    config: { 
      mass: 1,
      tension: 170,
      friction: 26,
      clamp: true
    },
  });

  const { total } = useSpring({
    total: displayTotalAmmo,
    from: { total: 0 },
    config: { 
      mass: 1,
      tension: 170,
      friction: 26,
      clamp: true
    },
  });

  useNuiEvent<Partial<AmmoState>>('UPDATE_WEAPON', (data) => {
    useAmmoStore.setState(data);
  });

  useEffect(() => {
    if (open) {
      if (!hasAnimated) {
        setDisplayAmmo(currentAmmo);
        setDisplayTotalAmmo(totalAmmo);
        setHasAnimated(true);
      } else {
        setDisplayAmmo(currentAmmo);
        setDisplayTotalAmmo(totalAmmo);
      }
    } else {
      setHasAnimated(false);
      setDisplayAmmo(0);
      setDisplayTotalAmmo(0);
    }
  }, [open, currentAmmo, totalAmmo]);

  const progressValue = useSpring({
    value: displayAmmo,
    from: { value: 0 },
    config: { 
      mass: 1,
      tension: 170,
      friction: 26,
    },
  });

  return (
    <Transition mounted={open} transition="slide-right" duration={300} timingFunction="ease">
      {(transStyles) => (
        <Flex
          pos="fixed"
          display="flex"
          justify="flex-end"
          align="flex-start"
          w="100vw"
          h="100vh"
          style={{
            pointerEvents: 'none',
            top: 30,
            right: 30,
          }}
        >
          <Box
            p="0.26vh"
            style={{
              ...transStyles,
              borderRadius: theme.radius.sm,
            }}
          >
            <Stack gap="2px">
              <Group>
                <Text size="1.5vh" fw={700}>
                  <animated.span style={{
                    color: theme.colors.blue[4],
                    textShadow: `0 0 10px ${theme.colors.blue[4]}`,
                  }}>
                    {ammo.to((val) => Math.round(val))}
                  </animated.span>
                  {' / '}
                  <animated.span style={{
                    color: theme.colors.gray[4],
                    textShadow: `0 0 10px ${theme.colors.gray[8]}`,
                  }}>
                    {total.to((val) => Math.round(val))}
                  </animated.span>
                </Text>
              </Group>
            </Stack>
          </Box>
        </Flex>
      )}
    </Transition>
  );
}