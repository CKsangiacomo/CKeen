import React from "react";

export type StudioShellProps = {
  children?: React.ReactNode;
};

export function StudioShell(props: StudioShellProps) {
  return <div id="centerCanvas">{props.children}</div>;
}

export default StudioShell;

/* ---- Slot helpers + attachments (keep at module scope) ---- */
function mkSlot(name: string) {
  const C: any = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
  C.displayName = `StudioShell.${name}`;
  return C;
}

const StudioShellLeft = mkSlot('Left');
const StudioShellCanvas = mkSlot('Canvas');
const StudioShellInspector = mkSlot('Inspector');

// Attach to the component so <StudioShell.Left> works
(StudioShell as any).Left = StudioShellLeft;
(StudioShell as any).Canvas = StudioShellCanvas;
(StudioShell as any).Inspector = StudioShellInspector;

// Also export in case some code prefers named imports
export { StudioShellLeft, StudioShellCanvas, StudioShellInspector };
// Note: StudioShell is already exported as a named function declaration
