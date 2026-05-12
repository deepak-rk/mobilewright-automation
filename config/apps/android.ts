import '../env';

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const androidConfig = {
  packageName: required('ANDROID_PACKAGE'),
  appPath: required('ANDROID_APP'),
  deviceName: required('ANDROID_DEVICE_NAME'),
  serial: process.env['ANDROID_DEVICE'],
  platformVersion: process.env['ANDROID_PLATFORM_VERSION'],
} as const;
