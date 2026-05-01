"use client";

import { Client, type IMessage } from "@stomp/stompjs";
import { env } from "@/config/env";
import type { InventoryRow } from "@/features/ton-kho/api";

export type InventoryEventType = "UPDATED" | "THRESHOLD";

export type InventoryEvent = {
  type: InventoryEventType;
  sanPhamId: number;
  row: InventoryRow;
};

type Listener = (event: InventoryEvent) => void;

let client: Client | null = null;
const listeners = new Set<Listener>();

function wsUrl(): string {
  const url = new URL(env.apiBaseUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = (url.pathname.replace(/\/+$/, "") || "") + "/ws";
  return url.toString();
}

function ensureClient(): Client {
  if (client) return client;
  client = new Client({
    brokerURL: wsUrl(),
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  });
  client.onConnect = () => {
    client?.subscribe("/topic/inventory", (msg: IMessage) => {
      try {
        const event = JSON.parse(msg.body) as InventoryEvent;
        listeners.forEach((l) => l(event));
      } catch {
      }
    });
  };
  client.activate();
  return client;
}

export function subscribeInventory(listener: Listener): () => void {
  ensureClient();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      client?.deactivate();
      client = null;
    }
  };
}
