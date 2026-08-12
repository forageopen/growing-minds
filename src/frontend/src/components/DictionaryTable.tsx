import { useState } from "react";
import { Search } from "lucide-react";
import type { DictionaryEntry } from "../lib/types";

interface Props {
  entries: DictionaryEntry[];
}

export function DictionaryTable({ entries }: Props) {
  const [query, setQuery] = useState("");
  const filtered = entries.filter(
    (e) =>
      e.column.toLowerCase().includes(query.toLowerCase()) ||
      e.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="search-input">
        <Search size={16} strokeWidth={2} />
        <input
          type="text"
          placeholder="Search columns…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search data dictionary"
        />
      </div>
      <div className="table-scroll">
        <table className="dict-table">
          <thead>
            <tr>
              <th>Column</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.column}>
                <td><code>{e.column}</code></td>
                <td className="dict-type">{e.type}</td>
                <td>{e.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
