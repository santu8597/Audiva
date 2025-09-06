import type React from "react"
import { Search } from "lucide-react"

interface McpConnectivityIllustrationProps {
  className?: string
}

const McpConnectivityIllustration: React.FC<McpConnectivityIllustrationProps> = ({ className = "" }) => {
  // Voice icon components as SVGs
  const VoiceIcon1 = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
        fill="hsl(var(--primary))"
        opacity="0.8"
      />
      <path
        d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  )

  const VoiceIcon2 = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" fill="hsl(var(--primary))" opacity="0.8" />
      <path
        d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  )

  const VoiceIcon3 = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 11h2l2-4 4 8 4-8 2 4h2"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.8"
      />
      <circle cx="12" cy="11" r="1" fill="hsl(var(--primary))" opacity="1" />
    </svg>
  )

  const VoiceIcon4 = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 9h6v6H9z"
        fill="hsl(var(--primary))"
        opacity="0.3"
        rx="1"
      />
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.8"
      />
      <circle cx="12" cy="12" r="3" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" opacity="0.6" />
    </svg>
  )

  const VoiceIcon5 = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"
        fill="hsl(var(--primary))"
        opacity="0.8"
      />
      <path
        d="M12 12c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
        fill="hsl(var(--primary))"
        opacity="0.6"
      />
      <path
        d="M16 8.5c0 .83.67 1.5 1.5 1.5S19 9.33 19 8.5 18.33 7 17.5 7 16 7.67 16 8.5zM21 12c-1.33 0-4 .67-4 2v1h4v-3z"
        fill="hsl(var(--primary))"
        opacity="0.4"
      />
    </svg>
  )

  const VoiceIcon6 = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M8.5 14.5A2.5 2.5 0 0 0 11 12H9a2 2 0 0 0-2 2v.5zM16.5 14.5a2 2 0 0 0-2-2H13a2.5 2.5 0 0 0 2.5 2.5v-.5z"
        fill="hsl(var(--primary))"
        opacity="0.6"
      />
      <circle cx="12" cy="7" r="4" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" opacity="0.8" />
      <path
        d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.7"
      />
    </svg>
  )

  // Integration data with voice-related names and SVG components
  const integrations = [
    { name: "Voice Assistant", icon: <VoiceIcon1 />, installed: true },
    { name: "Audio Processing", icon: <VoiceIcon2 /> },
    { name: "Speech Analytics", icon: <VoiceIcon3 />, installed: true },
    { name: "Call Monitoring", icon: <VoiceIcon4 /> },
    { name: "Agent Training", icon: <VoiceIcon5 />, installed: true },
    { name: "Customer Portal", icon: <VoiceIcon6 /> },
  ]

  return (
    <div
      className={`w-full h-full flex items-center justify-center p-4 relative ${className}`}
      role="img"
      aria-label="MCP Connectivity component showcasing installed integrations list"
    >
      {/* Main Message Box */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, calc(-50% + 24px))",
          width: "345px",
          height: "277px",
          background: "linear-gradient(180deg, hsl(var(--background)) 0%, transparent 100%)",
          backdropFilter: "blur(16px)",
          borderRadius: "9.628px",
          border: "0.802px solid hsl(var(--border))",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "100%",
          }}
        >
          {/* Search Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12.837px",
              padding: "8.826px 12.837px",
              borderBottom: "0.802px solid hsl(var(--border))",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "14.442px",
                height: "14.442px",
                position: "relative",
                flexShrink: 0,
              }}
            >
              <Search className="w-full h-full text-muted-foreground" />
            </div>
            <span
              style={{
                fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontSize: "12.837px",
                lineHeight: "19.256px",
                color: "hsl(var(--muted-foreground))",
                fontWeight: 400,
                whiteSpace: "nowrap",
              }}
            >
              Search for servers
            </span>
          </div>
          {/* Integration List */}
          {integrations.map((integration, index) => (
            <div
              key={integration.name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8.826px 12.837px",
                borderBottom: index < integrations.length - 1 ? "0.479px solid hsl(var(--border))" : "none",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12.837px",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {integration.icon}
                </div>
                <span
                  style={{
                    fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    fontSize: "12.837px",
                    lineHeight: "19.256px",
                    color: "hsl(var(--muted-foreground))",
                    fontWeight: 400,
                    whiteSpace: "nowrap",
                  }}
                >
                  {integration.name}
                </span>
              </div>
              {integration.installed && (
                <div
                  style={{
                    background: "hsl(var(--primary) / 0.08)",
                    padding: "1.318px 5.272px",
                    borderRadius: "3.295px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      fontSize: "9.583px",
                      lineHeight: "15.333px",
                      color: "hsl(var(--primary))",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Installed
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default McpConnectivityIllustration
