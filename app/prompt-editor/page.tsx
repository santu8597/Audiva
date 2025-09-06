"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Wand2, Copy, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SystemPromptEditor() {
  const [systemPrompt, setSystemPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setUploadedFile(file)
      toast({
        title: "File uploaded",
        description: `${file.name} is ready for processing`,
      })
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      })
    }
  }

  const generateSystemPrompt = async () => {
    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please upload a PDF file first",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const formData = new FormData()
      formData.append("file", uploadedFile)

      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to generate prompt")
      }

      const data = await response.json()
      setSystemPrompt(data.prompt)

      toast({
        title: "System prompt generated!",
        description: "Your AI voice agent system prompt is ready",
      })
    } catch (error) {
      console.error("Error generating prompt:", error)
      toast({
        title: "Generation failed",
        description: "Failed to generate system prompt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    if (systemPrompt) {
      await navigator.clipboard.writeText(systemPrompt)
      toast({
        title: "Copied to clipboard",
        description: "System prompt copied successfully",
      })
    }
  }

  const savePrompt = () => {
    // This would typically save to a database
    toast({
      title: "Prompt saved",
      description: "System prompt has been saved to your account",
    })
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">AI System Prompt Editor</h1>
          <p className="text-muted-foreground text-lg">
            Create custom system prompts for your AI voice agents by uploading company details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Company Details
              </CardTitle>
              <CardDescription>
                Upload a PDF with your company information to automatically generate a system prompt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Click to upload PDF</p>
                    <p className="text-xs text-muted-foreground">
                      Upload company brochure, about us, or service details
                    </p>
                  </div>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {uploadedFile && (
                <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{uploadedFile.name}</span>
                </div>
              )}

              <Button 
                onClick={generateSystemPrompt} 
                disabled={!uploadedFile || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Prompt...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate System Prompt
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle>Generated System Prompt</CardTitle>
              <CardDescription>
                Review and edit your AI voice agent system prompt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Your generated system prompt will appear here..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={copyToClipboard}
                  disabled={!systemPrompt}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button 
                  onClick={savePrompt}
                  disabled={!systemPrompt}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Prompt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Example Section */}
        <Card>
          <CardHeader>
            <CardTitle>What the AI looks for in your document:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Company Identity</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Company name and motto</li>
                  <li>• Mission and vision</li>
                  <li>• Brand voice and tone</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Company Information</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Business overview</li>
                  <li>• History and achievements</li>
                  <li>• Key differentiators</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Services & Products</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All services offered</li>
                  <li>• Product features</li>
                  <li>• Pricing information</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
