export const meta = {
  name: 'guild-mission-control',
  description: 'Run one guild mission milestone: workers, cross-model validators, one scoped fix attempt, escalation and a state report',
  whenToUse: 'Invoked by the guild-mission skill after the mission contract is approved',
  phases: [
    { title: 'Work', detail: 'one worker per ready feature, fresh context, role file by path' },
    { title: 'Validate', detail: 'validators on a different model, contract assertions only' },
    { title: 'Fix', detail: 'one fix attempt scoped to blocking findings, then a scoped re-check' },
    { title: 'Report', detail: 'vault-keeper writes features.json, backlog.md and the mission log', model: 'haiku' },
  ],
}

/*
 * args: {
 *   missionDir: string,             absolute path of missions/<nn>-<slug>
 *   guildDir: string,               absolute path of the installed guild (crew/, schemas/)
 *   milestone?: string,             run only features of this milestone
 *   features: Feature[],            features.json "features", passed in by the Director
 *   models: { [role]: string },     crew role -> model, read from the role files' frontmatter
 *   budget?: { maxAgentRuns, maxAttemptsPerFeature, stopAfterEscalations },
 * }
 * Workflows cannot touch the filesystem, so the Director reads features.json and the role
 * frontmatter, and the Report phase hands the new state to vault-keeper to write back.
 */
const A = args || {}
if (!A.missionDir || !A.guildDir || !Array.isArray(A.features)) {
  throw new Error('args.missionDir, args.guildDir and args.features are required')
}
const B = Object.assign({ maxAgentRuns: 30, maxAttemptsPerFeature: 2, stopAfterEscalations: 2 }, A.budget || {})
const MODELS = A.models || {}
const M = A.missionDir
const roleFile = (role) => `${A.guildDir}/crew/${role}.md`

/* R4: a mission-wide cap on agent runs. */
let runs = 0
const take = () => {
  if (runs >= B.maxAgentRuns) return false
  runs++
  return true
}

/* R10: a validator never shares the worker's model. */
const OTHER = { fable: 'opus', opus: 'fable', sonnet: 'opus', haiku: 'sonnet' }
const workerModel = (f) => f.model || MODELS[f.agent]
const validatorModel = (v, wm) => {
  const vm = MODELS[v]
  if (!vm || !wm) return vm
  return vm === wm ? OTHER[vm] || 'opus' : vm
}

const HANDOFF = {
  type: 'object',
  properties: {
    featureId: { type: 'string' },
    attempt: { type: 'integer' },
    output: { type: 'string' },
    assertionsAddressed: { type: 'array', items: { type: 'string' } },
    newValue: { type: 'array', items: { type: 'string' } },
    openQuestions: { type: 'array', items: { type: 'string' } },
    outOfScopeIdeas: { type: 'array', items: { type: 'string' } },
  },
  required: ['featureId', 'attempt', 'output', 'assertionsAddressed', 'newValue'],
}
const VERDICT = {
  type: 'object',
  properties: {
    featureId: { type: 'string' },
    attempt: { type: 'integer' },
    validator: { type: 'string' },
    status: { type: 'string', enum: ['pass', 'fail'] },
    assertions: {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: { type: 'string' }, pass: { type: 'boolean' }, evidence: { type: 'string' } },
        required: ['id', 'pass', 'evidence'],
      },
    },
    blocking: {
      type: 'array',
      items: {
        type: 'object',
        properties: { assertion: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' } },
        required: ['assertion', 'problem', 'fix'],
      },
    },
    nonBlocking: { type: 'array', items: { type: 'string' } },
  },
  required: ['featureId', 'attempt', 'validator', 'status', 'assertions', 'blocking', 'nonBlocking'],
}

const workerPrompt = (f, attempt, blocking) => `You are the guild crew member "${f.agent}".
Read your role file ${roleFile(f.agent)} first and follow it exactly.
Mission folder: ${M}. Read mission.md and contract.md there before anything else.
Your feature: ${JSON.stringify(f)}
Read every path in "inputs". Write your artifact to "output" (relative paths are relative to the project root that holds the missions folder, unless they start with the mission folder).
This is attempt ${attempt} of ${B.maxAttemptsPerFeature}.
${blocking
    ? `This is a FIX attempt. Fix only these blocking findings and change nothing else: ${JSON.stringify(blocking)}`
    : 'Address every assertion listed in your feature.'}
Do not spawn agents. Do not edit files outside your output and your handoff.
Write your handoff to ${M}/handoffs/${f.id}-a${attempt}.json (schema: ${A.guildDir}/schemas/handoff.schema.json) and return the same object.
"newValue" must list what this attempt added that was not already in your inputs; an empty list rejects the attempt.`

