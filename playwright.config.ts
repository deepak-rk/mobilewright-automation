import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  featuresRoot: './features',
  steps: ['./steps/**/*.ts', './support/**/*.ts'],
  outputDir: '.features-gen',
  importTestFrom: './steps/fixtures.ts',
});

export default defineConfig({ testDir });
