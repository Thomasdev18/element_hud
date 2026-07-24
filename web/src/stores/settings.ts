import { create } from "zustand";

export const MANTINE_HUD_COLORS = [
  "gray",
  "red",
  "pink",
  "grape",
  "violet",
  "indigo",
  "blue",
  "cyan",
  "teal",
  "green",
  "lime",
  "yellow",
  "orange",
] as const;

export type MantineHudColor = (typeof MANTINE_HUD_COLORS)[number];

export type HudIndicatorVisibility = "always" | "dynamic" | "hidden";

export type PlayerHudLayout = "icons" | "minimal" | "circular";
export type PlayerHudPosition =
  | "bottom-left"
  | "top-left"
  | "top-right"
  | "bottom-center";

export type VehicleHudLayout = "digital" | "dial";
export type VehicleIndicatorLayout = "icons" | "minimal" | "circular";

export type CompassHudLayout = "full" | "compact";
export type CompassPosition = "top-center" | "bottom-center";

export type StandardPlayerIndicatorId =
  | "health"
  | "armor"
  | "hunger"
  | "thirst"
  | "stamina"
  | "stress";

export type VoiceColorState = "inactive" | "voice" | "radio";
export type PlayerIndicatorId = StandardPlayerIndicatorId | "voice";

export type VehicleIndicatorId =
  | "gear"
  | "seatbelt"
  | "engine"
  | "fuel"
  | "nitrous";

export type VehicleStateColorIndicatorId =
  | "seatbelt"
  | "engine"
  | "fuel";

export type SeatbeltColorState = "fastened" | "unfastened";
export type VehicleLevelColorState = "high" | "medium" | "low";
export type VehicleIndicatorColorState =
  | SeatbeltColorState
  | VehicleLevelColorState;

export interface IndicatorSetting {
  visibility: HudIndicatorVisibility;
  color: MantineHudColor;
}

export interface VoiceIndicatorSetting {
  visibility: HudIndicatorVisibility;
  colors: Record<VoiceColorState, MantineHudColor>;
}

export interface SeatbeltIndicatorSetting {
  visibility: HudIndicatorVisibility;
  colors: Record<SeatbeltColorState, MantineHudColor>;
}

export interface VehicleLevelIndicatorSetting {
  visibility: HudIndicatorVisibility;
  colors: Record<VehicleLevelColorState, MantineHudColor>;
}

export interface PlayerHudSettings {
  layout: PlayerHudLayout;
  position: PlayerHudPosition;
  indicators: Record<StandardPlayerIndicatorId, IndicatorSetting> & {
    voice: VoiceIndicatorSetting;
  };
}

export interface VehicleHudSettings {
  layout: VehicleHudLayout;
  indicatorLayout: VehicleIndicatorLayout;
  indicators: {
    gear: IndicatorSetting;
    seatbelt: SeatbeltIndicatorSetting;
    engine: VehicleLevelIndicatorSetting;
    fuel: VehicleLevelIndicatorSetting;
    nitrous: IndicatorSetting;
  };
}

export interface CompassHudSettings {
  layout: CompassHudLayout;
  position: CompassPosition;
}

export interface HudSettingsUpdate {
  settingsEnabled?: boolean;
  hudEnabled?: boolean;
  cinematicBarsHeight?: number;
  player?: PlayerHudSettings;
  vehicle?: VehicleHudSettings;
  compass?: CompassHudSettings;
}

type PlayerIndicatorPatch = Partial<IndicatorSetting>;
type VehicleIndicatorPatch = {
  visibility?: HudIndicatorVisibility;
  color?: MantineHudColor;
};

interface HudSettingsStore {
  settingsEnabled: boolean;
  hudEnabled: boolean;
  cinematicBarsHeight: number;
  player: PlayerHudSettings;
  vehicle: VehicleHudSettings;
  compass: CompassHudSettings;

