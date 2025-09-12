export { default as StudioShell } from "../components/StudioRoot";
export { studioBus } from "../events/bus";
export type { StudioEvent, StudioEventListener } from "../events/types";

// V0 stubs; real wiring added in later phases
export function setTheme(_: "light" | "dark") {}
export function setViewport(_: "desktop" | "mobile") {}
