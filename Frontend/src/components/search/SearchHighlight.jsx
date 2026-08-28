/**
 * SearchHighlight — safely highlights matching text in a string.
 * Uses split + map instead of dangerouslySetInnerHTML.
 */
export default function SearchHighlight({ text = "", query = "", className = "" }) {
  if (!query || !query.trim() || !text) {
    return <span className={className}>{text}</span>;
  }

  const safeQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${safeQuery})`, "gi");
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-snap-accent/30 text-white rounded px-0.5 not-italic"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}
