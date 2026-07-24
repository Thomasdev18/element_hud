export type StatsStore = {
  open: boolean;
  health: number;
  armor: number;
  hunger: number;
  thirst: number;
  stress: number;
  stamina: number;
  talking: any;
  voice: number;
};

export type CompassStore = {
  open: boolean;
  currentStreet: string;
  nextStreet: string;
  direction: string;
  zone: string;
  heading: number;
};

export type SpeedUnit = "KMT" | "MPH";

export type VehicleStore = {
  open: boolean;
  isHelicopter: boolean;
  speed: number;
  altitude: number;
  pitch: number;
  roll: number;
  rpm: number;
  speedUnit: SpeedUnit;
  gears: number;
  nos: number;
  currentGear: string;
  fuel: number;
  engineHealth: number;
  seatbelt: boolean;
  harness: boolean;
  distance: number;
};

export interface MinimapStore {
  visibility: boolean;
  loaded: boolean;
  top: number;
  left: number;
  width: number;
  height: number;
  setMinimapData: (data: Omit<MinimapStore, 'loaded' | 'setMinimapData'>) => void;
}