const validatorPrompt = (f, v, attempt, handoff, scope, recheck) => `You are the guild crew member "${v}", acting as a validator.
Read your role file ${roleFile(v)} first and follow it.
Mission folder: ${M}. Read contract.md there.
Validate feature ${f.id} ("${f.title}"), whose artifact is ${handoff.output || f.output}.
Judge it against ONLY these contract assertions: ${scope.join(', ')}.
A blocking finding must cite one of those ids and say exactly what to change. Taste, extra ideas and anything outside those assertions go in "nonBlocking".
${recheck
    ? 'This is a re-check after a fix. Check only the listed assertions and any regression the fix caused; do not run a fresh full review.'
    : ''}
Worker handoff: ${JSON.stringify(handoff)}
Do not edit the artifact. Write your verdict to ${M}/verdicts/${f.id}-a${attempt}-${v}.json (schema: ${A.guildDir}/schemas/verdict.schema.json) and return it.`

const runWorker = async (f, attempt, blocking) => {
  if (!take()) return { budgetHit: true }
  const h = await agent(workerPrompt(f, attempt, blocking), {
    label: `${f.id}:${f.agent}${attempt > 1 ? ':fix' : ''}`,
    phase: attempt > 1 ? 'Fix' : 'Work',
    schema: HANDOFF,
    model: workerModel(f),
  })
  return { handoff: h }
}

/* A feature may map each validator to the assertions it checks (the contract's "Checked by" column); default is all. */
const scopeFor = (f, v, scope) => {
  const own = f.validatorScope && f.validatorScope[v]
  return own ? scope.filter((a) => own.includes(a)) : scope
}

const runValidators = async (f, attempt, handoff, scope, recheck) => {
  const wm = workerModel(f)
  const active = (f.validators || []).filter((v) => scopeFor(f, v, scope).length)
  const vs = await parallel(active.map((v) => () => {
    if (!take()) return Promise.resolve(null)
    return agent(validatorPrompt(f, v, attempt, handoff, scopeFor(f, v, scope), recheck), {
      label: `${f.id}:${v}${recheck ? ':recheck' : ''}`,
      phase: recheck ? 'Fix' : 'Validate',
      schema: VERDICT,
      model: validatorModel(v, wm),
    })
  }))
  const ok = vs.filter(Boolean)
  /* R2: only blocking findings that cite an assertion in scope count. */
  const blocking = ok.flatMap((v) => (v.blocking || []).filter((b) => scopeFor(f, v.validator, scope).includes(b.assertion)))
  const nonBlocking = ok.flatMap((v) => (v.nonBlocking || []).map((n) => `[${v.validator}] ${n}`))
  const failed = [...new Set(blocking.map((b) => b.assertion))]
  return { verdicts: ok.length, blocking, nonBlocking, failed }
}

