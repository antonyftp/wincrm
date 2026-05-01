"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addComment, deleteComment } from "@/app/actions/tracking";

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

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).replace(" à", " à");
}

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
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-5">
        Commentaires{" "}
        <span className="text-sm font-normal text-slate-400">({comments.length})</span>
      </h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          ref={textareaRef}
          rows={3}
          placeholder="Ajouter un commentaire…"
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={isPending}
        />
        {addError && (
          <p className="mt-1 text-xs text-red-600">{addError}</p>
        )}
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Envoi…" : "Ajouter"}
          </button>
        </div>
      </form>

      {sorted.length === 0 ? (
        <p className="text-sm text-slate-400 italic">Aucun commentaire pour l'instant.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((comment) => {
            const canDelete =
              sessionRole === "admin" || comment.author?.id === sessionUserId;

            return (
              <div key={comment.id} className="bg-slate-50 rounded-lg px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-slate-700">
                        {comment.author
                          ? `${comment.author.prenom} ${comment.author.nom}`
                          : "Utilisateur supprimé"}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                    {deleteErrors[comment.id] && (
                      <p className="mt-1 text-xs text-red-600">{deleteErrors[comment.id]}</p>
                    )}
                  </div>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={isPending}
                      className="flex-shrink-0 text-xs text-slate-400 hover:text-red-600 disabled:opacity-50 transition-colors"
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
  );
}
