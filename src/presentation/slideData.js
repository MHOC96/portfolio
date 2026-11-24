// ITC 4671 – Information Systems Development Research Project Slide Data
// Aligned with:
//   1) 2026 November - ITC_4671_Project_Proposal_Presentation_Guide.pdf
//   2) Research Proposal CPM 25688 (1).pdf
// Every in-text citation aligns 1-to-1 with the 10 Harvard entries in REFERENCES_LIST.

export const DECK_META = {
  title:
    'Design, Implementation, and Experimental Evaluation of a Task-to-Provider Authorization Gateway for Mitigating Metadata-Driven Cross-Server Tool-Selection Hijacking in Multi-Server Model Context Protocol Environments',
  shortTitle: 'Task-to-Provider Authorization Gateway for Multi-Server MCP',
  author: 'M.H. Oshadha Canchana',
  indexNo: '25688',
  regNo: '112219',
  supervisor: 'Dr. Mahesh Fernando',
  course: 'ITC 4671 – Information Systems Development Research Project',
  presentationLabel: 'Initial Project Proposal Presentation',
  semester: 'Year IV – Semester I',
  degree: 'B.Sc. Honors in Business Information Systems',
  department: 'Department of Information Technology',
  faculty: 'Faculty of Management Studies and Commerce',
  university: 'University of Sri Jayewardenepura',
  totalSlides: 13,
  maxMinutes: 6,
  qaMinutes: 14,
  closingSummary:
    'A Python Task-to-Provider Authorization Gateway enforcing signed host manifests and deterministic tool aliases to stop registered, task-unauthorized MCP servers.',
};

