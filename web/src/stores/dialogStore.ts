import { create } from "zustand";

export type DialogMessage = {
  id?: string | number;
  sender: "ped" | "player";
  name?: string;
  message: string;
};

export type DialogOption = {
  id: string | number;
  title: string;
  description: string;
  disabled?: boolean;
};

export type DialogPayload = {
  title?: string;
  pedName?: string;
  messages?: DialogMessage[];
  message?: string;
  options?: DialogOption[];
};

export type DialogSelectResponse = DialogPayload & {
  close?: boolean;
};

interface DialogStore {
  visible: boolean;
  title: string;
  pedName: string;
  messages: DialogMessage[];
  options: DialogOption[];

  setVisible: (visible: boolean) => void;
  openDialog: (data: DialogPayload) => void;
  updateDialog: (data: DialogPayload) => void;
  closeDialog: () => void;
  addMessage: (message: DialogMessage) => void;
  setOptions: (options: DialogOption[]) => void;
  applyResponse: (response: DialogSelectResponse | null) => void;
}

const getMessageId = () => `${Date.now()}-${Math.random()}`;

export const dialogStore = create<DialogStore>((set, get) => ({
  visible: false,
  title: "Buyer - Offer Goods",
  pedName: "Buyer",
  messages: [],
  options: [],

  setVisible: (visible) => set({ visible }),

  openDialog: (data) =>
    set({
      visible: true,
      title: data.title ?? "Dialog",
      pedName: data.pedName ?? "Unknown",
      messages: data.messages
        ? data.messages
        : data.message
          ? [
              {
                id: getMessageId(),
                sender: "ped",
                name: data.pedName ?? "Unknown",
                message: data.message,
              },
            ]
          : [],
      options: data.options ?? [],
    }),

  updateDialog: (data) =>
    set((state) => ({
      title: data.title ?? state.title,
      pedName: data.pedName ?? state.pedName,
      messages: data.messages
        ? data.messages
        : data.message
          ? [
              ...state.messages,
              {
                id: getMessageId(),
                sender: "ped",
                name: data.pedName ?? state.pedName,
                message: data.message,
              },
            ]
          : state.messages,
      options: data.options ?? state.options,
    })),

  closeDialog: () =>
    set({
      visible: false,
      messages: [],
      options: [],
    }),

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: message.id ?? getMessageId(),
        },
      ],
    })),

  setOptions: (options) => set({ options }),

  applyResponse: (response) => {
    if (!response) return;

    if (response.close) {
      get().closeDialog();
      return;
    }

    get().updateDialog(response);
  },
}));