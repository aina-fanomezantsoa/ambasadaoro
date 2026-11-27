/** A listing's status, always written: never colour alone. */
export function Status({ status, reserved }: { status: string; reserved?: boolean }) {
  const [label, color] =
    status === "sold"
      ? ["Vendu", "text-muted"]
      : reserved
        ? ["Réservé", "text-reserved"]
        : status === "published"
          ? ["Disponible", "text-available"]
          : [status === "draft" ? "Brouillon" : "Retiré", "text-muted"];
  return <span className={`text-sm font-medium ${color}`}>{label}</span>;
}