export const SLIDES_META = [
  {
    id: 1,
    slug: 'cover',
    section: '01 · Cover',
    guideRef: '§1 Title & Context',
    title: 'Task-to-Provider Authorization Gateway for Multi-Server MCP',
    subtitle: 'Initial Project Proposal Presentation · ITC 4671',
    targetSec: 15,
    speakerNotes:
      'Good morning, panel members. I am M.H. Oshadha Canchana, Index 25688, supervised by Dr. Mahesh Fernando. Under ITC 4671, I present my initial project proposal on a Task-to-Provider Authorization Gateway for multi-server Model Context Protocol environments.',
    qaDefense: [
      'Assessment scope: Chapter 1 initial proposal — no empirical data collection has been conducted yet.',
      'Project focus: Bridging the gap between static MCP server trust and explicit per-task provider authorization.',
    ],
  },
  {
    id: 2,
    slug: 'background-users',
    section: '02 · Background & Intended Users',
    guideRef: '§1 Background & Users',
    title: 'Project Background & Intended Users',
    subtitle: 'Multi-Server MCP Setting, Empirical Prompt & Target Users',
    targetSec: 30,
    speakerNotes:
      'AI agents use the Model Context Protocol to discover tools across connected servers via metadata. Empirical studies show manipulated metadata can hijack up to 90.89% of tool selections and execute 86.46% of malicious payloads. As a general-audience developer project without one named client, our primary target users are MCP application developers and organizations deploying AI agents, alongside AI service users and security researchers—supporting the core decision of routing each tool call only to an approved server.',
    qaDefense: [
      'Why no single named client: ITC 4671 permits general-audience projects when a clearly defined user group and supported decision are specified.',
      'Stakeholder alignment: Directly grounded in Proposal Section 1.4 (developers, deploying organizations, AI end-users, and security researchers).',
    ],
  },
  {
    id: 3,
    slug: 'problem',
    section: '03 · Preliminary Problem Statement',
    guideRef: '§2 Problem & Assumptions',
    title: 'Preliminary Problem Statement & Assumptions',
    subtitle: 'Current Workflow, Core Security Gap & Assumptions to Verify',
    targetSec: 45,
    speakerNotes:
      'Today, developers connect multiple MCP servers and rely on the LLM plus optional identity or hash checks to pick a tool. The problem arises when a registered adversarial Server B holds a valid Ed25519 key and unchanged SHA-256 tool fingerprint, yet uses biased metadata to outrank authorized Server A. Both identity and integrity checks pass, proving static trust does not equal task authorization. This matters because authorized tasks remain exposed even under registered servers. We define four assumptions—A1 to A4—to verify via practitioner outreach and controlled testing.',
    qaDefense: [
      'Important nuance (Proposal Sec 2): We do not claim ETDI or ContextGuard ignore authorization; we isolate whether explicit task-to-provider binding adds protection when multiple valid, unchanged servers compete.',
      'Why static registration fails: Server B’s persuasive metadata is registered before runtime, so tool-definition integrity hashes never trigger.',
      'ILO 1 alignment: Every assumption (A1–A4) maps directly to an explicit verification method in our investigation and test plans.',
    ],
  },
  {
    id: 4,
    slug: 'aim-objectives',
    section: '04 · Aim & Objectives',
    guideRef: '§3 Aim & Objectives',
    title: 'Project Aim & Specific Objectives',
    subtitle: 'One-Sentence Aim, Research Question & Four Specific Objectives',
    targetSec: 25,
    speakerNotes:
      'In one sentence, our aim is to design, implement, and experimentally evaluate a Python Task-to-Provider Authorization Gateway that mitigates metadata-driven cross-server tool-selection hijacking in multi-server MCP environments. Guided by our core research question, four objectives take us from investigating hijacking assumptions, to eliciting security and usability requirements, to building a working five-function Python gateway prototype, and evaluating it across both security benchmarks and representative user tasks.',
    qaDefense: [
      'Guide §3 mapping: The four objectives follow the exact Investigate → Identify Requirements → Develop Solution → Evaluate arc while preserving all five technical deliverables from Proposal Section 3.2.1.',
      'Primary Research Question (Sec 3.1): Measures to what extent task-to-provider enforcement prevents unauthorized execution by a registered, identity-valid server.',
    ],
  },
  {
    id: 5,
    slug: 'related-work',
    section: '05 · Related Studies & Systems',
    guideRef: '§4 Preliminary Review',
    title: 'Preliminary Review of Studies & Similar Systems',
    subtitle: 'Threat Evidence, Existing Defenses & Open Research Gap',
    targetSec: 30,
    speakerNotes:
      'Recent studies establish the threat: Wang et al. demonstrate metadata preference manipulation, Li et al. quantify 90.89% confused-deputy hijacking and missing MCP privilege controls, and Hou et al. document cross-server shadowing. Existing defenses—ETDI, ContextGuard, MCP-Guard, ShieldMCP, and Uppala’s governed proxy—validate cryptography, supply-chain hashes, runtime scanning, and proxy mediation, yet leave per-task provider binding untested when registered servers compete. A comprehensive literature review will be completed at Progress 1.',
    qaDefense: [
      'Why deterministic binding over neural detection alone: MCP-Guard and ShieldMCP rely on probabilistic classification, whereas host-signed grants enforce deterministic deny-by-default rules.',
      'Bibliography integrity: All 10 Harvard citations on the slides map 1-to-1 to the References slide and Proposal pp. 17–18.',
      'Progress 1 scope: Full comparative matrix and deeper protocol critique will be delivered at Progress 1 per the ITC 4671 guide.',
    ],
  },
  {
    id: 6,
    slug: 'solution-architecture',
    section: '06 · Proposed Solution',
    guideRef: '§5 Proposed Solution',
    title: 'Proposed Gateway Architecture & Core Functions',
    subtitle: 'Architectural Interception, Five Functions & Alias Isolation',
    targetSec: 35,
    speakerNotes:
      'Our solution is a Python Security Gateway interposed between the AI agent and connected MCP servers, overriding biased LLM choices outside the model. It provides five core functions: a SQLite Trusted Server Registry, Ed25519 identity and SHA-256 integrity validation, a Signed Manifest Store, an Authorization Engine matching provider, tool, action, path, and replay ID, and a Request Forwarder with audit logging. Deterministic aliases like server_A__read_file ensure the LLM never controls endpoints or routing.',
    qaDefense: [
      'Why separate Ed25519 keys (Sec 5.3.1): Server identity keys authenticate MCP providers, while a distinct authority private key signs task manifests—preventing any registered server from forging grants.',
      'Why the AI model cannot forge grants: Manifests arrive directly from the trusted host over an authenticated host-to-gateway channel, and task_id comes strictly from the host-bound session.',
    ],
  },
  {
    id: 7,
    slug: 'process-scope',
    section: '07 · Supported Process & Scope',
    guideRef: '§5 Process & Scope',
    title: 'Supported End-to-End Process, Manifest & Scope',
    subtitle: 'Authorized File Read Workflow, Grant Schema & Explicit Boundaries',
    targetSec: 35,
    speakerNotes:
      'To illustrate one complete supported process—reading a file in project/—the trusted host mints a task ID and signs an eight-field Task Approval Manifest binding the task to Server A and read_file. When manipulated metadata lures the agent to invoke server_B__read_file, the gateway resolves the provider internally, runs four verification checks including normalized paths and replay prevention, forwards valid Server A calls, and blocks and logs Server B. Initial scope explicitly excludes OS compromise, sandbox escapes, live production servers, novel cryptography, and enterprise policy engines.',
    qaDefense: [
      'Path traversal & replay defense (Sec 5.3.1): File arguments are normalized and resolved against project/ before approval; unique invocation IDs block replayed requests while permitting multiple valid calls under one manifest.',
      'Why strict scope boundaries: Focusing on a local synthetic two-server proof-of-concept keeps the 20-week project feasible and avoids exposing real credentials or production systems.',
    ],
  },
  {
    id: 8,
    slug: 'investigation-plan',
    section: '08 · Investigation Plan',
    guideRef: '§6 Investigation Plan',
    title: 'Investigation Plan & Stakeholder Outreach',
    subtitle: 'Whom to Consult, Information Needs, Methods & Outreach Strategy',
    targetSec: 35,
    speakerNotes:
      'No data collection has occurred yet. To verify assumptions A1 through A4 and refine requirements for Progress 1, we will consult MCP application developers, engineers deploying AI agents, and AI security researchers. We will examine current multi-server trust setups, shadowing awareness, manifest authoring needs, and latency tolerances using semi-structured interviews with 6 to 10 practitioners, MCP specification reviews, and guided two-server setup walkthroughs—recruiting via USJ IT and alumni networks, local AI meetups, and open-source MCP communities.',
    qaDefense: [
      'Handling no named client: Purposive recruitment across USJ alumni, Sri Lankan engineering meetups, and active open-source MCP forums directly reaches target MCP developers.',
      'Link to technical pilot (Sec 5.5): Practitioner insights finalize usability and policy requirements, while a local pilot experiment verifies tool-calling variance before full trials.',
    ],
  },
  {
    id: 9,
    slug: 'approach-platform',
    section: '09 · Approach, Platform & Tools',
    guideRef: '§7 Deliverable & Approach',
    title: 'Solution Type, Platform, Approach & Tools',
    subtitle: 'Integrated Component Prototype, Iterative DSR & Stack Rationale',
    targetSec: 35,
    speakerNotes:
      'The expected deliverable is an integrated security component and working prototype—the Python Authorization Gateway paired with a controlled two-server MCP testbed. Deployed as a Python middleware proxy and CLI harness consumed by an MCP host and local Ollama agent, it enables model-agnostic provider authorization without altering LLM weights. Following Design Science Research and iterative prototyping across five stages, we build with Python, the Official MCP SDK, Ollama, Python Cryptography Ed25519, SHA-256, SQLite, Pytest, and Pandas and SciPy.',
    qaDefense: [
      'Protocol realism caveat (Proposal Sec 5.4 p.11): Cryptographic server identity verification is implemented inside our experimental gateway rather than assumed as a universal built-in MCP feature.',
      'Why Ollama + local LLM: Eliminates cloud API drift, locks temperature at 0.2 with recorded random seeds, and keeps all synthetic test runs reproducible and zero-cost.',
    ],
  },
  {
    id: 10,
    slug: 'work-plan-feasibility',
    section: '10 · Work Plan, Feasibility & Risk',
    guideRef: '§7 Work Plan & Risk',
    title: 'Work Plan, Feasibility & Risk Management',
    subtitle: '20-Week Schedule, Stage Outputs, Resources & Key Risk Mitigation',
    targetSec: 35,
    speakerNotes:
      'Our 20-week work plan spans October 2026 to February 2027 across 12 activities in four stages, each producing a concrete deliverable from approved Chapter 1 and Progress 1 requirements to the working gateway, experimental logs, and final dissertation. All tooling is free and local, matching existing Python and security skills. Our key technical risk—local LLM tool-calling variability and GPU VRAM limits—is mitigated by benchmarking and locking a tool-capable Ollama model early with fixed prompts, temperature 0.2, and a pilot trial.',
    qaDefense: [
      'Secondary operational risk (recruitment): If fewer than 6 external practitioners respond quickly, we have fallback access via USJ Department of IT senior students/alumni building LLM tool workflows.',
      'Schedule buffer: Testing (Weeks 13–15) overlaps slightly with agent integration (Week 12–14) and leaves 3 full weeks (Weeks 18–20) for final dissertation assembly.',
    ],
  },
  {
    id: 11,
    slug: 'success-measures',
    section: '11 · Initial Measures of Success',
    guideRef: '§8 Measure of Success',
    title: 'Initial Measures of Success & Evaluation Plan',
    subtitle: 'Representative User Task Evaluation & Controlled Config A–D Benchmarks',
    targetSec: 40,
    speakerNotes:
      'We judge success through two observable evaluation streams. First, a representative user study where 6 to 10 MCP developers configure and execute multi-server file-read tasks with and without the gateway, recording completion time, setup and routing errors, and workflow friction. Second, controlled paired experiments comparing four configurations—A Baseline through D Proposed Gateway—across four metadata attack conditions, measuring Attack Success Rate, Blocking Rate, False-Positive Rate, Legitimate Task Completion, and Median and 95th-percentile latency, with Config C versus D tested statistically.',
    qaDefense: [
      'Why Config C vs Config D is the primary test (Sec 5.6.1): Config C already enforces identity, integrity, and general tool/action/path rules—so comparing C vs D isolates the exact marginal security gain of explicit task-to-provider binding (H0 vs H1).',
      'Statistical rigor (Sec 5.6.2–5.6.3): Paired designs with matched prompts, counterbalanced tool order, temp = 0.2, and recorded seeds; Exact McNemar (scipy.stats.binomtest) for binary rates, Shapiro-Wilk + paired t-test or Wilcoxon for latency, Holm correction, α = 0.05.',
      'Four metadata conditions (Sec 5.5): Neutral Metadata, Preference Name, Preference Description, and Name Similarity.',
    ],
  },
  {
    id: 12,
    slug: 'references',
    section: '12 · References',
    guideRef: '§4 Citations (1-to-1)',
    title: 'References (Harvard Style)',
    subtitle: 'All 10 Peer-Reviewed & Specification Sources Cited on Slides',
    targetSec: 0,
    speakerNotes:
      'All ten Harvard references cited across the slides match the proposal bibliography 1-to-1.',
    qaDefense: [
      'Zero unverified or fabricated citations: Every source is copied verbatim from Proposal CPM 25688 pp. 17–18.',
    ],
  },
  {
    id: 13,
    slug: 'closing',
    section: '13 · Q&A',
    guideRef: '14-Min Panel Q&A',
    title: 'Thank You & Questions',
    subtitle: '14-Minute Panel Q&A · Press G to Jump to Any Slide',
    targetSec: 0,
    speakerNotes:
      'Thank you for your attention. I welcome your questions and feedback during the 14-minute Q&A. I can jump directly to any slide using the overview grid.',
    qaDefense: [
      'Key ILO 1 takeaway: Valid cryptographic identity + intact tool hash ≠ task authorization when registered providers compete.',
      'Key ILO 6 takeaway: Feasibility is anchored in a 20-week local Python/Ollama prototype evaluated via both user tasks and paired Config C vs D experiments.',
    ],
  },
];

