"use client";

import { useState } from "react";
import { Trash2, Loader2, X, ChevronRight } from "lucide-react";

const CONFIRMATION_TEXT = "supprimer mon compte";

export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  const isConfirmed = input.toLowerCase().trim() === CONFIRMATION_TEXT;

  async function handleDelete() {
    if (!isConfirmed) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/user", { method: "DELETE" });
      if (!res.ok) throw new Error();
      window.location.href = "/login";
    } catch {
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between p-4 hover:bg-card transition-colors"
      >
        <div className="flex items-center gap-3">
          <Trash2 size={18} strokeWidth={2} className="text-accent2" />
          <span className="text-sm font-dm text-accent2">
            Supprimer mon compte
          </span>
        </div>
        <ChevronRight size={16} strokeWidth={2} className="text-muted" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !deleting && setOpen(false)}
          />
          <div className="relative bg-surface border border-border rounded-2xl w-full max-w-sm p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bebas text-xl text-text">
                Supprimer le compte
              </h2>
              <button
                onClick={() => setOpen(false)}
                disabled={deleting}
                className="p-1 text-muted hover:text-text transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm font-dm text-muted leading-relaxed">
              Cette action est irreversible. Toutes tes donnees seront
              definitivement supprimees : activites, plans, records.
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-dm text-muted">
                Tape{" "}
                <span className="text-accent2 font-semibold">
                  {CONFIRMATION_TEXT}
                </span>{" "}
                pour confirmer
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={deleting}
                placeholder={CONFIRMATION_TEXT}
                className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm font-dm text-text placeholder:text-muted/40 outline-none focus:border-accent2/50 transition-colors"
                autoFocus
              />
            </div>

            <button
              onClick={handleDelete}
              disabled={!isConfirmed || deleting}
              className="w-full flex items-center justify-center gap-2 bg-accent2 text-white rounded-xl py-2.5 text-sm font-dm font-medium transition-opacity disabled:opacity-30"
            >
              {deleting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Supprimer definitivement"
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
