/**
 * Sector Utilities & Configuration System
 * Handles sector definitions, sector-specific content, mock data, and AI copilot response mappings
 */

export interface SectorDefinition {
  id: string;
  name: string;
  shortDesc: string;
  description: string;
  badgeColor: string;
  bgGradient: string;
  accentColor: string;
  marketSize: string;
  targetAudience: string;
  keyMetrics: string[];
  competitors: string[];
  copilotGreeting: string;
  quickPrompts: string[];
  defaultIdea: {
    title: string;
    description: string;
  };
  sampleRoadmap: Array<{
    title: string;
    description: string;
    category: 'product' | 'marketing' | 'funding' | 'team' | 'legal';
    priority: 'low' | 'medium' | 'high' | 'critical';
    timeframe: string;
  }>;
  recommendedBooks: Array<{
    title: string;
    author: string;
    category: string;
    desc: string;
  }>;
  recommendedTools: Array<{
    name: string;
    category: string;
    desc: string;
    link: string;
  }>;
  pitchTips: Array<{
    title: string;
    content: string;
    proTip: string;
  }>;
}

export const SECTORS: Record<string, SectorDefinition> = {
  technology: {
    id: "technology",
    name: "Technology & SaaS",
    shortDesc: "Software, SaaS, Enterprise & Cloud Tools",
    description: "B2B and B2C software solutions, cloud platforms, productivity suites, and dev tools.",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    bgGradient: "from-blue-500/10 to-indigo-500/10",
    accentColor: "#3b82f6",
    marketSize: "$650B+",
    targetAudience: "Engineering teams, IT leaders, SMB founders, enterprise ops",
    keyMetrics: ["MRR / ARR Growth", "Net Revenue Retention (NRR)", "CAC Payback Period", "LTV / CAC Ratio"],
    competitors: ["Slack", "Notion", "Airtable", "Linear", "Datadog"],
    copilotGreeting: "Hello! I'm your Start Pilot AI Copilot, tuned for Technology & SaaS innovation. Let's analyze your software architecture, subscription pricing model, and go-to-market funnel. What problem are you solving?",
    quickPrompts: [
      "Analyze B2B SaaS pricing model & tiering",
      "Calculate CAC payback period & target LTV",
      "Draft product validation questionnaire for developers",
      "Structure developer documentation & API onboarding"
    ],
    defaultIdea: {
      title: "DevPulse - Automated Incident & Observability Copilot",
      description: "AI-driven platform predicting server outages and auto-remediating DevOps pipelines before users notice downtime."
    },
    sampleRoadmap: [
      { title: "API Architecture & Security Audit", description: "Design scalable REST/GraphQL endpoints with Auth0 and rate-limiting", category: "product", priority: "critical", timeframe: "Weeks 1-3" },
      { title: "SaaS Subscription Engine Integration", description: "Set up Stripe billing, tier usage limits, and seat management", category: "product", priority: "high", timeframe: "Weeks 4-6" },
      { title: "SOC2 Compliance Readiness", description: "Establish data encryption policies and security compliance frameworks", category: "legal", priority: "high", timeframe: "Weeks 5-8" },
      { title: "Developer Beta Program Launch", description: "Onboard 50 founding engineering leads for feedback & testimonials", category: "marketing", priority: "high", timeframe: "Weeks 7-10" }
    ],
    recommendedBooks: [
      { title: "The Lean Startup", author: "Eric Ries", category: "SaaS Strategy", desc: "How constant innovation and rapid iteration build market-defining software companies." },
      { title: "Predictable Revenue", author: "Aaron Ross", category: "B2B Sales", desc: "The outbound sales playbook that scaled Salesforce to $100M+ ARR." }
    ],
    recommendedTools: [
      { name: "Stripe Billing", category: "Payments", desc: "Subscription management and recurring payment infrastructure.", link: "https://stripe.com" },
      { name: "Postman", category: "API Development", desc: "Collaborative API design, testing, and documentation platform.", link: "https://postman.com" }
    ],
    pitchTips: [
      { title: "Highlight Net Revenue Retention", content: "Investors look for NRR > 110%. Demonstrate how customer expansion outweighs churn over time.", proTip: "Show your expansion triggers early." },
      { title: "Quantify Time-to-Value (TTV)", content: "Explain how fast a newly signed engineering team derives value from your app.", proTip: "Aim for under 15 minutes setup time." }
    ]
  },
  climate: {
    id: "climate",
    name: "Climate & Sustainability",
    shortDesc: "Renewables, Carbon Removal & Cleantech",
    description: "Solutions for carbon accounting, clean energy generation, circular economy, and ESG compliance.",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    bgGradient: "from-emerald-500/10 to-teal-500/10",
    accentColor: "#10b981",
    marketSize: "$1.2T+",
    targetAudience: "Enterprise ESG officers, sustainability managers, clean energy providers, carbon offset buyers",
    keyMetrics: ["Tonnes CO2e Avoided/Removed", "Levelized Cost of Energy (LCOE)", "Corporate Offtake Volume", "ESG Rating Score"],
    competitors: ["Watershed", "Climeworks", "Northvolt", "Persefoni", "Form Energy"],
    copilotGreeting: "Welcome! I'm your Start Pilot AI Copilot, specialized in ClimateTech & Sustainability. I'm ready to evaluate your carbon reduction methodology, lifecycle assessment (LCA), and ESG value proposition. What green transition problem are you solving?",
    quickPrompts: [
      "Calculate CO2 offset methodology & carbon credit pricing",
      "Draft ESG compliance strategy for Scope 1, 2 & 3 emissions",
      "Model levelized cost of energy (LCOE) vs fossil fuels",
      "Structure green bond & climate grant funding proposal"
    ],
    defaultIdea: {
      title: "CarbonTrace - Industrial Scope 3 Emissions AI",
      description: "Real-time supply chain carbon accounting software analyzing corporate procurement logs to auto-generate ESG disclosure reports."
    },
    sampleRoadmap: [
      { title: "Lifecycle Assessment (LCA) Validation", description: "Conduct ISO 14040 carbon footprint lifecycle assessment with independent auditors", category: "product", priority: "critical", timeframe: "Weeks 1-4" },
      { title: "Scope 1-3 Data Connector Suite", description: "Build automated ingestion pipelines for ERP and utility meter data", category: "product", priority: "high", timeframe: "Weeks 5-8" },
      { title: "Carbon Credit Registry Onboarding", description: "Submit carbon removal methodology to Verra / Gold Standard registries", category: "legal", priority: "high", timeframe: "Weeks 6-12" },
      { title: "Enterprise Pilot with ESG Leaders", description: "Sign pilot agreements with 3 Fortune 500 sustainability heads", category: "marketing", priority: "critical", timeframe: "Weeks 9-14" }
    ],
    recommendedBooks: [
      { title: "How to Avoid a Climate Disaster", author: "Bill Gates", category: "Climate Economics", desc: "A practical guide on eliminating green premiums and reaching net-zero carbon." },
      { title: "Speed & Scale", author: "John Doerr", category: "Climate Action", desc: "OKRs for solving the global climate crisis by 2050." }
    ],
    recommendedTools: [
      { name: "Watershed API", category: "Carbon Accounting", desc: "Enterprise emissions calculation and climate reporting tool.", link: "https://watershed.com" },
      { name: "Carbon Plan", category: "Open Data", desc: "Open-source data and scientific benchmarks for climate solutions.", link: "https://carbonplan.org" }
    ],
    pitchTips: [
      { title: "Address the Green Premium", content: "Investors care deeply about cost parity. Explain how your technology scales to become cheaper than fossil incumbents.", proTip: "Highlight unit cost reduction curves." },
      { title: "Verify Regulatory Alignment", content: "Show how EU CSRD and SEC climate disclosure rules drive urgent customer demand for your product.", proTip: "Regulatory tailwinds are your fastest sales accelerator." }
    ]
  },
  finance: {
    id: "finance",
    name: "Finance & FinTech",
    shortDesc: "Banking, Payments, Crypto & InsurTech",
    description: "Next-generation banking tools, payment gateways, wealth management, open banking, and financial infrastructure.",
    badgeColor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    bgGradient: "from-cyan-500/10 to-blue-500/10",
    accentColor: "#06b6d4",
    marketSize: "$1.5T+",
    targetAudience: "Neobanks, retail investors, corporate CFOs, e-commerce merchants, unbanked demographics",
    keyMetrics: ["Total Payment Volume (TPV)", "Net Interest Margin (NIM)", "User Take Rate (bps)", "Fraud & Chargeback %"],
    competitors: ["Stripe", "Plaid", "Brex", "Revolut", "Chime", "Ramp"],
    copilotGreeting: "Greetings! I'm your Start Pilot AI Copilot, trained on FinTech regulations, Open Banking APIs, and payment economics. Let's optimize your take rate, PCI-DSS compliance, and banking partnership roadmap. What financial service are you building?",
    quickPrompts: [
      "Design PCI-DSS & KYC/AML compliance roadmap",
      "Model transaction fee take-rate vs interchange revenues",
      "Structure banking-as-a-service (BaaS) sponsor partner pitch",
      "Draft fraud prevention & risk management workflow"
    ],
    defaultIdea: {
      title: "FlowLedger - Instant Cross-Border Corporate Settlement",
      description: "Low-cost B2B settlement rail utilizing stablecoins and Open Banking rails to reduce cross-border transfer fees by 85%."
    },
    sampleRoadmap: [
      { title: "Sponsor Bank & BaaS Partnership", description: "Secure FDIC-insured sponsor bank partnership for holding customer deposits", category: "legal", priority: "critical", timeframe: "Weeks 1-6" },
      { title: "KYC/AML & Identity Verification Pipeline", description: "Integrate Persona / Alloy for real-time identity checks and OFAC screening", category: "product", priority: "critical", timeframe: "Weeks 4-8" },
      { title: "Ledger Engine & Core Banking Integration", description: "Build double-entry ledger architecture with real-time balance reconciliation", category: "product", priority: "high", timeframe: "Weeks 7-12" },
      { title: "FinCEN / MSB License Registration", description: "Complete Money Services Business regulatory filings across launch markets", category: "legal", priority: "high", timeframe: "Weeks 8-16" }
    ],
    recommendedBooks: [
      { title: "Bank 4.0", author: "Brett King", category: "FinTech Vision", desc: "Why banking is no longer a place you go, but a digital service you embed." },
      { title: "The Anatomy of the Swipe", author: "Ahmed Siddiqui", category: "Payments", desc: "Understanding the complex architecture behind card payment networks." }
    ],
    recommendedTools: [
      { name: "Plaid", category: "Open Banking", desc: "API connection between financial accounts and software apps.", link: "https://plaid.com" },
      { name: "Persona", category: "Identity & KYC", desc: "Automated identity verification and fraud prevention platform.", link: "https://withpersona.com" }
    ],
    pitchTips: [
      { title: "Clarify Regulatory Strategy", content: "FinTech investors want to know if you're taking balance sheet risk or acting as a software middleware.", proTip: "Highlight your sponsor bank agreements early." },
      { title: "Demonstrate Fraud Protection", content: "Show how your ML risk models keep fraud rates below industry averages (< 0.05% of TPV).", proTip: "Unit economics collapse if fraud isn't capped." }
    ]
  },
  health: {
    id: "health",
    name: "HealthTech & Bio",
    shortDesc: "Telemedicine, Digital Health & MedTech",
    description: "Healthcare delivery tools, remote patient monitoring, biotech research, diagnostics, and wellness apps.",
    badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    bgGradient: "from-rose-500/10 to-pink-500/10",
    accentColor: "#f43f5e",
    marketSize: "$500B+",
    targetAudience: "Hospitals, health insurance providers, clinicians, patients, pharma research teams",
    keyMetrics: ["Clinical Efficacy Score", "Patient Engagement Rate", "Reimbursement CPT Eligibility", "Hospital Pipeline CAC"],
    competitors: ["Teladoc", "Ro", "Devoted Health", "Epic Systems", "Veeva"],
    copilotGreeting: "Hello! I'm your Start Pilot AI Copilot, specialized in HealthTech, HIPAA compliance, and clinical evidence. Let's refine your patient outcomes strategy, FDA pathways, and hospital procurement model. What health innovation are you advancing?",
    quickPrompts: [
      "Outline HIPAA compliance & PHI data encryption requirements",
      "Identify CPT reimbursement codes for digital health interventions",
      "Draft clinical trial pilot protocol & IRB ethics submission",
      "Model B2B2C health plan distribution & per-member-per-month (PMPM) pricing"
    ],
    defaultIdea: {
      title: "PulseCare - Remote Cardio Diagnostics AI",
      description: "FDA-cleared wearable companion app analyzing ECG waveforms in real time to alert cardiologists of early arrhythmia events."
    },
    sampleRoadmap: [
      { title: "HIPAA Data Security Framework", description: "Establish HIPAA-compliant cloud database encryption and BAA agreements", category: "legal", priority: "critical", timeframe: "Weeks 1-4" },
      { title: "Clinical Pilot Study Protocol", description: "Partner with regional university hospital to execute 100-patient feasibility trial", category: "product", priority: "critical", timeframe: "Weeks 5-12" },
      { title: "FDA 510(k) Pre-Submission Filing", description: "Prepare regulatory predicate comparison for FDA medical device clearance", category: "legal", priority: "high", timeframe: "Weeks 8-16" },
      { title: "Health System Pilot Contract", description: "Secure PMPM trial agreement with regional accountable care organization", category: "marketing", priority: "high", timeframe: "Weeks 14-20" }
    ],
    recommendedBooks: [
      { title: "The Creative Destruction of Medicine", author: "Eric Topol", category: "Digital Health", desc: "How wireless health and genomic data are revolutionizing medical delivery." },
      { title: "Remaking American Medicine", author: "Fitzhugh Mullan", category: "Healthcare Systems", desc: "Understanding hospital purchasing behavior and provider incentives." }
    ],
    recommendedTools: [
      { name: "Datavant", category: "Health Data", desc: "De-identified health data connecting ecosystem for research.", link: "https://datavant.com" },
      { name: "Medstack", category: "Compliance", desc: "Built-in HIPAA compliance infrastructure for digital health apps.", link: "https://medstack.co" }
    ],
    pitchTips: [
      { title: "Sell Outcomes, Not Just Features", content: "Clinicians and hospital CFOs buy solutions that reduce readmissions or cut operational costs.", proTip: "Prove dollar savings per patient year." },
      { title: "Show Clear Reimbursement Pathway", content: "Investors look for existing CPT reimbursement codes over out-of-pocket consumer sales.", proTip: "Reimbursement drives massive scale." }
    ]
  },
  agriculture: {
    id: "agriculture",
    name: "Agriculture & Food Systems",
    shortDesc: "AgriTech, Precision Farming & Supply",
    description: "Precision farming tools, autonomous machinery, soil analytics, vertical farming, and sustainable food supply chains.",
    badgeColor: "bg-green-600/10 text-green-600 border-green-600/20",
    bgGradient: "from-green-600/10 to-emerald-600/10",
    accentColor: "#16a34a",
    marketSize: "$350B+",
    targetAudience: "Commercial growers, agronomists, grain traders, food processors, farm equipment distributors",
    keyMetrics: ["Crop Yield Increase %", "Water & Input Savings Rate", "Hectares Under Management", "Farm Hardware Payback"],
    competitors: ["Climate FieldView", "Farmers Business Network", "Monarch Tractor", "Bowery Farming", "Indigo Ag"],
    copilotGreeting: "Welcome! I'm your Start Pilot AI Copilot, dedicated to AgriTech & Food Systems innovation. Let's model crop yield optimization, farm hardware economics, and grower adoption strategies. What agricultural challenge are you solving?",
    quickPrompts: [
      "Draft farmer ROI calculator for precision irrigation equipment",
      "Model seasonal cash flow & equipment leasing terms",
      "Structure grain buyer & cooperative channel partnership agreement",
      "Design satellite & IoT sensor data integration pipeline"
    ],
    defaultIdea: {
      title: "AgriYield AI - Autonomous Crop Health Monitoring",
      description: "Drone imagery and soil sensor platform delivering real-time nitrogen application advice directly to tractor guidance systems."
    },
    sampleRoadmap: [
      { title: "Field Sensor & Drone Data Calibration", description: "Calibrate multispectral sensors across 500 test acres of corn & soybeans", category: "product", priority: "critical", timeframe: "Weeks 1-4" },
      { title: "Agronomic AI Advisory Engine", description: "Train predictive ML models on historical soil condition and weather data", category: "product", priority: "critical", timeframe: "Weeks 5-8" },
      { title: "Grower Co-Op Distribution Pilot", description: "Partner with regional Midwest agricultural cooperative for pilot distribution", category: "marketing", priority: "high", timeframe: "Weeks 7-12" },
      { title: "USDA Grant & Equipment Financing", description: "Apply for USDA REAP technology adoption funding for participating farmers", category: "funding", priority: "medium", timeframe: "Weeks 10-14" }
    ],
    recommendedBooks: [
      { title: "The Future of Food", author: "Seth Goldman", category: "Food Tech", desc: "Insights into sustainable food production and agricultural supply chains." },
      { title: "Precision Agriculture Technology", author: "John Deere Institute", category: "AgriTech", desc: "Engineering and adoption strategies for modern farming automation." }
    ],
    recommendedTools: [
      { name: "Sentinel Hub", category: "Earth Observation", desc: "Satellite data processing API for crop health monitoring.", link: "https://sentinel-hub.com" },
      { name: "AgGateway", category: "Interoperability", desc: "Agricultural data exchange standards for equipment and software.", link: "https://aggateway.org" }
    ],
    pitchTips: [
      { title: "Respect the Crop Seasonality", content: "Agricultural adoption cycles depend on planting and harvest windows. Show you understand farmer timelines.", proTip: "Never launch mid-harvest." },
      { title: "Prove Simple Hardware Reliability", content: "Farmers cannot afford downtime during 14-day planting windows. Show ruggedized hardware durability.", proTip: "Dust and moisture proofing matters most." }
    ]
  },
  manufacturing: {
    id: "manufacturing",
    name: "Manufacturing & Industrial",
    shortDesc: "Smart Factories, Robotics & Industry 4.0",
    description: "Factory automation, predictive maintenance, IoT sensor networks, industrial robotics, and CAD/CAM software.",
    badgeColor: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    bgGradient: "from-orange-500/10 to-amber-500/10",
    accentColor: "#f97316",
    marketSize: "$800B+",
    targetAudience: "Plant managers, VP of Operations, industrial automation engineers, OEM contract manufacturers",
    keyMetrics: ["Overall Equipment Effectiveness (OEE)", "Unplanned Downtime Reduction", "Scrap & Waste Rate", "Pilot Conversion Time"],
    competitors: ["Instrumental", "Tulip Interfaces", "Augury", "Sight Machine", "Path Robotics"],
    copilotGreeting: "Greetings! I'm your Start Pilot AI Copilot, focused on Industry 4.0 & Smart Manufacturing. Let's analyze your Overall Equipment Effectiveness (OEE), edge computing hardware, and factory pilot conversion rate. What manufacturing bottleneck are you addressing?",
    quickPrompts: [
      "Calculate factory downtime cost savings & OEE improvement ROI",
      "Design industrial IoT edge gateway hardware specifications",
      "Draft pilot conversion agreement for tier-1 Automotive manufacturer",
      "Outline ISO 9001 quality management software integration"
    ],
    defaultIdea: {
      title: "VibeGuard - AI Predictive Machine Maintenance",
      description: "Magnetic wireless vibration sensors attached to factory motors predicting bearing failures 3 weeks before breakdown."
    },
    sampleRoadmap: [
      { title: "Industrial Edge Sensor Hardware Specs", description: "Finalize IP67-rated vibration & temperature sensor board design", category: "product", priority: "critical", timeframe: "Weeks 1-5" },
      { title: "MQTT & OPC-UA Protocol Integration", description: "Build compatibility with Siemens, Allen-Bradley, and Schneider PLCs", category: "product", priority: "high", timeframe: "Weeks 6-10" },
      { title: "Plant Floor Pilot Deployment", description: "Deploy 50 sensors across 2 CNC machining plants to capture baseline data", category: "marketing", priority: "critical", timeframe: "Weeks 8-14" },
      { title: "ISO 9001 / CE Marking Certification", description: "Complete electrical safety and industrial electromagnetic compatibility testing", category: "legal", priority: "high", timeframe: "Weeks 12-18" }
    ],
    recommendedBooks: [
      { title: "The Goal", author: "Eliyahu M. Goldratt", category: "Manufacturing Ops", desc: "The classic business novel introducing the Theory of Constraints in factory floors." },
      { title: "Industry 4.0 Playbook", author: "Klaus Schwab", category: "Smart Factories", desc: "Strategies for deploying IoT, robotics, and cyber-physical systems." }
    ],
    recommendedTools: [
      { name: "AWS IoT SiteWise", category: "Industrial IoT", desc: "Collect, organize, and analyze data from industrial equipment.", link: "https://aws.amazon.com/iot-sitewise" },
      { name: "Onshape API", category: "CAD Cloud", desc: "Cloud-native CAD & PDM system for hardware engineering teams.", link: "https://onshape.com" }
    ],
    pitchTips: [
      { title: "Target Unplanned Downtime Costs", content: "Factories lose up to $260k per hour during downtime. Show direct financial impact on the plant manager's bonus.", proTip: "Frame ROI in avoided downtime hours." },
      { title: "Demonstrate Non-Intrusive Installation", content: "Factories will reject solutions requiring weeks of assembly line shutdown. Show 15-minute clamp-on setup.", proTip: "Zero downtime deployment is king." }
    ]
  },
  ai: {
    id: "ai",
    name: "Artificial Intelligence & ML",
    shortDesc: "LLMs, Computer Vision, Agents & Robotics",
    description: "Foundation model fine-tuning, autonomous agent frameworks, computer vision pipelines, and AI developer infrastructure.",
    badgeColor: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    bgGradient: "from-violet-500/10 to-purple-500/10",
    accentColor: "#8b5cf6",
    marketSize: "$900B+",
    targetAudience: "AI engineers, product teams, enterprise transformation heads, autonomous systems builders",
    keyMetrics: ["Token Latency / Throughput", "Model Evaluation Benchmark Score", "Cost per Inference Call", "Dataset Flywheel Speed"],
    competitors: ["OpenAI", "Anthropic", "Scale AI", "LangChain", "Pinecone", "Hugging Face"],
    copilotGreeting: "Hello! I'm your Start Pilot AI Copilot, engineered for AI & Machine Learning innovation. Let's analyze your model latency, RAG architecture, dataset moat, and inference cost optimizations. What AI system are you creating?",
    quickPrompts: [
      "Design RAG pipeline architecture & vector database selection",
      "Calculate LLM inference cost & GPU cluster budget projections",
      "Establish automated model evaluation & hallucination benchmark suite",
      "Draft data privacy & proprietary dataset IP protection strategy"
    ],
    defaultIdea: {
      title: "AgentMesh - Enterprise Multi-Agent Workflow Engine",
      description: "Orchestration platform letting corporate teams deploy specialized AI agents that execute complex multi-step cross-SaaS tasks."
    },
    sampleRoadmap: [
      { title: "Vector DB & Hybrid Search Benchmarking", description: "Evaluate Pinecone vs Qdrant vs pgvector for sub-50ms retrieval latency", category: "product", priority: "critical", timeframe: "Weeks 1-3" },
      { title: "Fine-Tuning Data Pipeline & RLHF Setup", description: "Curate 10k domain-specific synthetic training pairs with human validation", category: "product", priority: "critical", timeframe: "Weeks 4-7" },
      { title: "GPU Cluster & Serverless Inference Optimization", description: "Deploy vLLM / TensorRT-LLM endpoints to reduce token costs by 60%", category: "product", priority: "high", timeframe: "Weeks 6-9" },
      { title: "AI Safety & Hallucination Guardrails Audit", description: "Implement NeMo Guardrails and PII sanitization filters for enterprise deployment", category: "legal", priority: "high", timeframe: "Weeks 8-11" }
    ],
    recommendedBooks: [
      { title: "Designing Machine Learning Systems", author: "Chip Huyen", category: "AI Systems", desc: "An end-to-end guide for building production-ready ML and AI products." },
      { title: "Deep Learning", author: "Ian Goodfellow", category: "Neural Networks", desc: "The definitive textbook on neural network architectures and learning theory." }
    ],
    recommendedTools: [
      { name: "LangChain", category: "Agent Framework", desc: "Framework for developing applications powered by language models.", link: "https://langchain.com" },
      { name: "Pinecone", category: "Vector Database", desc: "Vector database for semantic search and AI memory retention.", link: "https://pinecone.io" }
    ],
    pitchTips: [
      { title: "Defend Your Data Moat", content: "Investors fear thin wrappers around OpenAI APIs. Highlight your proprietary dataset flywheel and specialized fine-tuning.", proTip: "Show why commoditized LLMs can't copy you." },
      { title: "Demonstrate Token Cost Unit Economics", content: "Show how your inference pipeline scales profitably as query volume grows 100x.", proTip: "Include model optimization metrics." }
    ]
  },
  education: {
    id: "education",
    name: "Education & EdTech",
    shortDesc: "EdTech, Upskilling & Campus Ops",
    description: "Adaptive learning platforms, corporate upskilling tools, AI tutors, university management, and bootcamps.",
    badgeColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    bgGradient: "from-indigo-500/10 to-violet-500/10",
    accentColor: "#6366f1",
    marketSize: "$300B+",
    targetAudience: "Students, university administrators, K-12 school districts, corporate L&D leaders",
    keyMetrics: ["Course Completion Rate", "Skill Mastery Velocity", "Student Net Promoter Score", "District / Campus ACV"],
    competitors: ["Duolingo", "Coursera", "Guild Education", "Canvas", "Quizlet"],
    copilotGreeting: "Welcome! I'm your Start Pilot AI Copilot, specialized in EdTech & Educational Innovation. Let's optimize learner engagement, adaptive curriculum design, and school district procurement. What learning solution are you developing?",
    quickPrompts: [
      "Design adaptive AI tutoring prompt strategy & mastery tracking",
      "Draft school district pilot proposal & FERPA compliance documentation",
      "Model B2B corporate L&D seat pricing vs B2C subscription",
      "Build Gamification & student retention reward loops"
    ],
    defaultIdea: {
      title: "SocraticAI - Personal STEM Tutor for K-12",
      description: "Conversational AI tutor that guides students through math and physics problems using step-by-step Socratic questioning instead of giving answers."
    },
    sampleRoadmap: [
      { title: "Pedagogical AI Prompt Engineering", description: "Design Socratic dialog models preventing direct answer output while encouraging reasoning", category: "product", priority: "critical", timeframe: "Weeks 1-3" },
      { title: "FERPA & COPPA Privacy Audit", description: "Audit data retention policies to strictly comply with child online privacy protection laws", category: "legal", priority: "critical", timeframe: "Weeks 4-6" },
      { title: "School District Beta Pilot Program", description: "Sign pilot agreements with 5 public middle schools across 2 districts", category: "marketing", priority: "high", timeframe: "Weeks 7-12" },
      { title: "LTI 1.3 LMS Connector", description: "Build Canvas & Google Classroom single sign-on and gradebook synchronization", category: "product", priority: "high", timeframe: "Weeks 10-14" }
    ],
    recommendedBooks: [
      { title: "Make It Stick", author: "Peter C. Brown", category: "Learning Science", desc: "The science of successful learning, retention, and memory retrieval." },
      { title: "The One World Schoolhouse", author: "Sal Khan", category: "EdTech Vision", desc: "Reimagining education through personalized, mastery-based learning." }
    ],
    recommendedTools: [
      { name: "Canvas LTI API", category: "LMS Integration", desc: "Integrate educational apps seamlessly into Canvas LMS.", link: "https://instructure.com" },
      { name: "H5P", category: "Interactive Content", desc: "Create, share, and reuse interactive HTML5 content.", link: "https://h5p.org" }
    ],
    pitchTips: [
      { title: "Prove Efficacy & Completion Rates", content: "Most online courses suffer from < 10% completion rates. Show how your platform keeps learners engaged to completion.", proTip: "Highlight learner retention graphs." },
      { title: "Understand Sales Cycles", content: "School district buying decisions take 9-12 months aligned with fiscal years (July 1). Factor this into runway.", proTip: "Sell to private schools for faster validation." }
    ]
  },
  logistics: {
    id: "logistics",
    name: "Logistics & Supply Chain",
    shortDesc: "Freight, Warehousing & Fleet Ops",
    description: "Route optimization, warehouse robotics, freight dispatching, last-mile delivery, and supply chain visibility.",
    badgeColor: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    bgGradient: "from-slate-500/10 to-gray-500/10",
    accentColor: "#64748b",
    marketSize: "$1.1T+",
    targetAudience: "Fleet operators, 3PL logistics providers, warehouse managers, e-commerce fulfillment teams",
    keyMetrics: ["On-Time In-Full Delivery (OTIF)", "Fuel Cost per Mile Saved", "Warehouse Picking Rate (UPH)", "Fleet Utilization %"],
    competitors: ["Flexport", "Samsara", "Project44", "KeepTruckin", "Locus Robotics"],
    copilotGreeting: "Greetings! I'm your Start Pilot AI Copilot, tuned for Logistics & Supply Chain Operations. Let's analyze your route optimization algorithms, fleet telematics integrations, and OTIF delivery metrics. What logistics bottleneck are you solving?",
    quickPrompts: [
      "Calculate fleet fuel savings & route optimization ROI",
      "Design ELD telematics data ingestion & ELD compliance workflow",
      "Draft 3PL warehouse management system (WMS) API spec",
      "Model last-mile delivery cost per package optimization"
    ],
    defaultIdea: {
      title: "RouteWise - Autonomous Dynamic Freight Dispatch",
      description: "AI freight matching platform predicting empty backhaul miles and auto-booking optimal loads for regional trucking fleets."
    },
    sampleRoadmap: [
      { title: "Route Optimization Engine v1", description: "Implement vehicle routing problem (VRP) algorithms handling traffic & window constraints", category: "product", priority: "critical", timeframe: "Weeks 1-4" },
      { title: "ELD & Telematics API Connectors", description: "Integrate Samsara & Geotab APIs for real-time GPS vehicle tracking", category: "product", priority: "high", timeframe: "Weeks 5-8" },
      { title: "Regional 3PL Carrier Pilot", description: "Deploy with 3 mid-sized logistics fleets managing 150 trucks combined", category: "marketing", priority: "critical", timeframe: "Weeks 7-12" },
      { title: "DOT & FMCSA Compliance Verification", description: "Verify automated hours-of-service compliance reporting for driver safety", category: "legal", priority: "high", timeframe: "Weeks 9-13" }
    ],
    recommendedBooks: [
      { title: "The Box", author: "Marc Levinson", category: "Logistics History", desc: "How the shipping container made the world smaller and the world economy bigger." },
      { title: "Supply Chain Management", author: "Sunil Chopra", category: "Supply Chain", desc: "Strategy, planning, and operation principles for global logistics." }
    ],
    recommendedTools: [
      { name: "Samsara API", category: "Telematics", desc: "Connected operations cloud for fleet tracking and driver safety.", link: "https://samsara.com" },
      { name: "Mapbox Optimization", category: "Routing API", desc: "Turn-by-turn routing and fleet dispatch optimization APIs.", link: "https://mapbox.com" }
    ],
    pitchTips: [
      { title: "Highlight Fuel & Mile Reduction", content: "Fuel accounts for 30%+ of fleet operating costs. Show how saving 8% on miles directly doubles carrier net margins.", proTip: "Margin multiplier is a compelling VC metric." },
      { title: "Show Real-Time Visibility", content: "Shippers demand minute-by-minute tracking. Emphasize your GPS sensor and telematics accuracy.", proTip: "Visibility reduces customer support calls by 70%." }
    ]
  },
  fashion: {
    id: "fashion",
    name: "Fashion & E-Commerce",
    shortDesc: "Apparel, Digital Fitting & Retail",
    description: "Virtual try-on technology, sustainable apparel production, DTC brand platforms, inventory forecasting, and circular fashion.",
    badgeColor: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    bgGradient: "from-pink-500/10 to-rose-500/10",
    accentColor: "#ec4899",
    marketSize: "$450B+",
    targetAudience: "Fashion brands, e-commerce shoppers, apparel manufacturers, boutique retailers",
    keyMetrics: ["Return Rate % (Target < 15%)", "Average Order Value (AOV)", "Customer Acquisition Cost (CAC)", "Inventory Turn Rate"],
    competitors: ["Farfetch", "Stitch Fix", "Fit Analytics", "Shopify", "ThredUp"],
    copilotGreeting: "Hello! I'm your Start Pilot AI Copilot, specialized in Fashion & E-Commerce innovation. Let's analyze your virtual fitting technology, return rate reduction, and DTC acquisition strategy. What fashion concept are you building?",
    quickPrompts: [
      "Design 3D virtual try-on & sizing recommendation strategy",
      "Model DTC e-commerce unit economics (AOV, ROAS & LTV)",
      "Draft sustainable fabric sourcing & supplier code of conduct",
      "Structure influencer affiliate & viral social marketing launch"
    ],
    defaultIdea: {
      title: "FitFit AI - Smartphone 3D Body Scanning & Sizing",
      description: "Computer vision plugin for apparel Shopify stores that recommends exact sizes using 2 photos, cutting sizing returns by 60%."
    },
    sampleRoadmap: [
      { title: "3D Body Mesh Computer Vision Model", description: "Train neural body mesh reconstruction algorithm on 5,000 anonymized scan samples", category: "product", priority: "critical", timeframe: "Weeks 1-4" },
      { title: "Shopify & WooCommerce App Integration", description: "Build 1-click checkout widget showing size recommendations on product pages", category: "product", priority: "high", timeframe: "Weeks 5-8" },
      { title: "DTC Brand Beta Launch", description: "Partner with 10 emerging apparel brands to measure return rate reductions", category: "marketing", priority: "critical", timeframe: "Weeks 7-11" },
      { title: "Garment Measurement Database", description: "Digitize 50,000 brand garment tech packs for instant sizing mapping", category: "product", priority: "high", timeframe: "Weeks 9-14" }
    ],
    recommendedBooks: [
      { title: "The End of Fashion", author: "Teri Agins", category: "Fashion Business", desc: "How marketing and tech replaced haute couture to drive modern apparel." },
      { title: "Shoe Dog", author: "Phil Knight", category: "Founder Memoir", desc: "The inspiring story of building Nike from a trunk of a car into a global icon." }
    ],
    recommendedTools: [
      { name: "Shopify Admin API", category: "E-Commerce", desc: "API for building storefront extensions and checkout applications.", link: "https://shopify.dev" },
      { name: "CLO 3D", category: "Digital Apparel", desc: "3D garment simulation software for digital fashion design.", link: "https://clo3d.com" }
    ],
    pitchTips: [
      { title: "Attack the Return Rate Crisis", content: "Online fashion returns cost retailers $38B annually. Show how your sizing precision slashes return logistics expenses.", proTip: "Return reduction equals pure net profit." },
      { title: "Focus on Conversion Lift", content: "Show how virtual try-on increases shopper add-to-cart rates by 25%+.", proTip: "Conversion rate lift wins brand deals." }
    ]
  },
  production: {
    id: "production",
    name: "Production & Media",
    shortDesc: "Content Creation, Media & Goods",
    description: "Virtual video production, AI voice synthesis, automated post-production, digital goods distribution, and creator economy tools.",
    badgeColor: "bg-amber-600/10 text-amber-600 border-amber-600/20",
    bgGradient: "from-amber-600/10 to-orange-600/10",
    accentColor: "#d97706",
    marketSize: "$400B+",
    targetAudience: "Video producers, content creators, media studios, podcast networks, advertising agencies",
    keyMetrics: ["Render / Production Velocity", "Cost per Minute Produced", "Creator Retention Rate", "Content Monetization Yield"],
    competitors: ["Descript", "Runway AI", "ElevenLabs", "Frame.io", "Canva"],
    copilotGreeting: "Welcome! I'm your Start Pilot AI Copilot, tailored for Media Production & Content Creation. Let's analyze your rendering speeds, AI video synthesis pipelines, and creator monetization workflows. What media innovation are you working on?",
    quickPrompts: [
      "Draft AI video editing & speech-to-speech workflow architecture",
      "Model creator subscription & digital asset licensing pricing",
      "Structure media copyright & AI training data usage rights disclosure",
      "Design cloud video rendering pipeline with GPU acceleration"
    ],
    defaultIdea: {
      title: "CutFast AI - Automated Social Video Studio",
      description: "Generative AI studio turning long-form podcasts into viral short-form clips with animated captions, B-roll, and auto-reframing."
    },
    sampleRoadmap: [
      { title: "Audio Transcription & Speaker Diarization Engine", description: "Integrate Whisper / Deepgram APIs for high-accuracy transcript timestamps", category: "product", priority: "critical", timeframe: "Weeks 1-3" },
      { title: "Automated Highlight Extraction Algorithm", description: "Train LLM classifiers to detect hook moments, humor, and high-energy dialogue", category: "product", priority: "critical", timeframe: "Weeks 4-7" },
      { title: "GPU Cloud Render Farm Deployment", description: "Set up FFmpeg + WebGL rendering nodes for rapid 4K video exporting", category: "product", priority: "high", timeframe: "Weeks 6-9" },
      { title: "Creator & Agency Beta Program", description: "Onboard 100 YouTube channels and marketing agencies for daily clip production", category: "marketing", priority: "high", timeframe: "Weeks 8-12" }
    ],
    recommendedBooks: [
      { title: "Creativity, Inc.", author: "Ed Catmull", category: "Creative Operations", desc: "Overcoming the unseen forces that stand in the way of true inspiration at Pixar." },
      { title: "The YouTube Formula", author: "Derral Eves", category: "Audience Growth", desc: "Algorithms, audience psychology, and content creation frameworks." }
    ],
    recommendedTools: [
      { name: "ElevenLabs API", category: "Voice AI", desc: "High-fidelity AI voice generator and audio cloning software.", link: "https://elevenlabs.io" },
      { name: "Frame.io API", category: "Video Review", desc: "Cloud collaboration platform for video production review.", link: "https://frame.io" }
    ],
    pitchTips: [
      { title: "Demonstrate 10x Speed Improvement", content: "Show how video editors reduce 4 hours of tedious trimming to 5 minutes of automated assembly.", proTip: "Time saved per project is your core selling point." },
      { title: "Address Copyright & Licensing", content: "Assure investors that all AI generated B-roll and audio stems are 100% royalty-free and legally safe.", proTip: "Clear licensing builds buyer confidence." }
    ]
  },
  "social-impact": {
    id: "social-impact",
    name: "Social Impact & ESG",
    shortDesc: "Non-Profit, ESG & Community Tech",
    description: "Civic engagement tools, non-profit fundraising platforms, ESG tracking software, community empowerment, and equitable access solutions.",
    badgeColor: "bg-teal-500/10 text-teal-500 border-teal-500/20",
    bgGradient: "from-teal-500/10 to-emerald-500/10",
    accentColor: "#14b8a6",
    marketSize: "$250B+",
    targetAudience: "Non-profits, social enterprises, municipal governments, philanthropic foundations, ESG investors",
    keyMetrics: ["Social Return on Investment (SROI)", "Lives Positively Impacted", "Donor / Grant Retention Rate", "Program Cost Ratio"],
    competitors: ["Classy", "Givebutter", "Submittable", "Bonterra", "Neighborly"],
    copilotGreeting: "Greetings! I'm your Start Pilot AI Copilot, dedicated to Social Impact & ESG Ventures. Let's measure your Social Return on Investment (SROI), philanthropic donor retention, and community impact metrics. What social mission are you championing?",
    quickPrompts: [
      "Calculate Social Return on Investment (SROI) framework",
      "Draft 501(c)(3) vs Benefit Corporation (B-Corp) legal structure decision matrix",
      "Structure foundation grant proposal & donor stewardship campaign",
      "Design community feedback & impact outcome tracking survey"
    ],
    defaultIdea: {
      title: "CivicPulse - Community Micro-Granting Platform",
      description: "Transparent crowdfunding and micro-granting platform connecting neighborhood social projects directly with corporate ESG sponsors."
    },
    sampleRoadmap: [
      { title: "Social Impact Measurement Framework (SROI)", description: "Define verifiable outcome indicators mapped to UN Sustainable Development Goals (SDGs)", category: "product", priority: "critical", timeframe: "Weeks 1-4" },
      { title: "501(c)(3) / B-Corp Legal Filing", description: "Complete B-Lab assessment metrics and corporate structure registration", category: "legal", priority: "critical", timeframe: "Weeks 3-7" },
      { title: "Corporate ESG Sponsor Partnership", description: "Secure $100k pilot matching grant commitment from regional corporate foundation", category: "funding", priority: "high", timeframe: "Weeks 6-11" },
      { title: "Community Pilot Launch", description: "Fund 20 neighborhood improvement projects with full impact tracking", category: "marketing", priority: "high", timeframe: "Weeks 9-14" }
    ],
    recommendedBooks: [
      { title: "Building Social Business", author: "Muhammad Yunus", category: "Social Enterprise", desc: "Capitalism that serves humanity's most pressing needs by Nobel Peace Laureate." },
      { title: "Lean Impact", author: "Ann Mei Chang", category: "Impact Scaling", desc: "How to innovate for radically greater social good using lean startup tools." }
    ],
    recommendedTools: [
      { name: "Submittable", category: "Grant Management", desc: "Submission and grant management platform for social programs.", link: "https://submittable.com" },
      { name: "B-Lab Assessment", category: "ESG Certification", desc: "Comprehensive tool to evaluate corporate social and environmental performance.", link: "https://bcorporation.net" }
    ],
    pitchTips: [
      { title: "Balance Mission with Financial Sustainability", content: "Social impact investors want to see self-sustaining earned revenue models alongside noble missions.", proTip: "Avoid relying 100% on continuous donations." },
      { title: "Map to UN Sustainable Development Goals (SDGs)", content: "Align your impact metrics with official SDG benchmarks so institutional funds can invest easily.", proTip: "SDG alignment unlocks global grant capital." }
    ]
  }
};

/**
 * Get active sector ID from localStorage (defaults to "technology")
 */
export function getStoredSector(): string {
  if (typeof window === "undefined") return "technology";
  const stored = localStorage.getItem("startpilot_sector") || localStorage.getItem("user_sector");
  if (stored && SECTORS[stored]) {
    return stored;
  }
  return "technology";
}

/**
 * Store active sector ID to localStorage
 */
export function setStoredSector(sectorId: string): void {
  if (typeof window === "undefined") return;
  if (SECTORS[sectorId]) {
    localStorage.setItem("startpilot_sector", sectorId);
    localStorage.setItem("user_sector", sectorId);
    // Dispatch custom event for reactive updates across components
    window.dispatchEvent(new CustomEvent("startpilot_sector_changed", { detail: sectorId }));
  }
}

/**
 * Get full sector definition
 */
export function getSectorDetails(sectorId?: string): SectorDefinition {
  const activeId = sectorId || getStoredSector();
  return SECTORS[activeId] || SECTORS["technology"];
}
