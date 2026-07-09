import { ImageResponse } from "next/og"

// Route segment config
export const alt = "Echo — AI-Powered Customer Support Platform"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Branded Open Graph card, generated at build/request time so shared links
// (LinkedIn, X, Slack, etc.) always render a proper preview instead of the
// auth-gated app's 404.
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "linear-gradient(135deg, #0B1220 0%, #10203A 100%)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "22px",
          marginBottom: "36px",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "20px",
            background: "#377FF6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "48px",
            fontWeight: 700,
          }}
        >
          E
        </div>
        <div style={{ fontSize: "52px", fontWeight: 700 }}>Echo</div>
      </div>

      <div
        style={{
          display: "flex",
          fontSize: "66px",
          fontWeight: 800,
          lineHeight: 1.1,
          maxWidth: "980px",
        }}
      >
        AI-Powered Customer Support Platform
      </div>

      <div
        style={{
          display: "flex",
          fontSize: "30px",
          color: "#9DB2CE",
          marginTop: "28px",
          maxWidth: "1000px",
          lineHeight: 1.35,
        }}
      >
        Embeddable chat &amp; voice widget · RAG-grounded AI agent · real-time
        human takeover — installed with one line of code.
      </div>

      <div style={{ display: "flex", gap: "16px", marginTop: "48px" }}>
        {["Next.js", "Convex", "Gemini", "Vapi", "Clerk"].map((tech) => (
          <div
            key={tech}
            style={{
              display: "flex",
              fontSize: "24px",
              padding: "10px 24px",
              border: "1px solid #2A3B57",
              borderRadius: "999px",
              color: "#C7D6EC",
            }}
          >
            {tech}
          </div>
        ))}
      </div>
    </div>,
    { ...size }
  )
}
