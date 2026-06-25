import fs from 'fs';
import path from 'path';
import { parse as parseYaml } from 'yaml';

type JsonObject = Record<string, unknown>;

interface ParsedArgs {
  flags: Record<string, string | boolean>;
  positionals: string[];
}

interface SkillMeta {
  name: string;
  version: string;
  description: string;
  requires: string[];
  triggers: string[];
  skillPath: string;
}

interface MethodologyFactor {
  id: string;
  name: string;
  description: string;
  weight: number;
  levels?: Record<string, string>;
}

interface Methodology {
  id: string;
  name: string;
  version: string;
  description: string;
  factors: MethodologyFactor[];
  scoring: {
    points?: Record<string, number>;
    max_score?: number;
    thresholds?: Record<string, { min: number; label: string }>;
  };
}

interface GapMoveBook {
  moves: Record<
    string,
    Partial<
      Record<
        ScoreColor,
        {
          diagnosis?: string;
          moves?: string[];
          anti_patterns?: string[];
        }
      >
    >
  >;
}

type ScoreColor = 'green' | 'yellow' | 'red';

interface FactorScore {
  factor: MethodologyFactor;
  score: ScoreColor;
  points: number;
  diagnosis: string;
  evidence: string;
  nextMove: string;
}

interface DealRecord {
  name: string;
  domain?: string;
  stage?: string;
  acv: number;
  champion?: string;
  economicBuyer?: string;
  closeDateTarget?: string;
  competitors: string[];
  notes?: string;
  updatedAt?: string;
  sourceFiles: string[];
  memoryText?: string;
  parsedScores: Record<string, { score: ScoreColor; evidence: string }>;
}

interface ScoredDeal {
  deal: DealRecord;
  factors: FactorScore[];
  total: number;
  max: number;
  pct: number;
  category: string;
  redCount: number;
  staleDays: number | null;
  nextAction: string;
  fatalFlaw: string;
}

interface Workspace {
  cwd: string;
  packageRoot: string;
  root: string;
  companyConfig: JsonObject | null;
  identityConfig: JsonObject | null;
  voiceConfig: JsonObject | null;
  connectorsConfig: JsonObject | null;
  methodology: Methodology | null;
  gapMoves: GapMoveBook | null;
  skills: SkillMeta[];
}

const COMMANDS: Record<string, string> = {
  init: 'Create local data folders and starter state files',
  brief: 'Daily pipeline brief from local deals, actions, and calendar files',
  inspect: 'Score one deal against the active methodology',
  review: 'Portfolio review ranked by risk and ACV',
  prep: 'Pre-call plan for one deal',
  'post-call': 'Extract call notes/transcript into deal intel and follow-up',
  research: 'Build a local account dossier without external lookups',
  help: 'Show command help',
  version: 'Show package version',
};

const DEFAULT_DIRS = [
  'data/deals',
  'data/state',
  'data/state/morning-briefs',
  'data/state/cron-output',
  'data/briefings',
  'data/research',
  'data/post-call',
  'data/transcripts',
  'data/corpus',
  'memory/deals',
  'memory/patterns',
];

const FACTOR_ALIASES: Record<string, string[]> = {
  metrics: ['metrics', 'metric', 'business impact', 'roi'],
  economic_buyer: ['economic buyer', 'eb', 'budget holder'],
  decision_criteria: ['decision criteria', 'criteria', 'requirements'],
  decision_process: ['decision process', 'approval process', 'process'],
  paper_process: ['paper process', 'procurement', 'legal', 'security'],
  pain: ['pain', 'identified pain', 'need', 'problem'],
  champion: ['champion'],
  competition: ['competition', 'competitor', 'incumbent'],
  budget: ['budget'],
  authority: ['authority', 'decision maker'],
  need: ['need', 'pain', 'problem'],
  timeline: ['timeline', 'close date'],
};

export interface CliResult {
  code: number;
  output: string;
}

export function runSegundoCommand(input: {
  command?: string;
  args: string[];
  cwd: string;
  packageRoot: string;
}): CliResult {
  const command = normalizeCommand(input.command);
  const args = parseArgs(input.args);

  if (!command || command === 'help' || args.flags.help === true || args.flags.h === true) {
    return ok(renderHelp(input.packageRoot));
  }

  if (command === 'version' || args.flags.version === true || args.flags.v === true) {
    return ok(renderVersion(input.packageRoot));
  }

  if (!Object.prototype.hasOwnProperty.call(COMMANDS, command)) {
    return fail(
      [
        `Unknown command: ${command}`,
        '',
        renderHelp(input.packageRoot),
      ].join('\n')
    );
  }

  const workspace = loadWorkspace(input.cwd, input.packageRoot, command === 'init');

  if (command === 'init') {
    return commandInit(workspace);
  }

  if (!workspace.companyConfig) {
    return fail(
      [
        'Segundo is not initialized here.',
        '',
        `Missing: ${rel(workspace.root, path.join(workspace.root, 'config', 'company.yaml'))}`,
        'Run: npx segundo init',
      ].join('\n')
    );
  }

  if (!workspace.methodology) {
    return fail(
      [
        'Active methodology could not be loaded.',
        `Configured framework: ${getFramework(workspace.companyConfig)}`,
        'Fix: set methodology.framework to meddpicc, meddic, bant, or custom in config/company.yaml.',
      ].join('\n')
    );
  }

  switch (command) {
    case 'brief':
      return commandBrief(workspace);
    case 'inspect':
      return commandInspect(workspace, args);
    case 'review':
      return commandReview(workspace);
    case 'prep':
      return commandPrep(workspace, args);
    case 'post-call':
      return commandPostCall(workspace, args);
    case 'research':
      return commandResearch(workspace, args);
    default:
      return fail(`Command "${command}" is not implemented.`);
  }
}

function commandInit(workspace: Workspace): CliResult {
  const created: string[] = [];
  const existing: string[] = [];

  for (const dir of DEFAULT_DIRS) {
    const target = path.join(workspace.root, dir);
    if (fs.existsSync(target)) {
      existing.push(dir);
    } else {
      fs.mkdirSync(target, { recursive: true });
      created.push(dir);
    }
  }

  const files = [
    {
      relPath: 'data/state/actions.json',
      contents: JSON.stringify({ actions: [] }, null, 2) + '\n',
    },
    {
      relPath: 'data/state/calendar.json',
      contents: JSON.stringify({ events: [] }, null, 2) + '\n',
    },
  ];

  const createdFiles: string[] = [];
  const existingFiles: string[] = [];
  for (const file of files) {
    const target = path.join(workspace.root, file.relPath);
    if (fs.existsSync(target)) {
      existingFiles.push(file.relPath);
    } else {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, file.contents, 'utf8');
      createdFiles.push(file.relPath);
    }
  }

  const copiedConfigs: string[] = [];
  for (const configName of ['company.yaml', 'identity.yaml', 'voice.yaml', 'connectors.yaml']) {
    const target = path.join(workspace.root, 'config', configName);
    if (fs.existsSync(target)) continue;
    const source = path.join(workspace.packageRoot, 'config', configName);
    if (fs.existsSync(source)) {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(source, target);
      copiedConfigs.push(`config/${configName}`);
    }
  }

  const envTarget = path.join(workspace.root, '.env');
  let envMessage = '.env exists';
  if (!fs.existsSync(envTarget)) {
    const envSource = path.join(workspace.packageRoot, '.env.example');
    if (fs.existsSync(envSource)) {
      fs.copyFileSync(envSource, envTarget);
      envMessage = 'created .env from .env.example';
    } else {
      envMessage = 'no .env.example found; skipped .env';
    }
  }

  const companyName = getCompanyName(workspace.companyConfig) || 'Your Company';
  const framework = getFramework(workspace.companyConfig);
  const skills = loadSkills(workspace.root, workspace.packageRoot);
  const templateCount = listFiles(path.join(workspace.packageRoot, 'templates'), '.md').length;

  return ok(
    [
      'SEGUNDO INIT',
      `Workspace: ${workspace.root}`,
      `Company: ${companyName}`,
      `Methodology: ${framework}`,
      '',
      `Created dirs: ${created.length ? created.join(', ') : 'none'}`,
      `Existing dirs: ${existing.length}`,
      `Created files: ${createdFiles.length ? createdFiles.join(', ') : 'none'}`,
      `Existing files: ${existingFiles.length}`,
      `Config copied: ${copiedConfigs.length ? copiedConfigs.join(', ') : 'none'}`,
      `Env: ${envMessage}`,
      '',
      `Loaded assets: ${skills.length} skills, ${templateCount} templates`,
      '',
      'Next local data to add:',
      '- data/deals/<deal>.json for structured deal state',
      '- memory/deals/deal_<name>.md for narrative deal memory',
      '- data/state/actions.json for open follow-ups',
      '',
      'Try:',
      '  npx segundo brief',
      '  npx segundo inspect --deal "Acme Corp"',
      '  npx segundo review',
    ].join('\n')
  );
}