export const SLIDES_BY_SLUG = Object.fromEntries(SLIDES_META.map((slide) => [slide.slug, slide]));

// Slide 02: Section 1 — Background & Intended Users
export const BACKGROUND_USERS_DATA = {
  settingAndPrompt: [
    'MCP standardizes LLM tool discovery via a host–client–server architecture (Model Context Protocol, 2025; Hou et al., 2026).',
    'Agents pick tools from server-supplied names and descriptions across multiple connected providers (Model Context Protocol, 2025).',
    'Prompted by attacks hijacking up to 90.89% of tool choices via biased metadata (Li et al., 2026; Wang et al., 2026).',
  ],
  empiricalStats: [
    {
      value: '90.89%',
      label: 'Tool-Selection Hijacking',
      source: 'Confused deputy attacks via metadata (Li et al., 2026)',
    },
    {
      value: '86.46%',
      label: 'Malicious Execution Rate',
      source: 'End-to-end adversarial payload execution (Li et al., 2026)',
    },
  ],
  clientBadge: 'General Audience',
  clientStatus: 'General-Audience Project (No Single Named Client)',
  intendedUsers: [
    {
      group: 'MCP Application Developers',
      tier: 'Primary',
      need: 'Need deterministic control over which provider executes each agent task.',
    },
    {
      group: 'Organizations Deploying AI Agents',
      tier: 'Primary',
      need: 'Require provider-specific permissions and audit trails on sensitive resources.',
    },
    {
      group: 'AI Service Users & Security Researchers',
      tier: 'Secondary',
      need: 'Benefit from safer tool execution and reproducible multi-server security evidence.',
    },
  ],
  supportedTask:
    'Authorizing and routing each AI agent tool call (e.g., read_file on project/) strictly to an explicitly approved MCP provider.',
  whyNeeded:
    'MCP ecosystems lack granular task-to-provider privilege controls (Li et al., 2025; Hou et al., 2026), leaving tasks exposed even among registered servers.',
};

