import "server-only";
import { headers } from "next/headers";

/** Set by Netlify itself, so a visitor cannot fake it; elsewhere everyone shares one counter. */
export const clientIp = async () => (await headers()).get("x-nf-client-connection-ip") ?? "unknown";
