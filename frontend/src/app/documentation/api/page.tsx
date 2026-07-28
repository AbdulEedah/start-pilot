import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function APIReference() {
  const endpoints = [
    {
      method: "GET",
      endpoint: "/api/v1/startups",
      description: "Retrieve a list of startups",
      params: "?limit=10&offset=0&sector=tech"
    },
    {
      method: "POST",
      endpoint: "/api/v1/startups",
      description: "Create a new startup profile",
      params: "Body: { name, description, sector, stage }"
    },
    {
      method: "GET",
      endpoint: "/api/v1/startups/{id}",
      description: "Get a specific startup by ID",
      params: "Path: startup ID"
    },
    {
      method: "PUT",
      endpoint: "/api/v1/startups/{id}",
      description: "Update a startup profile",
      params: "Path: startup ID, Body: update fields"
    },
    {
      method: "GET",
      endpoint: "/api/v1/sectors",
      description: "Get all available sectors",
      params: "None"
    },
    {
      method: "GET",
      endpoint: "/api/v1/resources",
      description: "Retrieve startup resources",
      params: "?category=funding&type=guide"
    }
  ]

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-green-100 text-green-800"
      case "POST": return "bg-blue-100 text-blue-800"
      case "PUT": return "bg-yellow-100 text-yellow-800"
      case "DELETE": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">API Reference</h1>
        
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Welcome to the Start Pilot API. Our REST API allows you to programmatically access 
                startup data, resources, and services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Base URL</h4>
                <code className="text-sm">https://api.startpilot.com/v1</code>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Authentication</h4>
                <p className="text-sm text-muted-foreground">
                  Include your API key in the Authorization header:
                </p>
                <div className="bg-muted p-4 rounded-lg mt-2">
                  <code className="text-sm">Authorization: Bearer YOUR_API_KEY</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <h2 className="text-2xl font-semibold mb-6">Endpoints</h2>
        
        <div className="space-y-6">
          {endpoints.map((endpoint, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Badge className={getMethodColor(endpoint.method)}>
                    {endpoint.method}
                  </Badge>
                  <code className="font-mono text-lg">{endpoint.endpoint}</code>
                </div>
                <CardDescription>{endpoint.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-semibold mb-2">Parameters</h4>
                  <div className="bg-muted p-3 rounded-lg">
                    <code className="text-sm">{endpoint.params}</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Free tier: 100 requests per hour</li>
                <li>• Professional: 1,000 requests per hour</li>
                <li>• Enterprise: 10,000 requests per hour</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}