// Slide 03: Section 2 — Preliminary Problem Statement & Assumptions
export const PROBLEM_DATA = {
  figureCaption: 'Fig. 1 — Cross-Server Tool-Selection Hijacking',
  figureNote: 'Both servers hold valid keys & intact hashes',
  headline: 'Valid Identity & Intact Tool Hash ≠ Task Authorization',
  currentWorkflow:
    'Agents connect to multiple MCP servers; the LLM chooses tools from metadata while optional controls verify server keys and tool hashes.',
  difficulty:
    'Registered adversarial Server B (valid key, unchanged hash) uses persuasive metadata to beat Server A—passing identity and integrity checks (Bhatt, Narajala & Habler, 2025; Gentyala, Srinivas & Dhumpati, 2026).',
  whyWorthInvestigating:
    'Static server trust and unchanged tool definitions do not prove a provider is authorized for the current user task.',
  serverA: {
    name: 'Server A — Valid Provider',
    status: 'AUTHORIZED',
    details: 'Registered provider approved to execute read_file on project/ for this task.',
  },
  serverB: {
    name: 'Server B — Adversarial Provider',
    status: 'UNAUTHORIZED',
    details: 'Registered with valid key & intact hash; manipulates metadata to win selection.',
  },
  assumptionsToVerify: [
    {
      id: 'A1',
      assumption: 'Multi-server MCP hosts expose overlapping tools across providers.',
      verifyHow: 'Practitioner interviews & config review',
    },
    {
      id: 'A2',
      assumption: 'Pre-fingerprinted biased metadata passes identity/hash checks yet hijacks selection.',
      verifyHow: 'Controlled two-server pilot & trials',
    },
    {
      id: 'A3',
      assumption: 'Host-issued per-task provider grants are practical for developers to define.',
      verifyHow: 'Interviews & guided workflow walkthrough',
    },
    {
      id: 'A4',
      assumption: 'Gateway verification adds acceptable latency with minimal false blocks.',
      verifyHow: 'Latency benchmarks & user task timing',
    },
  ],
};

// Slide 04: Section 3 — Project Aim (1 Sentence) & 4 Objectives
export const AIM_OBJECTIVES_DATA = {
  overallAim:
    'To design, implement, and experimentally evaluate a Python-based Task-to-Provider Authorization Gateway that mitigates metadata-driven cross-server tool-selection hijacking in multi-server Model Context Protocol environments.',
  researchQuestion:
    'To what extent can a gateway enforcing task-to-provider authorization prevent unauthorized MCP tool execution when metadata manipulation causes an AI agent to select a registered, identity-valid but task-unauthorized server?',
  objectives: [
    {
      id: '01',
      category: 'Investigate the Problem',
      title: 'Define Threat Model & Verify Assumptions',
      detail:
        'Investigate metadata hijacking under registered, task-unauthorized servers and verify practitioner assumptions (A1–A4).',
      milestone: 'Phase 1 · Initial Study',
    },
    {
      id: '02',
      category: 'Identify Requirements',
      title: 'Specify Manifest & Gateway Requirements',
      detail:
        'Consult MCP developers and review specs to define authorization rules, signed manifests, and usability needs.',
      milestone: 'Phase 2 · Progress 1',
    },
    {
      id: '03',
      category: 'Develop Working Solution',
      title: 'Build Gateway Prototype & 2-Server Testbed',
      detail:
        'Implement the 5-function Python gateway (identity, integrity, task binding) with a local two-server MCP testbed.',
      milestone: 'Phase 3 · Build',
    },
    {
      id: '04',
      category: 'Evaluate the Solution',
      title: 'Evaluate Security, Latency & User Tasks',
      detail:
        'Compare Configs A–D on ASR, blocking, FPR, completion, and latency plus developer task time and errors.',
      milestone: 'Phase 4 · Evaluation',
    },
  ],
  dsrFooter: 'Aligned with Design Science Research (DSR): Investigate → Specify → Build → Evaluate',
  planMeta: '4 Objectives · 20-Week Plan',
};

