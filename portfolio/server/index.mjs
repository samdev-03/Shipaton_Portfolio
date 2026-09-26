import { createApp } from './app.mjs';
const app = createApp();
let ticking = false;
const timer = setInterval(async () => {
  if (ticking) return;
  ticking = true;
  try {
    await app.tick();
  } catch {
    console.error('Background worker failed; retrying on next interval.');
  } finally {
    ticking = false;
  }
}, 15000);
timer.unref();
app.server.listen(Number(process.env.PORT || 8787), '0.0.0.0', () =>
  console.log('Portfolio API ready on port ' + (process.env.PORT || 8787)),
);
for (const signal of ['SIGTERM', 'SIGINT'])
  process.on(signal, async () => {
    clearInterval(timer);
    await app.close();
    process.exit(0);
  });
