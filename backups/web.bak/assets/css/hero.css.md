.inf-hero {
  position: relative;
  margin: 0.95rem 1rem 1rem;
  min-height: 240px;
  overflow: hidden;
  border-radius: 36px;
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.18), rgba(15, 23, 42, 0.98));
}

.inf-hero-media {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 15%, rgba(34, 197, 94, 0.22), transparent 22%),
    radial-gradient(circle at 80% 30%, rgba(124, 58, 237, 0.28), transparent 32%),
    radial-gradient(circle at 72% 70%, rgba(56, 189, 248, 0.12), transparent 24%),
    linear-gradient(120deg, rgba(255, 255, 255, 0.06), transparent 35%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'%3E%3Crect width='1600' height='900' fill='%23070b12'/%3E%3Cg fill='%2394a3b8' fill-opacity='0.1'%3E%3Ccircle cx='160' cy='140' r='95'/%3E%3Ccircle cx='520' cy='220' r='180'/%3E%3Ccircle cx='1120' cy='180' r='130'/%3E%3Ccircle cx='1320' cy='620' r='240'/%3E%3Ccircle cx='760' cy='660' r='200'/%3E%3C/g%3E%3C/svg%3E") center/cover no-repeat;
  transform: scale(1.12);
  animation: drift 20s ease-in-out infinite alternate;
}

.inf-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(7, 11, 18, 0.08), rgba(7, 11, 18, 0.68) 70%, rgba(7, 11, 18, 0.9));
}

.inf-hero-copy {
  position: relative;
  z-index: 1;
  max-width: 54rem;
  padding: clamp(1.1rem, 4vw, 2.2rem);
  padding-top: clamp(2rem, 6vw, 3.2rem);
}

.inf-hero-eyebrow {
  margin: 0 0 0.8rem;
  color: var(--accent-3);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 0.78rem;
}

.inf-hero-copy h1 {
  margin: 0;
  font-size: clamp(2rem, 4.6vw, 4rem);
  line-height: 0.98;
  max-width: 18ch;
}

.inf-hero-text {
  margin: 1rem 0 0;
  color: #dbeafe;
  max-width: 42rem;
  font-size: 1rem;
  line-height: 1.55;
}

.inf-hero-marquee {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 1rem;
  padding: 0.9rem 1rem;
  overflow: hidden;
  white-space: nowrap;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(3, 7, 18, 0.55);
  backdrop-filter: blur(14px);
}

.inf-hero-marquee span {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.85rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  color: #e2e8f0;
}
