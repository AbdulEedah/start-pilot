import { Shield, Lock, Eye, Server, Key, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Security() {
  const securityFeatures = [
    {
      icon: <Lock className="w-8 h-8 text-primary" />,
      title: "End-to-End Encryption",
      description: "All data is encrypted in transit and at rest using industry-standard AES-256 encryption."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "SOC 2 Compliant",
      description: "We maintain SOC 2 Type II compliance with regular third-party security audits."
    },
    {
      icon: <Key className="w-8 h-8 text-primary" />,
      title: "Multi-Factor Authentication",
      description: "Secure your account with MFA using authenticator apps, SMS, or hardware keys."
    },
    {
      icon: <Server className="w-8 h-8 text-primary" />,
      title: "Secure Infrastructure",
      description: "Hosted on enterprise-grade cloud infrastructure with 99.9% uptime SLA."
    },
    {
      icon: <Eye className="w-8 h-8 text-primary" />,
      title: "Privacy by Design",
      description: "Built with privacy-first principles. We collect only what's necessary for our services."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-primary" />,
      title: "Regular Audits",
      description: "Continuous security monitoring and regular penetration testing by security experts."
    }
  ]

  const certifications = [
    "SOC 2 Type II",
    "ISO 27001",
    "GDPR Compliant",
    "CCPA Compliant",
    "HIPAA Ready"
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Security & Compliance</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your data security and privacy are our top priorities. Learn about our comprehensive 
            security measures and compliance certifications.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Encryption</h4>
                <p className="text-sm text-muted-foreground">
                  All data is encrypted using AES-256 encryption both in transit (TLS 1.3) 
                  and at rest. Encryption keys are managed using industry best practices.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Access Control</h4>
                <p className="text-sm text-muted-foreground">
                  Role-based access control (RBAC) ensures users only have access to data 
                  and features appropriate to their role.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Data Backup</h4>
                <p className="text-sm text-muted-foreground">
                  Automated daily backups with point-in-time recovery capabilities. 
                  Backups are encrypted and stored in geographically distributed locations.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-primary" />
                Compliance & Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  We maintain the highest security and compliance standards:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">{cert}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Security Audits</h4>
                  <p className="text-sm text-muted-foreground">
                    Annual third-party security audits and continuous vulnerability assessments 
                    ensure our security posture remains strong.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Report a Security Issue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                If you discover a security vulnerability, please report it to our security team. 
                We appreciate responsible disclosure and will work with you to address any issues promptly.
              </p>
              <div className="space-y-2">
                <p className="font-semibold">Security Email:</p>
                <p className="text-sm">security@startpilot.com</p>
                <p className="text-sm text-muted-foreground mt-4">
                  For urgent security issues, please include "[URGENT]" in your subject line.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}