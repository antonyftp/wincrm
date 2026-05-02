"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addComment, deleteComment } from "@/app/actions/tracking";
import { formatDate } from "@/app/lib/format";

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  author: { id: string; nom: string; prenom: string } | null;
};

type Props = {
  leadId: string;
  comments: Comment[];
  sessionUserId: string;
  sessionRole: string;
};

export default function CommentSection({ leadId, comments, sessionUserId, sessionRole }: Props) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const sorted = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const content = textareaRef.current?.value ?? "";
    if (!content.trim()) return;
    setAddError(null);
    startTransition(async () => {
      const result = await addComment(leadId, content);
      if (result.error) {
        setAddError(result.error);
      } else {
        if (textareaRef.current) textareaRef.current.value = "";
        router.refresh();
      }
    });
  }

  async function handleDelete(commentId: string) {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    setDeleteErrors((prev) => ({ ...prev, [commentId]: "" }));
    startTransition(async () => {
      const result = await deleteComment(commentId);
      if (result.error) {
        setDeleteErrors((prev) => ({ ...prev, [commentId]: result.error! }));
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="card">
      <div className="card-h">
        <h3>Commentaires</h3>
        <span className="meta">{comments.length}</span>
      </div>
      <div className="card-b">
        <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
          <textarea
            ref={textareaRef}
            rows={3}
            placeholder="Ajouter un commentaire…"
            className="input"
            style={{ height: "auto" }}
            disabled={isPending}
          />
          {addError && <p style={{ marginTop: 4, fontSize: 12, color: "var(--neg)" }}>{addError}</p>}
          <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" disabled={isPending} className="btn btn-primary btn-sm">
              {isPending ? "Envoi…" : "Ajouter"}
            </button>
          </div>
        </form>

        {sorted.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-faint)", fontStyle: "italic" }}>
            Aucun commentaire pour l&apos;instant.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sorted.map((comment) => {
              const canDelete = sessionRole === "admin" || comment.author?.id === sessionUserId;
              const initials = comment.author
                ? `${comment.author.prenom[0] ?? ""}${comment.author.nom[0] ?? ""}`.toUpperCase()
                : "?";

              return (
                <div key={comment.id} style={{ background: "var(--surface-2)", borderRadius: "var(--r)", padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span className="avatar avatar-sm" style={{ background: "var(--accent)" }}>{initials}</span>
                        <span className="bold" style={{ fontSize: 13 }}>
                          {comment.author ? `${comment.author.prenom} ${comment.author.nom}` : "Utilisateur supprimé"}
                        </span>
                        <span className="muted" style={{ fontSize: 12 }}>{formatDate(comment.createdAt)}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {comment.content}
                      </p>
                      {deleteErrors[comment.id] && (
                        <p style={{ marginTop: 4, fontSize: 11, color: "var(--neg)" }}>{deleteErrors[comment.id]}</p>
                      )}
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        disabled={isPending}
                        className="btn btn-ghost btn-sm"
                        style={{ color: "var(--neg)", flexShrink: 0 }}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
