import ReactMarkdown from "react-markdown";

export function Markdown({ content }: { content: string }) {
  return (
    <div style={{ overflow: "auto", fontSize: "16px" }}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
