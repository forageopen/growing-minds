import { Sparkles } from "lucide-react";
import {
  BINARY_FIELDS,
  CATEGORICAL_FIELDS,
  GROUP_LABELS,
  NUMERIC_FIELDS,
  type Profile,
} from "../lib/profile";

interface Props {
  profile: Profile;
  onChange: (next: Profile) => void;
  onReset: () => void;
}

const GROUPS: (keyof typeof GROUP_LABELS)[] = ["family", "pregnancy", "environment"];

export function ProfileBuilder({ profile, onChange, onReset }: Props) {
  function setCategorical(id: string, value: string) {
    onChange({ ...profile, categorical: { ...profile.categorical, [id]: value } });
  }
  function setBinary(id: string, value: boolean) {
    onChange({ ...profile, binary: { ...profile.binary, [id]: value } });
  }
  function setNumeric(id: string, value: number) {
    onChange({ ...profile, numeric: { ...profile.numeric, [id]: value } });
  }

  return (
    <div className="profile-builder">
      {GROUPS.map((group) => {
        const cats = CATEGORICAL_FIELDS.filter((f) => f.group === group);
        const bins = BINARY_FIELDS.filter((f) => f.group === group);
        const nums = NUMERIC_FIELDS.filter((f) => f.group === group);
        if (!cats.length && !bins.length && !nums.length) return null;
        return (
          <fieldset key={group} className="profile-group">
            <legend>{GROUP_LABELS[group]}</legend>

            {cats.map((field) => (
              <div className="profile-field" key={field.id}>
                <label>{field.question}</label>
                <div className="profile-pill-row">
                  {field.options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`profile-pill ${profile.categorical[field.id] === opt.value ? "is-active" : ""}`}
                      onClick={() => setCategorical(field.id, opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {bins.map((field) => (
              <div className="profile-field" key={field.id}>
                <label>{field.question}</label>
                <div className="profile-pill-row">
                  <button
                    type="button"
                    className={`profile-pill ${profile.binary[field.id] === true ? "is-active" : ""}`}
                    onClick={() => setBinary(field.id, true)}
                  >
                    {field.yesLabel}
                  </button>
                  <button
                    type="button"
                    className={`profile-pill ${profile.binary[field.id] === false ? "is-active" : ""}`}
                    onClick={() => setBinary(field.id, false)}
                  >
                    {field.noLabel}
                  </button>
                </div>
              </div>
            ))}

            {nums.map((field) => {
              const value = profile.numeric[field.id];
              return (
                <div className="profile-field" key={field.id}>
                  <label htmlFor={`field-${field.id}`}>
                    {field.question}
                    {value !== undefined && (
                      <span className="profile-field-value">
                        {value}
                        {field.unit ?? ""}
                      </span>
                    )}
                  </label>
                  <input
                    id={`field-${field.id}`}
                    type="range"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={value ?? (field.min + field.max) / 2}
                    onChange={(e) => setNumeric(field.id, Number(e.target.value))}
                    className="profile-slider"
                  />
                </div>
              );
            })}
          </fieldset>
        );
      })}

      <div className="profile-actions">
        <button type="button" className="profile-reset" onClick={onReset}>
          Reset to population average
        </button>
        <div className="profile-hint">
          <Sparkles size={14} /> Nothing you enter here leaves your browser.
        </div>
      </div>
    </div>
  );
}
