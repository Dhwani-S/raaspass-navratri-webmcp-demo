import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import puppeteer from 'puppeteer-core';

const baseUrl = process.env.BENCHMARK_URL || 'http://localhost:5173/';
const runs = Number(process.env.BENCHMARK_RUNS || process.argv[2] || 5);
const chromeChannel = process.env.BENCHMARK_CHROME_CHANNEL || 'chrome';
const outputDir = path.resolve('benchmark-results');

if (!Number.isInteger(runs) || runs < 1) {
  throw new Error('BENCHMARK_RUNS must be a positive integer.');
}

const response = await fetch(baseUrl).catch(() => null);
if (!response?.ok) {
  throw new Error(`RaasPass is not available at ${baseUrl}. Start it with npm run dev first.`);
}

const browser = await puppeteer.launch({
  browser: 'chrome',
  channel: chromeChannel,
  headless: true,
  args: ['--enable-features=WebMCP', '--no-sandbox', '--disable-setuid-sandbox']
});

const results = [];
try {
  console.log('Warming up both modes (not included in measurements)...');
  for (const mode of ['webmcp', 'dom']) {
    const page = await browser.newPage();
    page.setDefaultTimeout(10_000);
    const warmup = mode === 'webmcp' ? await runWebMCP(page, 0) : await runDOM(page, 0);
    await page.close();
    if (!warmup.success) throw new Error(`${mode} warmup failed: ${warmup.error}`);
  }

  for (let index = 0; index < runs; index += 1) {
    const order = index % 2 === 0 ? ['webmcp', 'dom'] : ['dom', 'webmcp'];
    for (const mode of order) {
      const page = await browser.newPage();
      page.setDefaultTimeout(10_000);
      const result = mode === 'webmcp'
        ? await runWebMCP(page, index + 1)
        : await runDOM(page, index + 1);
      results.push(result);
      await page.close();
      console.log(`${result.success ? 'PASS' : 'FAIL'} ${mode.padEnd(7)} run ${index + 1}: ${result.totalMs} ms, ${result.actionCount} actions`);
    }
  }
} finally {
  await browser.close();
}

const report = createReport(results);
await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, 'latest.json'), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(outputDir, 'latest.html'), renderHTML(report));

console.log(`\nBenchmark complete: ${path.join(outputDir, 'latest.html')}`);
console.table(report.summary.map(row => ({
  mode: row.label,
  success: `${row.successRate}%`,
  medianMs: row.medianMs,
  p95Ms: row.p95Ms,
  avgActions: row.averageActions
})));

async function runWebMCP(page, run) {
  const started = performance.now();
  const steps = [];
  let success = false;
  let error;

  try {
    await page.goto(withMode('on'), { waitUntil: 'networkidle0' });
    await recordStep(steps, 'Search Ahmedabad', 1, async () => {
      await executeTool(page, 'search_location', {
        query: 'Ahmedabad',
        checkin_date: '2026-10-10',
        adults: 2
      });
      await page.waitForSelector('[data-testid="venue-gmdc-ground"]');
    });
    await recordStep(steps, 'Open GMDC Ground', 1, async () => {
      await executeTool(page, 'view_hotel', { hotel_name_or_id: 'gmdc-ground' });
      await page.waitForSelector('[data-testid="continue-checkout"]');
    });
    await recordStep(steps, 'Verify dining', 1, async () => {
      await executeTool(page, 'lookup_amenity', { hotel_id: 'gmdc-ground', amenity: 'dining' });
      await page.waitForFunction(() => window.location.hash.includes('amenity=dining'));
    });
    await recordStep(steps, 'Start checkout', 1, async () => {
      await executeTool(page, 'start_booking', {});
      await page.waitForSelector('[data-testid="booking-form"]');
    });
    await recordStep(steps, 'Complete booking', 1, async () => {
      await executeTool(page, 'complete_booking', {
        firstName: 'Dhwani',
        lastName: 'Suthar',
        email: 'dhwani.suthar@gmail.com'
      });
      await page.waitForSelector('[data-testid="booking-success"]');
    });
    success = true;
  } catch (caught) {
    error = caught instanceof Error ? caught.message : String(caught);
  }

  return finishRun('webmcp', run, started, steps, success, error);
}

