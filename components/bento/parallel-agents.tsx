import type React from "react"

interface ParallelCodingAgentsProps {
  className?: string
}

const ParallelCodingAgents: React.FC<ParallelCodingAgentsProps> = ({ className = "" }) => {
  const VoiceIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      style={{ width: "16px", height: "16px" }}
    >
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

  const PlayIcon = () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      style={{ width: "12px", height: "12px" }}
    >
      <polygon
        points="5,3 19,12 5,21"
        fill="hsl(var(--primary))"
        opacity="0.7"
      />
    </svg>
  )

  const languageAgents = [
    {
      language: "English",
      voiceName: "Emma Watson",
      accent: "British",
      specialty: "Customer Support",
      status: "Active",
      statusColor: "#22c55e",
    },
    {
      language: "हिंदी",
      voiceName: "Arjun Sharma",
      accent: "Delhi",
      specialty: "Sales Calls",
      status: "Training",
      statusColor: "#f59e0b",
    },
    {
      language: "मराठी",
      voiceName: "Priya Patil",
      accent: "Mumbai",
      specialty: "Onboarding",
      status: "Active",
      statusColor: "#22c55e",
    },
    {
      language: "বাংলা",
      voiceName: "Raj Banerjee",
      accent: "Kolkata",
      specialty: "Technical Support",
      status: "Ready",
      statusColor: "#3b82f6",
    },
  ]

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "linear-gradient(180deg, hsl(var(--card) / 0.4) 0%, transparent 100%)",
        backdropFilter: "blur(8px)",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px 12px 20px",
          borderBottom: "1px solid hsl(var(--border) / 0.2)",
        }}
      >
        <h3
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "hsl(var(--foreground))",
            margin: 0,
            textAlign: "center",
          }}
        >
          AI Voice Agents
        </h3>
        <p
          style={{
            fontSize: "11px",
            color: "hsl(var(--muted-foreground))",
            margin: "4px 0 0 0",
            textAlign: "center",
          }}
        >
          Multi-language support
        </p>
      </div>

      {/* Language Agents List */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: "12px 16px 16px 16px",
          flex: 1,
          overflowY: "auto",
        }}
      >
        {languageAgents.map((agent, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 12px",
              background: "hsl(var(--card) / 0.3)",
              border: "1px solid hsl(var(--border) / 0.3)",
              borderRadius: "8px",
              backdropFilter: "blur(8px)",
            }}
          >
            {/* Voice Icon */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                background: "hsl(var(--primary) / 0.1)",
                borderRadius: "6px",
                flexShrink: 0,
              }}
            >
              <VoiceIcon />
            </div>

            {/* Agent Details */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "2px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "hsl(var(--foreground))",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {agent.language}
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: agent.statusColor,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "10px",
                      color: agent.statusColor,
                      fontWeight: "500",
                    }}
                  >
                    {agent.status}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "3px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: "hsl(var(--muted-foreground))",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {agent.voiceName}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    color: "hsl(var(--muted-foreground))",
                  }}
                >
                  {agent.accent}
                </span>
              </div>

              <span
                style={{
                  fontSize: "10px",
                  color: "hsl(var(--primary))",
                  fontWeight: "500",
                }}
              >
                {agent.specialty}
              </span>
            </div>

            {/* Play Button */}
            <button
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                background: "hsl(var(--primary) / 0.1)",
                border: "1px solid hsl(var(--primary) / 0.2)",
                borderRadius: "4px",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <PlayIcon />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "8px 16px 12px 16px",
          borderTop: "1px solid hsl(var(--border) / 0.2)",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          + 12 more languages available
        </span>
      </div>
    </div>
  )
}

export default ParallelCodingAgents