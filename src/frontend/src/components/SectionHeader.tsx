interface Props {
  number: string;
  title: string;
  lede?: string;
}

export function SectionHeader({ number, title, lede }: Props) {
  return (
    <div className="section-header">
      <span className="section-number">{number}</span>
      <div>
        <h2>{title}</h2>
        {lede && <p className="section-lede">{lede}</p>}
      </div>
    </div>
  );
}
