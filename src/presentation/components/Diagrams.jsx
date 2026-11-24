import { useId } from 'react';

const SANS_FONT = 'var(--pres-font-sans)';
const MONO_FONT = 'var(--pres-font-mono)';

const STROKE = {
  hairline: 1,
  node: 1.5,
  emphasis: 2,
};

const PHASE_PALETTE = {
  planning: {
    key: 'planning',
    label: 'Planning & Ch. 1',
    barBg: 'var(--pres-ink)',
  },
  writing: {
    key: 'writing',
    label: 'Lit. & Methodology',
    barBg: 'var(--pres-ink-muted)',
  },
  build: {
    key: 'build',
    label: 'Build & Evaluation',
    barBg: 'var(--pres-primary)',
  },
  analysis: {
    key: 'analysis',
    label: 'Analysis & Report',
    barBg: 'var(--pres-success)',
  },
};

const PHASE_LEGEND_ORDER = ['planning', 'writing', 'build', 'analysis'];

function ArrowMarker({ id, fill }) {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX="8.5"
      refY="5"
      markerWidth="6.5"
      markerHeight="6.5"
      orient="auto-start-reverse"
    >
      <path d="M 1 1.5 L 8.5 5 L 1 8.5 z" fill={fill} />
    </marker>
  );
}

function CheckGlyph({ x, y, stroke = 'var(--pres-success-ink)' }) {
  return (
    <path
      d={`M ${x} ${y + 4.5} L ${x + 3.2} ${y + 7.8} L ${x + 9.2} ${y + 1.2}`}
      fill="none"
      stroke={stroke}
      strokeWidth={STROKE.node}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    />
  );
}

function CrossGlyph({ x, y, stroke = 'var(--pres-danger)' }) {
  return (
    <path
      d={`M ${x + 1} ${y + 1} L ${x + 8} ${y + 8} M ${x + 8} ${y + 1} L ${x + 1} ${y + 8}`}
      fill="none"
      stroke={stroke}
      strokeWidth={STROKE.node}
      strokeLinecap="round"
      aria-hidden="true"
    />
  );
}

/**
 * Slide 03 — Metadata-Driven Cross-Server Tool-Selection Hijacking
 * Rebalanced warm-editorial SVG blueprint (viewBox 0 0 660 340, transparent root).
 */
