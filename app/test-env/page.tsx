export default function TestEnvPage() {
  return (
    <div className="container py-12">
      <h1 className="text-2xl font-bold mb-4">Environment Variable Test</h1>
      <p>
        <strong>NEXT_PUBLIC_SITE_URL:</strong> {process.env.NEXT_PUBLIC_SITE_URL || "Not set"}
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        If you see "Not set", make sure you've added the environment variable and restarted your server.
      </p>
    </div>
  )
}
