export { default as StudioShell } from "../components/StudioRoot";   // named export
export { default } from "../components/StudioRoot";                   // default export
export { studioBus } from "../events/bus";
export type { StudioEvent, StudioEventListener } from "../events/types";

// V0 stubs
export function setTheme(_: "light" | "dark") {}
export function setViewport(_: "desktop" | "mobile") {}