function commandBrief(workspace: Workspace): CliResult {
  const skill = findSkill(workspace, 'morning-brief');
  const deals = collectDeals(workspace);
  const scored = scoreDeals(workspace, deals);
  const today = todayIso();
  const prebuilt = path.join(workspace.root, 'data', 'state', 'morning-briefs', `brief-${today}.md`);

  if (fs.existsSync(prebuilt)) {
    return ok(
      [
        `SEGUNDO BRIEF | ${today}`,
        `Loaded prebuilt brief: ${rel(workspace.root, prebuilt)}`,
        '',
        fs.readFileSync(prebuilt, 'utf8').trim(),
      ].join('\n')
    );
  }

  const actions = readActions(workspace.root);
  const calendar = readCalendar(workspace.root, today);
  const staleDeals = scored.filter((d) => d.staleDays !== null && d.staleDays >= 14);
  const atRisk = scored.filter((d) => d.category.toLowerCase().includes('risk') || d.redCount >= 2);
  const overdue = actions.filter((a) => a.isOpen && a.daysOverdue !== null && a.daysOverdue > 0);
  const openActions = actions.filter((a) => a.isOpen);
  const nextMeeting = calendar[0];
  const lastOutcome = readLastSessionOutcome(workspace.root);
  const cron = readCronOutputs(workspace.root);

  const firstLine = `GOOD MORNING. Yesterday: ${lastOutcome || 'no prior session data available'}.`;
  const secondLine = `Today: ${
    nextMeeting ? `${nextMeeting.time} ${nextMeeting.title}` : 'no local calendar events loaded'
  }. ${atRisk.length + staleDeals.length} deals need attention.`;
  const thirdLine =
    scored.length === 0
      ? 'Pipeline state is empty; add data/deals/*.json or memory/deals/*.md to unlock scoring.'
      : `Momentum: ${formatMoney(sum(scored.map((d) => d.deal.acv)))} across ${scored.length} deals; top risk is ${topRisk(scored)}.`;

  return ok(
    [
      `SEGUNDO BRIEF | ${today}`,
      sourceLine(workspace, skill, ['data/deals', 'memory/deals', 'data/state/actions.json', 'data/state/calendar.json']),
      '',
      firstLine,
      secondLine,
      thirdLine,
      '',
      'PIPELINE ALERTS',
      ...renderBriefAlerts(scored),
      '',
      `TODAY'S CALENDAR (${calendar.length})`,
      ...(calendar.length
        ? calendar.map((event) => `- ${event.time} | ${event.title} | ${event.attendees || 'attendees not loaded'}`)
        : ['- No data. Add events to data/state/calendar.json.']),
      '',
      `OVERDUE ITEMS (${overdue.length})`,
      ...(overdue.length
        ? overdue.slice(0, 5).map((item) => `- [${item.daysOverdue}d overdue] ${item.title}${item.deal ? ` (${item.deal})` : ''}`)
        : ['- None found in data/state/actions.json.']),
      '',
      `OPEN ACTION ITEMS (${openActions.length})`,
      ...(openActions.length
        ? openActions.slice(0, 5).map((item) => `- ${item.title}${item.due ? ` -- due ${item.due}` : ''}`)
        : ['- No open local actions loaded.']),
      '',
      'OVERNIGHT UPDATES',
      ...(cron.length ? cron.map((item) => `- ${item}`) : ['- No local cron outputs in data/state/cron-output/.']),
      '',
      'NEXT MOVE',
      scored.length
        ? `- Run: npx segundo inspect --deal "${scored[0].deal.name}"`
        : '- Create your first deal: data/deals/acme.json or memory/deals/deal_acme.md',
    ].join('\n')
  );
}

function commandInspect(workspace: Workspace, args: ParsedArgs): CliResult {
  const skill = findSkill(workspace, 'deal-inspector');
  const deal = selectDeal(workspace, args);
  if ('error' in deal) return fail(deal.error);

  const scored = scoreDeal(workspace, deal.deal);
  return ok(
    [
      `DEAL INSPECTION | ${scored.deal.name} | ${todayIso()}`,
      sourceLine(workspace, skill, scored.deal.sourceFiles.map((file) => rel(workspace.root, file))),
      '',
      `STAGE: ${scored.deal.stage || 'unknown'} | ACV: ${formatMoney(scored.deal.acv)} | CATEGORY: ${scored.category}`,
      `SCORE: ${scored.total}/${scored.max} (${scored.pct}%) | RED FACTORS: ${scored.redCount} | LAST ACTIVITY: ${formatStale(scored.staleDays)}`,
      '',
      `${workspace.methodology?.name.toUpperCase() || 'METHODOLOGY'} SCORE`,
      ...scored.factors.map(
        (factor) =>
          `${factor.factor.name}: ${factor.score.toUpperCase()} ${factor.diagnosis} -- ${factor.evidence}`
      ),
      '',
      `FATAL FLAW: ${scored.fatalFlaw}`,
      `WEAKEST GAP: ${weakestFactor(scored).factor.name}`,
      `NEXT BEST ACTION: ${scored.nextAction}`,
      '',
      'CONTROL MAP',
      `Direct: send targeted question/asset that closes ${weakestFactor(scored).factor.name}.`,
      'Influence: get champion or stakeholder to validate the missing evidence.',
      'Uncontrolled: buyer budget, reorgs, competitor lock-in, or procurement delays.',
      '',
      'FILES',
      ...scored.deal.sourceFiles.map((file) => `- ${rel(workspace.root, file)}`),
    ].join('\n')
  );
}

function commandReview(workspace: Workspace): CliResult {
  const skill = findSkill(workspace, 'pipeline-review');
  const scored = scoreDeals(workspace, collectDeals(workspace));

  if (scored.length === 0) {
    return ok(
      [
        `PIPELINE REVIEW | ${getUserName(workspace.identityConfig)} | ${todayIso()}`,
        sourceLine(workspace, skill, ['data/deals', 'memory/deals']),
        '',
        'No local deals found.',
        '',
        'Add one of:',
        '- data/deals/acme.json with name, stage, acv, champion, economicBuyer',
        '- memory/deals/deal_acme.md using templates/deal-memory.md',
      ].join('\n')
    );
  }

  const buckets = bucketPipeline(scored);
  const ranked = [...scored].sort((a, b) => urgencyValue(b) - urgencyValue(a));
  const stale = ranked.filter((d) => d.staleDays !== null && d.staleDays >= 14);

  return ok(
    [
      `PIPELINE REVIEW | ${getUserName(workspace.identityConfig)} | ${todayIso()}`,
      sourceLine(workspace, skill, ['data/deals', 'memory/deals', methodologyPath(workspace)]),
      '',
      'SUMMARY',
      `Total Pipeline: ${formatMoney(sum(scored.map((d) => d.deal.acv)))} across ${scored.length} deals`,
      `Commit: ${formatMoney(buckets.commit.amount)} (${buckets.commit.count} deals)`,
      `Best Case: ${formatMoney(buckets.best_case.amount)} (${buckets.best_case.count} deals)`,
      `Pipeline: ${formatMoney(buckets.pipeline.amount)} (${buckets.pipeline.count} deals)`,
      `At Risk: ${formatMoney(buckets.at_risk.amount)} (${buckets.at_risk.count} deals)`,
      '',
      'DEAL BOARD',
      ...ranked.slice(0, 10).map((item, index) => {
        return `${index + 1}. ${item.deal.name} | ${formatMoney(item.deal.acv)} | ${item.deal.stage || 'unknown'} | ${item.pct}% | ${item.category}\n   Risk: ${item.fatalFlaw}`;
      }),
      '',
      'TOP 3 ACTIONS',
      ...ranked.slice(0, 3).map((item, index) => `${index + 1}. ${item.deal.name}: ${item.nextAction}`),
      '',
      'STALE DEALS (14+ days no activity)',
      ...(stale.length
        ? stale.map((item) => `- ${item.deal.name}: ${formatStale(item.staleDays)}`)
        : ['- None detected from local file timestamps/updatedAt fields.']),
    ].join('\n')
  );
}