export function HijackScenarioDiagram() {
  const uid = useId().replace(/:/g, '');
  const arrowInk = `hs-${uid}-ink`;
  const arrowSuccess = `hs-${uid}-success`;
  const arrowDanger = `hs-${uid}-danger`;

  return (
    <svg
      viewBox="0 0 660 340"
      width="100%"
      role="img"
      aria-label="Diagram of cross-server tool-selection hijacking: a local AI agent selects registered but task-unauthorized Server B over authorized Server A because of persuasive metadata, even though Ed25519 identity and SHA-256 hashes pass"
      className="block w-full h-auto"
      style={{ fontFamily: SANS_FONT, height: 'auto' }}
    >
      <defs>
        <ArrowMarker id={arrowInk} fill="var(--pres-ink)" />
        <ArrowMarker id={arrowSuccess} fill="var(--pres-success)" />
        <ArrowMarker id={arrowDanger} fill="var(--pres-danger)" />
      </defs>

      {/* ── NODE 1: User Task ── */}
      <rect
        x="2"
        y="46"
        width="128"
        height="174"
        rx="3"
        fill="var(--pres-surface-elevated)"
        stroke="var(--pres-border-strong)"
        strokeWidth={STROKE.node}
      />
      <rect x="2" y="46" width="128" height="3" fill="var(--pres-primary)" />
      <text
        x="14"
        y="71"
        fill="var(--pres-primary)"
        fontSize="12.5"
        fontWeight="700"
        letterSpacing="0.05em"
      >
        USER TASK
      </text>
      <line
        x1="14"
        y1="82"
        x2="118"
        y2="82"
        stroke="var(--pres-border)"
        strokeWidth={STROKE.hairline}
      />
      <text x="14" y="106" fill="var(--pres-ink)" fontSize="14" fontWeight="700">
        Read file
      </text>
      <text x="14" y="126" fill="var(--pres-ink-secondary)" fontSize="13">
        in project/
      </text>
      <rect
        x="14"
        y="142"
        width="104"
        height="28"
        rx="2"
        fill="var(--pres-primary-soft)"
      />
      <text
        x="23"
        y="160"
        fill="var(--pres-primary)"
        fontSize="12.5"
        fontWeight="600"
        style={{ fontFamily: MONO_FONT }}
      >
        read_file
      </text>
      <text x="14" y="198" fill="var(--pres-ink-muted)" fontSize="12.5" fontWeight="500">
        Goal: Server A
      </text>

      {/* ── CONNECTOR: User -> Agent ── */}
      <line
        x1="130"
        y1="133"
        x2="154"
        y2="133"
        stroke="var(--pres-ink)"
        strokeWidth={STROKE.node}
        markerEnd={`url(#${arrowInk})`}
      />

      {/* ── NODE 2: Local AI Agent ── */}
      <rect
        x="158"
        y="46"
        width="146"
        height="174"
        rx="3"
        fill="var(--pres-surface-elevated)"
        stroke="var(--pres-primary)"
        strokeWidth={STROKE.node}
      />
      <rect x="158" y="46" width="146" height="3" fill="var(--pres-primary)" />
      <text
        x="170"
        y="71"
        fill="var(--pres-primary)"
        fontSize="12.5"
        fontWeight="700"
        letterSpacing="0.05em"
      >
        LOCAL AGENT
      </text>
      <text x="170" y="92" fill="var(--pres-ink)" fontSize="14" fontWeight="700">
        Tool Selector
      </text>
      <line
        x1="170"
        y1="103"
        x2="292"
        y2="103"
        stroke="var(--pres-border)"
        strokeWidth={STROKE.hairline}
      />
      <text x="170" y="125" fill="var(--pres-ink-secondary)" fontSize="12.5">
        Reads tool names
      </text>
      <text x="170" y="143" fill="var(--pres-ink-secondary)" fontSize="12.5">
        &amp; descriptions
      </text>
      <rect
        x="170"
        y="158"
        width="122"
        height="48"
        rx="2"
        fill="var(--pres-accent-soft)"
      />
      <text x="179" y="178" fill="var(--pres-accent)" fontSize="12.5" fontWeight="700">
        Untrusted choice
      </text>
      <text x="179" y="196" fill="var(--pres-ink-secondary)" fontSize="12.5">
        No task binding
      </text>

      {/* ── BOTTOM LEFT ANCHOR: Static Trust Blind Spot (Eliminates Dead Space) ── */}
      <rect
        x="2"
        y="240"
        width="302"
        height="94"
        rx="3"
        fill="var(--pres-surface)"
        stroke="var(--pres-border)"
        strokeWidth={STROKE.hairline}
      />
      <rect x="2" y="240" width="3.5" height="94" fill="var(--pres-accent)" />
      <text
        x="16"
        y="264"
        fill="var(--pres-accent)"
        fontSize="12.5"
        fontWeight="700"
        letterSpacing="0.05em"
      >
        STATIC TRUST BLIND SPOT
      </text>
      <text x="16" y="290" fill="var(--pres-ink)" fontSize="13" fontWeight="700">
        Keys &amp; hashes pass for both servers.
      </text>
      <text x="16" y="313" fill="var(--pres-ink-secondary)" fontSize="12.5">
        Neither proves Server B is task-authorized.
      </text>

      {/* ── ORTHOGONAL FORK: Intended Path (Solid Forest -> Server A) ── */}
      <path
        d="M 304 102 H 324 V 54 H 398"
        fill="none"
        stroke="var(--pres-success)"
        strokeWidth={STROKE.node}
        markerEnd={`url(#${arrowSuccess})`}
      />
      <CheckGlyph x={328} y={34} stroke="var(--pres-success-ink)" />
      <text
        x="342"
        y="44"
        fill="var(--pres-success-ink)"
        fontSize="12.5"
        fontWeight="700"
      >
        Intended
      </text>

      {/* ── ORTHOGONAL FORK: Hijacked Path (Dashed Crimson -> Server B) ── */}
      <path
        d="M 304 174 H 324 V 206 H 398"
        fill="none"
        stroke="var(--pres-danger)"
        strokeWidth={STROKE.emphasis}
        strokeDasharray="6 4"
        markerEnd={`url(#${arrowDanger})`}
      />
      <CrossGlyph x={328} y={185} stroke="var(--pres-danger)" />
      <text x="342" y="195" fill="var(--pres-danger)" fontSize="12.5" fontWeight="700">
        Hijacked
      </text>
      <text x="330" y="226" fill="var(--pres-danger-ink)" fontSize="12.5" fontWeight="500">
        Biased
      </text>
      <text x="330" y="242" fill="var(--pres-danger-ink)" fontSize="12.5" fontWeight="500">
        metadata
      </text>

      {/* ── NODE 3A: Server A (Authorized Provider) ── */}
      <rect
        x="404"
        y="6"
        width="254"
        height="96"
        rx="3"
        fill="var(--pres-surface-elevated)"
        stroke="var(--pres-border-strong)"
        strokeWidth={STROKE.node}
      />
      <rect x="404" y="6" width="4" height="96" fill="var(--pres-success)" />
      <text x="420" y="31" fill="var(--pres-ink)" fontSize="14.5" fontWeight="700">
        Server A
      </text>
      <text
        x="646"
        y="30"
        textAnchor="end"
        fill="var(--pres-success-ink)"
        fontSize="12.5"
        fontWeight="700"
        letterSpacing="0.04em"
      >
        AUTHORIZED
      </text>
      <text
        x="420"
        y="55"
        fontSize="12.5"
        style={{ fontFamily: MONO_FONT }}
      >
        <tspan fill="var(--pres-success-ink)" fontWeight="700">
          read_file
        </tspan>
        <tspan fill="var(--pres-ink-secondary)"> · project/</tspan>
      </text>
      <line
        x1="420"
        y1="67"
        x2="646"
        y2="67"
        stroke="var(--pres-border)"
        strokeWidth={STROKE.hairline}
      />
      <text x="420" y="88" fill="var(--pres-ink-muted)" fontSize="12.5">
        Expected provider — bypassed
      </text>

      {/* ── NODE 3B: Server B (Adversarial Provider) ── */}
      <rect
        x="404"
        y="116"
        width="254"
        height="218"
        rx="3"
        fill="var(--pres-surface-elevated)"
        stroke="var(--pres-danger)"
        strokeWidth={STROKE.node}
      />
      <rect x="404" y="116" width="4" height="218" fill="var(--pres-danger)" />
      <text x="420" y="140" fill="var(--pres-ink)" fontSize="14.5" fontWeight="700">
        Server B
      </text>
      <text
        x="646"
        y="139"
        textAnchor="end"
        fill="var(--pres-danger)"
        fontSize="12.5"
        fontWeight="700"
        letterSpacing="0.04em"
      >
        ADVERSARIAL
      </text>

      {/* Booktabs Verification Check Ledger */}
      <line
        x1="420"
        y1="152"
        x2="646"
        y2="152"
        stroke="var(--pres-rule-ink)"
        strokeWidth={STROKE.emphasis}
      />
      <text
        x="420"
        y="170"
        fill="var(--pres-ink-muted)"
        fontSize="12.5"
        fontWeight="700"
        letterSpacing="0.04em"
      >
        CHECK
      </text>
      <text
        x="646"
        y="170"
        textAnchor="end"
        fill="var(--pres-ink-muted)"
        fontSize="12.5"
        fontWeight="700"
        letterSpacing="0.04em"
      >
        STATUS
      </text>
      <line
        x1="420"
        y1="178"
        x2="646"
        y2="178"
        stroke="var(--pres-border-strong)"
        strokeWidth={STROKE.hairline}
      />

      {/* Row 1 */}
      <text x="420" y="198" fill="var(--pres-ink)" fontSize="12.5" fontWeight="500">
        Ed25519 Identity
      </text>
      <CheckGlyph x={596} y={189} stroke="var(--pres-success-ink)" />
      <text
        x="646"
        y="198"
        textAnchor="end"
        fill="var(--pres-success-ink)"
        fontSize="12.5"
        fontWeight="700"
        style={{ fontFamily: MONO_FONT }}
      >
        Pass
      </text>
      <line
        x1="420"
        y1="208"
        x2="646"
        y2="208"
        stroke="var(--pres-border)"
        strokeWidth={STROKE.hairline}
      />

      {/* Row 2 */}
      <text x="420" y="228" fill="var(--pres-ink)" fontSize="12.5" fontWeight="500">
        SHA-256 Hash
      </text>
      <CheckGlyph x={596} y={219} stroke="var(--pres-success-ink)" />
      <text
        x="646"
        y="228"
        textAnchor="end"
        fill="var(--pres-success-ink)"
        fontSize="12.5"
        fontWeight="700"
        style={{ fontFamily: MONO_FONT }}
      >
        Pass
      </text>
      <line
        x1="420"
        y1="238"
        x2="646"
        y2="238"
        stroke="var(--pres-border)"
        strokeWidth={STROKE.hairline}
      />

      {/* Row 3: Missing Task Binding */}
      <rect x="420" y="239" width="226" height="30" fill="var(--pres-danger-soft)" />
      <text x="426" y="259" fill="var(--pres-ink)" fontSize="12.5" fontWeight="700">
        Task Binding
      </text>
      <CrossGlyph x={592} y={249} stroke="var(--pres-danger-ink)" />
      <text
        x="640"
        y="259"
        textAnchor="end"
        fill="var(--pres-danger-ink)"
        fontSize="12.5"
        fontWeight="700"
        style={{ fontFamily: MONO_FONT }}
      >
        None
      </text>
      <line
        x1="420"
        y1="270"
        x2="646"
        y2="270"
        stroke="var(--pres-rule-ink)"
        strokeWidth={STROKE.emphasis}
      />

      {/* Outcome Banner */}
      <rect x="420" y="282" width="3.5" height="38" fill="var(--pres-danger)" />
      <text x="432" y="298" fill="var(--pres-danger)" fontSize="13.5" fontWeight="700">
        Unauthorized Execution
      </text>
      <text x="432" y="317" fill="var(--pres-ink-secondary)" fontSize="12.5">
        Runs without task approval
      </text>
    </svg>
  );
}

