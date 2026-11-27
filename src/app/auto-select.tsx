"use client";

import type { ComponentProps } from "react";

/** A select that applies the catalogue filters as soon as it changes. */
export function AutoSelect(props: ComponentProps<"select">) {
  return <select {...props} onChange={(e) => e.currentTarget.form?.requestSubmit()} />;
}
