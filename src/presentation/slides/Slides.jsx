/* eslint-disable react-refresh/only-export-components */
import SlideFrame from '../components/SlideFrame.jsx';
import {
  HijackScenarioDiagram,
  GatewayArchitectureDiagram,
  ManifestLifecycleDiagram,
  IterativeApproachDiagram,
  GanttChart,
} from '../components/Diagrams.jsx';
import {
  DECK_META,
  SLIDES_BY_SLUG,
  BACKGROUND_USERS_DATA,
  PROBLEM_DATA,
  AIM_OBJECTIVES_DATA,
  RELATED_WORK_DATA,
  SOLUTION_ARCH_DATA,
  PROCESS_SCOPE_DATA,
  INVESTIGATION_PLAN_DATA,
  APPROACH_PLATFORM_DATA,
  GANTT_DATA,
  FEASIBILITY_RISK_DATA,
  SUCCESS_MEASURES_DATA,
  REFERENCES_META,
  REFERENCES_LIST,
} from '../slideData.js';

const formatSection = (section) => String(section || '').replace(' · ', ' / ');

const METRIC_CODE_TONE = {
  ASR: 'text-[color:var(--pres-danger)]',
  BLK: 'text-[color:var(--pres-danger)]',
  FPR: 'text-[color:var(--pres-primary)]',
  LTC: 'text-[color:var(--pres-success-ink)]',
  LAT: 'text-[color:var(--pres-accent)]',
};

function ScopeCheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="var(--pres-success)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-[3px] shrink-0"
      aria-hidden="true"
    >
      <path d="M3 8.5L6.5 12L13 4.5" />
    </svg>
  );
}

function ScopeCrossIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="var(--pres-danger)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-[3px] shrink-0"
      aria-hidden="true"
    >
      <path d="M4 4L12 12M12 4L4 12" />
    </svg>
  );
}

/* ==========================================================================
   SLIDE 01 — Cover (Asymmetric Oxford Navy Spine + Editorial Monograph)
   ========================================================================== */

