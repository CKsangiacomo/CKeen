import StudioRoot from "../components/StudioRoot";

export const StudioShell = StudioRoot;   // named export (concrete symbol)
export default StudioRoot;               // default export

export { studioBus } from "../events/bus";

// Safe type re-exports (no )
import type { StudioEvent, StudioEventListener } from "../events/types";
export type { StudioEvent, StudioEventListener };

// V0 stubs
export function setTheme(_: "light" | "dark") {}
export function setViewport(_: "desktop" | "mobile") {}
