import React from "react";

export type StudioShellProps = {
  children?: React.ReactNode;
};

export function StudioShell(props: StudioShellProps) {
  return <div id="centerCanvas">{props.children}</div>;
}

export default StudioShell;
