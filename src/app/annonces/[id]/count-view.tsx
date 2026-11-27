"use client";

import { useEffect } from "react";
import { addView } from "./actions";

/** BR-42: one view per device and per day. */
export function CountView({ id }: { id: string }) {
  useEffect(() => {
    const key = `vu:${id}`;
    const today = new Date().toDateString();
    try {
      if (localStorage.getItem(key) === today) return;
      localStorage.setItem(key, today);
    } catch {
      return; // storage blocked: better no count than one per reload
    }
    void addView({ id });
  }, [id]);
  return null;
}