/**
 * Slide 06 — Proposed Python Security Gateway Architecture (5 Linked Functions)
 * Directional editorial blueprint (viewBox 0 0 740 390, transparent root).
 */
export function GatewayArchitectureDiagram() {
  const uid = useId().replace(/:/g, '');
  const arrowPrimary = `gw-${uid}-primary`;
  const arrowInk = `gw-${uid}-ink`;
  const arrowMuted = `gw-${uid}-muted`;
  const arrowSuccess = `gw-${uid}-success`;

  const gatewayBlocks = [
    {
      num: '1.',
      title: 'Server Registry',
      detail: 'SQLite · Keys · Hashes',
      core: false,
    },
    {
      num: '2.',
      title: 'Identity & Integrity',
      detail: 'Ed25519 · SHA-256 Hash',
      core: false,
    },
    {
      num: '3.',
      title: 'Signed Manifest Store',
      detail: 'Host Grants · Expiry',
      core: false,
    },
    {
      num: '4.',
      title: 'Authorization Engine',
      detail: 'Task · Alias · Tool · Scope',
      core: true,
    },
    {
      num: '5.',
      title: 'Forwarder & Audit Log',
      detail: 'Route Match · Log Denials',
      core: false,
    },
  ];

  return (
    <svg
      viewBox="0 0 740 390"
      width="100%"
      role="img"
      aria-label="Directional architecture of the Python Security Gateway showing Host Policy Authority and Local AI Agent feeding five linked gateway modules that forward authorized calls to Server A and deny unauthorized calls to Server B"
      className="block w-full h-auto"
      style={{ fontFamily: SANS_FONT, height: 'auto' }}
    >
      <defs>
        <ArrowMarker id={arrowPrimary} fill="var(--pres-primary)" />
        <ArrowMarker id={arrowInk} fill="var(--pres-ink)" />
        <ArrowMarker id={arrowMuted} fill="var(--pres-ink-muted)" />
        <ArrowMarker id={arrowSuccess} fill="var(--pres-success)" />
      </defs>

      {/* ════════════════════════════════════════════════
          COLUMN 1: TRUSTED HOST & LOCAL AI AGENT
         ════════════════════════════════════════════════ */}
      <rect
        x="2"
        y="16"
        width="160"
        height="152"
        rx="3"
        fill="var(--pres-surface-elevated)"
        stroke="var(--pres-primary)"
        strokeWidth={STROKE.node}
      />
      <rect x="2" y="16" width="160" height="3" fill="var(--pres-primary)" />
      <text
        x="14"
        y="39"
        fill="var(--pres-primary)"
        fontSize="12.5"
        fontWeight="700"
        letterSpacing="0.05em"
      >
        TRUSTED HOST
      </text>
      <text x="14" y="59" fill="var(--pres-ink)" fontSize="14" fontWeight="700">
        Policy Authority
      </text>
      <line
        x1="14"
        y1="69"
        x2="150"
        y2="69"
        stroke="var(--pres-border)"
        strokeWidth={STROKE.hairline}
      />
      <text x="14" y="90" fill="var(--pres-ink-secondary)" fontSize="12.5">
        Task ID &amp; scope
      </text>
      <text x="14" y="109" fill="var(--pres-ink-secondary)" fontSize="12.5">
        Signed approval
      </text>
      <rect
        x="14"
        y="124"
        width="136"
        height="28"
        rx="2"
        fill="var(--pres-primary-soft)"
      />
      <text
        x="22"
        y="142"
        fill="var(--pres-primary)"
        fontSize="12.5"
        fontWeight="600"
        style={{ fontFamily: MONO_FONT }}
      >
        Ed25519 Grant
      </text>

      {/* Vertical Connector: Host -> Agent */}
      <line
        x1="82"
        y1="168"
        x2="82"
        y2="210"
        stroke="var(--pres-ink-muted)"
        strokeWidth={STROKE.node}
        markerEnd={`url(#${arrowMuted})`}
      />
      <text x="90" y="194" fill="var(--pres-ink-muted)" fontSize="12.5" fontWeight="500">
        Task prompt
      </text>

      {/* Local AI Agent */}
      <rect
        x="2"
        y="216"
        width="160"
        height="158"
        rx="3"
        fill="var(--pres-surface-elevated)"
        stroke="var(--pres-border-strong)"
        strokeWidth={STROKE.node}
      />
      <rect x="2" y="216" width="160" height="3" fill="var(--pres-ink)" />
      <text
        x="14"
        y="239"
        fill="var(--pres-ink-muted)"
        fontSize="12.5"
        fontWeight="700"
        letterSpacing="0.05em"
      >
        UNTRUSTED
      </text>
      <text x="14" y="259" fill="var(--pres-ink)" fontSize="14" fontWeight="700">
        Local AI Agent
      </text>
      <line
        x1="14"
        y1="269"
        x2="150"
        y2="269"
        stroke="var(--pres-border)"
        strokeWidth={STROKE.hairline}
      />
      <text x="14" y="290" fill="var(--pres-ink-secondary)" fontSize="12.5">
        Reads metadata
      </text>
      <text x="14" y="309" fill="var(--pres-ink-secondary)" fontSize="12.5">
        Alias calls only
      </text>
      <rect
        x="14"
        y="326"
        width="136"
        height="28"
        rx="2"
        fill="var(--pres-surface)"
      />
      <text
        x="20"
        y="344"
        fill="var(--pres-ink)"
        fontSize="12.5"
        fontWeight="500"
        style={{ fontFamily: MONO_FONT }}
      >
        server_*__tool
      </text>

      {/* ════════════════════════════════════════════════
          GAP 1: INPUT CHANNELS INTO GATEWAY
         ════════════════════════════════════════════════ */}
      {/* Host -> Gateway Manifest Store (elbow to Block 3 center) */}
      <path
        d="M 162 92 H 194 V 205 H 234"
        fill="none"
        stroke="var(--pres-primary)"
        strokeWidth={STROKE.node}
        markerEnd={`url(#${arrowPrimary})`}
      />
      <text
        x="194"
        y="68"
        textAnchor="middle"
        fill="var(--pres-primary)"
        fontSize="12.5"
        fontWeight="700"
      >
        Signed
      </text>
      <text
        x="194"
        y="83"
        textAnchor="middle"
        fill="var(--pres-primary)"
        fontSize="12.5"
        fontWeight="700"
      >
        grant
      </text>

      {/* Agent -> Gateway Auth Engine (straight into Block 4 center) */}
      <line
        x1="162"
        y1="271"
        x2="234"
        y2="271"
        stroke="var(--pres-ink)"
        strokeWidth={STROKE.node}
        markerEnd={`url(#${arrowInk})`}
      />
      <text
        x="194"
        y="248"
        textAnchor="middle"
        fill="var(--pres-ink)"
        fontSize="12.5"
        fontWeight="700"
      >
        Alias
      </text>
      <text
        x="194"
        y="262"
        textAnchor="middle"
        fill="var(--pres-ink)"
        fontSize="12.5"
        fontWeight="700"
      >
        call
      </text>

      {/* ════════════════════════════════════════════════
          COLUMN 2: PYTHON SECURITY GATEWAY (LINKED PIPELINE)
         ════════════════════════════════════════════════ */}
      <rect
        x="226"
        y="6"
        width="256"
        height="378"
        rx="4"
        fill="var(--pres-surface)"
        stroke="var(--pres-primary)"
        strokeWidth={STROKE.node}
        strokeDasharray="6 4"
      />
      <text
        x="354"
        y="29"
        textAnchor="middle"
        fill="var(--pres-primary)"
        fontSize="13"
        fontWeight="700"
        letterSpacing="0.06em"
      >
        PYTHON SECURITY GATEWAY
      </text>
      <line
        x1="238"
        y1="38"
        x2="470"
        y2="38"
        stroke="var(--pres-primary)"
        strokeWidth={STROKE.node}
      />

      {gatewayBlocks.map((block, idx) => {
        const y = 48 + idx * 66;
        const h = 50;
        const isLast = idx === gatewayBlocks.length - 1;
        return (
          <g key={block.num}>
            <rect
              x="238"
              y={y}
              width="232"
              height={h}
              rx="3"
              fill={block.core ? 'var(--pres-primary-soft)' : 'var(--pres-surface-elevated)'}
              stroke={block.core ? 'var(--pres-primary)' : 'var(--pres-border-strong)'}
              strokeWidth={block.core ? STROKE.emphasis : STROKE.node}
            />
            {block.core && (
              <rect x="238" y={y} width="3.5" height={h} fill="var(--pres-primary)" />
            )}
            <text
              x="250"
              y={y + 21}
              fontSize="13"
              fontWeight="700"
            >
              <tspan
                fill={block.core ? 'var(--pres-primary)' : 'var(--pres-ink-muted)'}
                style={{ fontFamily: MONO_FONT }}
              >
                {block.num}{' '}
              </tspan>
              <tspan fill={block.core ? 'var(--pres-primary)' : 'var(--pres-ink)'}>
                {block.title}
              </tspan>
            </text>
            <text
              x="250"
              y={y + 40}
              fill={block.core ? 'var(--pres-primary)' : 'var(--pres-ink-secondary)'}
              fontSize="12.5"
              fontWeight="500"
              style={{ fontFamily: MONO_FONT }}
            >
              {block.detail}
            </text>

            {/* Directional Internal Pipeline Connector */}
            {!isLast && (
              <line
                x1="354"
                y1={y + h}
                x2="354"
                y2={y + h + 13}
                stroke="var(--pres-primary)"
                strokeWidth={STROKE.node}
                markerEnd={`url(#${arrowPrimary})`}
              />
            )}
          </g>
        );
      })}

      {/* ════════════════════════════════════════════════
          GAP 2: ALLOW VS. DENY ENFORCEMENT GATE
         ════════════════════════════════════════════════ */}
      {/* Allow Path: Block 5 -> Up Riser -> Server A */}
      <path
        d="M 470 326 H 494 V 98 H 556"
        fill="none"
        stroke="var(--pres-success)"
        strokeWidth={STROKE.node}
        markerEnd={`url(#${arrowSuccess})`}
      />
      <CheckGlyph x={502} y={76} stroke="var(--pres-success-ink)" />
      <text
        x="516"
        y="86"
        fill="var(--pres-success-ink)"
        fontSize="12.5"
        fontWeight="700"
      >
        Allow
      </text>

      {/* Deny Gate: Block 5 -> Blocked Bar before Server B */}
      <line
        x1="470"
        y1="348"
        x2="526"
        y2="348"
        stroke="var(--pres-danger)"
        strokeWidth={STROKE.emphasis}
        strokeDasharray="6 4"
      />
      <line
        x1="528"
        y1="334"
        x2="528"
        y2="362"
        stroke="var(--pres-danger)"
        strokeWidth={STROKE.emphasis}
      />
      <line
        x1="534"
        y1="348"
        x2="560"
        y2="348"
        stroke="var(--pres-border-strong)"
        strokeWidth={STROKE.hairline}
        strokeDasharray="2 3"
      />
      <CrossGlyph x={506} y={316} stroke="var(--pres-danger)" />
      <text x="520" y="326" fill="var(--pres-danger)" fontSize="12.5" fontWeight="700">
        Deny
      </text>
      <text
        x="528"
        y="378"
        textAnchor="middle"
        fill="var(--pres-danger-ink)"
        fontSize="12.5"
        fontWeight="700"
      >
        Blocked
      </text>

      {/* ════════════════════════════════════════════════
          COLUMN 3: CONNECTED MCP SERVERS (A vs B)
         ════════════════════════════════════════════════ */}
      {/* Server A — Legitimate */}
      <rect
        x="562"
        y="16"
        width="176"
        height="164"
        rx="3"
        fill="var(--pres-surface-elevated)"
        stroke="var(--pres-border-strong)"
        strokeWidth={STROKE.node}
      />
      <rect x="562" y="16" width="4" height="164" fill="var(--pres-success)" />
      <text
        x="576"
        y="39"
        fill="var(--pres-success-ink)"
        fontSize="12.5"
        fontWeight="700"
        letterSpacing="0.04em"
      >
        SERVER A · VALID
      </text>
      <text
        x="576"
        y="62"
        fill="var(--pres-ink)"
        fontSize="12.5"
        fontWeight="600"
        style={{ fontFamily: MONO_FONT }}
      >
        server_A__read_file
      </text>
      <line
        x1="576"
        y1="74"
        x2="726"
        y2="74"
        stroke="var(--pres-border)"
        strokeWidth={STROKE.hairline}
      />
      <text x="576" y="96" fill="var(--pres-ink-secondary)" fontSize="12.5">
        Keys &amp; Hash: Pass
      </text>
      <text x="576" y="116" fill="var(--pres-success-ink)" fontSize="12.5" fontWeight="700">
        Binding: Match
      </text>
      <rect
        x="574"
        y="132"
        width="154"
        height="32"
        rx="2"
        fill="var(--pres-success-soft)"
      />
      <CheckGlyph x={582} y={143} stroke="var(--pres-success-ink)" />
      <text
        x="596"
        y="153"
        fill="var(--pres-success-ink)"
        fontSize="12.5"
        fontWeight="700"
      >
        FORWARDED
      </text>

      {/* Server B — Adversarial */}
      <rect
        x="562"
        y="210"
        width="176"
        height="164"
        rx="3"
        fill="var(--pres-surface-elevated)"
        stroke="var(--pres-danger)"
        strokeWidth={STROKE.node}
      />
      <rect x="562" y="210" width="4" height="164" fill="var(--pres-danger)" />
      <text
        x="576"
        y="233"
        fill="var(--pres-danger)"
        fontSize="12.5"
        fontWeight="700"
        letterSpacing="0.04em"
      >
        SERVER B · HIJACK
      </text>
      <text
        x="576"
        y="256"
        fill="var(--pres-ink)"
        fontSize="12.5"
        fontWeight="600"
        style={{ fontFamily: MONO_FONT }}
      >
        server_B__read_file
      </text>
      <line
        x1="576"
        y1="268"
        x2="726"
        y2="268"
        stroke="var(--pres-border)"
        strokeWidth={STROKE.hairline}
      />
      <text x="576" y="290" fill="var(--pres-ink-secondary)" fontSize="12.5">
        Keys &amp; Hash: Pass
      </text>
      <text x="576" y="310" fill="var(--pres-danger)" fontSize="12.5" fontWeight="700">
        Binding: Mismatch
      </text>
      <rect
        x="574"
        y="326"
        width="154"
        height="32"
        rx="2"
        fill="var(--pres-danger-soft)"
      />
      <CrossGlyph x={581} y={337} stroke="var(--pres-danger-ink)" />
      <text
        x="595"
        y="347"
        fill="var(--pres-danger-ink)"
        fontSize="12.5"
        fontWeight="700"
      >
        DENIED &amp; LOGGED
      </text>
    </svg>
  );
}

