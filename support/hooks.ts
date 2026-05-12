import * as path from 'path';
import * as fs from 'fs';
import { Before, After } from '../steps/fixtures';

Before(async () => {
  // per-scenario setup — extend as needed
});

After(async ({ screen, $testInfo }) => {
  if ($testInfo.status !== $testInfo.expectedStatus) {
    const screenshotDir = path.join(process.cwd(), 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const safeName = $testInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const screenshotPath = path.join(screenshotDir, `${safeName}-failed.png`);

    const buf = await screen.screenshot();
    fs.writeFileSync(screenshotPath, buf);
    await $testInfo.attach('screenshot', { body: buf, contentType: 'image/png' });
  }
});
