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
    await fetch(`/api/activities/${activityId}`, { method: "DELETE" });
    if (redirectToList) {
      router.push("/activities");
    } else {
      router.refresh();
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
