import React from 'react';
declare const StudioRoot: React.FC<{
    children?: React.ReactNode;
}>;
export declare const studioBus: {
    emit: (_evt?: unknown) => void;
    on: (_listener?: unknown) => () => void;
};
export declare function setTheme(_theme: 'light' | 'dark'): void;
export declare function setViewport(_vp: 'desktop' | 'mobile'): void;
export declare const StudioShell: React.FC<{
    children?: React.ReactNode;
}>;
export default StudioRoot;
