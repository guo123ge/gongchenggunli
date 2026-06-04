function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        if (!line.trim()) return <div key={index} className="h-1" />;
        if (line.startsWith("### ")) {
          return (
            <h4 key={index} className="pt-1 text-sm font-semibold text-brand">
              {line.slice(4)}
            </h4>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h3 key={index} className="text-base font-bold text-white">
              {line.slice(3)}
            </h3>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <p key={index} className="pl-3 text-sm leading-6 text-slate-200 before:mr-2 before:content-['•']">
              {renderInline(line.slice(2))}
            </p>
          );
        }
        return (
          <p key={index} className="text-sm leading-6 text-slate-200">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

export function AiChatMessage({ role, content }: { role: "user" | "assistant"; content: string }) {
  if (role === "user") {
    return <div className="ml-auto max-w-[88%] rounded-2xl bg-brand px-3 py-2 text-sm text-black">{content}</div>;
  }

  return (
    <div className="max-w-full rounded-2xl bg-panel-soft px-3 py-3 text-sm text-slate-200">
      <MarkdownContent content={content} />
    </div>
  );
}