function CoverSlide({ slideNumber, totalSlides }) {
  const meta = SLIDES_BY_SLUG.cover;

  return (
    <SlideFrame
      slideNumber={slideNumber}
      totalSlides={totalSlides}
      title={meta.title}
      variant="cover"
      meta={DECK_META}
    >
      <div className="flex h-full flex-col justify-between">
        {/* Institutional Masthead */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="pres-kicker text-[12px]">
              {DECK_META.university} &nbsp;·&nbsp; {DECK_META.faculty}
            </p>
            <p className="mt-1.5 text-[14px] font-medium text-[color:var(--pres-ink-secondary)]">
              {DECK_META.department} &nbsp;·&nbsp; {DECK_META.course}
            </p>
          </div>
          <span className="pres-tag text-[12px]">{DECK_META.presentationLabel}</span>
        </div>

        {/* Monograph Title Block — framed cleanly on left 62% beside architectural gateway motif */}
        <div className="my-auto max-w-[760px] py-4">
          <div className="mb-5 h-[3px] w-16 bg-[var(--pres-accent)]" aria-hidden="true" />
          <h1 className="pres-display text-[34px] font-bold leading-[1.16] tracking-[-0.02em] text-[color:var(--pres-ink)]">
            {DECK_META.title}
          </h1>
          <p className="mt-5 text-[15px] font-semibold text-[color:var(--pres-ink-secondary)]">
            {DECK_META.degree} &nbsp;·&nbsp; {DECK_META.semester}
          </p>
        </div>

        {/* Bottom 2-Column Academic Ledger */}
        <div className="grid max-w-[760px] grid-cols-2 gap-10 border-t-2 border-[color:var(--pres-rule-ink)] pt-5">
          <div>
            <div className="pres-kicker pres-kicker--muted text-[12px]">Candidate</div>
            <div className="mt-1.5 text-[16px] font-bold text-[color:var(--pres-ink)]">
              {DECK_META.author}
            </div>
            <div className="pres-mono mt-1 text-[13px] font-medium text-[color:var(--pres-primary)]">
              Index No: {DECK_META.indexNo} &nbsp;|&nbsp; Reg No: {DECK_META.regNo}
            </div>
          </div>

          <div className="border-l border-[color:var(--pres-border)] pl-10">
            <div className="pres-kicker pres-kicker--muted text-[12px]">Supervisor</div>
            <div className="mt-1.5 text-[16px] font-bold text-[color:var(--pres-ink)]">
              {DECK_META.supervisor}
            </div>
            <div className="mt-1 text-[13px] text-[color:var(--pres-ink-secondary)]">
              {DECK_META.department}
            </div>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}

/* ==========================================================================
   SLIDE 02 — §1: Background & Intended Users (Metric-Hero Split)
   ========================================================================== */

function BackgroundUsersSlide({ slideNumber, totalSlides }) {
  const meta = SLIDES_BY_SLUG['background-users'];

  return (
    <SlideFrame
      slideNumber={slideNumber}
      totalSlides={totalSlides}
      section={formatSection(meta.section)}
      title={meta.title}
      subtitle={meta.subtitle}
      meta={DECK_META}
    >
      <div className="grid h-full grid-cols-[1.12fr_1fr] gap-10">
        {/* Left: Empirical Metric Hero + Project Setting + Motivation */}
        <div className="flex min-h-0 flex-col justify-between">
          {/* Empirical Prompt Plate */}
          <div className="pres-plate pres-plate--danger">
            <div className="grid grid-cols-2 gap-6">
              {BACKGROUND_USERS_DATA.empiricalStats.map((stat, idx) => (
                <div
                  key={stat.label}
                  className={idx > 0 ? 'border-l border-[color:var(--pres-border)] pl-6' : ''}
                >
                  <div className="pres-stat-num text-[42px] text-[color:var(--pres-danger)]">
                    {stat.value}
                  </div>
                  <div className="mt-1.5 text-[14px] font-bold text-[color:var(--pres-ink)]">
                    {stat.label}
                  </div>
                  <p className="mt-0.5 text-[12px] leading-[1.35] text-[color:var(--pres-ink-muted)]">
                    {stat.source}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Setting & Prompt Bullets */}
          <div className="my-auto py-2">
            <h2 className="pres-kicker text-[12px]">Project Setting &amp; Motivation</h2>
            <ol className="mt-2.5 space-y-2.5">
              {BACKGROUND_USERS_DATA.settingAndPrompt.map((item, idx) => (
                <li
                  key={item}
                  className="flex items-baseline gap-3 text-[13.5px] leading-[1.46] text-[color:var(--pres-ink)]"
                >
                  <span className="pres-mono w-6 shrink-0 text-[12.5px] font-bold text-[color:var(--pres-primary)]">
                    0{idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Core Ecosystem Gap */}
          <div className="pres-callout pres-callout--danger">
            <h2 className="pres-kicker pres-kicker--danger text-[12px]">Ecosystem Privilege Gap</h2>
            <p className="mt-1 text-[13px] leading-[1.42] text-[color:var(--pres-ink)]">
              {BACKGROUND_USERS_DATA.whyNeeded}
            </p>
          </div>
        </div>

        {/* Right: Unboxed Target User Roster + Supported Task/Decision */}
        <div className="pres-col-divider flex min-h-0 flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3">
              <h2 className="pres-kicker text-[12px]">Intended Users</h2>
              <span className="pres-tag text-[12px]">{BACKGROUND_USERS_DATA.clientBadge}</span>
            </div>
            <p className="mt-1.5 text-[13.5px] font-semibold text-[color:var(--pres-ink-secondary)]">
              {BACKGROUND_USERS_DATA.clientStatus}
            </p>

            <div className="mt-3 divide-y divide-[color:var(--pres-border)] border-y border-[color:var(--pres-border-strong)]">
              {BACKGROUND_USERS_DATA.intendedUsers.map((user, idx) => (
                <div key={user.group} className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2.5">
                      <span className="pres-mono text-[12px] font-bold text-[color:var(--pres-primary)]">
                        0{idx + 1}
                      </span>
                      <h3 className="text-[14.5px] font-bold text-[color:var(--pres-ink)]">
                        {user.group}
                      </h3>
                    </div>
                    <span
                      className={
                        user.tier === 'Primary'
                          ? 'pres-tag text-[12px]'
                          : 'pres-tag pres-tag--neutral text-[12px]'
                      }
                    >
                      {user.tier}
                    </span>
                  </div>
                  <p className="mt-1 pl-6 text-[13px] leading-[1.42] text-[color:var(--pres-ink-secondary)]">
                    {user.need}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pres-callout mt-4">
            <h2 className="pres-kicker text-[12px]">Task &amp; Decision Supported</h2>
            <p className="mt-1 text-[13.5px] leading-[1.45] text-[color:var(--pres-ink)]">
              {BACKGROUND_USERS_DATA.supportedTask}
            </p>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}

/* ==========================================================================
   SLIDE 03 — §2: Preliminary Problem Statement & Assumptions (Diagram Stage)
   ========================================================================== */

function ProblemSlide({ slideNumber, totalSlides }) {
  const meta = SLIDES_BY_SLUG.problem;

  return (
    <SlideFrame
      slideNumber={slideNumber}
      totalSlides={totalSlides}
      section={formatSection(meta.section)}
      title={meta.title}
      subtitle={meta.subtitle}
      meta={DECK_META}
    >
      <div className="pres-split-asymmetric h-full">
        {/* Left (~58%): HijackScenarioDiagram Focal Stage + Workflow Contrast */}
        <div className="flex min-h-0 flex-col justify-between">
          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-4 border-b border-[color:var(--pres-border)] pb-1.5">
              <span className="pres-mono text-[12px] font-semibold text-[color:var(--pres-primary)]">
                {PROBLEM_DATA.figureCaption}
              </span>
              <span className="text-[12px] text-[color:var(--pres-ink-muted)]">
                {PROBLEM_DATA.figureNote}
              </span>
            </div>
            <HijackScenarioDiagram />
          </div>

          <div className="mt-2.5 border-t border-[color:var(--pres-border-strong)] pt-2.5">
            <p className="text-[13px] leading-[1.42] text-[color:var(--pres-ink)]">
              <strong className="font-bold text-[color:var(--pres-primary)]">
                Current Workflow:{' '}
              </strong>
              {PROBLEM_DATA.currentWorkflow}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-5 border-t border-[color:var(--pres-border)] pt-2">
              <div>
                <div className="pres-kicker pres-kicker--success text-[12px]">
                  {PROBLEM_DATA.serverA.name} · {PROBLEM_DATA.serverA.status}
                </div>
                <p className="mt-0.5 text-[12px] leading-[1.36] text-[color:var(--pres-ink-secondary)]">
                  {PROBLEM_DATA.serverA.details}
                </p>
              </div>
              <div className="border-l border-[color:var(--pres-border)] pl-4">
                <div className="pres-kicker pres-kicker--danger text-[12px]">
                  {PROBLEM_DATA.serverB.name} · {PROBLEM_DATA.serverB.status}
                </div>
                <p className="mt-0.5 text-[12px] leading-[1.36] text-[color:var(--pres-ink-secondary)]">
                  {PROBLEM_DATA.serverB.details}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right (~42%): Core Problem Thesis + Assumptions A1–A4 Verification Ledger */}
        <div className="pres-col-divider flex min-h-0 flex-col justify-between">
          <div>
            <h2 className="pres-kicker text-[12px]">Core Security Gap</h2>
            <p className="pres-display mt-1 text-[21px] font-bold leading-[1.2] tracking-[-0.015em] text-[color:var(--pres-ink)]">
              {PROBLEM_DATA.headline}
            </p>
            <p className="mt-2 text-[13px] leading-[1.42] text-[color:var(--pres-ink-secondary)]">
              {PROBLEM_DATA.difficulty}
            </p>
            <div className="pres-callout pres-callout--accent mt-2.5">
              <p className="text-[12.5px] leading-[1.38] text-[color:var(--pres-ink)]">
                <strong className="font-bold text-[color:var(--pres-accent)]">
                  Why Investigate:{' '}
                </strong>
                {PROBLEM_DATA.whyWorthInvestigating}
              </p>
            </div>
          </div>

          <div className="mt-2.5">
            <h2 className="pres-kicker text-[12px]">Assumptions to Verify</h2>
            <div className="mt-1.5 divide-y divide-[color:var(--pres-border)] border-y-2 border-[color:var(--pres-rule-ink)]">
              {PROBLEM_DATA.assumptionsToVerify.map((item) => (
                <div key={item.id} className="flex items-baseline gap-2.5 py-1.5">
                  <span className="pres-mono w-6 shrink-0 text-[12.5px] font-bold text-[color:var(--pres-primary)]">
                    {item.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-semibold leading-[1.3] text-[color:var(--pres-ink)]">
                      {item.assumption}
                    </div>
                    <div className="pres-mono mt-0.5 text-[12px] text-[color:var(--pres-ink-muted)]">
                      Verify: {item.verifyHow}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}

/* ==========================================================================
   SLIDE 04 — §3: Project Aim, Research Question & 4 Specific Objectives
   ========================================================================== */

function AimObjectivesSlide({ slideNumber, totalSlides }) {
  const meta = SLIDES_BY_SLUG['aim-objectives'];

  return (
    <SlideFrame
      slideNumber={slideNumber}
      totalSlides={totalSlides}
      section={formatSection(meta.section)}
      title={meta.title}
      subtitle={meta.subtitle}
      footnote={`${AIM_OBJECTIVES_DATA.dsrFooter}  ·  ${AIM_OBJECTIVES_DATA.planMeta}`}
      meta={DECK_META}
    >
      <div className="flex h-full flex-col justify-between">
        {/* Full-Width Sculptural One-Sentence Overall Aim */}
        <div className="pres-callout px-6 py-4">
          <h2 className="pres-kicker text-[12px]">Overall Project Aim (One Sentence)</h2>
          <blockquote className="pres-display mt-1.5 max-w-[1090px] text-[22px] font-semibold leading-[1.3] tracking-[-0.01em] text-[color:var(--pres-ink)]">
            {AIM_OBJECTIVES_DATA.overallAim}
          </blockquote>
        </div>

        {/* Proposal Research Question */}
        <div className="border-l-[3px] border-[color:var(--pres-accent)] pl-4 py-1">
          <h2 className="pres-kicker pres-kicker--accent text-[12px]">
            Primary Research Question
          </h2>
          <p className="mt-1 text-[13.5px] leading-[1.44] text-[color:var(--pres-ink-secondary)]">
            {AIM_OBJECTIVES_DATA.researchQuestion}
          </p>
        </div>

        {/* 2x2 Unboxed DSR Objective Rails */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-5 border-t-2 border-[color:var(--pres-rule-ink)] pt-5">
          {AIM_OBJECTIVES_DATA.objectives.map((obj) => (
            <div key={obj.id} className="flex items-start gap-4">
              <div className="pres-mono w-8 shrink-0 text-[22px] font-bold leading-none text-[color:var(--pres-primary)]">
                {obj.id}
              </div>
              <div className="min-w-0 flex-1 border-l border-[color:var(--pres-border-strong)] pl-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="pres-kicker text-[12px]">{obj.category}</span>
                  <span className="pres-mono text-[12px] text-[color:var(--pres-ink-muted)]">
                    {obj.milestone}
                  </span>
                </div>
                <h3 className="mt-1 text-[15.5px] font-bold leading-[1.25] text-[color:var(--pres-ink)]">
                  {obj.title}
                </h3>
                <p className="mt-1 text-[13.5px] leading-[1.44] text-[color:var(--pres-ink-secondary)]">
                  {obj.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}

/* ==========================================================================
   SLIDE 05 — §4: Preliminary Review of Related Studies & Similar Systems
   ========================================================================== */

function RelatedWorkSlide({ slideNumber, totalSlides }) {
  const meta = SLIDES_BY_SLUG['related-work'];

  const rows = [
    ...RELATED_WORK_DATA.relatedStudies.map((item) => ({
      kind: 'Study',
      label: item.study,
      citation: null,
      addresses: item.addresses,
      suggests: item.suggests,
    })),
    ...RELATED_WORK_DATA.similarSystems.map((sys) => ({
      kind: 'System',
      label: sys.system,
      citation: sys.citation,
      addresses: sys.addresses,
      suggests: sys.suggests,
    })),
  ];

  return (
    <SlideFrame
      slideNumber={slideNumber}
      totalSlides={totalSlides}
      section={formatSection(meta.section)}
      title={meta.title}
      subtitle={meta.subtitle}
      footnote={RELATED_WORK_DATA.progressOneNote}
      meta={DECK_META}
    >
      <div className="flex h-full flex-col justify-between gap-3">
        {/* Full-Width Publication Comparative Booktabs Matrix */}
        <div className="min-h-0 flex-1">
          <table className="pres-table pres-table--compact">
            <thead>
              <tr>
                <th className="w-[88px]">Type</th>
                <th className="w-[30%]">Study / System &amp; Citation</th>
                <th className="w-[31%]">What It Addresses</th>
                <th>What It Suggests for Proposal</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td>
                    <span
                      className={
                        row.kind === 'Study'
                          ? 'pres-tag pres-tag--accent text-[12px]'
                          : 'pres-tag text-[12px]'
                      }
                    >
                      {row.kind}
                    </span>
                  </td>
                  <td>
                    <span className="font-bold text-[color:var(--pres-ink)]">{row.label}</span>
                    {row.citation && (
                      <span className="ml-1.5 text-[12px] text-[color:var(--pres-ink-muted)]">
                        ({row.citation})
                      </span>
                    )}
                  </td>
                  <td className="text-[color:var(--pres-ink-secondary)]">{row.addresses}</td>
                  <td className="font-medium text-[color:var(--pres-primary)]">{row.suggests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stark Crimson-Ruled Identified Gap Callout */}
        <div className="pres-callout pres-callout--danger">
          <h2 className="pres-kicker pres-kicker--danger text-[12px]">
            Identified Gap / User Need to Investigate
          </h2>
          <p className="mt-1 text-[13.5px] leading-[1.42] text-[color:var(--pres-ink)]">
            {RELATED_WORK_DATA.identifiedGap}
          </p>
        </div>
      </div>
    </SlideFrame>
  );
}

/* ==========================================================================
   SLIDE 06 — §5a: Proposed Solution & Gateway Architecture (Blueprint Focus)
   ========================================================================== */

function SolutionArchitectureSlide({ slideNumber, totalSlides }) {
  const meta = SLIDES_BY_SLUG['solution-architecture'];

  return (
    <SlideFrame
      slideNumber={slideNumber}
      totalSlides={totalSlides}
      section={formatSection(meta.section)}
      title={meta.title}
      subtitle={meta.subtitle}
      footnote={SOLUTION_ARCH_DATA.aliasNote}
      meta={DECK_META}
    >
      <div className="grid h-full grid-cols-[1.45fr_1fr] gap-9">
        {/* Left (~59%): Dominant GatewayArchitectureDiagram + User Benefit */}
        <div className="flex min-h-0 flex-col justify-between">
          <div>
            <div className="mb-1.5 border-b border-[color:var(--pres-border)] pb-1.5">
              <span className="pres-mono text-[12px] font-semibold text-[color:var(--pres-primary)]">
                {SOLUTION_ARCH_DATA.figureCaption}
              </span>
            </div>
            <GatewayArchitectureDiagram />
          </div>

          <div className="pres-callout mt-2.5">
            <h2 className="pres-kicker text-[12px]">How It Helps Intended Users</h2>
            <p className="mt-1 text-[13.5px] leading-[1.42] text-[color:var(--pres-ink)]">
              {SOLUTION_ARCH_DATA.howItHelps}
            </p>
          </div>
        </div>

        {/* Right (~41%): Crisp Numbered 5 Core Functions Key */}
        <div className="pres-col-divider flex min-h-0 flex-col">
          <h2 className="pres-kicker text-[12px]">Five Core Gateway Functions</h2>
          <div className="mt-2.5 flex flex-1 flex-col justify-between divide-y divide-[color:var(--pres-border)] border-y-2 border-[color:var(--pres-rule-ink)]">
            {SOLUTION_ARCH_DATA.mainFunctions.map((fn) => (
              <div key={fn.num} className="flex items-start gap-3 py-2.5">
                <span className="pres-mono mt-0.5 w-7 shrink-0 text-[13px] font-bold text-[color:var(--pres-primary)]">
                  {fn.num}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[14.5px] font-bold leading-[1.25] text-[color:var(--pres-ink)]">
                    {fn.name}
                  </h3>
                  <p className="mt-0.5 text-[13px] leading-[1.38] text-[color:var(--pres-ink-secondary)]">
                    {fn.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}

/* ==========================================================================
   SLIDE 07 — §5b: Complete Supported Process, Manifest Schema & Scope
   ========================================================================== */

function ProcessScopeSlide({ slideNumber, totalSlides }) {
  const meta = SLIDES_BY_SLUG['process-scope'];
  const { supportedProcess, manifestPreview, inScope, outOfScope } = PROCESS_SCOPE_DATA;

  return (
    <SlideFrame
      slideNumber={slideNumber}
      totalSlides={totalSlides}
      section={formatSection(meta.section)}
      title={meta.title}
      subtitle={meta.subtitle}
      meta={DECK_META}
    >
      <div className="flex h-full flex-col justify-between">
        {/* Top Full-Width 4-Stage Supported Process Blueprint */}
        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-4">
            <h2 className="pres-kicker text-[12px]">{supportedProcess.title}</h2>
            <span className="pres-mono text-[12px] text-[color:var(--pres-ink-muted)]">
              {supportedProcess.figureCaption}
            </span>
          </div>
          <ManifestLifecycleDiagram />
        </div>

        {/* Bottom Asymmetric Split: Signed Manifest Schema + In/Out Scope Ledger */}
        <div className="mt-3.5 grid min-h-0 flex-1 grid-cols-[1.02fr_1.18fr] gap-8 border-t-2 border-[color:var(--pres-rule-ink)] pt-3.5">
          {/* Left: Signed Task Approval Manifest Code Block (Proposal Sec 5.3) */}
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="pres-kicker text-[12px]">{manifestPreview.title}</h2>
              <div className="pres-code-block mt-2">
                <div className="text-[12px] leading-[1.38] text-[color:var(--pres-ink-muted)]">
                  {'{'}
                </div>
                <div className="space-y-0.5 pl-4 text-[12px] leading-[1.38]">
                  {manifestPreview.fields.map((field, idx) => (
                    <div key={field.key}>
                      <span className="font-semibold text-[color:var(--pres-primary)]">
                        &quot;{field.key}&quot;
                      </span>
                      <span className="text-[color:var(--pres-ink-muted)]">: </span>
                      <span className="text-[color:var(--pres-ink)]">{field.value}</span>
                      {idx < manifestPreview.fields.length - 1 && (
                        <span className="text-[color:var(--pres-ink-muted)]">,</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-[12px] leading-[1.38] text-[color:var(--pres-ink-muted)]">
                  {'}'}
                </div>
              </div>
            </div>
            <p className="mt-2 text-[12.5px] leading-[1.4] text-[color:var(--pres-ink-secondary)]">
              {manifestPreview.securityNote}
            </p>
          </div>

          {/* Right: High-Contrast In-Scope vs Out-of-Scope Ledger (Sec 3.3) */}
          <div className="pres-col-divider grid grid-cols-2 gap-6">
            <div>
              <h2 className="pres-kicker pres-kicker--success text-[12px]">In Initial Scope</h2>
              <ul className="mt-2.5 space-y-2.5">
                {inScope.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[13px] leading-[1.42] text-[color:var(--pres-ink)]"
                  >
                    <ScopeCheckIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-l border-[color:var(--pres-border)] pl-5">
              <h2 className="pres-kicker pres-kicker--danger text-[12px]">
                Outside Initial Scope
              </h2>
              <ul className="mt-2.5 space-y-2">
                {outOfScope.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[12.5px] leading-[1.38] text-[color:var(--pres-ink-secondary)]"
                  >
                    <ScopeCrossIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}

/* ==========================================================================
   SLIDE 08 — §6: Investigation Plan (3-Column Architectural Inquiry Rail)
   ========================================================================== */

function InvestigationPlanSlide({ slideNumber, totalSlides }) {
  const meta = SLIDES_BY_SLUG['investigation-plan'];

  return (
    <SlideFrame
      slideNumber={slideNumber}
      totalSlides={totalSlides}
      section={formatSection(meta.section)}
      title={meta.title}
      subtitle={meta.subtitle}
      footnote={INVESTIGATION_PLAN_DATA.stageNote}
      meta={DECK_META}
    >
      <div className="flex h-full flex-col justify-between">
        {/* 3-Column Architectural Inquiry Rail: Whom | What | How */}
        <div className="pres-rail-3 min-h-0 flex-1">
          {/* Column 1: Whom to Consult */}
          <div className="flex flex-col border-t-2 border-[color:var(--pres-primary)] pt-3">
            <h2 className="pres-kicker text-[12px]">01 · Whom to Consult</h2>
            <div className="mt-2.5 flex flex-1 flex-col justify-between divide-y divide-[color:var(--pres-border)]">
              {INVESTIGATION_PLAN_DATA.whomToConsult.map((person) => (
                <div key={person.role} className="py-2.5 first:pt-1 last:pb-0">
                  <h3 className="text-[14.5px] font-bold text-[color:var(--pres-ink)]">
                    {person.role}
                  </h3>
                  <p className="mt-1 text-[13px] leading-[1.44] text-[color:var(--pres-ink-secondary)]">
                    {person.focus}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: What to Find Out */}
          <div className="flex flex-col border-t-2 border-[color:var(--pres-primary)] pt-3">
            <h2 className="pres-kicker text-[12px]">02 · What to Find Out</h2>
            <ol className="mt-2.5 flex flex-1 flex-col justify-between divide-y divide-[color:var(--pres-border)]">
              {INVESTIGATION_PLAN_DATA.whatToFindOut.map((item, idx) => (
                <li
                  key={item}
                  className="flex items-baseline gap-2.5 py-2.5 text-[13.5px] leading-[1.42] text-[color:var(--pres-ink)] first:pt-1 last:pb-0"
                >
                  <span className="pres-mono w-6 shrink-0 text-[12px] font-bold text-[color:var(--pres-primary)]">
                    Q{idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Column 3: Methods & Evidence */}
          <div className="flex flex-col border-t-2 border-[color:var(--pres-primary)] pt-3">
            <h2 className="pres-kicker text-[12px]">03 · Methods &amp; Evidence</h2>
            <div className="mt-2.5 flex flex-1 flex-col justify-between divide-y divide-[color:var(--pres-border)]">
              {INVESTIGATION_PLAN_DATA.methods.map((m) => (
                <div key={m.method} className="py-2.5 first:pt-1 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <h3 className="text-[14px] font-bold text-[color:var(--pres-ink)]">
                      {m.method}
                    </h3>
                    <span className="pres-tag text-[12px]">{m.target}</span>
                  </div>
                  <p className="mt-1 text-[13px] leading-[1.42] text-[color:var(--pres-ink-secondary)]">
                    {m.purpose}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Outreach Band */}
        <div className="pres-callout mt-5">
          <h2 className="pres-kicker text-[12px]">
            04 · Reaching Target Users Without a Named Client
          </h2>
          <p className="mt-1 text-[13.5px] leading-[1.46] text-[color:var(--pres-ink)]">
            {INVESTIGATION_PLAN_DATA.reachingUsersWithoutClient}
          </p>
        </div>
      </div>
    </SlideFrame>
  );
}

/* ==========================================================================
   SLIDE 09 — §7a: Solution Type, Platform, Iterative Approach & Tools
   ========================================================================== */

function ApproachPlatformSlide({ slideNumber, totalSlides }) {
  const meta = SLIDES_BY_SLUG['approach-platform'];
  const { expectedDeliverable, platformComponents, devApproach, toolsRationale } =
    APPROACH_PLATFORM_DATA;

  return (
    <SlideFrame
      slideNumber={slideNumber}
      totalSlides={totalSlides}
      section={formatSection(meta.section)}
      title={meta.title}
      subtitle={meta.subtitle}
      meta={DECK_META}
    >
      <div className="grid h-full grid-cols-[0.92fr_1.18fr] gap-9">
        {/* Left: Expected Deliverable + Platform & Consuming System Ledger */}
        <div className="flex min-h-0 flex-col justify-center gap-6">
          <div>
            <h2 className="pres-kicker text-[12px]">Expected Deliverable</h2>
            <h3 className="pres-display mt-1 text-[21px] font-bold leading-[1.2] text-[color:var(--pres-ink)]">
              {expectedDeliverable.type}
            </h3>
            <p className="mt-1.5 text-[13.5px] leading-[1.44] text-[color:var(--pres-ink-secondary)]">
              {expectedDeliverable.summary}
            </p>

            <div className="pres-callout mt-3">
              <div className="pres-kicker text-[12px]">Fit Within Complete Process</div>
              <p className="mt-1 text-[13px] leading-[1.42] text-[color:var(--pres-ink)]">
                {expectedDeliverable.fitInProcess}
              </p>
            </div>
          </div>

          <div className="border-t-2 border-[color:var(--pres-rule-ink)] pt-4">
            <h2 className="pres-kicker text-[12px]">Platform &amp; Consuming System</h2>
            <dl className="mt-2 space-y-2 text-[13px] leading-[1.42]">
              <div>
                <dt className="inline font-bold text-[color:var(--pres-ink)]">Platform: </dt>
                <dd className="inline text-[color:var(--pres-ink)]">
                  {platformComponents.platform}
                </dd>
              </div>
              <div>
                <dt className="inline font-bold text-[color:var(--pres-ink)]">
                  Consuming System:{' '}
                </dt>
                <dd className="inline font-semibold text-[color:var(--pres-primary)]">
                  {platformComponents.consumingSystem}
                </dd>
              </div>
              <div>
                <dt className="inline font-bold text-[color:var(--pres-ink)]">What It Enables: </dt>
                <dd className="inline text-[color:var(--pres-ink)]">
                  {platformComponents.enables}
                </dd>
              </div>
              <div>
                <dt className="inline font-bold text-[color:var(--pres-ink)]">Why It Suits: </dt>
                <dd className="inline text-[color:var(--pres-ink-secondary)]">
                  {platformComponents.whySuits}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right: IterativeApproachDiagram + Proposal Table 1 Tools Rationale */}
        <div className="pres-col-divider flex min-h-0 flex-col justify-between">
          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-4 border-b border-[color:var(--pres-border)] pb-1">
              <h2 className="pres-kicker shrink-0 text-[12px]">Development Approach</h2>
              <span className="pres-mono whitespace-nowrap text-[12px] text-[color:var(--pres-ink-muted)]">
                {devApproach.figureCaption}
              </span>
            </div>
            <IterativeApproachDiagram />
          </div>

          <div className="mt-2.5">
            <h2 className="pres-kicker mb-1.5 text-[12px]">
              Key Frameworks &amp; Tools Rationale
            </h2>
            <table className="pres-table pres-table--compact">
              <thead>
                <tr>
                  <th className="w-[38%]">Tool / Framework</th>
                  <th>Why It Suits the Project</th>
                </tr>
              </thead>
              <tbody>
                {toolsRationale.map((item) => (
                  <tr key={item.tool}>
                    <td className="pres-mono font-semibold text-[color:var(--pres-primary)]">
                      {item.tool}
                    </td>
                    <td className="text-[color:var(--pres-ink)]">{item.rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}

/* ==========================================================================
   SLIDE 10 — §7b: Work Plan, Stage Outputs, Feasibility & Key Risk
   ========================================================================== */

function WorkPlanFeasibilitySlide({ slideNumber, totalSlides }) {
  const meta = SLIDES_BY_SLUG['work-plan-feasibility'];
  const { stageOutputs, resources, keyRisk } = FEASIBILITY_RISK_DATA;

  return (
    <SlideFrame
      slideNumber={slideNumber}
      totalSlides={totalSlides}
      section={formatSection(meta.section)}
      title={meta.title}
      subtitle={meta.subtitle}
      meta={DECK_META}
    >
      <div className="flex h-full flex-col justify-between">
        {/* Top: Full-Width 20-Week Booktabs Gantt Chart */}
        <div className="w-full">
          <GanttChart data={GANTT_DATA} compact />
        </div>

        {/* Bottom Tier 1: Four Stage Expected Outputs Rail */}
        <div className="pres-rail-4 mt-2 border-t-2 border-[color:var(--pres-rule-ink)] pt-2">
          {stageOutputs.map((item) => (
            <div key={item.stage} className="min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="pres-mono text-[12px] font-bold text-[color:var(--pres-primary)]">
                  {item.stage}
                </span>
                <span className="pres-mono text-[12px] text-[color:var(--pres-ink-muted)]">
                  {item.weeks}
                </span>
              </div>
              <p className="truncate text-[12px] leading-[1.3] text-[color:var(--pres-ink)]">
                {item.output}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Tier 2: Feasibility (Access/Time/Skills/Tools) + Key Risk Mitigation */}
        <div className="mt-2 grid grid-cols-[1.06fr_1fr] gap-6 border-t border-[color:var(--pres-border)] pt-2">
          <div>
            <h2 className="pres-kicker mb-1 text-[12px]">
              Feasibility: Access, Time, Skills &amp; Tools
            </h2>
            <div className="grid grid-cols-2 gap-x-5 gap-y-1">
              {resources.map((res) => (
                <div key={res.label} className="text-[12px] leading-[1.32]">
                  <span className="pres-mono font-bold text-[color:var(--pres-primary)]">
                    {res.label}:{' '}
                  </span>
                  <span className="text-[color:var(--pres-ink)]">{res.detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pres-callout pres-callout--danger px-3.5 py-2">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="pres-kicker pres-kicker--danger text-[12px]">Key Risk:</span>
              <span className="text-[12.5px] font-bold text-[color:var(--pres-ink)]">
                {keyRisk.risk}
              </span>
            </div>
            <p className="mt-0.5 text-[12px] leading-[1.32] text-[color:var(--pres-ink)]">
              <strong className="font-bold text-[color:var(--pres-success-ink)]">
                Mitigation:{' '}
              </strong>
              {keyRisk.mitigation}
            </p>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}

/* ==========================================================================
   SLIDE 11 — §8: Initial Measures of Success & Controlled Benchmarks
   ========================================================================== */

function SuccessMeasuresSlide({ slideNumber, totalSlides }) {
  const meta = SLIDES_BY_SLUG['success-measures'];
  const { userTaskAssessment, systemBenchmarks } = SUCCESS_MEASURES_DATA;

  return (
    <SlideFrame
      slideNumber={slideNumber}
      totalSlides={totalSlides}
      section={formatSection(meta.section)}
      title={meta.title}
      subtitle={meta.subtitle}
      footnote={systemBenchmarks.statsNote}
      meta={DECK_META}
    >
      <div className="flex h-full flex-col justify-between">
        {/* Stream 1: Representative User Task Evaluation (KPI Trio) */}
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="pres-kicker text-[12px]">Stream 1 · {userTaskAssessment.title}</h2>
            <span className="text-[12.5px] text-[color:var(--pres-ink-secondary)]">
              {userTaskAssessment.howAssessed}
            </span>
          </div>

          <div className="pres-rail-3 mt-2.5">
            {userTaskAssessment.observables.map((obs, idx) => (
              <div
                key={obs.metric}
                className="border-t-2 border-[color:var(--pres-primary)] bg-[var(--pres-surface)] px-4 py-2.5"
              >
                <div className="pres-mono text-[12px] font-semibold text-[color:var(--pres-primary)]">
                  0{idx + 1} / USER METRIC
                </div>
                <h3 className="mt-0.5 text-[15px] font-bold text-[color:var(--pres-ink)]">
                  {obs.metric}
                </h3>
                <p className="mt-1 text-[12.5px] leading-[1.38] text-[color:var(--pres-ink-secondary)]">
                  {obs.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stream 2: Controlled Experimental Matrix (Configs A–D) + Metrics Table */}
        <div className="mt-4 flex min-h-0 flex-1 flex-col border-t-2 border-[color:var(--pres-rule-ink)] pt-3.5">
          <div className="mb-2.5 flex items-baseline justify-between gap-4">
            <h2 className="pres-kicker text-[12px]">Stream 2 · {systemBenchmarks.title}</h2>
            <span className="text-[12.5px] text-[color:var(--pres-ink-secondary)]">
              {systemBenchmarks.howAssessed}
            </span>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[0.95fr_1.35fr] gap-8">
            {/* Left: Configs A–D Matrix (Highlighting Primary C vs D) */}
            <div className="flex flex-col justify-between divide-y divide-[color:var(--pres-border)] border-y-2 border-[color:var(--pres-rule-ink)]">
              {systemBenchmarks.configs.map((cfg) => (
                <div
                  key={cfg.code}
                  className={
                    cfg.highlight
                      ? 'border-l-[3px] border-l-[color:var(--pres-primary)] bg-[var(--pres-primary-soft)] px-3 py-2'
                      : 'px-3 py-2'
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="pres-mono text-[13px] font-bold text-[color:var(--pres-primary)]">
                        Config {cfg.code}
                      </span>
                      <span className="text-[13.5px] font-bold text-[color:var(--pres-ink)]">
                        {cfg.name}
                      </span>
                    </div>
                    {cfg.highlight && <span className="pres-tag text-[12px]">Primary</span>}
                    {cfg.code === 'C' && (
                      <span className="pres-tag pres-tag--accent text-[12px]">Control</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-[1.34] text-[color:var(--pres-ink-secondary)]">
                    {cfg.controls}
                  </p>
                </div>
              ))}
            </div>

            {/* Right: 5 Observable Security & Latency Benchmarks */}
            <div className="pres-col-divider">
              <table className="pres-table pres-table--compact">
                <thead>
                  <tr>
                    <th className="w-[62px]">Code</th>
                    <th className="w-[33%]">Metric</th>
                    <th>Observable Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {systemBenchmarks.metrics.map((m) => (
                    <tr key={m.code}>
                      <td
                        className={`pres-mono font-bold ${
                          METRIC_CODE_TONE[m.code] || 'text-[color:var(--pres-primary)]'
                        }`}
                      >
                        {m.code}
                      </td>
                      <td className="font-bold text-[color:var(--pres-ink)]">{m.name}</td>
                      <td className="text-[color:var(--pres-ink-secondary)]">{m.observable}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}

/* ==========================================================================
   SLIDE 12 — References (Balanced 2-Column Hanging-Indent Harvard List)
   ========================================================================== */

function ReferenceEntry({ entry }) {
  return (
    <p className="break-words pl-7 -indent-7 text-[12.5px] leading-[1.42] text-[color:var(--pres-ink)]">
      <span className="pres-mono inline-block w-7 text-[12px] font-bold text-[color:var(--pres-primary)]">
        {entry.id}.
      </span>
      {entry.fullText}
    </p>
  );
}

function ReferencesSlide({ slideNumber, totalSlides }) {
  const meta = SLIDES_BY_SLUG.references;
  const midpoint = Math.ceil(REFERENCES_LIST.length / 2);
  const leftRefs = REFERENCES_LIST.slice(0, midpoint);
  const rightRefs = REFERENCES_LIST.slice(midpoint);

  return (
    <SlideFrame
      slideNumber={slideNumber}
      totalSlides={totalSlides}
      section={formatSection(meta.section)}
      title={meta.title}
      subtitle={meta.subtitle}
      footnote={`${REFERENCES_META.heading}  ·  ${DECK_META.department}, ${DECK_META.faculty}, ${DECK_META.university}  ·  ${REFERENCES_LIST.length} Cited Sources`}
      meta={DECK_META}
    >
      <div className="grid h-full grid-cols-2 gap-10 pt-1">
        <div className="flex flex-col justify-between gap-3">
          {leftRefs.map((ref) => (
            <ReferenceEntry key={ref.citeKey} entry={ref} />
          ))}
        </div>

        <div className="pres-col-divider flex flex-col justify-between gap-3">
          {rightRefs.map((ref) => (
            <ReferenceEntry key={ref.citeKey} entry={ref} />
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}

/* ==========================================================================
   SLIDE 13 — Closing (High-Contrast Oxford Navy Architectural Q&A Plate)
   ========================================================================== */

function ClosingSlide({ slideNumber, totalSlides }) {
  const meta = SLIDES_BY_SLUG.closing;

  return (
    <SlideFrame
      slideNumber={slideNumber}
      totalSlides={totalSlides}
      title={meta.title}
      variant="closing"
      meta={DECK_META}
    >
      <div className="flex h-full flex-col justify-between">
        {/* Institutional Masthead */}
        <div className="flex items-center justify-between gap-6">
          <p className="pres-kicker text-[12px]">
            {DECK_META.university} &nbsp;·&nbsp; {DECK_META.faculty} &nbsp;·&nbsp;{' '}
            {DECK_META.department}
          </p>
          <span className="pres-tag shrink-0 whitespace-nowrap text-[12px]">
            {DECK_META.presentationLabel}
          </span>
        </div>

        {/* Center Editorial Thank You Hero */}
        <div className="my-auto mx-auto flex max-w-[780px] flex-col items-center py-4 text-center">
          <div
            className="mb-6 h-[3px] w-16 bg-[var(--pres-accent)]"
            aria-hidden="true"
          />
          <h1 className="pres-display text-[56px] font-bold leading-[1.06] tracking-[-0.025em] text-[color:var(--pres-ink)]">
            {meta.title}
          </h1>
          <p className="mt-5 max-w-[660px] text-[16px] leading-[1.58] text-[color:var(--pres-ink-secondary)]">
            {DECK_META.closingSummary}
          </p>
        </div>

        <div aria-hidden="true" />
      </div>
    </SlideFrame>
  );
}

/* ==========================================================================
   Ordered Slide Deck Export (13 Slides — ITC 4671 Proposal Structure)
   ========================================================================== */

export const SLIDES = [
  CoverSlide,
  BackgroundUsersSlide,
  ProblemSlide,
  AimObjectivesSlide,
  RelatedWorkSlide,
  SolutionArchitectureSlide,
  ProcessScopeSlide,
  InvestigationPlanSlide,
  ApproachPlatformSlide,
  WorkPlanFeasibilitySlide,
  SuccessMeasuresSlide,
  ReferencesSlide,
  ClosingSlide,
];
