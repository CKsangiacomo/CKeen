import { useEffect, useMemo, useState } from "react";
import styles from "./studio.module.css";
import { SystemIcon } from "@/dieter/components/SystemIcon";
import type { IconName } from "@/dieter/tokens/icon.types";

type Theme = "light" | "dark";
type ViewportMode = "desktop" | "mobile";

export default function StudioPage() {
  const [theme, setTheme] = useState<Theme>("light");
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
  }, [theme]);

  const gridDataAttrs = useMemo(() => ({
    "data-left": leftOpen ? "open" : "closed",
    "data-right": rightOpen ? "open" : "closed",
  }), [leftOpen, rightOpen]);

  return (
    <div className={styles.studioRoot}>
      <header className={styles.topbar} role="banner">
        <nav className={styles.topbarLeft}>
          <a className={styles.logo} href="/">Clickeen</a>
          <span className={styles.title}>Lorem Ipsum</span>
        </nav>
        <div className={styles.topbarRight} role="toolbar" aria-label="Studio controls"></div>
      </header>

      <main className={styles.grid} {...gridDataAttrs} role="main">
        <aside className={`${styles.panel} ${styles.panelLeft}`} aria-label="Left Panel">
          <div className={styles.panelHeader}>
            <span className={styles.panelIcon}><SystemIcon name={"folder--bold" as IconName} size="sm" /></span>
            <span className={styles.panelTitle}>Lorem Ipsum</span>
            <div className={styles.panelActions}>
              <button className={styles.iconBtn} onClick={() => setLeftOpen(v => !v)} title="Collapse left" aria-label="Collapse left">
                <SystemIcon name={"chevron.left--bold" as IconName} size="sm" />
              </button>
            </div>
          </div>
          <div className={styles.panelBody}>Lorem Ipsum</div>
        </aside>

        <section className={`${styles.panel} ${styles.panelCenter}`} aria-label="Center Panel">
          <div className={styles.panelHeader}>
            <span className={styles.panelIcon}><SystemIcon name={"pencil--bold" as IconName} size="sm" /></span>
            <span className={styles.panelTitle}>Lorem Ipsum</span>
            <div className={styles.panelControls}>
              <div className={styles.segmented} role="tablist" aria-label="Theme" id="segTheme">
                <button
                  role="tab"
                  aria-selected={theme === "light"}
                  onClick={() => setTheme("light")}
                  title="Light"
                >
                  <SystemIcon name={"sun.max--bold" as IconName} size="sm" />
                  <span className={styles.srOnly}>Light</span>
                </button>
                <button
                  role="tab"
                  aria-selected={theme === "dark"}
                  onClick={() => setTheme("dark")}
                  title="Dark"
                >
                  <SystemIcon name={"moon--bold" as IconName} size="sm" />
                  <span className={styles.srOnly}>Dark</span>
                </button>
              </div>
              <div className={styles.segmented} role="tablist" aria-label="Viewport" id="segViewport">
                <button
                  role="tab"
                  aria-selected={viewport === "desktop"}
                  onClick={() => setViewport("desktop")}
                  title="Desktop"
                >
                  <SystemIcon name={"desktopcomputer--bold" as IconName} size="sm" />
                  <span className={styles.srOnly}>Desktop</span>
                </button>
                <button
                  role="tab"
                  aria-selected={viewport === "mobile"}
                  onClick={() => setViewport("mobile")}
                  title="Mobile"
                >
                  <SystemIcon name={"phone--bold" as IconName} size="sm" />
                  <span className={styles.srOnly}>Mobile</span>
                </button>
              </div>
            </div>
          </div>
          <div className={styles.panelBody}>
            <div id="centerPreview" className={`${styles.preview} ${viewport === 'mobile' ? styles.isMobile : ''}`}> 
              <div className={styles.previewPlaceholder}>Lorem Ipsum</div>
            </div>
          </div>
        </section>

        <aside className={`${styles.panel} ${styles.panelRight}`} aria-label="Right Panel">
          <div className={styles.panelHeader}>
            <span className={styles.panelIcon}><SystemIcon name={"wrench.adjustable--bold" as IconName} size="sm" /></span>
            <span className={styles.panelTitle}>Lorem Ipsum</span>
            <div className={styles.panelActions}>
              <button className={styles.iconBtn} title="Copy" aria-label="Copy">
                <SystemIcon name={"document.on.document--bold" as IconName} size="sm" />
              </button>
              <button className={styles.iconBtn} onClick={() => setRightOpen(v => !v)} title="Collapse right" aria-label="Collapse right">
                <SystemIcon name={"chevron.right--bold" as IconName} size="sm" />
              </button>
            </div>
          </div>
          <div className={styles.panelBody}>Lorem Ipsum</div>
        </aside>
      </main>
    </div>
  );
}