// Slide 05: Section 4 — Preliminary Review of Related Studies & Similar Systems
export const RELATED_WORK_DATA = {
  relatedStudies: [
    {
      study: 'MPMA (Wang et al., 2026)',
      addresses: 'Metadata preference manipulation via biased names/descriptions.',
      suggests: 'Persuasive metadata reliably steers LLM provider choice.',
    },
    {
      study: 'Confused Deputy (Li et al., 2026)',
      addresses: 'Cross-server hijacking (90.89% hijack; 86.46% execution).',
      suggests: 'Enforcement must sit architecturally outside the LLM.',
    },
    {
      study: 'MCP Threat Landscape (Hou et al., 2026)',
      addresses: 'Cross-server shadowing across co-located MCP servers.',
      suggests: 'Overlapping providers need explicit per-task isolation.',
    },
    {
      study: 'MCP Privilege Audit (Li et al., 2025)',
      addresses: 'Empirical audit exposing missing MCP API privilege controls.',
      suggests: 'Motivates explicit provider, action, and resource binding.',
    },
  ],
  similarSystems: [
    {
      system: 'ETDI',
      citation: 'Bhatt, Narajala & Habler, 2025',
      addresses: 'OAuth tool identity, signed definitions & policy RBAC.',
      suggests: 'Secures identity/hashes; leaves competing valid providers untested.',
    },
    {
      system: 'ContextGuard',
      citation: 'Gentyala, Srinivas & Dhumpati, 2026',
      addresses: 'Zero-trust supply-chain & runtime integrity checks.',
      suggests: 'Catches tampered definitions, not pre-registered biased metadata.',
    },
    {
      system: 'MCP-Guard & ShieldMCP',
      citation: 'Xing et al., 2025; Yergattikar, 2026',
      addresses: 'Static/neural threat detection & runtime call validation.',
      suggests: 'Probabilistic checks benefit from deterministic task grants.',
    },
    {
      system: 'Governed MCP Proxy',
      citation: 'Uppala, 2026',
      addresses: 'Architectural proxy filtering discovery & invocations.',
      suggests: 'Validates proxy mediation; motivates per-task provider binding.',
    },
  ],
  identifiedGap:
    'Existing defenses harden identity, integrity, or general policies, leaving open whether explicit task-to-provider binding blocks registered, unmodified adversarial servers.',
  progressOneNote:
    'Progress 1 Note: Comprehensive literature review and detailed comparative system analysis will be presented at Progress 1.',
};

// Slide 06: Section 5 (Part 1) — Proposed Solution & Gateway Architecture
export const SOLUTION_ARCH_DATA = {
  howItHelps:
    'Interposes a Python gateway between the AI agent and MCP servers, overriding biased LLM choices with host-signed task grants and deterministic tool aliases.',
  figureCaption: 'Fig. 2 — Python Task-to-Provider Authorization Gateway',
  mainFunctions: [
    {
      num: '01',
      name: 'Trusted Server Registry',
      detail: 'SQLite store of server IDs, public keys, endpoints & tool hashes.',
    },
    {
      num: '02',
      name: 'Authentication & Validation',
      detail: 'Ed25519 challenge-response identity and SHA-256 integrity checks.',
    },
    {
      num: '03',
      name: 'Signed Manifest Store',
      detail: 'Stores host Task Approval Manifests and verifies signatures.',
    },
    {
      num: '04',
      name: 'Authorization Engine',
      detail: 'Matches task ID, alias provider, tool, action, path & replay ID.',
    },
    {
      num: '05',
      name: 'Forwarder & Audit Logger',
      detail: 'Routes approved Server A calls; logs all denials & executions.',
    },
  ],
  aliasNote:
    'Internal aliases (server_A__read_file, server_B__read_file) resolve to trusted endpoints so the LLM never controls routing (Model Context Protocol, 2025).',
};

// Slide 07: Section 5 (Part 2) — Complete Supported Process, Manifest Schema & Explicit Scope
export const PROCESS_SCOPE_DATA = {
  supportedProcess: {
    title: 'One Complete Supported Process: Authorized File Read (read_file on project/)',
    figureCaption: 'Fig. 3 — End-to-End Task Approval Manifest Lifecycle',
    steps: [
      {
        step: '01',
        actor: 'Host Declares & Signs',
        action: 'Host mints task_id; authority signs Ed25519 manifest binding task to Server A & project/.',
      },
      {
        step: '02',
        actor: 'Agent Requests Tool',
        action: 'Agent invokes alias (e.g., server_B__read_file); gateway pulls task_id from host session.',
      },
      {
        step: '03',
        actor: 'Gateway Verifies (4 Checks)',
        action: 'Verifies server identity, tool hash, signed manifest match, normalized path & replay ID.',
      },
      {
        step: '04',
        actor: 'Route A / Deny B & Audit',
        action: 'Forwards authorized Server A read_file call; denies & logs Server B or out-of-scope calls.',
      },
    ],
  },
  manifestPreview: {
    title: 'Signed Task Approval Manifest',
    fields: [
      { key: 'grant_id', value: '"GRANT-001"' },
      { key: 'task_id', value: '"TASK-001"' },
      { key: 'approved_server_id', value: '"server-A"' },
      { key: 'approved_tool_id', value: '"read_file"' },
      { key: 'allowed_action', value: '"read"' },
      { key: 'allowed_resource_scope', value: '"project/"' },
      { key: 'expires_at', value: '"<ISO-8601>"' },
      { key: 'grant_nonce', value: '"<random>"' },
    ],
    securityNote:
      'Signed with a separate Ed25519 authority key; normalized path check & per-invocation replay prevention.',
  },
  inScope: [
    'Python security gateway mediating all protected MCP tool calls',
    'Server identity, tool-definition integrity & signed task-to-provider grants',
    'Local synthetic 2-server MCP testbed (Server A valid, Server B adversarial) + Ollama agent',
  ],
  outOfScope: [
    'OS compromises, sandbox escapes & malicious package installations',
    'Vulnerabilities in external services or live production MCP servers',
    'Confidential documents or real user credentials (synthetic data only)',
    'Novel cryptographic algorithms or a general-purpose policy engine',
  ],
};

