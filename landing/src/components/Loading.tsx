import { Loader2 } from "lucide-react";

export default function LoadingSpinner({
  size = 32,
  text = "Loading...",
  fullScreen = false,
}) {
  return (
    <div
      style={{
        position: fullScreen ? "fixed" : "relative",
        inset: fullScreen ? 0 : "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        background: fullScreen ? "rgba(255,255,255,0.8)" : "transparent",
        zIndex: fullScreen ? 9999 : "auto",
      }}
    >
      <Loader2
        size={size}
        className="spin"
        aria-label="Loading"
      />
      {text && <span style={{ fontSize: "14px" }}>{text}</span>}
    </div>
  );
}
