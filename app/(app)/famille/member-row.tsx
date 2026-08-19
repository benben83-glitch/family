"use client";

import { useState, useTransition } from "react";
import { approveMember, rejectMember } from "./actions";
import type { FamilyMember } from "@/lib/family/data";

export function PendingMemberRow({ member }: { member: FamilyMember }) {
  const [role, setRole] = useState<"parent" | "adulte">("adulte");
  const [confirmReject, setConfirmReject] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      const result = await approveMember({ profileId: member.id, role });
      if (result.error) setError(result.error);
    });
  }

  function handleReject() {
    startTransition(async () => {
      const result = await rejectMember(member.id);
      if (result.error) setError(result.error);
      setConfirmReject(false);
    });
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-3">
      <div className="flex-1 min-w-[160px]">
        <p className="font-medium">{member.full_name ?? "(sans nom)"}</p>
        <p className="text-sm text-muted">{member.email}</p>
      </div>

      <select
        value={role}
        onChange={(e) => setRole(e.target.value as "parent" | "adulte")}
        disabled={isPending}
        className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
      >
        <option value="adulte">Adulte (lecture seule)</option>
        <option value="parent">Parent (peut tout modifier)</option>
      </select>

      <button
        type="button"
        onClick={handleApprove}
        disabled={isPending}
        className="rounded-full bg-primary text-primary-foreground text-sm px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        Approuver
      </button>

      {confirmReject ? (
        <div className="flex items-center gap-2">
          <span className="text-sm">Rejeter ?</span>
          <button type="button" disabled={isPending} onClick={handleReject} className="rounded-full bg-red-600 text-white text-xs px-3 py-1.5 disabled:opacity-50">
            Oui
          </button>
          <button type="button" onClick={() => setConfirmReject(false)} className="rounded-full bg-background border border-border text-xs px-3 py-1.5">
            Non
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirmReject(true)} className="text-sm text-muted hover:text-red-700 transition-colors">
          Rejeter
        </button>
      )}

      {error && <p className="text-sm text-red-700 w-full">{error}</p>}
    </div>
  );
}
