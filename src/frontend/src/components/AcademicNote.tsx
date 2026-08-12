interface Props {
  title: string;
  children: React.ReactNode;
}

export function AcademicNote({ title, children }: Props) {
  return (
    <aside className="academic-note">
      <h4>{title}</h4>
      <p>{children}</p>
    </aside>
  );
}
