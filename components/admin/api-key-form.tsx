"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Check, Copy, Eye, EyeOff } from "lucide-react"
import { testApiKey, updateApiKey } from "@/app/actions/api-key-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export function ApiKeyForm() {
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Function to handle form submission
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setTestResult(null)

    try {
      const formData = new FormData(event.currentTarget)
      const result = await updateApiKey(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
          variant: "default",
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to test the API key
  async function handleTestApiKey() {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key to test",
        variant: "destructive",
      })
      return
    }

    setTestLoading(true)
    setTestResult(null)

    try {
      const result = await testApiKey(apiKey)
      setTestResult(result)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setTestLoading(false)
    }
  }

  // Function to copy API key to clipboard
  function copyToClipboard() {
    navigator.clipboard.writeText(apiKey)
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
      variant: "default",
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Grok API Key</h3>
        <p className="text-sm text-muted-foreground">
          Enter your Grok API key to enable AI chat functionality. You can get an API key from{" "}
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-4"
          >
            Groq Console
          </a>
          .
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <div className="flex">
            <div className="relative flex-1">
              <Input
                id="apiKey"
                name="apiKey"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Grok API key"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showApiKey ? "Hide API key" : "Show API key"}</span>
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="ml-2"
              onClick={copyToClipboard}
              disabled={!apiKey}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy API key</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isLoading || !apiKey.trim()}>
            {isLoading ? "Saving..." : "Save API Key"}
          </Button>
          <Button type="button" variant="outline" onClick={handleTestApiKey} disabled={testLoading || !apiKey.trim()}>
            {testLoading ? "Testing..." : "Test API Key"}
          </Button>
        </div>
      </form>

      {testResult && (
        <Alert variant={testResult.valid ? "default" : "destructive"}>
          {testResult.valid ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{testResult.valid ? "Valid API Key" : "Invalid API Key"}</AlertTitle>
          <AlertDescription>{testResult.message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