function commandPrep(workspace: Workspace, args: ParsedArgs): CliResult {
  const skill = findSkill(workspace, 'pre-call-brief');
  const deal = selectDeal(workspace, args);
  if ('error' in deal) return fail(deal.error);

  const scored = scoreDeal(workspace, deal.deal);
  const weakest = weakestFactor(scored);
  const callType = stringFlag(args, 'call-type') || stringFlag(args, 'type') || inferCallType(scored.deal);
  const attendeeFlag = stringFlag(args, 'attendees') || stringFlag(args, 'with');
  const questions = buildQuestionStack(weakest.factor);
  const competitors = scored.deal.competitors.length
    ? scored.deal.competitors
    : listCompetitors(workspace.companyConfig);

  return ok(
    [
      `PRE-CALL BRIEF | ${scored.deal.name} | ${todayIso()}`,
      sourceLine(workspace, skill, scored.deal.sourceFiles.map((file) => rel(workspace.root, file))),
      '',
      `CALL TYPE: ${callType}`,
      `ATTENDEES: ${attendeeFlag || 'not loaded locally'}`,
      `DEAL STATE: ${scored.deal.stage || 'unknown'} | ${formatMoney(scored.deal.acv)} | ${scored.category}`,
      `WEAKEST GAP: ${weakest.factor.name} (${weakest.score.toUpperCase()})`,
      '',
      'OBJECTIVES',
      `1. MUST: close the ${weakest.factor.name} evidence gap.`,
      `2. SHOULD: confirm who owns the next approval step.`,
      `3. NICE: capture one metric, date, or stakeholder detail that makes the next review sharper.`,
      '',
      'QUESTION STACK',
      ...questions.map((question) => `- ${question}`),
      '',
      'LANDMINES',
      ...(competitors.length
        ? competitors.map((name) => `- Ask how ${name} is being evaluated and what would make them lose.`)
        : ['- No competitor data loaded; ask what they would do if they did not buy from you.']),
      '',
      'OPENING LINE',
      `"I want to make this useful: can we spend the first few minutes on ${weakest.factor.name.toLowerCase()} so we leave with a clear next step?"`,
      '',
      'NEXT MOVE',
      `- After the call: npx segundo post-call --deal "${scored.deal.name}" --notes <notes-file>`,
    ].join('\n')
  );
}

function commandPostCall(workspace: Workspace, args: ParsedArgs): CliResult {
  const skill = findSkill(workspace, 'post-call');
  const deal = selectDeal(workspace, args, { allowMissingDeal: true });
  const dealName = 'deal' in deal ? deal.deal.name : stringFlag(args, 'deal') || stringFlag(args, 'company') || 'Unassigned';
  const notesResult = loadNotes(workspace.root, args);

  if (!notesResult.text) {
    return ok(
      [
        `POST-CALL | ${dealName} | ${todayIso()}`,
        sourceLine(workspace, skill, ['--transcript <file>', '--notes <text-or-file>']),
        '',
        'No transcript or notes were provided.',
        '',
        'Run one of:',
        `  npx segundo post-call --deal "${dealName}" --transcript data/transcripts/call.txt`,
        `  npx segundo post-call --deal "${dealName}" --notes "Champion confirmed CFO owns approval; next call Friday."`,
      ].join('\n')
    );
  }

  const extraction = extractCallIntel(notesResult.text, workspace.methodology);
  const voice = getVoice(workspace.voiceConfig);
  const write = args.flags.write === true;
  let writeMessage = 'Dry run only. Add --write to append this summary to memory/deals/.';

  if (write) {
    const file = appendDealMemory(workspace.root, dealName, extraction, notesResult.source);
    writeMessage = `Appended memory: ${rel(workspace.root, file)}`;
  }

  return ok(
    [
      `POST-CALL SUMMARY | ${dealName} | ${todayIso()}`,
      sourceLine(workspace, skill, [notesResult.source || 'inline notes']),
      '',
      `SOURCE: ${notesResult.source || 'inline notes'} (${wordCount(notesResult.text)} words)`,
      '',
      'INTEL EXTRACTED',
      `${workspace.methodology?.name || 'Methodology'} updates:`,
      ...(extraction.methodologySignals.length
        ? extraction.methodologySignals.map((item) => `- ${item}`)
        : ['- No explicit methodology signals found; mark unaddressed, do not infer.']),
      '',
      'Action items:',
      ...(extraction.actions.length ? extraction.actions.map((item) => `- ${item}`) : ['- None explicit. Ask for a dated next step.']),
      '',
      'Objections:',
      ...(extraction.objections.length ? extraction.objections.map((item) => `- ${item}`) : ['- None explicit.']),
      '',
      'DEAL STATE CHANGE',
      `Next step: ${extraction.nextStep || 'not confirmed'}`,
      `Risk change: ${extraction.risk || 'not enough evidence to change risk'}`,
      '',
      'FOLLOW-UP DRAFT',
      renderFollowUpDraft(dealName, extraction, voice),
      '',
      writeMessage,
    ].join('\n')
  );
}

function commandResearch(workspace: Workspace, args: ParsedArgs): CliResult {
  const skill = findSkill(workspace, 'account-research');
  const company = stringFlag(args, 'company') || stringFlag(args, 'account') || args.positionals.join(' ').trim();

  if (!company) {
    return ok(
      [
        `ACCOUNT RESEARCH | ${todayIso()}`,
        sourceLine(workspace, skill, ['data/research/<company>.md', 'data/research/<company>.json']),
        '',
        'Missing company name.',
        '',
        'Run:',
        '  npx segundo research --company "Acme Corp"',
        '  npx segundo research --company "Acme Corp" --source data/research/acme.md',
      ].join('\n')
    );
  }

  const source = locateResearchSource(workspace.root, company, args);
  const sourceText = source ? fs.readFileSync(source, 'utf8') : '';
  const dossier = buildResearchDossier(workspace, company, sourceText);

  return ok(
    [
      `ACCOUNT RESEARCH | ${company} | ${todayIso()}`,
      sourceLine(workspace, skill, [source ? rel(workspace.root, source) : 'no local research source']),
      '',
      `ICP SCORE: ${dossier.score}/100 - ${dossier.verdict}`,
      '',
      'COMPANY SNAPSHOT',
      `- Industry: ${dossier.industry || 'no local evidence'}`,
      `- Headcount: ${dossier.headcount || 'no local evidence'}`,
      `- Revenue: ${dossier.revenue || 'no local evidence'}`,
      `- HQ: ${dossier.hq || 'no local evidence'}`,
      `- Funding: ${dossier.funding || 'no local evidence'}`,
      '',
      'ICP MATCH',
      ...dossier.matches.map((item) => `- ${item}`),
      '',
      'RISKS',
      ...dossier.risks.map((item) => `- ${item}`),
      '',
      'RECOMMENDED APPROACH',
      dossier.approach,
      '',
      'LOCAL SOURCE NEEDED',
      source
        ? `- Source loaded: ${rel(workspace.root, source)}`
        : `- Add research notes to data/research/${slug(company)}.md for a higher-confidence dossier.`,
    ].join('\n')
  );
}

function loadWorkspace(cwd: string, packageRoot: string, preferCwd = false): Workspace {
  const root = preferCwd ? path.resolve(cwd) : findWorkspaceRoot(cwd, packageRoot);
  const allowPackageConfigFallback = preferCwd || path.resolve(root) === path.resolve(packageRoot);
  const configFile = (name: string) =>
    firstExisting(
      allowPackageConfigFallback
        ? [path.join(root, 'config', name), path.join(packageRoot, 'config', name)]
        : [path.join(root, 'config', name)]
    );
  const companyConfig = readYamlObject(configFile('company.yaml'));
  const identityConfig = readYamlObject(configFile('identity.yaml'));
  const voiceConfig = readYamlObject(configFile('voice.yaml'));
  const connectorsConfig = readYamlObject(configFile('connectors.yaml'));

  const framework = getFramework(companyConfig);
  const methodologyFile = firstExisting([
    path.join(root, 'methodologies', framework, 'methodology.json'),
    path.join(packageRoot, 'methodologies', framework, 'methodology.json'),
  ]);
  const methodology = loadMethodology(methodologyFile);
  const gapFile = firstExisting([
    path.join(root, 'methodologies', framework, 'gap-moves.json'),
    path.join(packageRoot, 'methodologies', framework, 'gap-moves.json'),
  ]);
  const gapMoves = loadGapMoves(gapFile);

  return {
    cwd,
    packageRoot,
    root,
    companyConfig,
    identityConfig,
    voiceConfig,
    connectorsConfig,
    methodology,
    gapMoves,
    skills: loadSkills(root, packageRoot),
  };
}

