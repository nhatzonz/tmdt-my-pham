"use client";

import { Client, type IMessage } from "@stomp/stompjs";
import { env } from "@/config/env";
import type { Coupon } from "@/features/khuyen-mai/api";

export type CouponEventType = "CREATED" | "UPDATED" | "DELETED" | "USED" | "RESTORED";

export type CouponEvent = {
  type: CouponEventType;
  couponId: number;
  coupon?: Coupon | null;
};

type Listener = (event: CouponEvent) => void;

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
  const url = wsUrl();
  // eslint-disable-next-line no-console
  console.log("[coupon-socket] connecting to", url);
  client = new Client({
    brokerURL: url,
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  });
  client.onConnect = () => {
    // eslint-disable-next-line no-console
    console.log("[coupon-socket] connected");
    client?.subscribe("/topic/coupons", (msg: IMessage) => {
      try {
        const event = JSON.parse(msg.body) as CouponEvent;
        // eslint-disable-next-line no-console
        console.log("[coupon-socket] event", event);
        listeners.forEach((l) => l(event));
      } catch {
      }
    });
  };
  client.onStompError = (frame) => {
    // eslint-disable-next-line no-console
    console.warn("[coupon-socket] STOMP error", frame.headers, frame.body);
  };
  client.onWebSocketError = (e) => {
    // eslint-disable-next-line no-console
    console.warn("[coupon-socket] WS error", e);
  };
  client.onWebSocketClose = (e) => {
    // eslint-disable-next-line no-console
    console.log("[coupon-socket] WS closed", e?.code, e?.reason);
  };
  client.activate();
  return client;
}

export function subscribeCoupons(listener: Listener): () => void {
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
