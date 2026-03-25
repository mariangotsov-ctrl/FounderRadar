import { PrismaClient, PricingModel, StartupStatus, SignalType } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log("🌱  Seeding Founder Radar database...");

  // ─── Users ─────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? "Admin123!", 12);
  const demoPassword = await bcrypt.hash("Demo1234!", 12);

  const admin = await db.user.upsert({
    where: { email: "admin@founderradar.dev" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@founderradar.dev",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const demoUser = await db.user.upsert({
    where: { email: "demo@founderradar.dev" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@founderradar.dev",
      password: demoPassword,
      role: "USER",
    },
  });

  console.log("✅  Users created");

  // ─── Categories ────────────────────────────────────────────────────────────
  const categoryData = [
    { name: "AI Agents", slug: "ai-agents", description: "Autonomous AI agents and multi-agent systems", color: "#6366f1" },
    { name: "LLMOps", slug: "llmops", description: "Infrastructure and tooling for LLM operations", color: "#8b5cf6" },
    { name: "AI DevTools", slug: "ai-devtools", description: "Developer tools powered by AI", color: "#3b82f6" },
    { name: "AI Infrastructure", slug: "ai-infrastructure", description: "Compute, storage and deployment infrastructure for AI", color: "#0ea5e9" },
    { name: "Vertical AI", slug: "vertical-ai", description: "AI applications for specific industries", color: "#10b981" },
    { name: "AI Consumer", slug: "ai-consumer", description: "Consumer-facing AI products", color: "#f59e0b" },
    { name: "Data & Analytics", slug: "data-analytics", description: "AI-powered data and analytics platforms", color: "#ef4444" },
    { name: "AI Security", slug: "ai-security", description: "Security tools and platforms using AI", color: "#f97316" },
    { name: "Generative Media", slug: "generative-media", description: "AI for image, video, audio, and creative content", color: "#ec4899" },
    { name: "AI Robotics", slug: "ai-robotics", description: "Physical AI, robotics and automation", color: "#14b8a6" },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const c = await db.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.slug] = c.id;
  }
  console.log("✅  Categories created");

  // ─── Tags ───────────────────────────────────────────────────────────────────
  const tagData = [
    { name: "LLM", slug: "llm" },
    { name: "Open Source", slug: "open-source" },
    { name: "RAG", slug: "rag" },
    { name: "Multimodal", slug: "multimodal" },
    { name: "Fine-tuning", slug: "fine-tuning" },
    { name: "Vector DB", slug: "vector-db" },
    { name: "Code Generation", slug: "code-generation" },
    { name: "Enterprise", slug: "enterprise" },
    { name: "API-first", slug: "api-first" },
    { name: "Autonomous", slug: "autonomous" },
    { name: "Workflow", slug: "workflow" },
    { name: "No-code", slug: "no-code" },
    { name: "Search", slug: "search" },
    { name: "Healthcare", slug: "healthcare" },
    { name: "Legal", slug: "legal" },
    { name: "Finance", slug: "finance" },
    { name: "Voice", slug: "voice" },
    { name: "Computer Vision", slug: "computer-vision" },
    { name: "Edge AI", slug: "edge-ai" },
    { name: "Observability", slug: "observability" },
  ];

  const tags: Record<string, string> = {};
  for (const tag of tagData) {
    const t = await db.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
    tags[tag.slug] = t.id;
  }
  console.log("✅  Tags created");

  // ─── Startups ───────────────────────────────────────────────────────────────
  const startupData = [
    {
      name: "Meridian AI",
      slug: "meridian-ai",
      shortDescription: "Autonomous AI agents that run complex multi-step business workflows",
      description: `Meridian AI builds next-generation autonomous agents capable of executing long-horizon tasks across business systems. Their agent runtime supports tool use, memory, and multi-agent collaboration out of the box.\n\nFounded by ex-DeepMind and ex-OpenAI engineers, Meridian's platform integrates with 200+ enterprise SaaS tools and can be deployed on-prem or via cloud. Their agents can handle tasks from data analysis to customer outreach without human intervention.`,
      website: "https://meridian.ai",
      logoUrl: null,
      launchDate: daysAgo(180),
      status: StartupStatus.ACTIVE,
      pricingModel: PricingModel.ENTERPRISE,
      categorySlug: "ai-agents",
      tags: ["llm", "autonomous", "enterprise", "workflow"],
      signals: [
        { type: SignalType.FUNDING_DETECTED, title: "Raised $18M Series A", description: "Led by Andreessen Horowitz with participation from Sequoia", weight: 10, daysAgo: 14 },
        { type: SignalType.PRODUCT_HUNT_LAUNCH, title: "Launched on Product Hunt — #1 Product of the Day", description: "2,400 upvotes and 340 comments", weight: 7, daysAgo: 45 },
        { type: SignalType.HIRING_SIGNAL, title: "Expanding engineering team — 12 open roles", weight: 3, daysAgo: 20 },
        { type: SignalType.FEATURE_UPDATE, title: "Released multi-agent collaboration API v2", weight: 4, daysAgo: 7 },
        { type: SignalType.TRAFFIC_SPIKE, title: "3x traffic spike after TechCrunch feature", weight: 8, daysAgo: 42 },
      ],
    },
    {
      name: "Vectorflow",
      slug: "vectorflow",
      shortDescription: "The fastest open-source pipeline for embedding and storing documents at scale",
      description: `Vectorflow is an open-source document processing pipeline designed for teams building RAG applications. It handles chunking, embedding, deduplication, and ingestion into any vector database with a single API call.\n\nThe platform supports 40+ document types, offers async processing for large batches, and provides built-in observability. Teams at Fortune 500 companies use Vectorflow to process millions of documents per day with sub-second latency.`,
      website: "https://vectorflow.dev",
      logoUrl: null,
      launchDate: daysAgo(240),
      status: StartupStatus.ACTIVE,
      pricingModel: PricingModel.FREEMIUM,
      categorySlug: "llmops",
      tags: ["open-source", "rag", "vector-db", "api-first"],
      signals: [
        { type: SignalType.GITHUB_STARS_SPIKE, title: "Hit 8,400 GitHub stars — 1,200 new stars in 48h", weight: 6, daysAgo: 10 },
        { type: SignalType.FEATURE_UPDATE, title: "Added native Pinecone and Weaviate connectors", weight: 4, daysAgo: 21 },
        { type: SignalType.PRICING_CHANGE, title: "Launched paid cloud-hosted tier at $49/mo", description: "Free tier remains unlimited for open-source use", weight: 4, daysAgo: 35 },
        { type: SignalType.PRODUCT_HUNT_LAUNCH, title: "Featured on HN Show — 420 points", weight: 5, daysAgo: 90 },
      ],
    },
    {
      name: "Cortex Code",
      slug: "cortex-code",
      shortDescription: "AI pair programmer that understands your entire codebase, not just the file",
      description: `Cortex Code is an IDE extension and CLI tool that gives developers a code assistant with full repository context. Unlike snippet-level autocomplete tools, Cortex ingests your entire codebase and maintains a live semantic graph of dependencies, patterns, and architecture.\n\nIt can explain complex functions, suggest refactors, generate tests, and perform codebase-wide changes. Supports VS Code, JetBrains, Neovim and all major languages.`,
      website: "https://cortexcode.dev",
      logoUrl: null,
      launchDate: daysAgo(120),
      status: StartupStatus.ACTIVE,
      pricingModel: PricingModel.FREEMIUM,
      categorySlug: "ai-devtools",
      tags: ["code-generation", "llm", "open-source"],
      signals: [
        { type: SignalType.PRODUCT_HUNT_LAUNCH, title: "#2 Product of the Week on Product Hunt", weight: 7, daysAgo: 60 },
        { type: SignalType.GITHUB_STARS_SPIKE, title: "Crossed 12,000 GitHub stars", weight: 6, daysAgo: 15 },
        { type: SignalType.FUNDING_DETECTED, title: "Raised $6M seed from Y Combinator + angels", weight: 10, daysAgo: 30 },
        { type: SignalType.FEATURE_UPDATE, title: "Launched JetBrains plugin — 40,000 installs in first week", weight: 4, daysAgo: 50 },
        { type: SignalType.HIRING_SIGNAL, title: "Hiring founding ML engineer and 2 product engineers", weight: 3, daysAgo: 25 },
      ],
    },
    {
      name: "NovaMind",
      slug: "novamind",
      shortDescription: "AI-native knowledge management for enterprise teams",
      description: `NovaMind replaces wikis, intranets and scattered Google Docs with an AI-native knowledge base that automatically organises, links and surfaces relevant information. The AI continuously indexes new content as it's created and routes questions to the right answers.\n\nUsed by engineering, product, and legal teams at over 300 companies. Integrates with Notion, Confluence, Slack, GitHub, and Jira. SOC 2 Type II certified with on-prem deployment option.`,
      website: "https://novamind.so",
      logoUrl: null,
      launchDate: daysAgo(365),
      status: StartupStatus.ACTIVE,
      pricingModel: PricingModel.PAID,
      categorySlug: "vertical-ai",
      tags: ["enterprise", "llm", "search", "workflow"],
      signals: [
        { type: SignalType.FUNDING_DETECTED, title: "Closed $22M Series B", description: "Valuation reported at $120M", weight: 10, daysAgo: 60 },
        { type: SignalType.FEATURE_UPDATE, title: "Released v3 with multimodal search — images and diagrams", weight: 4, daysAgo: 30 },
        { type: SignalType.GROWTH, title: "Announced 300+ paying enterprise customers", weight: 8, daysAgo: 55 },
        { type: SignalType.HIRING_SIGNAL, title: "Opened 20 roles including VP Sales and 4 AEs", weight: 3, daysAgo: 50 },
      ],
    },
    {
      name: "Synapse Health",
      slug: "synapse-health",
      shortDescription: "Clinical AI copilot that reduces documentation burden for physicians",
      description: `Synapse Health's AI listens to patient-physician conversations in real time and auto-generates clinical notes, SOAP summaries, and billing codes. Physicians save 2–3 hours per day on documentation.\n\nBuilt with HIPAA compliance and HL7 FHIR integration at its core, Synapse integrates with Epic, Cerner, and Athena EHRs. Currently used at 50+ health systems with 4,000+ active physicians.`,
      website: "https://synapsehealth.ai",
      logoUrl: null,
      launchDate: daysAgo(300),
      status: StartupStatus.ACTIVE,
      pricingModel: PricingModel.ENTERPRISE,
      categorySlug: "vertical-ai",
      tags: ["healthcare", "enterprise", "voice", "llm"],
      signals: [
        { type: SignalType.FUNDING_DETECTED, title: "Raised $35M Series A from a16z Bio", weight: 10, daysAgo: 20 },
        { type: SignalType.GROWTH, title: "Expanded to 50 health systems — up from 12 six months ago", weight: 8, daysAgo: 18 },
        { type: SignalType.FEATURE_UPDATE, title: "Added real-time ICD-11 code suggestion", weight: 4, daysAgo: 40 },
        { type: SignalType.HIRING_SIGNAL, title: "25 open roles including Clinical Success team", weight: 3, daysAgo: 15 },
      ],
    },
    {
      name: "Lumina Finance",
      slug: "lumina-finance",
      shortDescription: "AI-powered financial analysis and due diligence for investment teams",
      description: `Lumina Finance automates financial modelling, document analysis and market research for VCs, PE firms, and corporate development teams. It can ingest 10-Ks, earnings calls, and market reports and produce structured analysis in minutes instead of hours.\n\nFeatures include automated comparable analysis, precedent transaction modelling, and custom deal memo generation. Used by analysts at 80+ investment firms managing over $200B AUM.`,
      website: "https://luminafinance.ai",
      logoUrl: null,
      launchDate: daysAgo(200),
      status: StartupStatus.ACTIVE,
      pricingModel: PricingModel.ENTERPRISE,
      categorySlug: "vertical-ai",
      tags: ["finance", "enterprise", "llm", "rag"],
      signals: [
        { type: SignalType.FUNDING_DETECTED, title: "Raised $12M seed round", weight: 10, daysAgo: 45 },
        { type: SignalType.PRODUCT_HUNT_LAUNCH, title: "Launched publicly — #3 Product of the Day", weight: 7, daysAgo: 50 },
        { type: SignalType.FEATURE_UPDATE, title: "Added EDGAR integration and real-time SEC filing alerts", weight: 4, daysAgo: 22 },
        { type: SignalType.TRAFFIC_SPIKE, title: "Traffic spike after Bloomberg coverage", weight: 8, daysAgo: 48 },
      ],
    },
    {
      name: "Prism Observability",
      slug: "prism-observability",
      shortDescription: "The observability layer purpose-built for LLM applications in production",
      description: `Prism provides logging, tracing, evals and alerting for teams running LLM-powered apps in production. It captures prompts, completions, latency, cost and quality metrics in one unified dashboard.\n\nIntegrates with OpenAI, Anthropic, Mistral, and self-hosted models. Supports A/B testing of prompts, automatic hallucination detection, and budget alerts. Built for engineering teams that need production-grade reliability for AI features.`,
      website: "https://prism.dev",
      logoUrl: null,
      launchDate: daysAgo(150),
      status: StartupStatus.ACTIVE,
      pricingModel: PricingModel.FREEMIUM,
      categorySlug: "llmops",
      tags: ["observability", "llm", "api-first", "open-source"],
      signals: [
        { type: SignalType.GITHUB_STARS_SPIKE, title: "Reached 6,200 GitHub stars", weight: 6, daysAgo: 5 },
        { type: SignalType.PRODUCT_HUNT_LAUNCH, title: "Launched on Product Hunt — Top 5 of the Day", weight: 7, daysAgo: 80 },
        { type: SignalType.FEATURE_UPDATE, title: "Released Evals SDK — run custom quality checks on every LLM call", weight: 4, daysAgo: 18 },
        { type: SignalType.FUNDING_DETECTED, title: "Pre-seed $2.5M from Gradient Ventures", weight: 10, daysAgo: 120 },
        { type: SignalType.PRICING_CHANGE, title: "Introduced team and enterprise plans", weight: 4, daysAgo: 30 },
      ],
    },
    {
      name: "CanvasAI",
      slug: "canvas-ai",
      shortDescription: "Generative design tool that turns product briefs into production-ready UI",
      description: `CanvasAI lets product teams go from a written brief to a full Figma-compatible UI design in seconds. The AI understands design systems, brand guidelines, and component libraries — and generates designs that fit your existing codebase.\n\nSupports export to React, Vue, and Tailwind. Integrates with Figma, Storybook, and GitHub. Used by 15,000+ product designers at startups and enterprises.`,
      website: "https://canvasai.design",
      logoUrl: null,
      launchDate: daysAgo(90),
      status: StartupStatus.ACTIVE,
      pricingModel: PricingModel.FREEMIUM,
      categorySlug: "generative-media",
      tags: ["multimodal", "no-code", "llm"],
      signals: [
        { type: SignalType.PRODUCT_HUNT_LAUNCH, title: "#1 Product of the Day — 3,800 upvotes", weight: 7, daysAgo: 30 },
        { type: SignalType.GROWTH, title: "15,000 active users in first 3 months", weight: 8, daysAgo: 25 },
        { type: SignalType.TRAFFIC_SPIKE, title: "Viral on X — 2M impressions in 24h", weight: 8, daysAgo: 28 },
        { type: SignalType.FEATURE_UPDATE, title: "Added React + Tailwind code export", weight: 4, daysAgo: 12 },
      ],
    },
    {
      name: "AxonNet",
      slug: "axonnet",
      shortDescription: "Distributed inference network enabling sub-100ms AI at the edge",
      description: `AxonNet is building a globally distributed inference network that routes AI workloads to the nearest available compute node — achieving sub-100ms response times even for large models. Think CDN, but for AI inference.\n\nTheir custom model sharding and speculative decoding techniques reduce inference cost by 60% vs centralized cloud providers. Partners with telcos and hyperscalers to place inference nodes at the edge.`,
      website: "https://axonnet.io",
      logoUrl: null,
      launchDate: daysAgo(270),
      status: StartupStatus.ACTIVE,
      pricingModel: PricingModel.PAID,
      categorySlug: "ai-infrastructure",
      tags: ["edge-ai", "api-first", "llm"],
      signals: [
        { type: SignalType.FUNDING_DETECTED, title: "Raised $28M Series A led by Kleiner Perkins", weight: 10, daysAgo: 35 },
        { type: SignalType.FEATURE_UPDATE, title: "Launched edge nodes in 12 new regions", weight: 4, daysAgo: 20 },
        { type: SignalType.HIRING_SIGNAL, title: "Hiring distributed systems and ML infra engineers", weight: 3, daysAgo: 30 },
        { type: SignalType.GROWTH, title: "Processing 500M API requests/day — up 10x in 6 months", weight: 8, daysAgo: 40 },
      ],
    },
    {
      name: "LexAI",
      slug: "lex-ai",
      shortDescription: "AI-powered contract analysis and drafting for legal and commercial teams",
      description: `LexAI automates contract review, risk identification and redlining for legal, procurement, and finance teams. It reviews NDAs, MSAs, and enterprise software agreements in under 60 seconds, flagging non-standard clauses and suggesting market-standard alternatives.\n\nUsed by in-house legal teams at 200+ companies. Integrates with DocuSign, SharePoint, and Salesforce. ISO 27001 and SOC 2 Type II certified. Trained on millions of commercial contracts.`,
      website: "https://lexai.legal",
      logoUrl: null,
      launchDate: daysAgo(400),
      status: StartupStatus.ACTIVE,
      pricingModel: PricingModel.PAID,
      categorySlug: "vertical-ai",
      tags: ["legal", "enterprise", "llm", "workflow"],
      signals: [
        { type: SignalType.FUNDING_DETECTED, title: "Raised $9M seed from Bessemer Venture Partners", weight: 10, daysAgo: 90 },
        { type: SignalType.FEATURE_UPDATE, title: "Added AI-powered contract drafting from templates", weight: 4, daysAgo: 55 },
        { type: SignalType.GROWTH, title: "Reached 200 paying enterprise customers", weight: 8, daysAgo: 70 },
        { type: SignalType.PRICING_CHANGE, title: "Launched self-serve SMB plan at $199/mo", weight: 4, daysAgo: 85 },
      ],
    },
    {
      name: "Flux Robotics",
      slug: "flux-robotics",
      shortDescription: "General-purpose manipulation robots trained with foundation models",
      description: `Flux Robotics is developing general-purpose robotic arms that can learn new manipulation tasks from a handful of demonstrations — no custom programming required. Their foundation model approach means the same robot can handle packaging, assembly, and quality inspection.\n\nCurrently deployed in 8 manufacturing facilities. Targets automotive, electronics, and food processing verticals. Raised from hardware-focused deep-tech investors.`,
      website: "https://fluxrobotics.ai",
      logoUrl: null,
      launchDate: daysAgo(500),
      status: StartupStatus.ACTIVE,
      pricingModel: PricingModel.ENTERPRISE,
      categorySlug: "ai-robotics",
      tags: ["computer-vision", "enterprise", "edge-ai"],
      signals: [
        { type: SignalType.FUNDING_DETECTED, title: "Raised $45M Series B", weight: 10, daysAgo: 25 },
        { type: SignalType.FEATURE_UPDATE, title: "Demo'd zero-shot object manipulation at CES 2025", weight: 4, daysAgo: 75 },
        { type: SignalType.GROWTH, title: "Deployed in 8 manufacturing facilities", weight: 8, daysAgo: 22 },
      ],
    },
    {
      name: "Palette Security",
      slug: "palette-security",
      shortDescription: "AI-native threat detection that eliminates alert fatigue for SOC teams",
      description: `Palette's AI security platform ingests logs, network traffic and endpoint telemetry and uses large-scale models to distinguish real threats from noise — reducing false positive rates by 94% vs traditional SIEM tools.\n\nIntegrates with Splunk, CrowdStrike, SentinelOne and all major cloud providers. Provides explainable detections in plain English so analysts understand exactly what happened and why. Deployed at 60+ enterprise security teams.`,
      website: "https://palette.security",
      logoUrl: null,
      launchDate: daysAgo(330),
      status: StartupStatus.ACTIVE,
      pricingModel: PricingModel.ENTERPRISE,
      categorySlug: "ai-security",
      tags: ["enterprise", "llm", "observability"],
      signals: [
        { type: SignalType.FUNDING_DETECTED, title: "Raised $20M Series A from Cybersecurity-focused VCs", weight: 10, daysAgo: 55 },
        { type: SignalType.GROWTH, title: "60+ enterprise customers, 3x growth in 12 months", weight: 8, daysAgo: 50 },
        { type: SignalType.FEATURE_UPDATE, title: "Launched GenAI-assisted incident response playbooks", weight: 4, daysAgo: 28 },
        { type: SignalType.HIRING_SIGNAL, title: "Hiring CISO-in-residence and 3 enterprise AEs", weight: 3, daysAgo: 45 },
      ],
    },
  ];

  // Seed startups
  const startupIds: Record<string, string> = {};
  for (const s of startupData) {
    const { signals, tags: tagSlugs, categorySlug, ...startupFields } = s;

    const startup = await db.startup.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        ...startupFields,
        categoryId: categories[categorySlug] ?? null,
        tags: {
          create: tagSlugs
            .filter((slug) => tags[slug])
            .map((slug) => ({ tagId: tags[slug] })),
        },
      },
    });

    startupIds[s.slug] = startup.id;

    // Seed signals
    for (const sig of signals) {
      const { daysAgo: d, ...sigFields } = sig;
      await db.signal.upsert({
        where: {
          id: `${startup.id}-${sig.type}-${d}`,
        },
        update: {},
        create: {
          id: `${startup.id}-${sig.type}-${d}`,
          startupId: startup.id,
          type: sigFields.type,
          title: sigFields.title,
          description: (sigFields as { description?: string }).description ?? null,
          weight: sigFields.weight,
          occurredAt: daysAgo(d),
        },
      });
    }
  }

  console.log("✅  Startups and signals created");

  // ─── Recalculate trending scores ───────────────────────────────────────────
  const LAMBDA = 0.05;
  const now = Date.now();

  for (const [, startupId] of Object.entries(startupIds)) {
    const signals = await db.signal.findMany({
      where: { startupId },
      select: { weight: true, occurredAt: true },
    });

    const score = signals.reduce((sum, sig) => {
      const daysSince = (now - sig.occurredAt.getTime()) / (1000 * 60 * 60 * 24);
      return sum + sig.weight * Math.exp(-LAMBDA * daysSince);
    }, 0);

    await db.startup.update({
      where: { id: startupId },
      data: { trendingScore: Math.round(score * 100) / 100 },
    });
  }

  console.log("✅  Trending scores calculated");

  // ─── Competitor relations ──────────────────────────────────────────────────
  const competitorPairs = [
    ["cortex-code", "meridian-ai", "Both offer AI coding / development automation"],
    ["vectorflow", "prism-observability", "Both target LLMOps infrastructure buyers"],
    ["synapse-health", "novamind", "Both serve enterprise teams with vertical AI workflows"],
    ["lumina-finance", "lex-ai", "Both target professional services with AI document analysis"],
  ];

  for (const [slugA, slugB, note] of competitorPairs) {
    const idA = startupIds[slugA];
    const idB = startupIds[slugB];
    if (!idA || !idB) continue;

    await db.competitorRelation.upsert({
      where: { startupAId_startupBId: { startupAId: idA, startupBId: idB } },
      update: {},
      create: { startupAId: idA, startupBId: idB, note: note ?? null },
    });
  }

  console.log("✅  Competitor relations created");

  // ─── Watchlist items for demo user ─────────────────────────────────────────
  const watchSlugs = ["meridian-ai", "cortex-code", "canvas-ai", "vectorflow", "synapse-health"];
  for (const slug of watchSlugs) {
    const startupId = startupIds[slug];
    if (!startupId) continue;
    await db.watchlistItem.upsert({
      where: { userId_startupId: { userId: demoUser.id, startupId } },
      update: {},
      create: { userId: demoUser.id, startupId },
    });
  }

  console.log("✅  Demo watchlist created");

  // ─── Pricing snapshots ─────────────────────────────────────────────────────
  const snapshotData = [
    { slug: "vectorflow", model: PricingModel.FREE, priceUsd: 0, planName: "Open Source", notes: "Free tier, unlimited" },
    { slug: "vectorflow", model: PricingModel.PAID, priceUsd: 49, planName: "Cloud Starter", notes: "Hosted tier, launched recently" },
    { slug: "prism-observability", model: PricingModel.FREE, priceUsd: 0, planName: "Developer", notes: "Up to 100K events/mo" },
    { slug: "prism-observability", model: PricingModel.PAID, priceUsd: 99, planName: "Team", notes: "Launched with new pricing page" },
    { slug: "lex-ai", model: PricingModel.PAID, priceUsd: 199, planName: "SMB Plan", notes: "Self-serve SMB plan" },
  ];

  for (const snap of snapshotData) {
    const startupId = startupIds[snap.slug];
    if (!startupId) continue;
    await db.pricingSnapshot.create({
      data: {
        startupId,
        model: snap.model,
        priceUsd: snap.priceUsd,
        planName: snap.planName,
        notes: snap.notes,
        recordedAt: daysAgo(Math.floor(Math.random() * 30)),
      },
    });
  }

  console.log("✅  Pricing snapshots created");

  console.log("\n🎉  Seed complete!\n");
  console.log("   Admin login:  admin@founderradar.dev / Admin123!");
  console.log("   Demo login:   demo@founderradar.dev / Demo1234!\n");
}

main()
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
