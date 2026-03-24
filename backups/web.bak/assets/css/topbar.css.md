.inf-brandbar {
  position: fixed;
  top: 0.85rem;
  left: 0.75rem;
  z-index: 60;
}

.inf-brandbar-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.72rem 0.95rem;
  border-radius: 999px;
  border: 1px solid rgba(124, 58, 237, 0.35);
  background: rgba(7, 11, 18, 0.9);
  color: var(--text);
  box-shadow: var(--shadow);
  backdrop-filter: blur(18px);
}

.inf-logo,
.inf-brand-word {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.55rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.inf-logo {
  width: 2.55rem;
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.12);
  border: 1px solid rgba(124, 58, 237, 0.35);
  box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.08) inset;
}

.inf-quickrail {
  position: fixed;
  top: 4.15rem;
  left: 0.75rem;
  z-index: 58;
  width: calc(100vw - 1.5rem);
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(7, 11, 18, 0.78);
  box-shadow: var(--shadow);
  backdrop-filter: blur(18px);
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.inf-quickrail::-webkit-scrollbar {
  height: 0;
}

.inf-quickrail a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 0.85rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.03);
  flex: 0 0 auto;
}

.inf-quickrail.is-hidden {
  transform: translateY(-130%);
  opacity: 0;
  pointer-events: none;
}

.inf-quickrail.is-faded {
  opacity: 0.62;
}

.inf-chip {
  min-height: 2.7rem;
  padding: 0.72rem 1rem;
  border-radius: 999px;
}

.inf-chip-accent {
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.3);
}

.inf-drawer {
  position: fixed;
  top: 7.1rem;
  right: 0.8rem;
  z-index: 64;
  width: min(88vw, 340px);
  padding: 1rem;
  border-radius: var(--radius-lg);
  background: var(--panel-strong);
  box-shadow: var(--shadow);
  border: 1px solid var(--line);
  backdrop-filter: blur(20px);
}

.inf-drawer-head {
  display: grid;
  gap: 0.15rem;
  margin-bottom: 0.9rem;
}

.inf-drawer-head span {
  color: var(--muted);
  font-size: 0.88rem;
}

.inf-drawer-nav {
  display: grid;
  gap: 0.45rem;
}

.inf-drawer-nav a {
  padding: 0.82rem 0.9rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid transparent;
}

.inf-drawer-nav a:hover {
  border-color: var(--line);
  background: rgba(255, 255, 255, 0.05);
}
