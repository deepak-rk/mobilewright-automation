import { defineConfig } from 'mobilewright';
import { iosConfig } from './config/apps/ios';
import { androidConfig } from './config/apps/android';

export default defineConfig({
  testDir: '.features-gen',
  timeout: 30_000,
  retries: process.env['CI'] ? 2 : 0,
  workers: 2,
  fullyParallel: true,
  installApps: [iosConfig.appPath, androidConfig.appPath],
  reporter: [
    ['list'],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    ['html', { outputFolder: 'reports', open: 'never' }],
  ],
  projects: [
    {
      name: 'ios',
      grep: /@ios|@both/,
      use: {
        platform: 'ios',
        bundleId: iosConfig.bundleId,
        deviceName: new RegExp(iosConfig.deviceName),
      },
    },
    {
      name: 'android',
      grep: /@android|@both/,
      use: {
        platform: 'android',
        bundleId: androidConfig.packageName,
        deviceName: new RegExp(androidConfig.deviceName),
      },
    },
  ],
});
