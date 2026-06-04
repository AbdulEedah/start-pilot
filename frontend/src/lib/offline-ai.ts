/**
 * Offline AI System
 * Simulates AI responses for all platform features
 */

import { ChatMessage, StartupIdea, RoadmapItem, PitchAnalysis } from './offline-storage';

export interface Mentor {
  id: string;
  name: string;
  avatar: string;
  expertise: string[];
  bio: string;
  experience: string;
  rating: number;
  availability: 'available' | 'busy' | 'offline';
}

export interface AIResponse {
  content: string;
  confidence: number;
  sources?: string[];
  metadata?: any;
}

export interface ValidationResult {
  score: number;
  marketSize: string;
  competition: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface RoadmapGeneration {
  items: RoadmapItem[];
  timeline: string;
  milestones: string[];
}

class OfflineAI {
  private ideaTemplates = [
    {
      sector: 'SaaS',
      ideas: [
        'AI-powered project management tool for remote teams',
        'Automated customer support chatbot platform',
        'Smart inventory management system for e-commerce',
        'Real-time collaboration tool for designers',
        'Automated social media content scheduler'
      ]
    },
    {
      sector: 'FinTech',
      ideas: [
        'Micro-investment app for spare change',
        'AI-driven personal finance advisor',
        'Blockchain-based payment system for freelancers',
        'Automated expense tracking for small businesses',
        'Peer-to-peer lending platform'
      ]
    },
    {
      sector: 'HealthTech',
      ideas: [
        'Telemedicine platform for rural areas',
        'AI-powered symptom checker app',
        'Mental health support chatbot',
        'Fitness tracking with personalized coaching',
        'Medication reminder and tracking system'
      ]
    }
  ];

  private responseTemplates = {
    ideation: [
      "That's an interesting concept! Let me help you refine it further.",
      "I can see potential in this idea. Here are some considerations:",
      "This aligns with current market trends. Let's explore the opportunity:",
      "Great thinking! Let's validate this concept step by step."
    ],
    validation: [
      "Based on market analysis, here's what I found:",
      "The validation results show promising indicators:",
      "Market research reveals several key insights:",
      "Here's my assessment of your idea's viability:"
    ],
    roadmap: [
      "I've created a comprehensive roadmap for your startup:",
      "Here's your step-by-step path to launch:",
      "Based on your idea, here's the recommended timeline:",
      "Let's break down your journey into actionable milestones:"
    ],
    pitch: [
      "I've analyzed your pitch deck. Here's my feedback:",
      "Your pitch shows strong potential. Here are areas to improve:",
      "The investor perspective reveals these insights:",
      "Here's how to make your pitch more compelling:"
    ]
  };

  private mentors: Mentor[] = [
    {
      id: 'mentor_1',
      name: 'Sarah Chen',
      avatar: '/mentors/sarah.jpg',
      expertise: ['SaaS', 'Product Management', 'Growth Hacking'],
      bio: 'Former VP of Product at Stripe, built 3 successful SaaS companies',
      experience: '15+ years in tech, 2 exits, $50M+ raised',
      rating: 4.9,
      availability: 'available'
    },
    {
      id: 'mentor_2',
      name: 'Marcus Rodriguez',
      avatar: '/mentors/marcus.jpg',
      expertise: ['FinTech', 'Fundraising', 'Scaling'],
      bio: 'Serial entrepreneur, founded 2 FinTech unicorns',
      experience: '12+ years, $200M+ raised, 1 IPO',
      rating: 4.8,
      availability: 'available'
    },
    {
      id: 'mentor_3',
      name: 'Dr. Emily Watson',
      avatar: '/mentors/emily.jpg',
      expertise: ['HealthTech', 'Regulatory', 'Clinical Trials'],
      bio: 'Former FDA advisor, built leading telemedicine platform',
      experience: '20+ years in healthcare innovation',
      rating: 4.9,
      availability: 'busy'
    }
  ];

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getRandomTemplate(type: keyof typeof this.responseTemplates): string {
    const templates = this.responseTemplates[type];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private simulateDelay(min = 800, max = 2000): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  async generateIdeaResponse(userMessage: string): Promise<AIResponse> {
    await this.simulateDelay();

    const responses = [
      `I love the direction you're thinking! ${userMessage.toLowerCase().includes('ai') ? 'AI-powered solutions are definitely trending right now.' : 'This could solve a real problem in the market.'} 

Let me help you refine this concept:

**Market Opportunity:**
- Growing demand in this space
- Underserved customer segments
- Technology enablers are mature

**Key Questions to Explore:**
1. Who is your specific target customer?
2. What's their biggest pain point?
3. How are they solving this today?
4. What makes your solution 10x better?

**Next Steps:**
- Conduct customer interviews
- Research existing solutions
- Define your unique value proposition
- Create a simple prototype

Would you like me to help you dive deeper into any of these areas?`,

      `This is a solid foundation for a startup idea! ${userMessage.toLowerCase().includes('saas') ? 'SaaS models have great scalability potential.' : 'The market timing seems right for this type of solution.'}

**Strengths I See:**
- Clear problem identification
- Scalable business model potential
- Technology feasibility

**Areas to Validate:**
- Market size and growth rate
- Customer willingness to pay
- Competitive landscape
- Technical complexity

**Recommended Validation Steps:**
1. Create landing page to test demand
2. Interview 20+ potential customers
3. Build MVP with core features
4. Run pilot program with early adopters

I can help you create a detailed validation plan. What aspect would you like to focus on first?`
    ];

    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      confidence: 0.85 + Math.random() * 0.1,
      sources: ['Market Research Database', 'Startup Success Patterns', 'Industry Reports']
    };
  }