/**
 * Slide 07 — Complete Supported Process Lifecycle (read_file on project/)
 * Full-width 4-stage horizontal editorial SVG (viewBox 0 0 1160 164, transparent root).
 */
export function ManifestLifecycleDiagram() {
  const uid = useId().replace(/:/g, '');
  const arrowPrimary = `ml-${uid}-primary`;

  const stages = [
    {
      num: '01',
      verb: 'DECLARE & SIGN',
      actor: 'Host',
      title: 'Host Declares & Signs',
      bullets: [
        'Issues host-owned task_id',
        'Binds Server A & project/',
        'Signs grant (Ed25519)',
      ],
    },
    {
      num: '02',
      verb: 'REQUEST TOOL',
      actor: 'Agent',
      title: 'Agent Requests Tool',
      bullets: [
        'Reads MCP tool metadata',
        'Calls alias server_*__read_file',
        'Cannot alter grant or route',
      ],
    },
    {
      num: '03',
      verb: 'VERIFY',
      actor: 'Gateway',
      title: 'Gateway Verifies (4 Checks)',
      bullets: [
        'Grant signature, expiry & replay',
        'Server key + SHA-256 tool hash',
        'Alias, action & normalized path',
      ],
    },
  ];

  return (
    <svg
      viewBox="0 0 1160 164"
      width="100%"
      role="img"
      aria-label="Four-stage process lifecycle for read_file on project/: 01 Host Declares and Signs, 02 Agent Requests Tool, 03 Gateway Verifies 4 Checks, 04 Route Server A or Deny Server B and Audit"
      className="block w-full h-auto"
      style={{ fontFamily: SANS_FONT, height: 'auto' }}
    >
      <defs>
        <ArrowMarker id={arrowPrimary} fill="var(--pres-primary)" />
      </defs>

      {stages.map((stage, idx) => {
        const x = 2 + idx * 298;
        return (
          <g key={stage.num}>
            <rect
              x={x}
              y="4"
              width="264"
              height="156"
              rx="3"
              fill="var(--pres-surface-elevated)"
              stroke="var(--pres-border-strong)"
              strokeWidth={STROKE.node}
            />
            <rect x={x} y="4" width="264" height="3" fill="var(--pres-primary)" />

            <text x={x + 14} y="29" fontSize="12" fontWeight="700">
              <tspan fill="var(--pres-primary)" style={{ fontFamily: MONO_FONT }}>
                {stage.num}
              </tspan>
              <tspan fill="var(--pres-ink-muted)" style={{ fontFamily: MONO_FONT }}>
                {' / '}
              </tspan>
              <tspan fill="var(--pres-primary)" letterSpacing="0.05em">
                {stage.verb}
              </tspan>
            </text>
            <text
              x={x + 250}
              y="29"
              textAnchor="end"
              fill="var(--pres-ink-muted)"
              fontSize="12"
              fontWeight="500"
              style={{ fontFamily: MONO_FONT }}
            >
              {stage.actor}
            </text>

            <line
              x1={x + 14}
              y1="39"
              x2={x + 250}
              y2="39"
              stroke="var(--pres-border)"
              strokeWidth={STROKE.hairline}
            />

            <text x={x + 14} y="62" fill="var(--pres-ink)" fontSize="14.5" fontWeight="700">
              {stage.title}
            </text>

            {stage.bullets.map((line, bIdx) => (
              <text
                key={line}
                x={x + 14}
                y={88 + bIdx * 23}
                fill="var(--pres-ink-secondary)"
                fontSize="12.5"
              >
                — {line}
              </text>
            ))}

            <line
              x1={x + 264}
              y1="82"
              x2={x + 294}
              y2="82"
              stroke="var(--pres-primary)"
              strokeWidth={STROKE.node}
              markerEnd={`url(#${arrowPrimary})`}
            />
          </g>
        );
      })}

      {/* ── STAGE 04: ROUTE A / DENY B & AUDIT ── */}
      <rect
        x="896"
        y="4"
        width="262"
        height="156"
        rx="3"
        fill="var(--pres-surface-elevated)"
        stroke="var(--pres-rule-ink)"
        strokeWidth={STROKE.node}
      />
      <rect x="896" y="4" width="262" height="3" fill="var(--pres-rule-ink)" />
      <text x="910" y="29" fontSize="12" fontWeight="700">
        <tspan fill="var(--pres-ink)" style={{ fontFamily: MONO_FONT }}>
          04
        </tspan>
        <tspan fill="var(--pres-ink-muted)" style={{ fontFamily: MONO_FONT }}>
          {' / '}
        </tspan>
        <tspan fill="var(--pres-ink)" letterSpacing="0.05em">
          ENFORCE &amp; AUDIT
        </tspan>
      </text>
      <text
        x="1144"
        y="29"
        textAnchor="end"
        fill="var(--pres-ink-muted)"
        fontSize="12"
        fontWeight="500"
        style={{ fontFamily: MONO_FONT }}
      >
        Outcome
      </text>
      <line
        x1="910"
        y1="39"
        x2="1144"
        y2="39"
        stroke="var(--pres-border)"
        strokeWidth={STROKE.hairline}
      />
      <text x="910" y="62" fill="var(--pres-ink)" fontSize="14.5" fontWeight="700">
        Route A / Deny B &amp; Log
      </text>

      {/* Allow Outcome Row */}
      <rect x="910" y="74" width="234" height="34" rx="2" fill="var(--pres-success-soft)" />
      <rect x="910" y="74" width="3.5" height="34" fill="var(--pres-success)" />
      <CheckGlyph x={922} y={87} stroke="var(--pres-success-ink)" />
      <text x="937" y="96" fill="var(--pres-success-ink)" fontSize="12.5" fontWeight="700">
        Match → Forward Server A
      </text>

      {/* Deny Outcome Row */}
      <rect x="910" y="114" width="234" height="34" rx="2" fill="var(--pres-danger-soft)" />
      <rect x="910" y="114" width="3.5" height="34" fill="var(--pres-danger)" />
      <CrossGlyph x={922} y={127} stroke="var(--pres-danger-ink)" />
      <text x="937" y="136" fill="var(--pres-danger-ink)" fontSize="12.5" fontWeight="700">
        Mismatch → Deny B &amp; Audit
      </text>
    </svg>
  );
}

