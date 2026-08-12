interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  footnote?: string;
  explainer?: React.ReactNode;
}

export function ChartCard({ title, subtitle, actions, children, footnote, explainer }: Props) {
  return (
    <section className="chart-card">
      <header className="chart-card-header">
        <div>
          <h3>{title}</h3>
          {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="chart-card-actions">{actions}</div>}
      </header>
      {explainer && (
        <details className="chart-explainer">
          <summary>What am I looking at?</summary>
          <div className="chart-explainer-body">{explainer}</div>
        </details>
      )}
      <div className="chart-card-body">{children}</div>
      {footnote && <p className="chart-card-footnote">{footnote}</p>}
    </section>
  );
}
