import { Metadata } from 'next';
import { StudioShell } from '../builder-shell/components/StudioShell';

export const metadata: Metadata = {
  title: 'Studio · Clickeen',
};

export default function StudioPage() {
  // Future: pull real workspace + instance context
  return <StudioShell />;
}
