.inf-summary {
  margin: 0 1rem 1rem;
  padding: 1rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--line);
  background: rgba(15, 23, 42, 0.68);
  box-shadow: var(--shadow);
}

.inf-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.8rem;
}

.inf-summary-card {
  padding: 0.95rem 1rem;
  border-radius: 20px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.03);
}

.inf-summary-card strong {
  display: block;
  font-size: 1.4rem;
  margin-bottom: 0.2rem;
}

.inf-summary-card span {
  color: var(--muted);
  font-size: 0.9rem;
}

.inf-categories {
  display: grid;
  gap: 1rem;
}

.inf-category {
  display: grid;
  gap: 0.8rem;
  padding: 0.95rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.03);
}

.inf-category-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.inf-category-head h2 {
  margin: 0;
  font-size: 1.1rem;
}

.inf-category-head span {
  color: var(--muted);
  font-size: 0.9rem;
}

.inf-category-desc {
  margin: 0;
  color: var(--muted);
  line-height: 1.5;
}
