import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQ() {
  const faqs = [
    {
      question: "What is Start Pilot?",
      answer: "Start Pilot is a comprehensive platform designed to help entrepreneurs and startups navigate their journey from idea to successful business. We provide resources, guides, tools, and community support tailored to different industry sectors."
    },
    {
      question: "How do I get started with Start Pilot?",
      answer: "Simply sign up for a free account and complete our onboarding process. You'll get access to our basic resources and can upgrade to a paid plan for advanced features and personalized guidance."
    },
    {
      question: "What sectors do you cover?",
      answer: "We cover a wide range of sectors including technology, healthcare, fintech, e-commerce, SaaS, biotech, clean energy, and many more. Each sector has specialized guides and resources."
    },
    {
      question: "Is there a free plan available?",
      answer: "Yes! Our Starter plan is completely free and includes access to basic startup resources, community features, and limited sector guides. You can upgrade anytime for more advanced features."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Absolutely. You can cancel your subscription at any time from your account settings. Your plan will remain active until the end of your current billing cycle."
    },
    {
      question: "Do you offer custom solutions for enterprises?",
      answer: "Yes, we offer custom enterprise solutions including white-label platforms, dedicated account management, and custom integrations. Contact our sales team for more information."
    },
    {
      question: "How accurate and up-to-date is your information?",
      answer: "Our content is regularly updated by industry experts and our research team. We review and update our sector guides, regulations, and market data quarterly or as needed based on industry changes."
    },
    {
      question: "Can I access Start Pilot on mobile devices?",
      answer: "Yes, our platform is fully responsive and works on all devices. We also have mobile apps available for iOS and Android for convenient access on the go."
    },
    {
      question: "Do you provide mentorship or one-on-one support?",
      answer: "Our Professional and Enterprise plans include priority support. Enterprise customers get access to dedicated account managers. We also have a community forum where you can connect with other entrepreneurs and industry experts."
    },
    {
      question: "How do I integrate with your API?",
      answer: "Check out our API documentation for detailed integration guides. We provide RESTful APIs with comprehensive documentation, code examples, and SDKs for popular programming languages."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers. All payments are processed securely through our payment partners."
    },
    {
      question: "How do I contact support?",
      answer: "You can reach our support team through the contact form on our website, email us at support@startpilot.com, or use the in-app chat feature. Enterprise customers have access to dedicated support channels."
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">
            Find answers to the most common questions about Start Pilot
          </p>
        </div>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold mb-4">Still have questions?</h3>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <a 
            href="/contact" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}