function collectDeals(workspace: Workspace): DealRecord[] {
  const byName = new Map<string, DealRecord>();

  for (const file of listFiles(path.join(workspace.root, 'data', 'deals'), '.json')) {
    const raw = readJsonObject(file);
    if (!raw) continue;
    const deal = dealFromJson(raw, file);
    mergeDeal(byName, deal);
  }

  const memoryDirs = [
    path.join(workspace.root, 'memory', 'deals'),
    path.join(workspace.root, 'data', 'memory', 'deals'),
  ];
  for (const dir of memoryDirs) {
    for (const file of listFiles(dir, '.md')) {
      const text = safeRead(file);
      const deal = dealFromMarkdown(text, file);
      mergeDeal(byName, deal);
    }
  }

  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function dealFromJson(raw: JsonObject, file: string): DealRecord {
  const name = asString(raw.name) || asString(raw.company) || stripExt(path.basename(file));
  const competitorsRaw = Array.isArray(raw.competitors) ? raw.competitors : [];
  return {
    name,
    domain: asString(raw.domain),
    stage: asString(raw.stage),
    acv: asNumber(raw.acv) ?? asNumber(raw.amount) ?? 0,
    champion: asString(raw.champion),
    economicBuyer: asString(raw.economicBuyer) || asString(raw.economic_buyer),
    closeDateTarget: asString(raw.closeDateTarget) || asString(raw.close_date) || asString(raw.closeDate),
    competitors: competitorsRaw.map((item) => String(item)).filter(Boolean),
    notes: asString(raw.notes),
    updatedAt: asString(raw.updatedAt) || asString(raw.lastActivity) || asString(raw.last_activity),
    sourceFiles: [file],
    parsedScores: parseStructuredScores(raw),
  };
}

function dealFromMarkdown(text: string, file: string): DealRecord {
  const fields = parseMarkdownFields(text);
  const fallbackName = stripExt(path.basename(file)).replace(/^deal[_-]/i, '').replace(/[_-]+/g, ' ');
  const name = fields.company || fields.name || titleCase(fallbackName);
  const parsedScores = parseMarkdownScores(text);
  const competitors = extractListAfterHeading(text, 'Competitors');

  return {
    name,
    stage: fields.stage,
    acv: parseMoney(fields.acv || fields.amount),
    closeDateTarget: fields.closeDate,
    champion: findInlineRole(text, 'Champion'),
    economicBuyer: findInlineRole(text, 'Economic Buyer'),
    competitors,
    notes: text.slice(0, 5000),
    updatedAt: latestDateInText(text),
    sourceFiles: [file],
    memoryText: text,
    parsedScores,
  };
}

function mergeDeal(byName: Map<string, DealRecord>, incoming: DealRecord): void {
  const key = normalizeName(incoming.name);
  const existing = byName.get(key);
  if (!existing) {
    byName.set(key, incoming);
    return;
  }

  existing.domain ||= incoming.domain;
  existing.stage ||= incoming.stage;
  existing.acv = existing.acv || incoming.acv;
  existing.champion ||= incoming.champion;
  existing.economicBuyer ||= incoming.economicBuyer;
  existing.closeDateTarget ||= incoming.closeDateTarget;
  existing.notes = [existing.notes, incoming.notes].filter(Boolean).join('\n\n');
  existing.memoryText = [existing.memoryText, incoming.memoryText].filter(Boolean).join('\n\n');
  existing.updatedAt = latestDate([existing.updatedAt, incoming.updatedAt]);
  existing.sourceFiles.push(...incoming.sourceFiles);
  existing.competitors = unique([...existing.competitors, ...incoming.competitors]);
  existing.parsedScores = { ...incoming.parsedScores, ...existing.parsedScores };
}

function scoreDeals(workspace: Workspace, deals: DealRecord[]): ScoredDeal[] {
  return deals.map((deal) => scoreDeal(workspace, deal));
}

function scoreDeal(workspace: Workspace, deal: DealRecord): ScoredDeal {
  const methodology = workspace.methodology;
  if (!methodology) {
    throw new Error('Cannot score without methodology.');
  }

  const points = methodology.scoring.points || { green: 10, yellow: 5, red: 0 };
  const factors = methodology.factors.map((factor) => {
    const score = inferFactorScore(deal, factor);
    const weight = factor.weight || 1;
    const pointValue = (points[score.score] ?? 0) * weight;
    const gapMove = workspace.gapMoves?.moves?.[factor.id]?.[score.score];
    return {
      factor,
      score: score.score,
      points: pointValue,
      diagnosis: score.diagnosis,
      evidence: score.evidence,
      nextMove: gapMove?.moves?.[0] || defaultMove(factor, score.score),
    };
  });

  const total = sum(factors.map((factor) => factor.points));
  const max =
    methodology.scoring.max_score ||
    sum(methodology.factors.map((factor) => (points.green ?? 10) * (factor.weight || 1)));
  const pct = max > 0 ? Math.round((total / max) * 100) : 0;
  const redCount = factors.filter((factor) => factor.score === 'red').length;
  const category = categoryForScore(methodology, total, redCount);
  const staleDays = staleDaysForDeal(deal);
  const weakest = weakestFactor({ factors } as ScoredDeal);

  return {
    deal,
    factors,
    total,
    max,
    pct,
    category,
    redCount,
    staleDays,
    nextAction: `${weakest.nextMove} by ${nextBusinessDay()} because ${weakest.factor.name.toLowerCase()} is the limiting gap.`,
    fatalFlaw: fatalFlaw(deal, weakest),
  };
}

function inferFactorScore(
  deal: DealRecord,
  factor: MethodologyFactor
): { score: ScoreColor; diagnosis: string; evidence: string } {
  const parsed = findParsedScore(deal, factor);
  if (parsed) {
    return {
      score: parsed.score,
      diagnosis: parsed.score === 'green' ? 'CONFIRMED' : parsed.score === 'yellow' ? 'ASSUMED' : 'MISSING',
      evidence: parsed.evidence || `Loaded from local deal memory for ${factor.name}.`,
    };
  }

  const text = `${deal.notes || ''}\n${deal.memoryText || ''}`.toLowerCase();
  const id = factor.id;
  const name = factor.name.toLowerCase();

  if (id === 'economic_buyer' || name.includes('economic buyer') || id === 'authority') {
    if (deal.economicBuyer) return yellow(`Economic buyer loaded locally: ${deal.economicBuyer}. Validate direct engagement.`);
  }

  if (id === 'champion') {
    if (deal.champion) return yellow(`Champion loaded locally: ${deal.champion}. Test influence and EB access.`);
  }

  if (id === 'competition') {
    if (deal.competitors.length) return yellow(`Competitors loaded: ${deal.competitors.join(', ')}. Position is not confirmed.`);
  }

  if (id === 'timeline') {
    if (deal.closeDateTarget) return yellow(`Close date loaded: ${deal.closeDateTarget}. Confirm buyer-owned consequences.`);
  }

  if (id === 'metrics' && hasAny(text, ['$', '%', 'roi', 'savings', 'cost', 'revenue', 'hours'])) {
    return yellow('Numeric or business-impact language exists in local notes; prospect validation not proven.');
  }

  if ((id === 'pain' || id === 'need') && hasAny(text, ['pain', 'problem', 'challenge', 'risk', 'blocked', 'cost'])) {
    return yellow('Pain language exists in local notes; prospect-owned consequences not proven.');
  }

  if (id === 'decision_criteria' && hasAny(text, ['criteria', 'requirements', 'must have', 'evaluate', 'evaluation'])) {
    return yellow('Evaluation language exists in local notes; criteria need confirmation.');
  }

  if (id === 'decision_process' && hasAny(text, ['approval', 'approver', 'process', 'committee', 'sign off', 'sign-off'])) {
    return yellow('Approval/process language exists in local notes; steps and owners are not fully mapped.');
  }

  if (id === 'paper_process' && hasAny(text, ['procurement', 'legal', 'security', 'msa', 'vendor onboarding'])) {
    return yellow('Paper-process language exists in local notes; timeline and owners need confirmation.');
  }

  if (id === 'budget' && (deal.acv > 0 || hasAny(text, ['budget', '$', 'pricing', 'cost']))) {
    return yellow('Budget/pricing signal exists locally; allocated budget is not confirmed.');
  }

  return {
    score: 'red',
    diagnosis: 'MISSING',
    evidence: `No local evidence found for ${factor.name}.`,
  };
}

function yellow(evidence: string): { score: ScoreColor; diagnosis: string; evidence: string } {
  return { score: 'yellow', diagnosis: 'ASSUMED', evidence };
}

function commandDealSelectionError(workspace: Workspace): string {
  const deals = collectDeals(workspace);
  if (deals.length === 0) {
    return [
      'No local deals found.',
      '',
      'Add one of:',
      '- data/deals/acme.json',
      '- memory/deals/deal_acme.md from templates/deal-memory.md',
    ].join('\n');
  }

  return [
    'Missing --deal.',
    '',
    'Available deals:',
    ...deals.map((deal) => `- ${deal.name}`),
    '',
    'Run:',
    `  npx segundo inspect --deal "${deals[0].name}"`,
  ].join('\n');
}

function selectDeal(
  workspace: Workspace,
  args: ParsedArgs,
  options: { allowMissingDeal?: boolean } = {}
): { deal: DealRecord } | { error: string } {
  const deals = collectDeals(workspace);
  const requested = stringFlag(args, 'deal') || stringFlag(args, 'company') || args.positionals.join(' ').trim();

  if (!requested && deals.length === 1) {
    return { deal: deals[0] };
  }

  if (!requested) {
    if (options.allowMissingDeal) {
      return { error: '' };
    }
    return { error: commandDealSelectionError(workspace) };
  }

  const exact = deals.find((deal) => normalizeName(deal.name) === normalizeName(requested));
  if (exact) return { deal: exact };

  const partial = deals.find((deal) => normalizeName(deal.name).includes(normalizeName(requested)));
  if (partial) return { deal: partial };

  if (options.allowMissingDeal) {
    return {
      deal: {
        name: requested,
        acv: 0,
        competitors: [],
        sourceFiles: [],
        parsedScores: {},
      },
    };
  }

  return {
    error: [
      `Deal not found: ${requested}`,
      '',
      'Available deals:',
      ...(deals.length ? deals.map((deal) => `- ${deal.name}`) : ['- none']),
      '',
      `Fix: create data/deals/${slug(requested)}.json or memory/deals/deal_${slug(requested)}.md`,
    ].join('\n'),
  };
}

function readActions(root: string): Array<{
  title: string;
  deal?: string;
  due?: string;
  daysOverdue: number | null;
  isOpen: boolean;
}> {
  const file = path.join(root, 'data', 'state', 'actions.json');
  const raw = readJsonAny(file);
  const rows = Array.isArray(raw)
    ? raw
    : isObject(raw) && Array.isArray(raw.actions)
      ? raw.actions
      : [];
  return rows
    .filter(isObject)
    .map((item) => {
      const title = asString(item.title) || asString(item.action) || asString(item.description) || 'Untitled action';
      const due = asString(item.due) || asString(item.dueDate) || asString(item.date);
      const status = (asString(item.status) || 'open').toLowerCase();
      return {
        title,
        deal: asString(item.deal) || asString(item.account),
        due,
        daysOverdue: due ? daysBetween(parseDate(due), new Date(todayIso())) : null,
        isOpen: !['done', 'closed', 'complete', 'completed'].includes(status),
      };
    });
}

function readCalendar(root: string, today: string): Array<{ title: string; time: string; attendees?: string }> {
  const file = path.join(root, 'data', 'state', 'calendar.json');
  const raw = readJsonAny(file);
  const rows = Array.isArray(raw)
    ? raw
    : isObject(raw) && Array.isArray(raw.events)
      ? raw.events
      : [];
  return rows
    .filter(isObject)
    .map((item) => {
      const date = asString(item.date) || asString(item.day) || firstDate(asString(item.start) || '');
      const title = asString(item.title) || asString(item.summary) || 'Untitled meeting';
      const time = asString(item.time) || firstTime(asString(item.start) || '') || 'time not loaded';
      const attendeesRaw = item.attendees;
      const attendees = Array.isArray(attendeesRaw) ? attendeesRaw.map(String).join(', ') : asString(attendeesRaw);
      return { date, title, time, attendees };
    })
    .filter((event) => event.date === today || (!event.date && today === todayIso()))
    .sort((a, b) => a.time.localeCompare(b.time));
}

function readLastSessionOutcome(root: string): string | null {
  const file = path.join(root, 'data', 'state', 'session.log');
  if (!fs.existsSync(file)) return null;
  const lines = safeRead(file)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length ? lines[lines.length - 1] : null;
}

function readCronOutputs(root: string): string[] {
  const dir = path.join(root, 'data', 'state', 'cron-output');
  return listFiles(dir)
    .slice(-5)
    .map((file) => `${path.basename(file)} loaded`);
}

function renderBriefAlerts(scored: ScoredDeal[]): string[] {
  if (scored.length === 0) {
    return ['- No pipeline data loaded. Add data/deals/*.json or memory/deals/*.md.'];
  }

  const alerts = scored
    .filter((deal) => deal.redCount > 0 || (deal.staleDays !== null && deal.staleDays >= 14))
    .sort((a, b) => urgencyValue(b) - urgencyValue(a))
    .slice(0, 7)
    .map((deal) => {
      const tags = [
        deal.redCount > 0 ? `${deal.redCount} red` : null,
        deal.staleDays !== null && deal.staleDays >= 14 ? `${deal.staleDays}d stale` : null,
      ].filter(Boolean);
      return `- [${tags.join(', ')}] ${deal.deal.name} -- ${deal.fatalFlaw}`;
    });

  return alerts.length ? alerts : ['- No red or stale deals detected from local data.'];
}

function bucketPipeline(scored: ScoredDeal[]): Record<string, { amount: number; count: number }> {
  const buckets: Record<string, { amount: number; count: number }> = {
    commit: { amount: 0, count: 0 },
    best_case: { amount: 0, count: 0 },
    pipeline: { amount: 0, count: 0 },
    at_risk: { amount: 0, count: 0 },
  };

  for (const item of scored) {
    const key = categoryKey(item.category);
    buckets[key].amount += item.deal.acv;
    buckets[key].count += 1;
  }
  return buckets;
}

function categoryKey(category: string): 'commit' | 'best_case' | 'pipeline' | 'at_risk' {
  const normalized = category.toLowerCase().replace(/[^a-z]/g, '_');
  if (normalized.includes('commit')) return 'commit';
  if (normalized.includes('best')) return 'best_case';
  if (normalized.includes('risk')) return 'at_risk';
  return 'pipeline';
}

function categoryForScore(methodology: Methodology, total: number, redCount: number): string {
  const thresholds = methodology.scoring.thresholds || {};
  const sorted = Object.values(thresholds).sort((a, b) => b.min - a.min);
  const label = sorted.find((threshold) => total >= threshold.min)?.label || 'Pipeline';
  if (redCount >= 2 && label.toLowerCase() === 'commit') return 'Best Case';
  if (redCount >= 3) return 'At Risk';
  return label;
}

function weakestFactor(scored: Pick<ScoredDeal, 'factors'>): FactorScore {
  return [...scored.factors].sort((a, b) => {
    if (a.points !== b.points) return a.points - b.points;
    return a.factor.name.localeCompare(b.factor.name);
  })[0];
}

function urgencyValue(item: ScoredDeal): number {
  const risk = item.max - item.total;
  const stale = item.staleDays !== null && item.staleDays >= 14 ? item.deal.acv * 0.25 : 0;
  return risk * Math.max(item.deal.acv, 1) + stale;
}

function fatalFlaw(deal: DealRecord, weakest: FactorScore): string {
  if (weakest.score === 'red') {
    return `${deal.name} can die because ${weakest.factor.name.toLowerCase()} has no local evidence.`;
  }
  if (weakest.score === 'yellow') {
    return `${deal.name} can slip if ${weakest.factor.name.toLowerCase()} stays assumed instead of buyer-confirmed.`;
  }
  return `${deal.name} has no obvious fatal flaw in local scoring; keep evidence fresh.`;
}

function defaultMove(factor: MethodologyFactor, score: ScoreColor): string {
  if (score === 'green') return `Keep ${factor.name.toLowerCase()} evidence fresh`;
  return `Ask one direct question that confirms ${factor.name.toLowerCase()}`;
}

function buildQuestionStack(factor: MethodologyFactor): string[] {
  const id = factor.id;
  const bank: Record<string, string[]> = {
    metrics: [
      'What does this problem cost you today in dollars, hours, or risk?',
      'How will leadership measure whether this project worked?',
      'If nothing changes for 12 months, what gets worse?',
    ],
    economic_buyer: [
      'Who ultimately signs off on a purchase like this?',
      'What does that person care most about this quarter?',
      'What would make this worth their time to review?',
    ],
    decision_criteria: [
      'What are the top three things this solution must do to get a yes?',
      'How did you evaluate the last vendor you bought?',
      'What would be the tiebreaker if two vendors looked similar?',
    ],
    decision_process: [
      'Walk me through what happens between your team liking this and a signed agreement.',
      'Who needs to weigh in, and in what order?',
      'What has stalled similar purchases before?',
    ],
    paper_process: [
      'After business approval, what does legal, security, or procurement require?',
      'Who owns vendor onboarding on your side?',
      'What timeline should we plan around after verbal yes?',
    ],
    pain: [
      'What triggered you to look at this now?',
      'When this breaks, what is the operational or financial consequence?',
      'How does solving this connect to your leadership priorities this year?',
    ],
    champion: [
      'Who internally cares most about solving this?',
      'Would you be comfortable introducing us to the budget owner?',
      'What would make this initiative a personal win for you?',
    ],
    competition: [
      'Who else are you evaluating, including doing nothing?',
      'What have you seen from alternatives that impressed you?',
      'If you had to argue against us, what would you say?',
    ],
    budget: [
      'Is budget already allocated for this, or does it need to be created?',
      'What price range has already been socialized internally?',
      'Who approves spend at this level?',
    ],
    authority: [
      'Who owns the final decision?',
      'Who can block this even if your team wants it?',
      'How are decision rights split between business and technical teams?',
    ],
    need: [
      'What problem are you trying to make disappear?',
      'Who feels that pain most day to day?',
      'What happens if the team keeps the current process?',
    ],
    timeline: [
      'What date matters here, and what happens if it slips?',
      'What internal milestone are you trying to hit?',
      'When would you need a decision to make that timeline real?',
    ],
  };

  return bank[id] || [
    `What would confirmed ${factor.name.toLowerCase()} look like from your side?`,
    `What evidence would make your team confident on ${factor.name.toLowerCase()}?`,
    `How does ${factor.name.toLowerCase()} connect to the business outcome this year?`,
  ];
}

function inferCallType(deal: DealRecord): string {
  const stage = (deal.stage || '').toLowerCase();
  if (stage.includes('negotiat') || stage.includes('clos')) return 'Negotiation / Close';
  if (stage.includes('validat') || stage.includes('demo')) return 'Technical Demo';
  if (stage.includes('discover')) return 'Discovery';
  return 'Discovery';
}

function extractCallIntel(text: string, methodology: Methodology | null): {
  methodologySignals: string[];
  actions: string[];
  objections: string[];
  nextStep: string | null;
  risk: string | null;
} {
  const lines = text
    .split(/\r?\n|(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const lower = text.toLowerCase();
  const methodologySignals: string[] = [];

  for (const factor of methodology?.factors || []) {
    const aliases = FACTOR_ALIASES[factor.id] || [factor.name.toLowerCase()];
    const hit = aliases.find((alias) => lower.includes(alias));
    if (hit) {
      methodologySignals.push(`${factor.name}: mentioned via "${hit}"; review evidence before changing score.`);
    }
  }

  const actions = lines
    .filter((line) => /\b(will|send|follow up|follow-up|next step|by \w+day|due|owner|action)\b/i.test(line))
    .slice(0, 8);
  const objections = lines
    .filter((line) => /\b(concern|worried|blocker|risk|too expensive|price|competitor|incumbent|security|legal)\b/i.test(line))
    .slice(0, 8);
  const nextStep =
    lines.find((line) => /\b(next step|next call|follow up|follow-up|meet again|send)\b/i.test(line)) || null;
  const risk = objections[0] || null;

  return {
    methodologySignals: unique(methodologySignals).slice(0, 10),
    actions,
    objections,
    nextStep,
    risk,
  };
}

function renderFollowUpDraft(
  dealName: string,
  extraction: ReturnType<typeof extractCallIntel>,
  voice: { signOff: string; maxParagraphs: number }
): string {
  const signal = extraction.methodologySignals[0]?.split(';')[0];
  const takeaway = signal
    ? `${signal} came up and needs validation`
    : 'we covered the current evaluation and next step';
  const next = extraction.nextStep || 'I can send a concrete next step for review';
  const paragraphs = [
    `Hi - thanks for the time today. My read is that ${sentence(takeaway)}`,
    extraction.actions.length
      ? `I captured the main action item as: ${sentence(extraction.actions[0])}`
      : 'I did not hear a dated action item, so the cleanest move is to lock one down now.',
    `Next step: ${sentence(next)}`,
    `${voice.signOff}`,
  ];
  return paragraphs.slice(0, Math.max(1, voice.maxParagraphs)).join('\n\n');
}

function appendDealMemory(
  root: string,
  dealName: string,
  extraction: ReturnType<typeof extractCallIntel>,
  source?: string
): string {
  const dir = path.join(root, 'memory', 'deals');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `deal_${slug(dealName)}.md`);
  const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : `# Deal Memory: ${dealName}\n\n`;
  const entry = [
    `## ${todayIso()} - Post-call update`,
    `- Source: ${source || 'inline notes'}`,
    `- Methodology signals: ${extraction.methodologySignals.length ? extraction.methodologySignals.join('; ') : 'none explicit'}`,
    `- Action items: ${extraction.actions.length ? extraction.actions.join('; ') : 'none explicit'}`,
    `- Objections: ${extraction.objections.length ? extraction.objections.join('; ') : 'none explicit'}`,
    `- Next step: ${extraction.nextStep || 'not confirmed'}`,
    '',
  ].join('\n');
  fs.writeFileSync(file, `${entry}\n${existing}`, 'utf8');
  return file;
}

function loadNotes(root: string, args: ParsedArgs): { text: string; source?: string } {
  const transcript = stringFlag(args, 'transcript') || stringFlag(args, 'file');
  if (transcript) {
    const file = path.resolve(root, transcript);
    if (fs.existsSync(file)) {
      return { text: safeRead(file), source: rel(root, file) };
    }
    return { text: '', source: transcript };
  }

  const notes = stringFlag(args, 'notes');
  if (!notes) return { text: '' };

  const possibleFile = path.resolve(root, notes);
  if (fs.existsSync(possibleFile)) {
    return { text: safeRead(possibleFile), source: rel(root, possibleFile) };
  }
  return { text: notes };
}

function locateResearchSource(root: string, company: string, args: ParsedArgs): string | null {
  const explicit = stringFlag(args, 'source') || stringFlag(args, 'file');
  if (explicit) {
    const file = path.resolve(root, explicit);
    return fs.existsSync(file) ? file : null;
  }

  const base = path.join(root, 'data', 'research', slug(company));
  for (const ext of ['.md', '.json', '.txt']) {
    const file = `${base}${ext}`;
    if (fs.existsSync(file)) return file;
  }
  return null;
}

function buildResearchDossier(workspace: Workspace, company: string, sourceText: string): {
  score: number;
  verdict: string;
  industry: string | null;
  headcount: string | null;
  revenue: string | null;
  hq: string | null;
  funding: string | null;
  matches: string[];
  risks: string[];
  approach: string;
} {
  const config = getNested(workspace.companyConfig, ['company', 'icp']);
  const segments = arrayStrings(isObject(config) ? config.segments : undefined);
  const verticals = arrayStrings(isObject(config) ? config.verticals : undefined);
  const geo = arrayStrings(isObject(config) ? config.geo : undefined);
  const minAcv = isObject(config) ? asNumber(config.min_acv) : null;
  const maxAcv = isObject(config) ? asNumber(config.max_acv) : null;

  const text = sourceText.toLowerCase();
  let score = 0;
  const matches: string[] = [];
  const risks: string[] = [];

  if (sourceText) {
    score += 10;
    matches.push('Local research source loaded.');
  } else {
    risks.push('No local source file loaded; no external research was performed.');
  }

  if (segments.length && segments.some((segment) => text.includes(segment.toLowerCase()))) {
    score += 20;
    matches.push(`Segment evidence matches config: ${segments.join(', ')}.`);
  } else if (segments.length) {
    risks.push(`No segment evidence for configured ICP: ${segments.join(', ')}.`);
  }

  if (verticals.length && verticals.some((vertical) => text.includes(vertical.toLowerCase()))) {
    score += 20;
    matches.push(`Vertical evidence matches config: ${verticals.join(', ')}.`);
  } else if (verticals.length) {
    risks.push(`No vertical evidence for configured ICP: ${verticals.join(', ')}.`);
  }

  if (geo.length && geo.some((item) => text.includes(item.toLowerCase()))) {
    score += 15;
    matches.push(`Geo evidence matches config: ${geo.join(', ')}.`);
  } else if (geo.length) {
    risks.push(`No geo evidence for configured ICP: ${geo.join(', ')}.`);
  }

  const acvSignal = firstMoney(sourceText);
  if (
    acvSignal !== null &&
    typeof minAcv === 'number' &&
    typeof maxAcv === 'number' &&
    acvSignal >= minAcv &&
    acvSignal <= maxAcv
  ) {
    score += 15;
    matches.push(`ACV signal ${formatMoney(acvSignal)} fits configured range.`);
  } else if (typeof minAcv === 'number' && typeof maxAcv === 'number') {
    risks.push(`No ACV evidence in configured range ${formatMoney(minAcv)}-${formatMoney(maxAcv)}.`);
  }

  if (hasAny(text, ['hiring', 'growth', 'funding', 'expansion', 'new vp', 'new cfo'])) {
    score += 15;
    matches.push('Growth or trigger language found in local source.');
  } else {
    risks.push('No growth trigger found locally.');
  }

  if (hasAny(text, ['salesforce', 'hubspot', 'slack', 'gong', 'api', 'integration'])) {
    score += 5;
    matches.push('Tech stack or integration terms found locally.');
  }

  score = Math.min(score, 100);

  return {
    score,
    verdict: score >= 80 ? 'Strong fit' : score >= 60 ? 'Good fit' : score >= 40 ? 'Marginal' : 'Insufficient evidence',
    industry: fieldFromResearch(sourceText, ['industry', 'vertical']),
    headcount: fieldFromResearch(sourceText, ['headcount', 'employees', 'size']),
    revenue: fieldFromResearch(sourceText, ['revenue']),
    hq: fieldFromResearch(sourceText, ['hq', 'headquarters', 'location']),
    funding: fieldFromResearch(sourceText, ['funding', 'stage']),
    matches: matches.length ? matches : ['No positive ICP matches can be proven from local data.'],
    risks: risks.length ? risks : ['No major local risks detected; verify with sourced research before outreach.'],
    approach:
      score >= 60
        ? `Open on the strongest sourced trigger for ${company}, then ask one pain or metrics question tied to ${getCompanyProduct(workspace.companyConfig)}.`
        : `Do not over-personalize yet. Add sourced notes for ${company}, then re-run research before outreach.`,
  };
}

function fieldFromResearch(text: string, names: string[]): string | null {
  for (const name of names) {
    const pattern = new RegExp(`(?:^|\\n)\\s*(?:[-*]\\s*)?(?:\\*\\*)?${escapeRegExp(name)}(?:\\*\\*)?\\s*:?\\s*(.+)`, 'i');
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim().replace(/\s+$/, '');
  }
  return null;
}

function findWorkspaceRoot(cwd: string, packageRoot: string): string {
  if (process.env.SEGUNDO_ROOT) return path.resolve(process.env.SEGUNDO_ROOT);

  let dir = path.resolve(cwd);
  while (true) {
    if (fs.existsSync(path.join(dir, 'config', 'company.yaml'))) return dir;
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      const pkg = readJsonObject(path.join(dir, 'package.json'));
      if (asString(pkg?.name) === 'segundo-os') return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return path.resolve(cwd);
}

function loadSkills(root: string, packageRoot: string): SkillMeta[] {
  const dirs = [path.join(root, 'skills'), path.join(packageRoot, 'skills')];
  const byName = new Map<string, SkillMeta>();

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const child of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!child.isDirectory()) continue;
      const pluginPath = path.join(dir, child.name, 'plugin.json');
      const raw = readJsonObject(pluginPath);
      if (!raw) continue;
      const name = asString(raw.name) || child.name;
      byName.set(name, {
        name,
        version: asString(raw.version) || '0.0.0',
        description: asString(raw.description) || 'No description',
        requires: arrayStrings(raw.requires),
        triggers: arrayStrings(raw.triggers),
        skillPath: path.join(dir, child.name, 'SKILL.md'),
      });
    }
  }

  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function findSkill(workspace: Workspace, name: string): SkillMeta | null {
  return workspace.skills.find((skill) => skill.name === name) || null;
}

function loadMethodology(file: string | null): Methodology | null {
  if (!file) return null;
  const raw = readJsonObject(file);
  if (!raw) return null;
  const factorsRaw = Array.isArray(raw.factors) ? raw.factors : [];
  return {
    id: asString(raw.id) || stripExt(path.basename(path.dirname(file))),
    name: asString(raw.name) || 'Methodology',
    version: asString(raw.version) || '0.0.0',
    description: asString(raw.description) || '',
    factors: factorsRaw.filter(isObject).map((factor) => ({
      id: asString(factor.id) || slug(asString(factor.name) || 'factor'),
      name: asString(factor.name) || 'Factor',
      description: asString(factor.description) || '',
      weight: asNumber(factor.weight) || 1,
      levels: isObject(factor.levels) ? Object.fromEntries(Object.entries(factor.levels).map(([key, value]) => [key, String(value)])) : undefined,
    })),
    scoring: isObject(raw.scoring) ? normalizeScoring(raw.scoring) : {},
  };
}

function normalizeScoring(raw: JsonObject): Methodology['scoring'] {
  const pointsRaw = isObject(raw.points) ? raw.points : undefined;
  const thresholdsRaw = isObject(raw.thresholds) ? raw.thresholds : undefined;
  const thresholds: Record<string, { min: number; label: string }> = {};

  if (thresholdsRaw) {
    for (const [key, value] of Object.entries(thresholdsRaw)) {
      if (!isObject(value)) continue;
      thresholds[key] = {
        min: asNumber(value.min) || 0,
        label: asString(value.label) || titleCase(key.replace(/_/g, ' ')),
      };
    }
  }

  return {
    points: pointsRaw
      ? Object.fromEntries(Object.entries(pointsRaw).map(([key, value]) => [key, asNumber(value) || 0]))
      : undefined,
    max_score: asNumber(raw.max_score),
    thresholds,
  };
}

function loadGapMoves(file: string | null): GapMoveBook | null {
  if (!file) return null;
  const raw = readJsonObject(file);
  if (!raw || !isObject(raw.moves)) return null;
  return { moves: raw.moves as GapMoveBook['moves'] };
}

function parseArgs(args: string[]): ParsedArgs {
  const flags: Record<string, string | boolean> = {};
  const positionals: string[] = [];

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (token.startsWith('--')) {
      const withoutPrefix = token.slice(2);
      const eq = withoutPrefix.indexOf('=');
      if (eq >= 0) {
        flags[withoutPrefix.slice(0, eq)] = withoutPrefix.slice(eq + 1);
        continue;
      }
      const next = args[i + 1];
      if (next && !next.startsWith('-')) {
        flags[withoutPrefix] = next;
        i += 1;
      } else {
        flags[withoutPrefix] = true;
      }
    } else if (token.startsWith('-') && token.length > 1) {
      flags[token.slice(1)] = true;
    } else {
      positionals.push(token);
    }
  }

  return { flags, positionals };
}

