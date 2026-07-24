import { BackgroundImage, MantineProvider, Stack } from '@mantine/core';
import React from "react";
import theme from '../theme';
import { isEnvBrowser } from '../utils/misc';
import "./App.css";
import VehicleHud from './Vehicle/main';
import { MinimapBorder } from './Minimap/main';
import SettingsModal from './Settings/main';
import { Compass } from './Vehicle/compass';
import { WeaponHud } from './Weapon/main';
import CombinedHud from './Vehicle/main';

const App: React.FC = () => {
  return (
    <MantineProvider theme={theme} defaultColorScheme='dark'>
      <Wrapper>
        <SettingsModal />
        <WeaponHud/>
        <CombinedHud />
        <Compass/>
      </Wrapper>
    </MantineProvider>
  );
};

export default App;

function Wrapper({ children }: { children: React.ReactNode }) {
  return isEnvBrowser() ? (
    <BackgroundImage w='100vw' h='100vh' style={{ overflow:'hidden', zIndex: -999 }}
      src="https://i.imgur.com/kiK65kg.jpeg"
    >
      {children}
    </BackgroundImage>
  ) : (
    <>{children}</>
  )
}