async function runDOM(page, run) {
  const started = performance.now();
  const steps = [];
  let success = false;
  let error;

  try {
    await page.goto(withMode('off'), { waitUntil: 'networkidle0' });
    const exposedTools = page.webmcp.tools() || [];
    if (exposedTools.length !== 0) {
      throw new Error(`DOM baseline unexpectedly exposed ${exposedTools.length} WebMCP tools.`);
    }

    await recordStep(steps, 'Search Ahmedabad', 5, async () => {
      await fill(page, '[data-testid="location-input"]', 'Ahmedabad');
      await fill(page, '[data-testid="festival-date"]', '2026-10-10');
      await page.click('[data-testid="dancers-toggle"]');
      await page.click('[data-testid="adult-increment"]');
      await page.click('[data-testid="find-passes"]');
      await page.waitForSelector('[data-testid="venue-gmdc-ground"]');
    });
    await recordStep(steps, 'Open GMDC Ground', 1, async () => {
      await page.click('[data-testid="venue-gmdc-ground"] button');
      await page.waitForSelector('[data-testid="continue-checkout"]');
    });
    await recordStep(steps, 'Verify dining', 1, async () => {
      const hasDining = await page.evaluate(() => document.body.textContent?.includes('Gujarati Food Village'));
      if (!hasDining) throw new Error('Dining perk was not visible on the venue page.');
    });
    await recordStep(steps, 'Start checkout', 1, async () => {
      await page.click('[data-testid="continue-checkout"]');
      await page.waitForSelector('[data-testid="booking-form"]');
    });
    await recordStep(steps, 'Complete booking', 4, async () => {
      await fill(page, 'input[name="firstName"]', 'Dhwani');
      await fill(page, 'input[name="lastName"]', 'Suthar');
      await fill(page, 'input[name="email"]', 'dhwani.suthar@gmail.com');
      await page.click('button[type="submit"]');
      await page.waitForSelector('[data-testid="booking-success"]');
    });
    success = true;
  } catch (caught) {
    error = caught instanceof Error ? caught.message : String(caught);
  }

  return finishRun('dom', run, started, steps, success, error);
}

function withMode(mode) {
  const url = new URL(baseUrl);
  url.searchParams.set('webmcp', mode);
  url.hash = '/';
  return url.toString();
}

async function executeTool(page, name, args) {
  const tool = await waitForTool(page, name);
  const result = await tool.execute(args);
  if (result.status !== 'Completed') {
    throw new Error(`${name} returned ${result.status}: ${result.errorText || 'unknown error'}`);
  }
  return result.output;
}