function normalizeCommand(command?: string): string | undefined {
  if (!command) return undefined;
  if (command === '--help' || command === '-h') return 'help';
  if (command === '--version' || command === '-v') return 'version';
  return command;
}

function renderHelp(packageRoot: string): string {
  const pkg = readJsonObject(path.join(packageRoot, 'package.json'));
  const version = asString(pkg?.version);
  return [
    '',
    `segundo${version ? ` v${version}` : ''} - local-first sales OS`,
    '',
    'Usage:',
    '  npx segundo <command> [options]',
    '',
    'Commands:',
    ...Object.entries(COMMANDS)
      .filter(([command]) => command !== 'help')
      .map(([command, description]) => `  ${command.padEnd(12)} ${description}`),
    '',
    'Examples:',
    '  npx segundo init',
    '  npx segundo brief',
    '  npx segundo inspect --deal "Acme Corp"',
    '  npx segundo prep --deal "Acme Corp" --call-type Discovery',
    '  npx segundo post-call --deal "Acme Corp" --transcript data/transcripts/acme.txt',
    '  npx segundo research --company "Acme Corp"',
    '',
    'No external API calls are made by these commands.',
  ].join('\n');
}

function renderVersion(packageRoot: string): string {
  const pkg = readJsonObject(path.join(packageRoot, 'package.json'));
  return `segundo v${asString(pkg?.version) || '0.0.0'}`;
}

