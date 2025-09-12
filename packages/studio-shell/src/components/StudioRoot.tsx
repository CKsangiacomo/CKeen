import React from react;
import { studioBus } from ../events/bus;

export default function StudioShell({ children }:{ children?: React.ReactNode }) {
  React.useEffect(() => {
    studioBus.emit({ type: studio:ready, at: Date.now() });
  }, []);
  return <div id="studio-root" className="studio sh">{children}</div>;
}
