"use client";

import { useState } from "react";
import { deleteLead } from "@/app/actions/leads";

type Props = {
  id: string;
};

export default function DeleteButton({ id }: Props) {
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
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Suppression…" : "Supprimer"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