// Slide 08: Section 6 — Investigation Plan & Stakeholder Outreach
export const INVESTIGATION_PLAN_DATA = {
  stageNote:
    'Pre-collection stage: no data collected yet. Findings verify assumptions (A1–A4) and inform Progress 1 requirements and the technical pilot.',
  whomToConsult: [
    {
      role: 'MCP Application Developers',
      focus: 'Builders integrating multiple MCP servers with local or hosted LLM hosts.',
    },
    {
      role: 'Engineers Deploying AI Agents',
      focus: 'Practitioners governing tool permissions, proxies, and organizational access.',
    },
    {
      role: 'AI Security Researchers',
      focus: 'Academic peers reviewing threat-model realism and experimental controls.',
    },
  ],
  whatToFindOut: [
    'Current multi-server MCP host setups and provider trust practices.',
    'Awareness of metadata shadowing across overlapping server tools.',
    'Practical workflow needs for defining host-issued task approvals.',
    'Acceptable latency overhead and audit-log detail for developers.',
  ],
  methods: [
    {
      method: 'Semi-Structured Interviews',
      target: '6–10 MCP practitioners',
      purpose: 'Verify A1 & A3 and capture real provider-authorization pain points.',
    },
    {
      method: 'Spec & Config Review',
      target: 'MCP Auth Spec & SDKs',
      purpose: 'Map protocol authorization hooks and proxy interception boundaries.',
    },
    {
      method: 'Guided Setup Walkthrough',
      target: '2-server local MCP setup',
      purpose: 'Observe manifest configuration friction and routing errors pre-build.',
    },
  ],
  reachingUsersWithoutClient:
    'Without a single named client, participants will be recruited via USJ Dept. of IT & alumni networks, Sri Lankan AI/engineering meetups, and open-source MCP developer communities.',
};

// Slide 09: Section 7 (Part 1) — Solution Type, Platform, Iterative Approach & Tools
export const APPROACH_PLATFORM_DATA = {
  expectedDeliverable: {
    type: 'Integrated Component & Working Prototype',
    summary:
      'A Python Task-to-Provider Authorization Gateway paired with a controlled two-server MCP + local Ollama testbed.',
    fitInProcess:
      'Sits transparently between the MCP Host/Agent and connected servers, intercepting every tool call before execution to enforce task-to-provider binding.',
  },
  platformComponents: {
    platform: 'Python Middleware Proxy / API + Local CLI Test Harness',
    consumingSystem: 'MCP Host Application & Local Ollama AI Agent (MCP Python SDK)',
    enables:
      'Deterministic, model-agnostic per-task provider authorization and audit logging without modifying LLM weights.',
    whySuits:
      'Lightweight local interception with SQLite and CLI logs keeps experimentation reproducible and zero-cost.',
  },
  devApproach: {
    methodology: 'Design Science Research (DSR) + Iterative Prototyping',
    figureCaption: 'Fig. 4 — Iterative Prototyping Lifecycle',
    stages: [
      { step: '01', name: 'Requirements', detail: 'Verify A1–A4 & threat model' },
      { step: '02', name: 'Design', detail: '5-function gateway & manifest' },
      { step: '03', name: 'Development', detail: 'Python proxy & 2 MCP servers' },
      { step: '04', name: 'Testing', detail: 'Pytest unit, integration & denial' },
      { step: '05', name: 'Refinement', detail: 'Security, latency & UX polish' },
    ],
  },
  toolsRationale: [
    { tool: 'Python + MCP SDK', rationale: 'Official protocol parity & async proxy interception' },
    { tool: 'Ollama + Local LLM', rationale: 'Reproducible local tool-calling agent (temp = 0.2)' },
    { tool: 'Python Crypto + SHA-256', rationale: 'Fast Ed25519 signatures & tool-definition hashing' },
    { tool: 'SQLite', rationale: 'Zero-config local registry, manifest & audit store' },
    { tool: 'Pytest', rationale: 'Automated unit, integration & security denial suite' },
    { tool: 'Pandas & SciPy', rationale: 'Paired McNemar, Wilcoxon/t-test & latency analysis' },
  ],
};