function ok(output: string): CliResult {
  return { code: 0, output: output.trimEnd() + '\n' };
}

function fail(output: string): CliResult {
  return { code: 1, output: output.trimEnd() + '\n' };
}

function sourceLine(workspace: Workspace, skill: SkillMeta | null, sources: string[]): string {
  const parts = [
    `Company: ${getCompanyName(workspace.companyConfig)}`,
    `Methodology: ${workspace.methodology?.name || getFramework(workspace.companyConfig)}`,
    skill ? `Skill: ${skill.name}@${skill.version}` : 'Skill: not found',
  ];
  const cleanSources = sources.filter(Boolean).slice(0, 4);
  if (cleanSources.length) parts.push(`Sources: ${cleanSources.join(', ')}`);
  return parts.join(' | ');
}

function methodologyPath(workspace: Workspace): string {
  return `methodologies/${workspace.methodology?.id || getFramework(workspace.companyConfig)}/methodology.json`;
}

function getFramework(config: JsonObject | null): string {
  return asString(getNested(config, ['methodology', 'framework'])) || 'meddpicc';
}

function getCompanyName(config: JsonObject | null): string {
  return asString(getNested(config, ['company', 'name'])) || 'Unknown Company';
}

function getCompanyProduct(config: JsonObject | null): string {
  return asString(getNested(config, ['company', 'product'])) || 'your product';
}