  async validateIdea(idea: string, sector: string): Promise<ValidationResult> {
    await this.simulateDelay(1500, 3000);

    const baseScore = 65 + Math.random() * 25;
    const marketSizes = ['$2.5B', '$8.1B', '$15.3B', '$42.7B', '$128.9B'];
    
    const competitions = {
      'SaaS': ['Slack', 'Notion', 'Airtable', 'Monday.com'],
      'FinTech': ['Stripe', 'Square', 'Robinhood', 'Plaid'],
      'HealthTech': ['Teladoc', 'Dexcom', 'Veracyte', 'Guardant Health'],
      'default': ['Various startups', 'Enterprise solutions', 'Legacy systems']
    };

    return {
      score: Math.round(baseScore),
      marketSize: marketSizes[Math.floor(Math.random() * marketSizes.length)],
      competition: competitions[sector as keyof typeof competitions] || competitions.default,
      strengths: [
        'Strong market demand',
        'Clear value proposition',
        'Scalable technology',
        'Experienced team potential'
      ],
      weaknesses: [
        'Competitive market',
        'Customer acquisition challenges',
        'Technical complexity',
        'Regulatory considerations'
      ],
      recommendations: [
        'Focus on specific niche initially',
        'Build strong MVP quickly',
        'Establish key partnerships',
        'Secure early customer commitments'
      ]
    };
  }

  async generateRoadmap(idea: StartupIdea): Promise<RoadmapGeneration> {
    await this.simulateDelay(2000, 4000);

    const baseItems: RoadmapItem[] = [
      {
        id: this.generateId(),
        title: 'Market Research & Validation',
        description: 'Conduct comprehensive market research and validate core assumptions',
        category: 'product',
        priority: 'critical',
        timeframe: 'Weeks 1-4',
        status: 'pending',
        dependencies: []
      },
      {
        id: this.generateId(),
        title: 'MVP Development',
        description: 'Build minimum viable product with core features',
        category: 'product',
        priority: 'critical',
        timeframe: 'Weeks 5-12',
        status: 'pending',
        dependencies: ['Market Research & Validation']
      },
      {
        id: this.generateId(),
        title: 'Legal Structure Setup',
        description: 'Incorporate company, set up legal framework',
        category: 'legal',
        priority: 'high',
        timeframe: 'Weeks 2-6',
        status: 'pending',
        dependencies: []
      },
      {
        id: this.generateId(),
        title: 'Initial Team Hiring',
        description: 'Recruit key team members (CTO, lead developer)',
        category: 'team',
        priority: 'high',
        timeframe: 'Weeks 8-16',
        status: 'pending',
        dependencies: ['Legal Structure Setup']
      },
      {
        id: this.generateId(),
        title: 'Beta Testing Program',
        description: 'Launch beta with select customers, gather feedback',
        category: 'product',
        priority: 'high',
        timeframe: 'Weeks 13-20',
        status: 'pending',
        dependencies: ['MVP Development']
      },
      {
        id: this.generateId(),
        title: 'Seed Funding Round',
        description: 'Raise seed funding to accelerate growth',
        category: 'funding',
        priority: 'medium',
        timeframe: 'Weeks 16-24',
        status: 'pending',
        dependencies: ['Beta Testing Program']
      },
      {
        id: this.generateId(),
        title: 'Go-to-Market Strategy',
        description: 'Develop and execute customer acquisition strategy',
        category: 'marketing',
        priority: 'high',
        timeframe: 'Weeks 20-28',
        status: 'pending',
        dependencies: ['Beta Testing Program']
      }
    ];

    return {
      items: baseItems,
      timeline: '6-8 months to market launch',
      milestones: [
        'Month 1: Validated problem-solution fit',
        'Month 3: MVP completed and tested',
        'Month 4: Beta customers onboarded',
        'Month 6: Seed funding secured',
        'Month 8: Public launch and growth'
      ]
    };
  }