// Slide 10: Section 7 (Part 2) — Exact 20-Week Gantt (Proposal Sec 6) + Stage Outputs, Feasibility & Risk
export const GANTT_DATA = {
  months: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
  progress1WeekCol: 10, // Dec Week 2 (Lit Review & Methodology checkpoint)
  progress1Label: 'Progress 1 Gate',
  tasks: [
    {
      no: 1,
      activity: 'Finalize Topic & Identify Research Gap',
      startWeek: 1,
      endWeek: 3,
      phase: 'Planning & Chapter 1',
    },
    {
      no: 2,
      activity: 'Research Proposal Preparation',
      startWeek: 3,
      endWeek: 6,
      phase: 'Planning & Chapter 1',
    },
    {
      no: 3,
      activity: 'Proposal Completion & Submission',
      startWeek: 5,
      endWeek: 6,
      phase: 'Planning & Chapter 1',
    },
    {
      no: 4,
      activity: 'Complete Introduction Chapter',
      startWeek: 6,
      endWeek: 7,
      phase: 'Literature & Methodology',
    },
    {
      no: 5,
      activity: 'Investigation & Literature Review',
      startWeek: 7,
      endWeek: 10,
      phase: 'Literature & Methodology',
    },
    {
      no: 6,
      activity: 'Complete Methodology Chapter',
      startWeek: 8,
      endWeek: 9,
      phase: 'Literature & Methodology',
    },
    {
      no: 7,
      activity: 'Build Python Security Gateway',
      startWeek: 10,
      endWeek: 12,
      phase: 'Build & Evaluation',
    },
    {
      no: 8,
      activity: 'Develop 2 MCP Servers & Ollama Agent',
      startWeek: 12,
      endWeek: 14,
      phase: 'Build & Evaluation',
    },
    {
      no: 9,
      activity: 'Conduct Testing & Experiments',
      startWeek: 13,
      endWeek: 15,
      phase: 'Build & Evaluation',
    },
    {
      no: 10,
      activity: 'Analyze Results & Complete Summary',
      startWeek: 15,
      endWeek: 17,
      phase: 'Analysis & Final Report',
    },
    {
      no: 11,
      activity: 'Final Report Preparation',
      startWeek: 18,
      endWeek: 19,
      phase: 'Analysis & Final Report',
    },
    {
      no: 12,
      activity: 'Final Report Submission',
      startWeek: 20,
      endWeek: 20,
      phase: 'Analysis & Final Report',
    },
  ],
};

export const FEASIBILITY_RISK_DATA = {
  stageOutputs: [
    { stage: '1 · Planning & Ch. 1', weeks: 'W1–W6', output: 'Approved proposal & Chapter 1' },
    { stage: '2 · Lit & Method', weeks: 'W6–W10', output: 'Progress 1 review, reqs & threat model' },
    { stage: '3 · Build & Eval', weeks: 'W10–W15', output: 'Python gateway, 2-server testbed & logs' },
    { stage: '4 · Analysis & Report', weeks: 'W15–W20', output: 'SciPy evaluation & final dissertation' },
  ],
  resources: [
    { label: 'Access', detail: 'Open-source MCP SDK, local GPU/Ollama, volunteer devs' },
    { label: 'Time', detail: '20-week plan (Oct 2026–Feb 2027) + Progress 1 gate' },
    { label: 'Skills', detail: 'Python async, Ed25519/SHA-256 & statistical testing' },
    { label: 'Tools', detail: 'Python, SQLite, Pytest, Ollama, Pandas & SciPy (free)' },
  ],
  keyRisk: {
    risk: 'Local LLM tool-calling variability & GPU VRAM limits',
    impact: 'Unstable tool calling or VRAM bottlenecks can skew repeated trials.',
    mitigation:
      'Benchmark and lock one tool-capable Ollama model early within VRAM limits, fix temp = 0.2 and random seeds, and run a pilot trial first.',
  },
};

// Slide 11: Section 8 — Initial Measures of Success (User Tasks + Controlled Config A–D Benchmarks)
export const SUCCESS_MEASURES_DATA = {
  userTaskAssessment: {
    title: 'Representative User Task Evaluation',
    howAssessed:
      '6–10 MCP developers configure & run multi-server file-read tasks with and without the gateway:',
    observables: [
      {
        metric: 'Task Completion Time',
        detail: 'Seconds to configure a task manifest and complete a valid file read.',
      },
      {
        metric: 'Config & Routing Errors',
        detail: 'Count of manifest setup mistakes and unintended Server B calls.',
      },
      {
        metric: 'Workflow Clarity',
        detail: 'Post-task rating of manifest authoring effort and denial clarity.',
      },
    ],
  },
  systemBenchmarks: {
    title: 'Controlled Experimental Benchmarks (Configs A–D)',
    howAssessed:
      'Paired trials across 4 metadata conditions (primary hypothesis test: Config C vs Config D):',
    configs: [
      {
        code: 'A',
        name: 'Baseline',
        controls: 'No identity, integrity, or authorization checks',
        highlight: false,
      },
      {
        code: 'B',
        name: 'Identity + Integrity',
        controls: 'Ed25519 identity + SHA-256 tool fingerprint',
        highlight: false,
      },
      {
        code: 'C',
        name: 'General Auth',
        controls: 'Identity + integrity + general tool/action/path policy',
        highlight: false,
      },
      {
        code: 'D',
        name: 'Proposed Gateway',
        controls: 'All Config C checks + explicit task-to-provider binding',
        highlight: true,
      },
    ],
    metrics: [
      {
        code: 'ASR',
        name: 'Attack Success Rate',
        observable: '% malicious trials executing unauthorized Server B',
      },
      {
        code: 'BLK',
        name: 'Blocking Rate',
        observable: '% unauthorized Server B attempts rejected & logged',
      },
      {
        code: 'FPR',
        name: 'False-Positive Rate',
        observable: '% legitimate Server A calls incorrectly blocked',
      },
      {
        code: 'LTC',
        name: 'Task Completion',
        observable: '% legitimate Server A tasks completed end-to-end',
      },
      {
        code: 'LAT',
        name: 'Execution Latency',
        observable: 'Added gateway & end-to-end latency (median & P95 ms)',
      },
    ],
    statsNote:
      'Paired analysis (α = 0.05): Exact McNemar (binary outcomes) & Shapiro-Wilk + paired t-test / Wilcoxon (latency), Holm-adjusted.',
  },
};

