import { redirect } from "next/navigation";
import { requireFamilyProfile } from "@/lib/auth/session";
import { listFamilyMembers } from "@/lib/family/data";
import { PendingMemberRow } from "./member-row";

export default async function FamilyPage() {
  const profile = await requireFamilyProfile();
  if (profile.role !== "parent") redirect("/");

  const members = await listFamilyMembers();
  const pending = members.filter((member) => member.status === "pending");
  const active = members.filter((member) => member.status === "active");

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-3xl text-primary">Famille</h1>
        <p className="text-muted text-sm mt-1">
          Partage le lien <span className="font-medium">nosvacances.com/signup</span> pour inviter un membre de la famille à demander l&apos;accès.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-primary">Demandes en attente {pending.length > 0 && `(${pending.length})`}</h2>
        {pending.length === 0 ? (
          <p className="text-muted text-sm">Aucune demande en attente.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((member) => (
              <PendingMemberRow key={member.id} member={member} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-primary">Membres</h2>
        <div className="flex flex-col gap-2">
          {active.map((member) => (
            <div key={member.id} className="flex items-center justify-between text-sm bg-card border border-border rounded-lg px-4 py-2.5">
              <span>
                {member.full_name ?? member.email} <span className="text-muted">— {member.email}</span>
              </span>
              <span className="text-muted">{member.role === "parent" ? "Parent" : "Adulte"}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