  async analyzePitch(pitchContent: string): Promise<PitchAnalysis> {
    await this.simulateDelay(3000, 5000);

    const generateScore = () => Math.round(60 + Math.random() * 35);

    const scores = {
      clarity: generateScore(),
      marketOpportunity: generateScore(),
      businessModel: generateScore(),
      traction: generateScore(),
      team: generateScore(),
      financials: generateScore(),
      overall: 0
    };

    scores.overall = Math.round(
      (scores.clarity + scores.marketOpportunity + scores.businessModel + 
       scores.traction + scores.team + scores.financials) / 6
    );

    return {
      id: this.generateId(),
      startupId: 'current',
      content: pitchContent,
      scores,
      feedback: {
        strengths: [
          'Clear problem identification',
          'Strong market opportunity',
          'Compelling value proposition',
          'Realistic financial projections'
        ],
        weaknesses: [
          'Competition analysis could be deeper',
          'Go-to-market strategy needs refinement',
          'Team section could highlight more experience',
          'Risk mitigation strategies unclear'
        ],
        suggestions: [
          'Add more customer validation data',
          'Include competitive differentiation matrix',
          'Strengthen team credentials section',
          'Add detailed financial breakdown',
          'Include customer testimonials or LOIs'
        ]
      },
      createdAt: new Date().toISOString()
    };
  }

  async getChatResponse(message: string, context?: any): Promise<AIResponse> {
    await this.simulateDelay();

    const messageType = this.detectMessageType(message);
    const template = this.getRandomTemplate(messageType);

    let response = '';

    switch (messageType) {
      case 'ideation':
        response = await this.generateIdeationResponse(message);
        break;
      case 'validation':
        response = await this.generateValidationResponse(message);
        break;
      case 'roadmap':
        response = await this.generateRoadmapResponse(message);
        break;
      case 'pitch':
        response = await this.generatePitchResponse(message);
        break;
      default:
        response = await this.generateGeneralResponse(message);
    }

    return {
      content: response,
      confidence: 0.8 + Math.random() * 0.15,
      sources: ['AI Knowledge Base', 'Startup Database', 'Market Intelligence']
    };
  }

  private detectMessageType(message: string): keyof typeof this.responseTemplates {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('idea') || lowerMessage.includes('concept') || lowerMessage.includes('startup')) {
      return 'ideation';
    }
    if (lowerMessage.includes('validate') || lowerMessage.includes('market') || lowerMessage.includes('viable')) {
      return 'validation';
    }
    if (lowerMessage.includes('roadmap') || lowerMessage.includes('plan') || lowerMessage.includes('timeline')) {
      return 'roadmap';
    }
    if (lowerMessage.includes('pitch') || lowerMessage.includes('investor') || lowerMessage.includes('funding')) {
      return 'pitch';
    }
    
    return 'ideation'; // default
  }

  private async generateIdeationResponse(message: string): Promise<string> {
    return `${this.getRandomTemplate('ideation')}

I can help you explore this idea further. Here are some key areas we should focus on:

**🎯 Target Market Analysis**
- Who exactly would use this?
- What's their current pain point?
- How big is this market?

**💡 Unique Value Proposition**
- What makes this different?
- Why would customers choose you?
- What's your competitive advantage?

**🛠 Technical Feasibility**
- What technology stack would you need?
- Are there any technical challenges?
- What's the development timeline?

**💰 Business Model**
- How would you monetize this?
- What's the pricing strategy?
- What are the unit economics?

Would you like me to dive deeper into any of these areas? I can also help you create a validation plan or generate a preliminary roadmap.`;
  }

  private async generateValidationResponse(message: string): Promise<string> {
    return `${this.getRandomTemplate('validation')}

**Market Validation Checklist:**
✅ Problem-Solution Fit
- Conduct customer interviews
- Survey target market
- Analyze existing solutions

✅ Market Size Assessment
- Total Addressable Market (TAM)
- Serviceable Addressable Market (SAM)
- Serviceable Obtainable Market (SOM)

✅ Competitive Analysis
- Direct competitors
- Indirect competitors
- Competitive advantages

✅ Customer Validation
- Landing page tests
- Pre-orders or LOIs
- Beta user feedback

**Recommended Next Steps:**
1. Create customer interview script
2. Build simple landing page
3. Run targeted ads to test demand
4. Analyze competitor pricing
5. Calculate unit economics

I can help you create detailed validation experiments for each of these areas. What would you like to start with?`;
  }

