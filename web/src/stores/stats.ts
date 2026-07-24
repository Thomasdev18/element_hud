import { create } from "zustand";
import { StatsStore } from "../typings/stats";
import { CompassStore } from "../typings/stats";
import { VehicleStore } from "../typings/stats";
import { MinimapStore } from "../typings/stats";
import { isEnvBrowser } from "../utils/misc";

export const statsStore = create<StatsStore>((set) => ({
  open: isEnvBrowser() ? true : false,
  health: isEnvBrowser() ? 100 : 0,
  armor: isEnvBrowser() ? 10 : 0,
  hunger: isEnvBrowser() ? 55 : 0,
  thirst: isEnvBrowser() ? 66 : 0,
  stress: isEnvBrowser() ? 30 : 0,
  stamina: isEnvBrowser() ? 100 : 0,
  voice: isEnvBrowser() ? 3.0 : 0,
  talking: false,
}));

export const compassStore = create<CompassStore>((set) => ({
  open: isEnvBrowser() ? true : false,
  currentStreet: "San Andreas Ave",
  nextStreet: "Grove Street",
  zone: "Paleto Bay",
  direction: "NW",
  heading: 10
}));

export const vehicleStore = create<VehicleStore>((set) => ({
  open: isEnvBrowser() ? true : false,
  isHelicopter: isEnvBrowser() ? true : false,
  speed: isEnvBrowser() ? 101 : 0,
  altitude: isEnvBrowser() ? 197 : 0,
  pitch: isEnvBrowser() ? 8 : 0,
  roll: isEnvBrowser() ? 12 : 0,
  speedUnit: "KMT",
  rpm: isEnvBrowser() ? 0.2 : 0,
  gears: isEnvBrowser() ? 8 : 0,
  currentGear: 'R',
  fuel: isEnvBrowser() ? 50 : 0,
  nos: isEnvBrowser() ? 50 : 0,
  engineHealth: isEnvBrowser() ? 66 : 0,
  seatbelt: isEnvBrowser() ? true : false,
  harness: isEnvBrowser() ? true : false,
  distance: isEnvBrowser() ? 22 : 0,
}));

export const minimapStore = create<MinimapStore>((set) => ({
  visibility: isEnvBrowser(),
  loaded: false,
  top: isEnvBrowser() ? 71.14285511629922 : 0,
  left: isEnvBrowser() ? 1.00000202655792 : 0,
  width: isEnvBrowser() ? 309.4555850869263 : 0,
  height: isEnvBrowser() ? 192.85714285714287 : 0,
  setMinimapData: (data) => set({ ...data, loaded: true }),
}));
