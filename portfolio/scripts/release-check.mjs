import { readFileSync, existsSync } from 'node:fs';
import sharp from 'sharp';
import { APP_IDS } from '../shared/catalog.ts';
const variant = process.argv[2] || 'rehearsal',
  platform = process.argv[3] || 'ios',
  env = process.env,
  issues = [];
if (!APP_IDS.includes(variant) || !['ios', 'android'].includes(platform))
  throw Error(
    'Usage: release-check.mjs <rehearsal|care|meal|quote> <ios|android> [--config-only] [--nextgen-only] [--server]',
  );
const p = variant.toUpperCase(),
  need = (yes, message) => {
    if (!yes) issues.push(message);
  },
  https = (value) => {
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  },
  ledger = JSON.parse(readFileSync('docs/submission/evidence.json', 'utf8')),
  app = ledger.apps[variant],
  nextOnly = process.argv.includes('--nextgen-only'),
  targets = nextOnly ? ['NextGen'] : app.targets;
need(env.BUNDLE_ROOT && !env.BUNDLE_ROOT.includes('example'), 'Choose an owned bundle namespace.');
need(https(env.EXPO_PUBLIC_API_URL), 'Set an HTTPS API URL.');
need(https(env.LEGAL_ORIGIN), 'Publish complete legal/support pages and set LEGAL_ORIGIN.');
need(env.OPERATOR_NAME?.trim(), 'Set the operator identity.');
need(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(env.SUPPORT_EMAIL || ''), 'Set a monitored support email.');
need(env.HOSTING_REGION?.trim(), 'Declare the actual hosting region.');
need(
  /^\d+$/.test(env.BACKUP_RETENTION_DAYS || '') &&
    Number(env.BACKUP_RETENTION_DAYS) > 0 &&
    Number(env.BACKUP_RETENTION_DAYS) <= 365,
  'Declare and implement a backup retention period from 1 to 365 days.',
);
need(env[p + '_EAS_PROJECT_ID'], 'Link this app to its separate EAS project.');
need(
  env[p + (platform === 'ios' ? '_RC_IOS_PUBLIC_KEY' : '_RC_ANDROID_PUBLIC_KEY')],
  'Set the correct RevenueCat public SDK key.',
);
need(env.PORTFOLIO_PREVIEW !== '1', 'Disable the combined portfolio preview.');
if (process.argv.includes('--server')) {
  need(env.NODE_ENV === 'production', 'Use production mode on the live service.');
  need(https(env.PUBLIC_ORIGIN), 'Set PUBLIC_ORIGIN to the HTTPS companion.');
  need(
    /^[a-f0-9]{64}$/i.test(env.DATA_KEY || '') && !/^([a-f0-9])\1{63}$/i.test(env.DATA_KEY),
    'Set an independently generated DATA_KEY.',
  );
  for (const k of ['OPS_TOKEN', 'WEBHOOK_SECRET'])
    need((env[k] || '').length >= 32, 'Set strong ' + k + '.');
  need(env[p + '_RC_SECRET_KEY'], 'Set the server RevenueCat secret.');
  need(env[p + '_RC_APP_IDS'], 'Map all RevenueCat internal app IDs.');
}
if (!process.argv.includes('--config-only')) {
  need(
    ledger.entrant.eligibility_reviewed,
    'Record an eligibility review, including residency, conflicts and ownership.',
  );
  need(
    ledger.entrant.adult === true || nextOnly,
    'Non-adult entrants may use only the Next Gen route.',
  );
  need(
    /^https:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//.test(app.demo_video_url),
    'Publish an accessible demonstration video.',
  );
  need(
    app.demo_duration_seconds > 0 && app.demo_duration_seconds < 120,
    'Record a demo shorter than 120 seconds.',
  );
  if (!nextOnly) {
    need(https(app.store_url), 'Record the fully published store URL.');
    need(app.us_available, 'Verify US availability.');
    need(
      Date.parse(app.first_public_release) >= Date.parse('2026-07-31T15:00:00Z') &&
        Date.parse(app.first_public_release) <= Date.parse(ledger.deadline),
      'Verify first public release inside the event window.',
    );
    need(app.judge_access_instructions, 'Provide tested judge trial/promo instructions.');
    need(
      Date.parse(app.judge_access_valid_until) >= Date.parse('2026-10-13T19:00:00Z'),
      'Maintain judge access through the end of judging.',
    );
    for (const k of [
      'native_purchase_verified',
      'native_restore_verified',
      'native_deletion_verified',
    ])
      need(app[k], 'Complete ' + k + '.');
  }
  if (targets.includes('NextGen')) {
    need(
      ledger.entrant.active_student && ledger.entrant.academic_email_verified,
      'Verify active-student and academic-email eligibility.',
    );
    need(
      https(app.public_repository_url),
      'Publish a complete open-source repository with its license.',
    );
    if (ledger.entrant.adult === false)
      need(ledger.entrant.guardian_consent_if_required, 'Complete required guardian consent.');
  }
  const screenshot = app.native_screenshot_path;
  need(screenshot && existsSync(screenshot), 'Capture the required native screenshot.');
  if (screenshot && existsSync(screenshot)) {
    const m = await sharp(screenshot).metadata();
    need(
      m.width === 1179 && m.height === 2556,
      'Native screenshot must be 1179 × 2556 without a frame.',
    );
  }
  if (targets.includes('OneSignal')) {
    need(
      env[p + '_ONESIGNAL_APP_ID'] && app.onesignal_campaign_id && app.onesignal_delivery_verified,
      'Record a deployed OneSignal campaign and verified delivery.',
    );
  }
  if (targets.includes('Layers'))
    need(
      env[p + '_LAYERS_APP_ID'] && app.layers_dashboard_evidence && app.layers_experiment_results,
      'Verify native Layers installation and record a measured learning.',
    );
  if (targets.includes('HAMM'))
    need(
      app.monetization_results,
      'Record actual monetization results, with measurement dates and limitations.',
    );
  if (targets.includes('Grand'))
    need(app.revenuecat_revenue_export, 'Supply genuine RevenueCat revenue and growth evidence.');
  if (targets.includes('BuildInPublic'))
    need(
      app.social_posts.some(https),
      'Record actual public build posts and feedback-driven changes.',
    );
  if (targets.includes('Replit'))
    need(
      app.replit_username &&
        https(app.replit_preview_url) &&
        app.replit_agent_integration_evidence &&
        app.social_posts.filter(https).length >= 3,
      'Complete actual Replit Agent work, preview, username and three stage-specific posts.',
    );
  if (targets.includes('Stripe'))
    need(
      https(app.funnel_url) && app.stripe_project_id && app.stripe_live_checkout_verified,
      'Verify the live RevenueCat Funnel using Stripe checkout and Project ID.',
    );
}
console.log(
  JSON.stringify(
    { variant, platform, targets, status: issues.length ? 'BLOCKED' : 'READY_FOR_REVIEW', issues },
    null,
    2,
  ),
);
process.exitCode = issues.length ? 1 : 0;
