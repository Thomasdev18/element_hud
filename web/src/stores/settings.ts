import { create } from "zustand";

export type PlayerStatusIndicator =
  | "square"
  | "bar"
  | "circle"
  | "segmented"
  | "segmented-bar";

export type VehicleHudStyle =
  | "bars"
  | "speedometer"
  | "speedometer-column";

export type CompassHudStyle = "default" | "compact";

export type PlayerHudPosition =
  | "bottom-left"
  | "top-left"
  | "top-right"
  | "bottom-center";

export type CompassPosition = "top-center" | "bottom-center";

interface SettingsStore {
  hudDisabled: boolean;
  cinematicBarsHeight: number;
  playerStatusIndicator: PlayerStatusIndicator;
  playerHudPosition: PlayerHudPosition;
  vehicleHudStyle: VehicleHudStyle;
  compassStyle: CompassHudStyle;
  compassPosition: CompassPosition;

  setHudDisabled: (disabled: boolean) => void;
  setCinematicBarsHeight: (height: number) => void;
  setPlayerStatusIndicator: (indicator: PlayerStatusIndicator) => void;
  setPlayerHudPosition: (position: PlayerHudPosition) => void;
  setVehicleHudStyle: (style: VehicleHudStyle) => void;
  setCompassStyle: (style: CompassHudStyle) => void;
  setCompassPosition: (position: CompassPosition) => void;

  updateSettings: (settings: {
    hudDisabled?: boolean;
    cinematicBarsHeight?: number;
    playerStatusIndicator?: PlayerStatusIndicator;
    playerHudPosition?: PlayerHudPosition;
    vehicleHudStyle?: VehicleHudStyle;
    compassStyle?: CompassHudStyle;
    compassPosition?: CompassPosition;
  }) => void;
}

export const settingsStore = create<SettingsStore>((set) => ({
  hudDisabled: false,
  cinematicBarsHeight: 0,
  playerStatusIndicator: "square",
  playerHudPosition: "bottom-left",
  vehicleHudStyle: "speedometer-column",
  compassStyle: "default",
  compassPosition: "top-center",

  setHudDisabled: (disabled) => set({ hudDisabled: disabled }),
  setCinematicBarsHeight: (height) => set({ cinematicBarsHeight: height }),
  setPlayerStatusIndicator: (indicator) =>
    set({ playerStatusIndicator: indicator }),
  setPlayerHudPosition: (position) => set({ playerHudPosition: position }),
  setVehicleHudStyle: (style) => set({ vehicleHudStyle: style }),
  setCompassStyle: (style) => set({ compassStyle: style }),
  setCompassPosition: (position) => set({ compassPosition: position }),

  updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
}));