async function waitForTool(page, name) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const tool = (page.webmcp.tools() || []).find(candidate => candidate.name === name);
    if (tool) return tool;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out waiting for WebMCP tool "${name}".`);
}

async function fill(page, selector, value) {
  await page.$eval(selector, (element, nextValue) => {
    const input = element;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setter?.call(input, nextValue);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function recordStep(steps, name, actions, operation) {
  const started = performance.now();
  await operation();
  steps.push({ name, actions, durationMs: Math.round(performance.now() - started) });
}

function finishRun(mode, run, started, steps, success, error) {
  return {
    mode,
    run,
    success,
    error,
    totalMs: Math.round(performance.now() - started),
    actionCount: steps.reduce((total, step) => total + step.actions, 0),
    steps
  };
}

function createReport(rawRuns) {
  const summary = ['webmcp', 'dom'].map(mode => {
    const modeRuns = rawRuns.filter(run => run.mode === mode);
    const successful = modeRuns.filter(run => run.success);
    const durations = successful.map(run => run.totalMs).sort((a, b) => a - b);
    const actions = successful.map(run => run.actionCount);
    return {
      mode,
      label: mode === 'webmcp' ? 'WebMCP tools' : 'DOM automation',
      runs: modeRuns.length,
      successfulRuns: successful.length,
      successRate: round(successful.length / modeRuns.length * 100),
      averageMs: round(mean(durations)),
      medianMs: percentile(durations, 50),
      p95Ms: percentile(durations, 95),
      minMs: durations[0] ?? null,
      maxMs: durations.at(-1) ?? null,
      averageActions: round(mean(actions))
    };
  });
  const webmcp = summary.find(row => row.mode === 'webmcp');
  const dom = summary.find(row => row.mode === 'dom');
  const comparison = {
    actionReductionPercent: round((dom.averageActions - webmcp.averageActions) / dom.averageActions * 100),
    medianTimeReductionPercent: round((dom.medianMs - webmcp.medianMs) / dom.medianMs * 100),
    medianTimeDifferenceMs: dom.medianMs - webmcp.medianMs
  };

  return {
    generatedAt: new Date().toISOString(),
    task: 'Find Ahmedabad passes for two adults on 2026-10-10, open GMDC Ground, verify dining, and book for Dhwani Suthar.',
    disclaimer: 'This deterministic benchmark compares structured WebMCP invocation with direct DOM automation. It does not measure LLM vision, reasoning quality, or model token usage.',
    baseUrl,
    requestedRunsPerMode: runs,
    warmupRunsPerMode: 1,
    comparison,
    summary,
    runs: rawRuns
  };
}

function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function percentile(sorted, percentileValue) {
  if (!sorted.length) return null;
  const index = Math.min(sorted.length - 1, Math.ceil(percentileValue / 100 * sorted.length) - 1);
  return sorted[index];
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function renderHTML(report) {
  const summaryRows = report.summary.map(row => `
    <tr>
      <td>${escapeHTML(row.label)}</td>
      <td>${row.successfulRuns}/${row.runs} (${row.successRate}%)</td>
      <td>${row.medianMs ?? 'n/a'} ms</td>
      <td>${row.p95Ms ?? 'n/a'} ms</td>
      <td>${row.averageActions}</td>
    </tr>`).join('');
  const runRows = report.runs.map(run => `
    <tr>
      <td>${escapeHTML(run.mode)}</td>
      <td>${run.run}</td>
      <td class="${run.success ? 'pass' : 'fail'}">${run.success ? 'PASS' : 'FAIL'}</td>
      <td>${run.totalMs} ms</td>
      <td>${run.actionCount}</td>
      <td>${escapeHTML(run.error || '')}</td>
    </tr>`).join('');
  const medianDirection = report.comparison.medianTimeDifferenceMs >= 0 ? 'faster' : 'slower';

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>RaasPass WebMCP Benchmark</title>
<style>
body{font-family:Segoe UI,sans-serif;margin:0;background:#fffaf2;color:#251036}main{max-width:1080px;margin:auto;padding:48px 24px}h1{font-size:42px;margin-bottom:8px}p{line-height:1.6}.notice{border-left:5px solid #c35727;background:#fff3e3;padding:16px 20px;margin:24px 0}.highlights{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:28px 0}.highlight{background:#251036;color:white;padding:22px}.highlight strong{display:block;color:#ffd28a;font-size:30px;margin-bottom:5px}table{width:100%;border-collapse:collapse;margin:24px 0;background:white}th,td{text-align:left;padding:14px;border-bottom:1px solid #ead7ca}th{background:#251036;color:white}.pass{color:#167747;font-weight:700}.fail{color:#ba1a1a;font-weight:700}.metric{font-size:14px;color:#762b5f}@media(max-width:700px){.highlights{grid-template-columns:1fr}}</style>
</head><body><main><p class="metric">RAASPASS · REPRODUCIBLE AUTOMATION BENCHMARK</p><h1>WebMCP vs DOM automation</h1>
<p>${escapeHTML(report.task)}</p><div class="notice"><strong>Read this correctly:</strong> ${escapeHTML(report.disclaimer)}</div>
<div class="highlights"><div class="highlight"><strong>${report.comparison.actionReductionPercent}%</strong>fewer interaction actions</div><div class="highlight"><strong>${Math.abs(report.comparison.medianTimeDifferenceMs)} ms</strong>${medianDirection} median in this run</div><div class="highlight"><strong>${report.summary[0].successRate}%</strong>WebMCP task success</div></div>
<h2>Summary</h2><table><thead><tr><th>Mode</th><th>Success</th><th>Median</th><th>P95</th><th>Avg. actions</th></tr></thead><tbody>${summaryRows}</tbody></table>
<h2>Individual runs</h2><table><thead><tr><th>Mode</th><th>Run</th><th>Result</th><th>Duration</th><th>Actions</th><th>Error</th></tr></thead><tbody>${runRows}</tbody></table>
<p>Generated ${escapeHTML(report.generatedAt)} against ${escapeHTML(report.baseUrl)}.</p></main></body></html>`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}