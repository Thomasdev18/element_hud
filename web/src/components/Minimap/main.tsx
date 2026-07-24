import { useNuiEvent } from '../../hooks/useNuiEvent';
import { minimapStore } from '../../stores/stats';
import { Transition, useMantineTheme, Box } from '@mantine/core';

export const MinimapBorder = () => {
  const { visibility } = minimapStore();
  const theme = useMantineTheme();

  useNuiEvent('MINIMAP_SHOW', () => {
    minimapStore.setState({ visibility: true });
  });

  useNuiEvent('MINIMAP_HIDE', () => {
    minimapStore.setState({ visibility: false });
  });

  return (
    <Transition mounted={visibility} transition="slide-right" duration={300} timingFunction="ease">
      {(transStyles) => (
        <div
          style={{
            width: "17vw",
            height: "17.5vh",
            borderRadius: 0,
            pointerEvents: 'none',
            zIndex: 999,
            transition: 'all 0.3s ease-out',
            ...transStyles,
          }}
        />
      )}
    </Transition>
  );
};