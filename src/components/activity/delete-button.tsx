"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  activityId: string;
  redirectToList?: boolean;
}

export function DeleteButton({
  activityId,
  redirectToList = false,
}: DeleteButtonProps) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Supprimer cette activite ?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/activities/${activityId}`, { method: "DELETE" });
      if (!res.ok) {
        console.error("Erreur lors de la suppression:", res.status, res.statusText);
        alert("Erreur lors de la suppression de l'activite.");
        return;
      }
      if (redirectToList) {
        router.push("/activities");
      } else {
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="p-2 text-muted hover:text-accent2 transition-colors"
    >
      {deleting ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Trash2 size={16} />
      )}
    </button>
  );
}
