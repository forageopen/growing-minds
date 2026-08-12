interface Props {
  children: React.ReactNode;
}

export function AcademicNote({ children }: Props) {
  return (
    <aside className="academic-note">
      <p>{children}</p>
    </aside>
  );
}