  updateSettings: (settings: HudSettingsUpdate) => void;
  setHudEnabled: (enabled: boolean) => void;
  setCinematicBarsHeight: (height: number) => void;

  setPlayerLayout: (layout: PlayerHudLayout) => void;
  setPlayerPosition: (position: PlayerHudPosition) => void;
  setPlayerIndicator: (
    indicator: StandardPlayerIndicatorId,
    patch: PlayerIndicatorPatch,
  ) => void;
  setVoiceVisibility: (visibility: HudIndicatorVisibility) => void;
  setVoiceColor: (
    state: VoiceColorState,
    color: MantineHudColor,
  ) => void;

  setVehicleLayout: (layout: VehicleHudLayout) => void;
  setVehicleIndicatorLayout: (layout: VehicleIndicatorLayout) => void;
  setVehicleIndicator: (
    indicator: VehicleIndicatorId,
    patch: VehicleIndicatorPatch,
  ) => void;
  setVehicleIndicatorStateColor: (
    indicator: VehicleStateColorIndicatorId,
    state: VehicleIndicatorColorState,
    color: MantineHudColor,
  ) => void;

  setCompassLayout: (layout: CompassHudLayout) => void;
  setCompassPosition: (position: CompassPosition) => void;
}

const defaultPlayerSettings: PlayerHudSettings = {
  layout: "icons",
  position: "bottom-left",
  indicators: {
    health: {
      visibility: "always",
      color: "green",
    },
    armor: {
      visibility: "dynamic",
      color: "blue",
    },
    hunger: {
      visibility: "dynamic",
      color: "orange",
    },
    thirst: {
      visibility: "dynamic",
      color: "cyan",
    },
    stamina: {
      visibility: "dynamic",
      color: "yellow",
    },
    stress: {
      visibility: "dynamic",
      color: "red",
    },
    voice: {
      visibility: "always",
      colors: {
        inactive: "gray",
        voice: "green",
        radio: "blue",
      },
    },
  },
};

const defaultVehicleSettings: VehicleHudSettings = {
  layout: "digital",
  indicatorLayout: "icons",
  indicators: {
    gear: {
      visibility: "always",
      color: "blue",
    },
    seatbelt: {
      visibility: "dynamic",
      colors: {
        fastened: "green",
        unfastened: "red",
      },
    },
    engine: {
      visibility: "dynamic",
      colors: {
        high: "green",
        medium: "orange",
        low: "red",
      },
    },
    fuel: {
      visibility: "dynamic",
      colors: {
        high: "green",
        medium: "orange",
        low: "red",
      },
    },
    nitrous: {
      visibility: "dynamic",
      color: "violet",
    },
  },
};

const defaultCompassSettings: CompassHudSettings = {
  layout: "full",
  position: "top-center",
};

const clonePlayerSettings = (
  settings: PlayerHudSettings,
): PlayerHudSettings => ({
  ...settings,
  indicators: {
    ...settings.indicators,
    health: { ...settings.indicators.health },
    armor: { ...settings.indicators.armor },
    hunger: { ...settings.indicators.hunger },
    thirst: { ...settings.indicators.thirst },
    stamina: { ...settings.indicators.stamina },
    stress: { ...settings.indicators.stress },
    voice: {
      ...settings.indicators.voice,
      colors: { ...settings.indicators.voice.colors },
    },
  },
});

const cloneVehicleSettings = (
  settings: VehicleHudSettings,
): VehicleHudSettings => ({
  ...settings,
  indicators: {
    gear: { ...settings.indicators.gear },
    seatbelt: {
      ...settings.indicators.seatbelt,
      colors: { ...settings.indicators.seatbelt.colors },
    },
    engine: {
      ...settings.indicators.engine,
      colors: { ...settings.indicators.engine.colors },
    },
    fuel: {
      ...settings.indicators.fuel,
      colors: { ...settings.indicators.fuel.colors },
    },
    nitrous: { ...settings.indicators.nitrous },
  },
});

