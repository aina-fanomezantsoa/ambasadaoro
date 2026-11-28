/** "4,8/5": written out, the star is decoration only. */
export function Rating({ value }: { value: number }) {
  return (
    <span className="font-semibold">
      <span aria-hidden className="text-reserved">
        ★{" "}
      </span>
      {value.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}/5
    </span>
  );
}