function getUserName(config: JsonObject | null): string {
  return asString(getNested(config, ['user', 'name'])) || 'Your Name';
}

function getVoice(config: JsonObject | null): { signOff: string; maxParagraphs: number } {
  return {
    signOff: asString(getNested(config, ['email', 'sign_off'])) || 'Best,',
    maxParagraphs: asNumber(getNested(config, ['email', 'max_paragraphs'])) || 4,
  };
}

function listCompetitors(config: JsonObject | null): string[] {
  const competitors = getNested(config, ['competitors']);
  if (!Array.isArray(competitors)) return [];
  return competitors.filter(isObject).map((item) => asString(item.name)).filter((item): item is string => Boolean(item));
}

function getNested(root: unknown, keys: string[]): unknown {
  let current = root;
  for (const key of keys) {
    if (!isObject(current)) return undefined;
    current = current[key];
  }
  return current;
}

function readYamlObject(file: string | null): JsonObject | null {
  if (!file || !fs.existsSync(file)) return null;
  try {
    const parsed = parseYaml(fs.readFileSync(file, 'utf8'));
    return isObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function readJsonObject(file: string | null): JsonObject | null {
  const raw = readJsonAny(file);
  return isObject(raw) ? raw : null;
}

function readJsonAny(file: string | null): unknown {
  if (!file || !fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function listFiles(dir: string, extension?: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && (!extension || entry.name.endsWith(extension)))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

function firstExisting(paths: string[]): string | null {
  return paths.find((item) => fs.existsSync(item)) || null;
}

function safeRead(file: string): string {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

function stringFlag(args: ParsedArgs, name: string): string | null {
  const value = args.flags[name];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function parseStructuredScores(raw: JsonObject): Record<string, { score: ScoreColor; evidence: string }> {
  const scoresRaw = raw.scores || raw.methodologyScores || raw.methodology_scores;
  const scores: Record<string, { score: ScoreColor; evidence: string }> = {};

  if (isObject(scoresRaw)) {
    for (const [key, value] of Object.entries(scoresRaw)) {
      if (typeof value === 'string') {
        const score = normalizeScore(value);
        if (score) scores[normalizeName(key)] = { score, evidence: value };
      } else if (isObject(value)) {
        const score = normalizeScore(asString(value.score) || asString(value.status) || '');
        if (score) scores[normalizeName(key)] = { score, evidence: asString(value.evidence) || asString(value.rationale) || '' };
      }
    }
  }

  if (Array.isArray(scoresRaw)) {
    for (const item of scoresRaw.filter(isObject)) {
      const factor = asString(item.factor) || asString(item.name);
      const score = normalizeScore(asString(item.score) || '');
      if (factor && score) {
        scores[normalizeName(factor)] = {
          score,
          evidence: asString(item.evidence) || asString(item.rationale) || '',
        };
      }
    }
  }

  return scores;
}

function parseMarkdownScores(text: string): Record<string, { score: ScoreColor; evidence: string }> {
  const scores: Record<string, { score: ScoreColor; evidence: string }> = {};
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const table = line.match(/^\|\s*([^|]+?)\s*\|\s*(red|yellow|green)\b([^|]*)\|?/i);
    if (table) {
      scores[normalizeName(table[1])] = {
        score: normalizeScore(table[2]) || 'red',
        evidence: table[3]?.trim().replace(/^\|\s*/, '') || 'Loaded from score table.',
      };
      continue;
    }

    const bullet = line.match(/^\s*[-*]\s*\**([^:*]+?)\**\s*:\s*(red|yellow|green)\b(.*)$/i);
    if (bullet) {
      scores[normalizeName(bullet[1])] = {
        score: normalizeScore(bullet[2]) || 'red',
        evidence: bullet[3]?.replace(/[()]/g, '').trim() || 'Loaded from score bullet.',
      };
    }
  }

  return scores;
}

function findParsedScore(deal: DealRecord, factor: MethodologyFactor): { score: ScoreColor; evidence: string } | null {
  const candidates = [
    normalizeName(factor.id),
    normalizeName(factor.name),
    ...(FACTOR_ALIASES[factor.id] || []).map(normalizeName),
  ];

  for (const candidate of candidates) {
    if (deal.parsedScores[candidate]) return deal.parsedScores[candidate];
  }

  return null;
}

function parseMarkdownFields(text: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const map: Record<string, string> = {
    company: 'company',
    name: 'name',
    stage: 'stage',
    acv: 'acv',
    amount: 'amount',
    'close date': 'closeDate',
    'close date target': 'closeDate',
  };

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*[-*]?\s*\**([^:*]+?)\**\s*:\s*(.+)$/);
    if (!match) continue;
    const key = normalizeName(match[1]).replace(/_/g, ' ');
    const mapped = map[key];
    if (mapped) fields[mapped] = match[2].trim();
  }

  return fields;
}

function findInlineRole(text: string, role: string): string | undefined {
  const pattern = new RegExp(`${escapeRegExp(role)}\\**\\s*:?\\s*([^\\n|]+)`, 'i');
  const match = text.match(pattern);
  return match?.[1]?.replace(/^[-:* ]+/, '').trim();
}

function extractListAfterHeading(text: string, heading: string): string[] {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => line.toLowerCase().includes(heading.toLowerCase()));
  if (start < 0) return [];
  const items: string[] = [];
  for (const line of lines.slice(start + 1, start + 12)) {
    if (/^#{1,6}\s/.test(line)) break;
    const item = line.match(/^\s*[-*]\s+(.+)/);
    if (item) items.push(item[1].trim());
  }
  return items;
}

function latestDateInText(text: string): string | undefined {
  const dates = [...text.matchAll(/\b(20\d{2}-\d{2}-\d{2})\b/g)].map((match) => match[1]);
  return latestDate(dates);
}

function latestDate(dates: Array<string | undefined>): string | undefined {
  const clean = dates.filter((date): date is string => Boolean(date)).sort();
  return clean[clean.length - 1];
}

function staleDaysForDeal(deal: DealRecord): number | null {
  if (deal.updatedAt) {
    return daysBetween(parseDate(deal.updatedAt), new Date(todayIso()));
  }

  const mtimes = deal.sourceFiles
    .map((file) => {
      try {
        return fs.statSync(file).mtime;
      } catch {
        return null;
      }
    })
    .filter((item): item is Date => item !== null);

  if (!mtimes.length) return null;
  const latest = new Date(Math.max(...mtimes.map((date) => date.getTime())));
  return daysBetween(latest, new Date(todayIso()));
}

function daysBetween(start: Date | null, end: Date): number | null {
  if (!start || Number.isNaN(start.getTime())) return null;
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / 86_400_000);
}

function parseDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function firstDate(value: string): string | undefined {
  return value.match(/\b(20\d{2}-\d{2}-\d{2})\b/)?.[1];
}

function firstTime(value: string): string | undefined {
  return value.match(/\b(\d{1,2}:\d{2})(?::\d{2})?\b/)?.[1];
}

function formatStale(days: number | null): string {
  if (days === null) return 'unknown';
  if (days <= 0) return 'today';
  return `${days} days ago`;
}

function topRisk(scored: ScoredDeal[]): string {
  const top = [...scored].sort((a, b) => urgencyValue(b) - urgencyValue(a))[0];
  return top ? `${top.deal.name} (${weakestFactor(top).factor.name})` : 'none';
}

function normalizeScore(value: string): ScoreColor | null {
  const lower = value.toLowerCase();
  if (lower.includes('green')) return 'green';
  if (lower.includes('yellow')) return 'yellow';
  if (lower.includes('red')) return 'red';
  return null;
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function slug(value: string): string {
  return normalizeName(value).replace(/_/g, '_') || 'item';
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function stripExt(value: string): string {
  return value.replace(/\.[^.]+$/, '');
}

function parseMoney(value?: string): number {
  if (!value) return 0;
  const match = value.replace(/,/g, '').match(/\$?\s*(\d+(?:\.\d+)?)([kKmM])?/);
  if (!match) return 0;
  const amount = Number(match[1]);
  const suffix = match[2]?.toLowerCase();
  if (suffix === 'm') return amount * 1_000_000;
  if (suffix === 'k') return amount * 1_000;
  return amount;
}

function firstMoney(value: string): number | null {
  const amount = parseMoney(value);
  return amount > 0 ? amount : null;
}

function formatMoney(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '$0';
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextBusinessDay(): string {
  const date = new Date(todayIso());
  do {
    date.setDate(date.getDate() + 1);
  } while (date.getDay() === 0 || date.getDay() === 6);
  return date.toISOString().slice(0, 10);
}

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function sentence(text: string): string {
  const clean = text.trim().replace(/[.?!]+$/g, '');
  return `${clean}.`;
}

function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function hasAny(text: string, needles: string[]): boolean {
  return needles.some((needle) => text.includes(needle.toLowerCase()));
}

function arrayStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[$,]/g, ''));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function rel(root: string, file: string): string {
  return path.relative(root, file) || '.';
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