  private async generateRoadmapResponse(message: string): Promise<string> {
    return `${this.getRandomTemplate('roadmap')}

**Phase 1: Foundation (Months 1-2)**
- Market research and validation
- Legal entity setup
- Initial team formation
- MVP specification

**Phase 2: Development (Months 3-4)**
- MVP development
- Beta testing program
- Customer feedback integration
- Initial marketing strategy

**Phase 3: Launch (Months 5-6)**
- Product launch
- Customer acquisition
- Funding preparation
- Team scaling

**Phase 4: Growth (Months 7-12)**
- Scale customer base
- Product iteration
- Series A preparation
- Market expansion

Each phase has specific milestones and success metrics. Would you like me to break down any particular phase in more detail?`;
  }

  private async generatePitchResponse(message: string): Promise<string> {
    return `${this.getRandomTemplate('pitch')}

**Essential Pitch Deck Elements:**

1. **Problem** - Clear, relatable pain point
2. **Solution** - Your unique approach
3. **Market** - Size and opportunity
4. **Product** - Demo or screenshots
5. **Traction** - Growth metrics
6. **Business Model** - Revenue strategy
7. **Competition** - Competitive landscape
8. **Team** - Why you'll win
9. **Financials** - Projections and unit economics
10. **Funding** - Ask and use of funds

**Investor Perspective Tips:**
- Lead with the problem, not the solution
- Show, don't just tell
- Include social proof and validation
- Be realistic about market size
- Demonstrate clear path to profitability

Would you like me to review a specific section of your pitch or help you develop any of these elements?`;
  }

  private async generateGeneralResponse(message: string): Promise<string> {
    const responses = [
      `Great question! Let me help you think through this systematically.`,
      `I understand what you're looking for. Here's my perspective:`,
      `That's an important consideration for any startup. Let me break it down:`,
      `I can definitely help with that. Here's what I recommend:`
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return `${randomResponse}

Based on my analysis of successful startups, here are the key factors to consider:

**Strategic Approach:**
- Focus on customer needs first
- Validate assumptions early and often
- Build incrementally and iterate
- Measure what matters

**Execution Excellence:**
- Set clear milestones
- Track key metrics
- Stay close to customers
- Adapt quickly to feedback

**Growth Mindset:**
- Think scalable from day one
- Build strong team culture
- Maintain product quality
- Plan for sustainable growth

Is there a specific aspect of your startup journey you'd like to explore further? I'm here to help with ideation, validation, roadmapping, or any other challenges you're facing.`;
  }

  getMentors(): Mentor[] {
    return this.mentors;
  }

  async getMentorAdvice(mentorId: string, question: string): Promise<AIResponse> {
    await this.simulateDelay(1000, 2500);

    const mentor = this.mentors.find(m => m.id === mentorId);
    if (!mentor) {
      throw new Error('Mentor not found');
    }

    const advice = `Hi! ${mentor.name} here. Based on my experience in ${mentor.expertise.join(', ')}, here's my advice:

${question.toLowerCase().includes('funding') ? 
  `**Fundraising Insights:**
  - Investors invest in people first, ideas second
  - Traction speaks louder than projections
  - Know your numbers inside and out
  - Build relationships before you need them
  
  In my experience raising $200M+, the key is demonstrating clear product-market fit and a path to scalable growth.` :
  
  question.toLowerCase().includes('product') ?
  `**Product Development Wisdom:**
  - Start with the customer problem, not the solution
  - Build the minimum viable product first
  - Iterate based on real user feedback
  - Focus on core value proposition
  
  From building multiple successful products, I've learned that simplicity and user focus always win.` :
  
  `**Startup Strategy:**
  - Validate early and often
  - Focus on one thing and do it exceptionally well
  - Build a strong team culture from day one
  - Stay close to your customers
  
  The most successful founders I've worked with are obsessed with solving real problems for real people.`
}

Feel free to ask me more specific questions about your situation. I'm here to help!`;

    return {
      content: advice,
      confidence: 0.9,
      sources: [`${mentor.name}'s Experience`, 'Industry Best Practices']
    };
  }
}

export const offlineAI = new OfflineAI();