const initialState = {
  settingsEnabled: true,
  hudEnabled: true,
  cinematicBarsHeight: 0,
  player: clonePlayerSettings(defaultPlayerSettings),
  vehicle: cloneVehicleSettings(defaultVehicleSettings),
  compass: { ...defaultCompassSettings },
};

export const settingsStore = create<HudSettingsStore>((set) => ({
  ...initialState,

  updateSettings: (settings) =>
    set((current) => ({
      settingsEnabled:
        settings.settingsEnabled ?? current.settingsEnabled,
      hudEnabled: settings.hudEnabled ?? current.hudEnabled,
      cinematicBarsHeight:
        settings.cinematicBarsHeight ?? current.cinematicBarsHeight,
      player: settings.player
        ? clonePlayerSettings(settings.player)
        : current.player,
      vehicle: settings.vehicle
        ? cloneVehicleSettings(settings.vehicle)
        : current.vehicle,
      compass: settings.compass
        ? { ...settings.compass }
        : current.compass,
    })),

  setHudEnabled: (hudEnabled) => set({ hudEnabled }),

  setCinematicBarsHeight: (cinematicBarsHeight) =>
    set({ cinematicBarsHeight }),

  setPlayerLayout: (layout) =>
    set((current) => ({
      player: {
        ...current.player,
        layout,
      },
    })),

  setPlayerPosition: (position) =>
    set((current) => ({
      player: {
        ...current.player,
        position,
      },
    })),

  setPlayerIndicator: (indicator, patch) =>
    set((current) => ({
      player: {
        ...current.player,
        indicators: {
          ...current.player.indicators,
          [indicator]: {
            ...current.player.indicators[indicator],
            ...patch,
          },
        },
      },
    })),

  setVoiceVisibility: (visibility) =>
    set((current) => ({
      player: {
        ...current.player,
        indicators: {
          ...current.player.indicators,
          voice: {
            ...current.player.indicators.voice,
            visibility,
          },
        },
      },
    })),

  setVoiceColor: (voiceState, color) =>
    set((current) => ({
      player: {
        ...current.player,
        indicators: {
          ...current.player.indicators,
          voice: {
            ...current.player.indicators.voice,
            colors: {
              ...current.player.indicators.voice.colors,
              [voiceState]: color,
            },
          },
        },
      },
    })),

  setVehicleLayout: (layout) =>
    set((current) => ({
      vehicle: {
        ...current.vehicle,
        layout,
      },
    })),

  setVehicleIndicatorLayout: (indicatorLayout) =>
    set((current) => ({
      vehicle: {
        ...current.vehicle,
        indicatorLayout,
      },
    })),

  setVehicleIndicator: (indicator, patch) =>
    set((current) => ({
      vehicle: {
        ...current.vehicle,
        indicators: {
          ...current.vehicle.indicators,
          [indicator]: {
            ...current.vehicle.indicators[indicator],
            ...patch,
          },
        },
      },
    })),

  setVehicleIndicatorStateColor: (
    indicator,
    indicatorState,
    color,
  ) =>
    set((current) => {
      const setting = current.vehicle.indicators[indicator];

      return {
        vehicle: {
          ...current.vehicle,
          indicators: {
            ...current.vehicle.indicators,
            [indicator]: {
              ...setting,
              colors: {
                ...setting.colors,
                [indicatorState]: color,
              },
            },
          },
        },
      };
    }),

  setCompassLayout: (layout) =>
    set((current) => ({
      compass: {
        ...current.compass,
        layout,
      },
    })),

  setCompassPosition: (position) =>
    set((current) => ({
      compass: {
        ...current.compass,
        position,
      },
    })),
}));

// Compatibility aliases for components that still use the earlier names.
export type PlayerStatusIndicator = PlayerHudLayout;
export type CompassHudStyle = CompassHudLayout;
export type VehicleHudStyle = VehicleHudLayout;