// Slide 12: References (10 Verified Harvard Entries, Alphabetical, 1-to-1 with Slide Citations)
export const REFERENCES_META = {
  heading: 'ITC 4671 Bibliography',
  subtitle: 'All 10 sources cited across slides (Harvard style, 1-to-1)',
};

export const REFERENCES_LIST = [
  {
    id: 1,
    citeKey: 'bhatt2025',
    authorsYear: 'Bhatt, Narajala & Habler (2025)',
    fullText:
      "Bhatt, M, Narajala, VS & Habler, I 2025, 'ETDI: Mitigating tool squatting and rug pull attacks in Model Context Protocol (MCP) by using OAuth-enhanced tool definitions and policy-based access control', in 2025 Cyber Awareness and Research Symposium (CARS), IEEE, retrieved 8 November 2026, <https://doi.org/10.1109/CARS67163.2025.11337310>.",
  },
  {
    id: 2,
    citeKey: 'gentyala2026',
    authorsYear: 'Gentyala, Srinivas & Dhumpati (2026)',
    fullText:
      "Gentyala, S, Srinivas, C & Dhumpati, R 2026, 'A zero-trust supply chain security framework for Model Context Protocol-based AI systems', in Proceedings of the 2026 5th International Conference on Computer Networks, Big Data and IoT (ICCBI), IEEE, pp. 913–919, retrieved 8 November 2026, <https://doi.org/10.1109/ICCBI68589.2026.11619741>.",
  },
  {
    id: 3,
    citeKey: 'hou2026',
    authorsYear: 'Hou et al. (2026)',
    fullText:
      "Hou, X, Zhao, Y, Wang, S & Wang, H 2026, 'Model Context Protocol (MCP): Landscape, security threats, and future research directions', ACM Transactions on Software Engineering and Methodology, vol. 35, no. 10, article 302, retrieved 8 November 2026, <https://doi.org/10.1145/3796519>.",
  },
  {
    id: 4,
    citeKey: 'li2025',
    authorsYear: 'Li et al. (2025)',
    fullText:
      "Li, Z, Li, K, Ma, B, Xu, M, Zhang, Y & Cheng, X 2025, 'We urgently need privilege management in MCP: A measurement of API usage in MCP ecosystems', in 2025 IEEE 22nd International Conference on Mobile Ad-Hoc and Smart Systems (MASS), IEEE, retrieved 8 November 2026, <https://doi.org/10.1109/MASS66014.2025.00090>.",
  },
  {
    id: 5,
    citeKey: 'li2026',
    authorsYear: 'Li et al. (2026)',
    fullText:
      "Li, Z, Wu, J, Peng, Y, Luo, T, Cui, X & Ling, X 2026, 'Confused deputy attack against Model Context Protocol', ACM Transactions on Software Engineering and Methodology, retrieved 8 November 2026, <https://doi.org/10.1145/3830467>.",
  },
  {
    id: 6,
    citeKey: 'mcp2025',
    authorsYear: 'Model Context Protocol (2025)',
    fullText:
      "Model Context Protocol 2025, 'Authorization', Model Context Protocol Specification, version 2025-11-25, GitHub, retrieved 8 November 2026, <https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2025-11-25/basic/authorization.mdx>.",
  },
  {
    id: 7,
    citeKey: 'uppala2026',
    authorsYear: 'Uppala (2026)',
    fullText:
      "Uppala, R 2026, 'Prompts don't protect: Architectural enforcement via MCP proxy for LLM tool access control', arXiv preprint, arXiv:2605.18414, retrieved 8 November 2026, <https://arxiv.org/abs/2605.18414>.",
  },
  {
    id: 8,
    citeKey: 'wang2026',
    authorsYear: 'Wang et al. (2026)',
    fullText:
      "Wang, Z, Zhang, R, Liu, Y, Fan, W, Jiang, W, Zhao, Q, Li, H & Xu, G 2026, 'MPMA: Preference manipulation attack against Model Context Protocol', in Proceedings of the AAAI Conference on Artificial Intelligence, vol. 40, no. 42, pp. 35838–35846, retrieved 8 November 2026, <https://doi.org/10.1609/aaai.v40i42.40898>.",
  },
  {
    id: 9,
    citeKey: 'xing2025',
    authorsYear: 'Xing et al. (2025)',
    fullText:
      "Xing, W, Qi, Z, Qin, Y, Li, Y, Chang, C, Yu, J, Lin, C, Xie, Z & Han, M 2025, 'MCP-Guard: A defense framework for Model Context Protocol integrity in large language model applications', arXiv preprint, arXiv:2508.10991, retrieved 8 November 2026, <https://arxiv.org/abs/2508.10991>.",
  },
  {
    id: 10,
    citeKey: 'yergattikar2026',
    authorsYear: 'Yergattikar (2026)',
    fullText:
      "Yergattikar, S 2026, 'Securing the tool layer: A threat taxonomy and runtime defense framework for Model Context Protocol deployments', in Proceedings of the 64th Annual Meeting of the Association for Computational Linguistics (Volume 6: Industry Track), Association for Computational Linguistics, pp. 865–871, retrieved 8 November 2026, <https://doi.org/10.18653/v1/2026.acl-industry.58>.",
  },
];
