# mobilewright-automation

Cucumber-based iOS and Android end-to-end automation framework using [mobilewright](https://mobilewright.dev).

---

## Prerequisites

| Tool | Minimum | Notes |
|---|---|---|
| Node.js | v18 | v20 recommended |
| Java JDK | 17 | Required for Android build tools |
| Android Studio | Any | Installs the Android SDK and ADB |
| Git | Any | |

**iOS automation requires macOS.** On Windows, iOS can be driven remotely via a Mac running `mobilecli server start` — see [iOS on Windows](#ios-on-windows).

---

## 1. Clone and install

```bash
git clone <repo-url>
cd mobilewright-automation
npm install
```

---

## 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your device details:

```env
# Android
ANDROID_DEVICE=RFCW40TVH9M        # from: adb devices
ANDROID_DEVICE_NAME=Galaxy A34 5G
ANDROID_APP=./builds/MyApp.apk
ANDROID_PACKAGE=com.example.myapp

# iOS (macOS only)
IOS_UDID=00008101-000XXXXXXXXX    # from: mobilewright devices
IOS_DEVICE_NAME=iPhone 15 Pro
IOS_APP=./builds/MyApp.ipa
IOS_BUNDLE_ID=com.example.myapp
```

---

## 3. Fix Android environment variables

`ANDROID_HOME` and `JAVA_HOME` must be set as system environment variables. Run the following in **admin PowerShell**, then restart your terminal.

```powershell
# Set ANDROID_HOME (adjust path if your SDK is elsewhere)
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "Machine")

# Add platform-tools and emulator to PATH
$path = [System.Environment]::GetEnvironmentVariable("PATH", "Machine")
[System.Environment]::SetEnvironmentVariable("PATH", "$path;$env:LOCALAPPDATA\Android\Sdk\platform-tools;$env:LOCALAPPDATA\Android\Sdk\emulator", "Machine")

# Set JAVA_HOME (adjust to your JDK installation path)
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-21.0.2.13-hotspot", "Machine")
```

> If Android Studio is not installed: `winget install Google.AndroidStudio` — complete its setup wizard before setting `ANDROID_HOME`.

---

## 4. Connect your Android device

1. Enable **Developer Options** on the device: Settings → About Phone → tap *Build number* 7 times
2. Enable **USB Debugging**: Settings → Developer Options → USB Debugging → On
3. Connect via USB
4. Accept the **"Allow USB debugging?"** prompt on the device
5. Verify the device is visible:

```bash
npm run devices
# or: adb devices
```

### Install the mobilewright agent

The agent only needs to be installed once per device. It persists between connections.

```bash
npm run install:agent
# for a specific device: npx mobilewright install -d <device-id>
# force reinstall:       npm run install:agent:force
```

Confirm the agent is running:

```bash
npm run doctor
# look for: ✓  mobilecli devices  — agent: com.mobilenext.devicekit
```

---

## 5. iOS setup (macOS only)

> **Windows users:** See [iOS on Windows](#ios-on-windows) below.

1. Connect iPhone via USB and trust the computer on the device
2. Get the device UDID:

```bash
npm run devices
```

3. Install the mobilewright agent (requires an Apple Developer provisioning profile):

```bash
npx mobilewright install -d <udid> --provisioning-profile /path/to/profile.mobileprovision
```

The provisioning profile must be created in your [Apple Developer account](https://developer.apple.com) with the device's UDID registered.

---

## 6. Verify environment

```bash
npm run doctor
```

All items should be ✓ or ⚠ (warnings only). Fix any ✗ errors before running tests.

---

## 7. Run tests

```bash
# Generate BDD specs + run all platforms in parallel
npm run test

# Single platform
npm run test:android
npm run test:ios

# Specific tag (e.g. @login, @biometrics, @both)
TAG=@login npm run test:tag         # PowerShell: $env:TAG='@login'; npm run test:tag

# More workers for same-platform parallelism (requires multiple devices)
npm run test:parallel
```

---

## 8. Reports

After a test run:

```bash
npm run report:full      # generate full Allure report + open in browser
npm run report:single    # open mobilewright built-in HTML report (last run only)
```

Screenshots of failed scenarios are saved to `screenshots/` and attached to the Allure report automatically.

---

## iOS on Windows

iOS requires Xcode (macOS only). The workaround is to run `mobilecli` as an HTTP server on a Mac with the iPhone attached, and point this project at it.

**On the Mac** (iPhone connected):

```bash
npx mobilecli install -d <udid> --provisioning-profile ./profile.mobileprovision
npx mobilecli server start --listen 0.0.0.0:9008 --cors
```

**In `mobilewright.config.ts`**, add `url` to the iOS project:

```ts
{
  name: 'ios',
  grep: /@ios|@both/,
  use: { platform: 'ios', bundleId: iosConfig.bundleId },
  url: 'http://<mac-ip>:9008',
}
```

Then `npm run test:ios` runs from Windows while the Mac drives the device.

---

## Adding new tests

1. Add scenarios to an existing `.feature` in `features/` or create a new feature file
2. Tag every scenario with `@ios`, `@android`, or `@both`
3. Add step definitions in `steps/` — import `Given`/`When`/`Then` from `./fixtures`, not from `playwright-bdd` directly
4. Run `npm run bddgen` to compile and catch any unmatched steps before a full run

### Platform-specific steps

Use the `platform` fixture to branch within a shared step when behaviour differs:

```ts
When('I authenticate', async ({ screen, platform }) => {
  if (platform === 'ios') {
    await screen.getByText('Use Face ID').tap();
  } else {
    await screen.getByText('Use Fingerprint').tap();
  }
});
```

---

## CI

Set `CI=true` in the pipeline environment to enable automatic retries (2 per test).

The device must be connected and the agent installed before the pipeline runs. For unattended CI, use the remote server approach (`mobilecli server start`) on a dedicated device host, and set the `url:` field per project in `mobilewright.config.ts`.