/**
 * Slide 09 — Iterative Development Approach (DSR + Iterative Prototyping)
 * Compact horizontal SVG with explicit feedback loop (viewBox 0 0 640 192, transparent root).
 */
export function IterativeApproachDiagram() {
  const uid = useId().replace(/:/g, '');
  const arrowPrimary = `it-${uid}-primary`;
  const arrowAccent = `it-${uid}-accent`;

  const stages = [
    { num: '01', name: 'Req.', line1: 'Interviews', line2: '& MCP specs', accent: false },
    { num: '02', name: 'Design', line1: '5-fn proxy', line2: '& manifest', accent: false },
    { num: '03', name: 'Build', line1: 'Python code', line2: '& 2 servers', accent: false },
    { num: '04', name: 'Pytest', line1: 'Security &', line2: 'denial suite', accent: false },
    { num: '05', name: 'Refine', line1: 'Latency &', line2: 'UX tuning', accent: true },
  ];

  return (
    <svg
      viewBox="0 0 640 192"
      width="100%"
      role="img"
      aria-label="Five-stage Design Science Research and Iterative Prototyping workflow: 01 Requirements, 02 Design, 03 Build, 04 Pytest, 05 Refine, with an iterative feedback loop returning from Refine to Design and Build"
      className="block w-full h-auto"
      style={{ fontFamily: SANS_FONT, height: 'auto' }}
    >
      <defs>
        <ArrowMarker id={arrowPrimary} fill="var(--pres-primary)" />
        <ArrowMarker id={arrowAccent} fill="var(--pres-accent)" />
      </defs>

      {/* Top Editorial Header */}
      <text
        x="2"
        y="16"
        fill="var(--pres-primary)"
        fontSize="12.5"
        fontWeight="700"
        letterSpacing="0.05em"
      >
        DSR + ITERATIVE PROTOTYPING LOOP
      </text>
      <text
        x="638"
        y="16"
        textAnchor="end"
        fill="var(--pres-ink-muted)"
        fontSize="12.5"
        fontWeight="500"
        style={{ fontFamily: MONO_FONT }}
      >
        5 Stages · Test-Driven Cycles
      </text>

      {/* 5 Stage Cards */}
      {stages.map((st, idx) => {
        const x = 2 + idx * 131.5;
        const isLast = idx === stages.length - 1;
        return (
          <g key={st.num}>
            <rect
              x={x}
              y="28"
              width="110"
              height="96"
              rx="3"
              fill="var(--pres-surface-elevated)"
              stroke={st.accent ? 'var(--pres-accent)' : 'var(--pres-border-strong)'}
              strokeWidth={STROKE.node}
            />
            <rect
              x={x}
              y="28"
              width="110"
              height="3"
              fill={st.accent ? 'var(--pres-accent)' : 'var(--pres-primary)'}
            />
            <text
              x={x + 11}
              y="51"
              fill={st.accent ? 'var(--pres-accent)' : 'var(--pres-primary)'}
              fontSize="12.5"
              fontWeight="700"
              style={{ fontFamily: MONO_FONT }}
            >
              {st.num}
            </text>
            <text
              x={x + 11}
              y="72"
              fill="var(--pres-ink)"
              fontSize="14"
              fontWeight="700"
            >
              {st.name}
            </text>
            <line
              x1={x + 11}
              y1="80"
              x2={x + 99}
              y2="80"
              stroke="var(--pres-border)"
              strokeWidth={STROKE.hairline}
            />
            <text x={x + 11} y="97" fill="var(--pres-ink-secondary)" fontSize="12.5">
              {st.line1}
            </text>
            <text x={x + 11} y="113" fill="var(--pres-ink-secondary)" fontSize="12.5">
              {st.line2}
            </text>

            {/* Forward Stage Connector */}
            {!isLast && (
              <line
                x1={x + 110}
                y1="76"
                x2={x + 128}
                y2="76"
                stroke="var(--pres-primary)"
                strokeWidth={STROKE.node}
                markerEnd={`url(#${arrowPrimary})`}
              />
            )}
          </g>
        );
      })}

      {/* Iterative Feedback Loop Arc: 05 Refine -> 02 Design & 03 Build */}
      <path
        d="M 583 124 V 162 Q 583 168 577 168 H 194.5 Q 188.5 168 188.5 162 V 129"
        fill="none"
        stroke="var(--pres-accent)"
        strokeWidth={STROKE.node}
        strokeDasharray="6 4"
        markerEnd={`url(#${arrowAccent})`}
      />
      <path
        d="M 320 168 V 129"
        fill="none"
        stroke="var(--pres-accent)"
        strokeWidth={STROKE.node}
        strokeDasharray="6 4"
        markerEnd={`url(#${arrowAccent})`}
      />

      {/* Feedback Label Pill Centered on Return Path */}
      <rect
        x="348"
        y="155"
        width="204"
        height="26"
        rx="3"
        fill="var(--pres-accent-soft)"
        stroke="var(--pres-accent)"
        strokeWidth={STROKE.hairline}
      />
      <text
        x="450"
        y="172"
        textAnchor="middle"
        fill="var(--pres-accent)"
        fontSize="12.5"
        fontWeight="700"
      >
        Iterative Feedback Cycle
      </text>
    </svg>
  );
}

