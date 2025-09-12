import StudioShellComponent from "../components/StudioRoot";

// Concrete exports that survive bundler rewrites
export const StudioShell = StudioShellComponent;   // named
export default StudioShellComponent;               // default

export { studioBus } from "../events/bus";

// Re-export types safely
import type { StudioEvent, StudioEventListener } from "../events/types";
export type { StudioEvent, StudioEventListener };

// V0 stubs; wired in later phases
export function setTheme(_: "light" | "dark") {}
export function setViewport(_: "desktop" | "mobile") {}
