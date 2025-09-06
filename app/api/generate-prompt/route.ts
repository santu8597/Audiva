import { NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Please upload a PDF file" },
        { status: 400 }
      )
    }

    // Convert file to array buffer for Gemini
    const fileBuffer = await file.arrayBuffer()

    // Generate system prompt using Gemini with direct PDF input
    const { text: systemPrompt } = await generateText({
      model: google("gemini-2.5-flash"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
                Please analyze this company PDF document and create a comprehensive system prompt for an AI voice agent.

                The system prompt should include:
                1. **Company Name and Motto**: Extract and prominently feature the company name and any motto/tagline
                2. **Company Information**: Include detailed information about the company (history, mission, values, achievements)
                3. **Services Provided**: List and describe all services offered by the company

                Format the system prompt as follows:
                - Start with a clear role definition for the AI voice agent
                - Include company identity (name, motto) prominently
                - Provide comprehensive company background information
                - Detail all services with descriptions
                - Set appropriate tone and personality for customer interactions
                - Include guidelines for handling customer queries
                - Specify what to do if asked about services not offered
                - Maintain professional yet approachable tone

                Create a structured system message that would work well for a voice AI assistant representing this company.
              `,
            },
            {
              type: "file",
              data: fileBuffer,
              mediaType: "application/pdf",
            },
          ],
        },
      ],
    })

    return NextResponse.json({
      prompt: systemPrompt,
    })

  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json(
      { error: "Failed to process the document and generate prompt. Please try again." },
      { status: 500 }
    )
  }
}