/* ── Gantt Helpers (Token-Driven, Zero Duplicated Schedule Copy) ── */

function resolvePhaseStyle(phase, taskNo) {
  const normalized = String(phase || '').toLowerCase();
  if (normalized.includes('plan') || normalized.includes('init') || normalized.includes('chapter 1')) {
    return PHASE_PALETTE.planning;
  }
  if (normalized.includes('writ') || normalized.includes('lit') || normalized.includes('method')) {
    return PHASE_PALETTE.writing;
  }
  if (
    normalized.includes('build') ||
    normalized.includes('dev') ||
    normalized.includes('impl') ||
    normalized.includes('eval') ||
    normalized.includes('test')
  ) {
    return PHASE_PALETTE.build;
  }
  if (
    normalized.includes('analy') ||
    normalized.includes('report') ||
    normalized.includes('final') ||
    normalized.includes('submit')
  ) {
    return PHASE_PALETTE.analysis;
  }
  if (taskNo <= 3) return PHASE_PALETTE.planning;
  if (taskNo <= 6) return PHASE_PALETTE.writing;
  if (taskNo <= 9) return PHASE_PALETTE.build;
  return PHASE_PALETTE.analysis;
}

function formatEditorialMarker(label, fallback) {
  if (!label) return fallback;
  return String(label).replace(/\s*\(([^)]+)\)/, ' · $1');
}

