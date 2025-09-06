import type React from "react"
import Image from "next/image"

const AiCodeReviews: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "16px",
        overflow: "hidden",
        borderRadius: "8px",
      }}
      role="img"
      aria-label="Smart Voice AI Agents visualization"
    >
      {/* Background overlay for better text readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)",
          zIndex: 1,
        }}
      />

      {/* Main generated image */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          src="/Generated%20Image%20September%2006%2C%202025%20-%2011_52PM.jpeg"
          alt="Smart Voice AI Agents - Futuristic visualization of AI-powered voice assistants"
          fill
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
          priority
        />
      </div>

      {/* Overlay content */}
      
    </div>
  )
}

export default AiCodeReviews