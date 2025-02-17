export function ShimmerText({
  text,
  color = "#C0C0C0",
}: {
  text: string;
  color?: string;
}) {
  return (
    <p
      style={{
        background: `linear-gradient(90deg, ${color} 47%, #ffffff 50%, ${color} 53%)`,
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
        backgroundSize: "400% 100%",
        animation: "textShine 3s linear infinite",
        margin: 0,
        padding: "0.5em 0",
      }}
    >
      {text}
    </p>
  );
}
