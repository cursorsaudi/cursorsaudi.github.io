/**
 * Tailwind classes for individual contributor / supporter role pills.
 * Colors are keyed on the English `role` string from site config.
 */
export function contributorRoleBadgeClass(roleEn: string): string {
  const r = roleEn.trim();
  if (r === "Community Supporter") {
    return "text-[#7dd3fc] bg-[#7dd3fc]/[0.08] border border-[#7dd3fc]/[0.15]";
  }
  if (r === "Engineer") {
    return "text-[#c4b5fd] bg-[#c4b5fd]/[0.08] border border-[#c4b5fd]/[0.15]";
  }
  return "text-[#d4d4d8] bg-white/[0.06] border border-white/[0.12]";
}
