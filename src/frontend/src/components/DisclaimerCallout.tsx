import { Info } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export function DisclaimerCallout({ children }: Props) {
  return (
    <div className="disclaimer-callout" role="note">
      <Info size={16} strokeWidth={2} />
      <div>{children}</div>
    </div>
  );
}
