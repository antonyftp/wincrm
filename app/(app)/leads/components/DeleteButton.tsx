"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteLead } from "@/app/actions/leads";

type Props = {
  id: string;
};

export default function DeleteButton({ id }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!window.confirm("Voulez-vous vraiment supprimer ce lead ?")) return;
    setLoading(true);
    setError(null);
    const result = await deleteLead(id);
    if (result && "error" in result) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/leads");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <button onClick={handleClick} disabled={loading} className="btn btn-sm btn-danger">
        {loading ? "Suppression…" : "Supprimer"}
      </button>
      {error && <p style={{ fontSize: 11, color: "var(--neg)", margin: 0 }}>{error}</p>}
    </div>
  );
}
