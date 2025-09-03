import { Type, Behavior } from "@google/genai"

// Console tool definition
export const console_log_name = {
  name: "console_log_name",
  description: "Log a name to the console for debugging or demonstration purposes",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: "The name to log to the console"
      }
    },
    required: ["name"]
  },
  behavior: Behavior.NON_BLOCKING // Simple console logging is non-blocking
}

// Console logging function
export async function logNameToConsole(name: string): Promise<any> {
  console.log(`🎯 Console Tool: Name logged - "${name}"`)
  return {
    status: "success",
    message: `Successfully logged name: ${name}`,
    timestamp: new Date().toISOString()
  }
}
