// Export all tools from their respective files
export * from './weather'
export * from './console'

// Tool handler function
export async function handleToolCall(toolCall: any): Promise<any[]> {
  const { fetchWeather } = await import('./weather')
  const { logNameToConsole } = await import('./console')
  
  const functionResponses = []
  
  for (const fc of toolCall.functionCalls) {
    let result
    
    try {
      if (fc.name === "get_weather") {
        const { location } = fc.args
        result = await fetchWeather(location)
      } else if (fc.name === "console_log_name") {
        const { name } = fc.args
        result = await logNameToConsole(name)
      } else {
        result = { error: `Unknown function: ${fc.name}` }
      }
      
      functionResponses.push({
        id: fc.id,
        name: fc.name,
        response: { result: result }
      })
    } catch (error: any) {
      functionResponses.push({
        id: fc.id,
        name: fc.name,
        response: { error: `Failed to execute ${fc.name}: ${error?.message || error}` }
      })
    }
  }
  
  return functionResponses
}
