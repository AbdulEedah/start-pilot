/**
 * Offline AI System
 * Simulates AI responses for all platform features
 */

import { ChatMessage, StartupIdea, RoadmapItem, PitchAnalysis } from './offline-storage';
import { getSectorDetails, getStoredSector } from './sector-utils';

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
  private responseTemplates = {
    ideation: [
      "That's an impressive concept! Let me help you refine it further for your sector.",
      "I can see massive potential in this idea. Here are key considerations tailored to your industry:",
      "This aligns perfectly with modern market trends. Let's analyze the opportunity:",
      "Great strategic thinking! Let's validate this concept step by step."
    ],
    validation: [
      "Based on current industry analysis and sector metrics, here's what I found:",
      "The validation results show promising indicators for your target market:",
      "Deep-dive market research reveals several key insights:",
      "Here's my comprehensive assessment of your startup's viability:"
    ],
    roadmap: [
      "I've created a customized execution roadmap for your startup:",
      "Here's your step-by-step path to launch and scale:",
      "Based on your target market, here's the recommended timeline:",
      "Let's break down your journey into high-impact actionable milestones:"
    ],
    pitch: [
      "I've analyzed your pitch deck structure for your sector. Here's my feedback:",
      "Your narrative shows strong potential. Here are areas to optimize:",
      "From an investor's perspective in this industry, here are key insights:",
      "Here's how to make your value proposition irresistibly compelling:"
    ]
  };

  private mentors: Mentor[] = [
    {
      id: 'mentor_1',
      name: 'Sarah Chen',
      avatar: '/mentors/sarah.jpg',
      expertise: ['Technology', 'Product Management', 'Growth Hacking'],
      bio: 'Former VP of Product at Stripe, built 3 successful tech companies',
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

  async validateIdea(idea: string, sectorId: string): Promise<ValidationResult> {
    await this.simulateDelay(1200, 2200);

    const sectorDetails = getSectorDetails(sectorId || getStoredSector());
    const baseScore = 72 + Math.floor(Math.random() * 20);

    return {
      score: baseScore,
      marketSize: sectorDetails.marketSize,
      competition: sectorDetails.competitors,
      strengths: [
        `Strong tailwinds in ${sectorDetails.name}`,
        `Clear target audience (${sectorDetails.targetAudience})`,
        `High-impact key metrics focus: ${sectorDetails.keyMetrics[0]}`,
        `Scalable business model opportunity`
      ],
      weaknesses: [
        `Competitive pressure from established players like ${sectorDetails.competitors.slice(0, 2).join(' and ')}`,
        `Industry-specific compliance & regulatory hurdles`,
        `Customer acquisition efficiency in early phases`,
        `Demonstrating rapid payback velocity`
      ],
      recommendations: [
        `Focus on your unique value proposition vs ${sectorDetails.competitors[0] || 'incumbents'}`,
        `Build an early pilot program around ${sectorDetails.keyMetrics[0]}`,
        `Validate customer willingness-to-pay early`,
        `Follow the recommended ${sectorDetails.name} launch roadmap`
      ]
    };
  }

  async generateRoadmap(idea: StartupIdea): Promise<RoadmapGeneration> {
    await this.simulateDelay(1500, 2500);

    const sectorDetails = getSectorDetails(idea.sector || getStoredSector());

    const baseItems: RoadmapItem[] = sectorDetails.sampleRoadmap.map((item, idx) => ({
      id: this.generateId(),
      title: item.title,
      description: item.description,
      category: item.category,
      priority: item.priority,
      timeframe: item.timeframe,
      status: idx === 0 ? 'in-progress' : 'pending',
      dependencies: idx > 0 ? [sectorDetails.sampleRoadmap[idx - 1].title] : []
    }));

    return {
      items: baseItems,
      timeline: '6-8 months to commercial scale',
      milestones: [
        `Month 1: Initial ${sectorDetails.name} pilot setup & architecture`,
        `Month 3: MVP completion & compliance verification`,
        `Month 5: Beta launch with target audience (${sectorDetails.targetAudience})`,
        `Month 7: Commercial rollout & key metric tracking (${sectorDetails.keyMetrics[0]})`,
        `Month 9: Funding round & market expansion`
      ]
    };
  }

  async analyzePitch(pitchContent: string): Promise<PitchAnalysis> {
    await this.simulateDelay(2000, 3500);

    const activeSector = getSectorDetails();
    const generateScore = () => Math.round(70 + Math.random() * 25);

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
          `Clear positioning in the ${activeSector.name} sector`,
          `Addressable market size of ${activeSector.marketSize} highlighted`,
          `Strong awareness of target customer segment (${activeSector.targetAudience})`,
          `Solid grasp of core unit metrics like ${activeSector.keyMetrics[0]}`
        ],
        weaknesses: [
          `Competitive differentiation against ${activeSector.competitors[0]} could be sharper`,
          `Go-to-market timeline needs regulatory/compliance milestones`,
          `Highlight more domain expertise in ${activeSector.name}`,
          `Financial projections should break down CAC payback period`
        ],
        suggestions: [
          `Emphasize why incumbent solutions like ${activeSector.competitors.slice(0, 2).join(', ')} fail`,
          `Include pilot metrics focused on ${activeSector.keyMetrics.join(' and ')}`,
          `Add customer LOIs or pilot partner logos to traction slide`,
          `Detail your capital efficiency and 18-month runway plan`
        ]
      },
      createdAt: new Date().toISOString()
    };
  }

  async getChatResponse(message: string, context?: any): Promise<AIResponse> {
    await this.simulateDelay(800, 1600);

    const sectorId = context?.sector || getStoredSector();
    const sectorDetails = getSectorDetails(sectorId);
    const messageType = this.detectMessageType(message);

    let response = '';

    switch (messageType) {
      case 'ideation':
        response = await this.generateIdeationResponse(message, sectorDetails);
        break;
      case 'validation':
        response = await this.generateValidationResponse(message, sectorDetails);
        break;
      case 'roadmap':
        response = await this.generateRoadmapResponse(message, sectorDetails);
        break;
      case 'pitch':
        response = await this.generatePitchResponse(message, sectorDetails);
        break;
      default:
        response = await this.generateGeneralResponse(message, sectorDetails);
    }

    return {
      content: response,
      confidence: 0.88 + Math.random() * 0.1,
      sources: [`${sectorDetails.name} Intelligence`, 'Market Research Database', 'Start Pilot AI Engine']
    };
  }

  private detectMessageType(message: string): keyof typeof this.responseTemplates {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('idea') || lowerMessage.includes('concept') || lowerMessage.includes('startup') || lowerMessage.includes('build')) {
      return 'ideation';
    }
    if (lowerMessage.includes('validate') || lowerMessage.includes('market') || lowerMessage.includes('viable') || lowerMessage.includes('competitor')) {
      return 'validation';
    }
    if (lowerMessage.includes('roadmap') || lowerMessage.includes('plan') || lowerMessage.includes('timeline') || lowerMessage.includes('milestone')) {
      return 'roadmap';
    }
    if (lowerMessage.includes('pitch') || lowerMessage.includes('investor') || lowerMessage.includes('funding') || lowerMessage.includes('deck')) {
      return 'pitch';
    }
    
    return 'ideation';
  }

  private async generateIdeationResponse(message: string, sector: ReturnType<typeof getSectorDetails>): Promise<string> {
    return `${this.getRandomTemplate('ideation')}

**Sector Focus: ${sector.name}**

I've tailored my analysis for **${sector.name}** (Total Addressable Market: **${sector.marketSize}**):

**🎯 Target Customer & Segment**
- **Primary Audience:** ${sector.targetAudience}
- **Default Strategic Concept:** *${sector.defaultIdea.title}* — ${sector.defaultIdea.description}

**💡 Key Metrics To Track**
${sector.keyMetrics.map(m => `- ${m}`).join('\n')}

**🚀 Industry Landscape**
- Key Competitors to Note: **${sector.competitors.join(', ')}**
- Core Competitive Moat: Deep domain integration and metric velocity.

Would you like me to generate a tailored validation plan or outline a launch roadmap for your ${sector.name} venture?`;
  }

  private async generateValidationResponse(message: string, sector: ReturnType<typeof getSectorDetails>): Promise<string> {
    return `${this.getRandomTemplate('validation')}

**Validation Blueprint for ${sector.name}:**

✅ **Market Opportunity & Size**
- **TAM:** ${sector.marketSize}
- **Primary Buyers:** ${sector.targetAudience}

✅ **Competitive Matrix**
- Key Benchmarks: **${sector.competitors.join(', ')}**
- Your Strategic Edge: Focus on ${sector.keyMetrics[0]} and lower total cost of ownership.

✅ **High-Priority Metrics for Investors**
${sector.keyMetrics.map(m => `- ${m}`).join('\n')}

**Recommended Action Steps:**
1. Execute pilot study with target buyers (${sector.targetAudience}).
2. Benchmark your prototype performance against ${sector.competitors[0] || 'incumbents'}.
3. Create customer validation deck focused on ${sector.keyMetrics[0]}.

What specific element of this ${sector.name} validation strategy should we refine first?`;
  }

  private async generateRoadmapResponse(message: string, sector: ReturnType<typeof getSectorDetails>): Promise<string> {
    return `${this.getRandomTemplate('roadmap')}

**Execution Milestones for ${sector.name}:**

${sector.sampleRoadmap.map((item, i) => `**Phase ${i + 1}: ${item.title} (${item.timeframe})**\n- ${item.description}\n- Focus: ${item.category.toUpperCase()} [${item.priority.toUpperCase()}]`).join('\n\n')}

**Target Output:** Commercial readiness in 6-8 months targeting **${sector.targetAudience}**.

Would you like to customize any of these milestone timeframes or assign priorities?`;
  }

  private async generatePitchResponse(message: string, sector: ReturnType<typeof getSectorDetails>): Promise<string> {
    return `${this.getRandomTemplate('pitch')}

**Essential Pitch Deck Framework for ${sector.name}:**

1. **Problem Statement:** Quantify the pain experienced by ${sector.targetAudience}.
2. **Solution:** Present your unique innovation.
3. **Market Opportunity:** Addressable market of ${sector.marketSize}.
4. **Key Traction Metrics:** Highlight ${sector.keyMetrics.join(', ')}.
5. **Competitive Advantage:** Direct comparison against ${sector.competitors.join(', ')}.
6. **Financial Projections:** Clear path to revenue growth and scalable unit economics.

**Sector Pro-Tips for ${sector.name}:**
${sector.pitchTips.map(t => `- **${t.title}:** ${t.content} (*${t.proTip}*)`).join('\n')}

Would you like me to review your pitch script or structure your investor presentation?`;
  }

  private async generateGeneralResponse(message: string, sector: ReturnType<typeof getSectorDetails>): Promise<string> {
    return `I'm analyzing your request within the context of **${sector.name}**.

**Industry Perspective:**
- **Target Audience:** ${sector.targetAudience}
- **Market Size:** ${sector.marketSize}
- **Primary Metrics:** ${sector.keyMetrics.slice(0, 2).join(' & ')}

**Strategic Recommendations:**
- Validate your value proposition against ${sector.competitors[0]}
- Focus initial effort on driving high ${sector.keyMetrics[0]}
- Execute against your sector-tailored roadmap

How can I assist you further with your ${sector.name} startup today?`;
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

    const sectorDetails = getSectorDetails();

    const advice = `Hi! ${mentor.name} here. Based on my experience in ${mentor.expertise.join(', ')} and our focus on ${sectorDetails.name}, here's my advice:

${question.toLowerCase().includes('funding') ? 
  `**Fundraising Insights:**
  - In ${sectorDetails.name}, investors look closely at ${sectorDetails.keyMetrics[0]}.
  - Traction speaks louder than projections. Show real buyer engagement from ${sectorDetails.targetAudience}.
  - Position clearly against incumbents like ${sectorDetails.competitors[0]}.
  - Know your unit economics inside out.` :
  
  `**Execution & Growth:**
  - Start with the core customer problem for ${sectorDetails.targetAudience}.
  - Build your MVP around ${sectorDetails.keyMetrics[0]}.
  - Move fast to establish your competitive moat against ${sectorDetails.competitors.slice(0, 2).join(' and ')}.
  - Benchmark performance regularly.`
}

Feel free to ask me more specific questions about your venture. I'm here to help!`;

    return {
      content: advice,
      confidence: 0.9,
      sources: [`${mentor.name}'s Experience`, 'Industry Best Practices']
    };
  }
}

export const offlineAI = new OfflineAI();