function getLabelAlignment(percent, sideOverride) {
  if (sideOverride === 'left') {
    return { transform: 'translateX(-100%)', alignItems: 'flex-end', paddingRight: '5px' };
  }
  if (sideOverride === 'right') {
    return { transform: 'translateX(0%)', alignItems: 'flex-start', paddingLeft: '5px' };
  }
  if (percent < 14) {
    return { transform: 'translateX(-10%)', alignItems: 'flex-start' };
  }
  if (percent > 86) {
    return { transform: 'translateX(-90%)', alignItems: 'flex-end' };
  }
  return { transform: 'translateX(-50%)', alignItems: 'center' };
}

/**
 * Slide 10 — Token-Driven Booktabs 20-Week Gantt Chart
 * Fluid grid (`34px minmax(250px, 33%) 1fr`), supports optional Milestone & Progress 1 markers
 * with automatic collision-safe edge clamping and ≥11.5px typography.
 */
export function GanttChart({ data, compact = false } = {}) {
  const months = Array.isArray(data?.months) ? data.months : [];
  const tasks = Array.isArray(data?.tasks) ? data.tasks : [];

  if (months.length === 0 || tasks.length === 0) {
    return null;
  }

  const rowHeight = compact ? 21 : 30;
  const barHeight = compact ? 10 : 12;
  const monthRowHeight = compact ? 22 : 26;
  const weekRowHeight = compact ? 19 : 21;

  const totalWeeks = months.length * 4;
  const weekIndices = Array.from({ length: totalWeeks }, (_, i) => i + 1);
  const gridCols = '34px minmax(250px, 33%) 1fr';

  const rawMilestoneCol =
    typeof data?.milestoneWeekCol === 'number'
      ? data.milestoneWeekCol
      : typeof data?.defenseWeekCol === 'number'
        ? data.defenseWeekCol
        : null;
  const milestoneCol =
    rawMilestoneCol !== null
      ? Math.min(Math.max(rawMilestoneCol, 1), totalWeeks)
      : null;
  const milestoneLabel = formatEditorialMarker(
    data?.milestoneLabel || data?.defenseLabel,
    'Milestone'
  );

  const rawProgress1Col =
    typeof data?.progress1WeekCol === 'number' ? data.progress1WeekCol : null;
  const progress1Col =
    rawProgress1Col !== null
      ? Math.min(Math.max(rawProgress1Col, 1), totalWeeks)
      : null;
  const progress1Label = formatEditorialMarker(data?.progress1Label, 'Progress 1');

  const markers = [];
  if (milestoneCol !== null) {
    markers.push({
      key: 'milestone',
      col: milestoneCol,
      percent: ((milestoneCol - 0.5) / totalWeeks) * 100,
      label: milestoneLabel,
      color: 'var(--pres-danger)',
      ink: 'var(--pres-danger-ink)',
      soft: 'var(--pres-danger-soft)',
    });
  }
  if (progress1Col !== null && progress1Col !== milestoneCol) {
    markers.push({
      key: 'progress1',
      col: progress1Col,
      percent: ((progress1Col - 0.5) / totalWeeks) * 100,
      label: progress1Label,
      color: 'var(--pres-accent)',
      ink: 'var(--pres-accent)',
      soft: 'var(--pres-accent-soft)',
    });
  }

  // Prevent overlapping callout labels when two markers sit within 5 weeks
  const closePair =
    markers.length === 2 && Math.abs(markers[0].col - markers[1].col) <= 5;
  const sortedByCol = [...markers].sort((a, b) => a.col - b.col);
  const sideOverrides = {};
  if (closePair) {
    sideOverrides[sortedByCol[0].key] = 'left';
    sideOverrides[sortedByCol[1].key] = 'right';
  }

  return (
    <div
      className="w-full select-none"
      style={{ fontFamily: SANS_FONT, color: 'var(--pres-ink)' }}
      role="region"
      aria-label={`Project work plan Gantt chart across ${totalWeeks} weeks (${months.join(', ')})`}
    >
      {/* ── TOP EDITORIAL BAR: Schedule Caption + Phase Key ── */}
      <div className="flex items-center justify-between mb-1.5" style={{ minHeight: '22px' }}>
        <div
          className="text-[11.5px] font-bold uppercase tracking-[0.08em]"
          style={{ color: 'var(--pres-ink-muted)' }}
        >
          Schedule · {months[0]} – {months[months.length - 1]} ({totalWeeks} Weeks)
        </div>

        <div className="flex items-center gap-5">
          {PHASE_LEGEND_ORDER.map((key) => {
            const p = PHASE_PALETTE[key];
            return (
              <div key={p.key} className="flex items-center gap-1.5">
                <span
                  className="inline-block shrink-0"
                  aria-hidden="true"
                  style={{
                    width: '14px',
                    height: '8px',
                    borderRadius: '1px',
                    backgroundColor: p.barBg,
                  }}
                />
                <span className="text-[12px] font-medium" style={{ color: 'var(--pres-ink)' }}>
                  {p.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MARKER CALLOUT STRIP (Edge-Clamped & Collision-Safe) ── */}
      <div
        className="grid items-end"
        style={{
          gridTemplateColumns: gridCols,
          height: '22px',
        }}
      >
        <div />
        <div
          className="text-[11.5px] pb-1 truncate"
          style={{ color: 'var(--pres-ink-muted)', fontFamily: MONO_FONT }}
        >
          {tasks.length} activities · 4 wks / month
        </div>
        <div className="relative h-full">
          {markers.map((m) => {
            const align = getLabelAlignment(m.percent, sideOverrides[m.key]);
            return (
              <div key={m.key}>
                {/* Vertical tick anchored at exact week center */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: `${m.percent}%`,
                    width: '2px',
                    height: '5px',
                    transform: 'translateX(-1px)',
                    backgroundColor: m.color,
                    zIndex: 20,
                  }}
                />
                {/* Callout text aligned safely without colliding */}
                <div
                  className="absolute bottom-[5px] flex flex-col"
                  style={{
                    left: `${m.percent}%`,
                    transform: align.transform,
                    alignItems: align.alignItems,
                    paddingLeft: align.paddingLeft,
                    paddingRight: align.paddingRight,
                    zIndex: 20,
                  }}
                >
                  <span
                    className="whitespace-nowrap text-[11.5px] font-bold tracking-[0.01em]"
                    style={{
                      color: m.ink,
                      lineHeight: '1.15',
                    }}
                  >
                    {m.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BOOKTABS GANTT TABLE (2px solid --pres-rule-ink top & bottom) ── */}
      <div
        style={{
          borderTop: '2px solid var(--pres-rule-ink)',
          borderBottom: '2px solid var(--pres-rule-ink)',
          backgroundColor: 'var(--pres-canvas)',
        }}
      >
        {/* Header Row */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: gridCols,
            borderBottom: '1.5px solid var(--pres-rule-ink)',
            backgroundColor: 'var(--pres-surface)',
          }}
        >
          <div
            className="flex items-center justify-center text-[11.5px] font-bold"
            style={{
              color: 'var(--pres-ink-muted)',
              borderRight: '1px solid var(--pres-border)',
              fontFamily: MONO_FONT,
            }}
          >
            #
          </div>

          <div
            className="flex items-center px-3 text-[11.5px] font-bold uppercase tracking-[0.07em]"
            style={{
              color: 'var(--pres-ink)',
              borderRight: '1px solid var(--pres-border-strong)',
            }}
          >
            Research Activity
          </div>

          <div>
            {/* Row 1: Months */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))`,
                height: `${monthRowHeight}px`,
                borderBottom: '1px solid var(--pres-border)',
              }}
            >
              {months.map((month, mIdx) => (
                <div
                  key={month}
                  className="flex items-center justify-center text-[12px] font-bold uppercase tracking-[0.06em]"
                  style={{
                    color: 'var(--pres-ink)',
                    borderRight:
                      mIdx < months.length - 1
                        ? '1px solid var(--pres-border-strong)'
                        : 'none',
                  }}
                >
                  {month}
                </div>
              ))}
            </div>

            {/* Row 2: Week Indices */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${totalWeeks}, minmax(0, 1fr))`,
                height: `${weekRowHeight}px`,
                backgroundColor: 'var(--pres-surface-muted)',
              }}
            >
              {weekIndices.map((w) => {
                const weekInMonth = ((w - 1) % 4) + 1;
                const isMonthEnd = w % 4 === 0 && w < totalWeeks;
                const marker = markers.find((m) => m.col === w);
                return (
                  <div
                    key={w}
                    className="flex items-center justify-center text-[11.5px]"
                    style={{
                      fontFamily: MONO_FONT,
                      fontWeight: marker ? 700 : 500,
                      color: marker ? marker.ink : 'var(--pres-ink-secondary)',
                      backgroundColor: marker ? marker.soft : 'transparent',
                      borderRight:
                        w < totalWeeks
                          ? isMonthEnd
                            ? '1px solid var(--pres-border-strong)'
                            : '1px solid var(--pres-border)'
                          : 'none',
                    }}
                  >
                    {weekInMonth}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Task Rows + Vertical Dashed Marker Lines */}
        <div className="relative">
          {tasks.map((task, idx) => {
            const start = Math.min(Math.max(Number(task.startWeek) || 1, 1), totalWeeks);
            const end = Math.min(Math.max(Number(task.endWeek) || start, start), totalWeeks);
            const phaseStyle = resolvePhaseStyle(task.phase, task.no ?? idx + 1);
            const isEven = idx % 2 === 1;

            return (
              <div
                key={task.no ?? idx}
                className="grid items-center"
                style={{
                  gridTemplateColumns: gridCols,
                  height: `${rowHeight}px`,
                  backgroundColor: isEven ? 'var(--pres-surface)' : 'var(--pres-canvas)',
                  borderBottom:
                    idx < tasks.length - 1 ? '1px solid var(--pres-border)' : 'none',
                }}
              >
                <div
                  className="h-full flex items-center justify-center text-[11.5px] font-medium"
                  style={{
                    color: 'var(--pres-ink-muted)',
                    fontFamily: MONO_FONT,
                    borderRight: '1px solid var(--pres-border)',
                  }}
                >
                  {String(task.no ?? idx + 1).padStart(2, '0')}
                </div>

                <div
                  className={`h-full flex items-center px-3 ${compact ? 'text-[12px]' : 'text-[13.5px]'} font-medium truncate`}
                  style={{
                    color: 'var(--pres-ink)',
                    borderRight: '1px solid var(--pres-border-strong)',
                    lineHeight: 1.2,
                  }}
                  title={task.activity}
                >
                  {task.activity}
                </div>

                {/* Week Columns + Task Bar */}
                <div
                  className="relative h-full grid items-center"
                  style={{
                    gridTemplateColumns: `repeat(${totalWeeks}, minmax(0, 1fr))`,
                  }}
                >
                  {weekIndices.map((w) => {
                    const isMonthEnd = w % 4 === 0 && w < totalWeeks;
                    const marker = markers.find((m) => m.col === w);
                    return (
                      <div
                        key={w}
                        className="relative h-full"
                        style={{
                          gridRow: 1,
                          gridColumn: w,
                          borderRight:
                            w < totalWeeks
                              ? isMonthEnd
                                ? '1px solid var(--pres-border-strong)'
                                : '1px solid var(--pres-border)'
                              : 'none',
                        }}
                      >
                        {marker && (
                          <div
                            aria-hidden="true"
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              backgroundColor: marker.soft,
                              opacity: 0.45,
                            }}
                          />
                        )}
                      </div>
                    );
                  })}

                  <div
                    className="relative"
                    style={{
                      gridRow: 1,
                      gridColumn: `${start} / ${end + 1}`,
                      height: `${barHeight}px`,
                      marginLeft: '2px',
                      marginRight: '2px',
                      borderRadius: '2px',
                      backgroundColor: phaseStyle.barBg,
                      zIndex: 5,
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* Vertical Dashed Milestone & Progress 1 Lines */}
          {markers.length > 0 && (
            <div
              className="pointer-events-none absolute inset-y-0 grid"
              style={{
                left: 0,
                right: 0,
                gridTemplateColumns: gridCols,
                zIndex: 15,
              }}
            >
              <div />
              <div />
              <div className="relative h-full">
                {markers.map((m) => (
                  <div
                    key={m.key}
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: `${m.percent}%`,
                      transform: 'translateX(-0.75px)',
                      borderLeft: `1.5px dashed ${m.color}`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