const runFeature = async (f) => {
  const scope = f.assertions || []
  const result = { id: f.id, title: f.title, agent: f.agent, attempts: 0, state: 'pending', failedAssertions: [], nonBlocking: [], newValue: [], outOfScopeIdeas: [], openQuestions: [] }

  let w = await runWorker(f, 1)
  if (w.budgetHit) return Object.assign(result, { state: 'pending', note: 'budget spent before start' })
  result.attempts = 1
  let h = w.handoff
  let check
  /* R11: an attempt that declares no new value is rejected without validation. */
  if (!h || !(h.newValue || []).length) {
    check = { blocking: [{ assertion: scope[0] || 'value', problem: 'The attempt declared no new value.', fix: 'Produce the artifact and list what it adds.' }], nonBlocking: [], failed: [scope[0] || 'value'] }
  } else {
    check = await runValidators(f, 1, h, scope, false)
  }
  result.nonBlocking.push(...check.nonBlocking)
  if (h) {
    result.newValue.push(...(h.newValue || []))
    result.outOfScopeIdeas.push(...(h.outOfScopeIdeas || []))
    result.openQuestions.push(...(h.openQuestions || []))
  }
  if (!check.failed.length) return Object.assign(result, { state: 'passed' })

  /* R4: one fix attempt, scoped to the blocking findings (R6 on the re-check). */
  if (B.maxAttemptsPerFeature < 2) return Object.assign(result, { state: 'escalated', failedAssertions: check.failed, blocking: check.blocking })
  w = await runWorker(f, 2, check.blocking)
  if (w.budgetHit) return Object.assign(result, { state: 'failed', failedAssertions: check.failed, blocking: check.blocking, note: 'budget spent before fix' })
  result.attempts = 2
  h = w.handoff || h
  if (h) result.newValue.push(...(w.handoff ? w.handoff.newValue || [] : []))
  const re = await runValidators(f, 2, h, check.failed, true)
  result.nonBlocking.push(...re.nonBlocking)
  if (!re.failed.length) return Object.assign(result, { state: 'passed' })

  /* R5: the fix must shrink the failing set; either way there is no third attempt. */
  const progressed = re.failed.length < check.failed.length
  return Object.assign(result, {
    state: 'escalated',
    failedAssertions: re.failed,
    blocking: re.blocking,
    note: progressed ? 'fix helped but did not finish' : 'fix made no progress',
  })
}

/* Run features in dependency waves; a feature waits until everything it depends on passed. */
const all = A.features.filter((f) => !A.milestone || f.milestone === A.milestone)
const done = new Map()
A.features.filter((f) => f.state === 'passed').forEach((f) => done.set(f.id, { id: f.id, state: 'passed', attempts: f.attempts || 0, carried: true }))
let pending = all.filter((f) => f.state !== 'passed')
let escalations = 0
let wave = 0

while (pending.length) {
  const ready = pending.filter((f) => (f.dependsOn || []).every((d) => done.get(d) && done.get(d).state === 'passed'))
  if (!ready.length) {
    pending.forEach((f) => done.set(f.id, { id: f.id, title: f.title, state: 'blocked', note: `waiting on ${(f.dependsOn || []).join(', ')}` }))
    log(`${pending.length} feature(s) blocked by unmet dependencies`)
    break
  }
  /* R12: stop starting new work once the escalation limit is reached. */
  if (escalations >= B.stopAfterEscalations) {
    pending.forEach((f) => done.set(f.id, { id: f.id, title: f.title, state: 'pending', note: 'mission stopped after escalations' }))
    log(`stopping: ${escalations} escalations`)
    break
  }
  wave++
  phase('Work')
  log(`wave ${wave}: ${ready.map((f) => f.id).join(', ')}`)
  const results = await pipeline(ready, (f) => runFeature(f))
  results.forEach((r, i) => {
    const r2 = r || { id: ready[i].id, title: ready[i].title, state: 'failed', note: 'agent error' }
    done.set(r2.id, r2)
    if (r2.state === 'escalated' || r2.state === 'failed') escalations++
  })
  pending = pending.filter((f) => !done.has(f.id))
}

const report = all.map((f) => done.get(f.id) || { id: f.id, state: 'pending' })

phase('Report')
await agent(`You are the guild crew member "vault-keeper". Read your role file ${roleFile('vault-keeper')}.
Mission folder: ${M}.
Apply this Mission Control report to the mission files, changing nothing else:
1. In features.json set each feature's "state", "attempts" and "failedAssertions" from the report.
2. Append every "nonBlocking" and "outOfScopeIdeas" entry to backlog.md under a heading for this run, deduplicated against what is already there.
3. Append a short entry to log.md (create it): wave count ${wave}, agent runs ${runs} of ${B.maxAgentRuns}, and one line per feature with its state and note.
Report: ${JSON.stringify(report)}`, { label: 'vault-keeper', phase: 'Report', model: MODELS['vault-keeper'] || 'haiku' })

const count = (s) => report.filter((r) => r.state === s).length
return {
  milestone: A.milestone || 'all',
  runs,
  passed: count('passed'),
  escalated: count('escalated'),
  failed: count('failed'),
  blocked: count('blocked'),
  pending: count('pending'),
  features: report.map((r) => ({ id: r.id, state: r.state, attempts: r.attempts, failedAssertions: r.failedAssertions, note: r.note, openQuestions: r.openQuestions })),
}
