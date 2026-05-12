# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time device setup
npm run doctor                        # verify local toolchain (ADB, Java, mobilecli)
npm run devices                       # list connected devices and their IDs
npm run install:agent                 # install mobilewright agent on connected device
npm run install:agent:force           # reinstall agent (if already present)

# Running tests
npm run test                          # bddgen + run all platforms in parallel
npm run test:ios                      # iOS project only
npm run test:android                  # Android project only
npm run test:parallel                 # all platforms, 4 workers
TAG=@login npm run test:tag           # run scenarios matching a specific tag

# Reports
npm run report:full                   # generate Allure report + open in browser
npm run report:generate               # generate Allure report (CI-safe, no open)
npm run report:open                   # open previously generated Allure report
npm run report:single                 # open mobilewright built-in HTML report

# Development
npm run bddgen                        # compile .feature files → .features-gen/*.spec.ts
npm run typecheck                     # tsc --noEmit
npm run lint                          # ESLint on all .ts files
npm run clean                         # wipe .features-gen/, test-results/, allure-*/
```

`npm run test` always runs `bddgen` first. Run `bddgen` standalone when adding new steps to catch compilation errors before a full test run.

## Architecture

### Two-config system

There are two config files with distinct roles — do not conflate them:

- **`playwright.config.ts`** — consumed only by `bddgen`. Tells playwright-bdd where to find `.feature` files and step definitions, and where to emit generated specs. Never used by `mobilewright test`.
- **`mobilewright.config.ts`** — consumed only by `mobilewright test`. Declares the iOS and Android projects, device matching, reporters, and workers. Its `testDir` points to `.features-gen/` (the output of `bddgen`).

### Cucumber → mobilewright execution flow

```
.feature files  →  bddgen  →  .features-gen/*.spec.ts  →  mobilewright test
```

`playwright-bdd` bridges Cucumber's Gherkin syntax to mobilewright's Playwright-Test-compatible runner. The bridge lives in `steps/fixtures.ts`:

```ts
import { test } from '@mobilewright/test';
import { createBdd } from 'playwright-bdd';
export const { Given, When, Then, Before, After, ... } = createBdd(test);
```

All step definitions and hooks **must** import `Given`/`When`/`Then`/`Before`/`After` from `steps/fixtures.ts`, not from `playwright-bdd` or `@cucumber/cucumber` directly.

### Platform segregation

- `config/apps/ios.ts` and `config/apps/android.ts` read env vars and export typed config objects. These are the only files that reference env vars for device/app settings.
- `config/env.ts` calls `dotenv.config()` and is side-effect imported at the top of both config files.
- `mobilewright.config.ts` imports from both config files and wires them into the `projects` array. Each project uses `use: { platform, bundleId, deviceName }` — these are the only fields accepted per-project; `installApps` is top-level only.
- `deviceName` in mobilewright project config must be a `RegExp`, not a string.

### Tag conventions

Scenarios are tagged to control which project runs them:

| Tag | Runs in |
|---|---|
| `@both` | iOS project + Android project |
| `@ios` | iOS project only |
| `@android` | Android project only |

Feature-level tags (e.g. `@login`, `@biometrics`) are purely organisational — use them with `TAG=@login npm run test:tag`.

Each project in `mobilewright.config.ts` has `grep: /@ios|@both/` or `grep: /@android|@both/` to enforce this routing.

### Hooks and screenshots

`support/hooks.ts` registers a global `After` hook that captures a screenshot on failure and attaches it to the Allure report via `$testInfo.attach(...)`. The `$testInfo` fixture is provided by playwright-bdd and is accessed as a fixture parameter, not a second callback argument.

### Device setup

The mobilewright agent (`com.mobilenext.devicekit`) is installed once per physical device and persists between connections. It does not need reinstalling when switching computers — only ADB USB authorisation ("Allow USB debugging") is per-computer.

iOS automation requires macOS (Xcode toolchain). On Windows, iOS can be driven remotely by pointing `url:` in the ios project config at a `mobilecli server start` instance running on a Mac with the iPhone connected.

## Environment variables

Copy `.env.example` to `.env` before running tests. Required variables:

```
IOS_BUNDLE_ID, IOS_APP, IOS_DEVICE_NAME      # iOS — required
ANDROID_PACKAGE, ANDROID_APP, ANDROID_DEVICE_NAME  # Android — required
IOS_UDID, ANDROID_DEVICE                      # optional — narrows device selection
CI                                            # set to any value to enable retries
```
