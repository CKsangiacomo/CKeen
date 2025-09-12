import StudioShellComponent from ../components/StudioRoot;
export const StudioShell = StudioShellComponent;     // named export (stable symbol)
export default StudioShellComponent;                 // default export (for flexibility)

export { studioBus } from ../events/bus;
export type { StudioEvent, StudioEventListener } from ../events/types;

// V0 stubs; real wiring added in later phases
export function setTheme(_: light | dark) {}
export function setViewport(_: desktop | mobile) {}
