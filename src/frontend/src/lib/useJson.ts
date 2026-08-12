import { useEffect, useState } from "react";

const base = import.meta.env.BASE_URL;

export function useJson<T>(file: string): T | null {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${base}data/${file}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setData(json as T);
      });
    return () => {
      cancelled = true;
    };
  }, [file]);

  return data;
}
