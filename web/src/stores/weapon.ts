import { create } from "zustand";
import { AmmoState } from "../typings/weapon";
import { isEnvBrowser } from "../utils/misc"

export const useAmmoStore = create<AmmoState>((set) => ({
  open: isEnvBrowser() ? true : false,
  currentAmmo: isEnvBrowser() ? 6 : 0,
  totalAmmo: isEnvBrowser() ? 90 : 0,
}));