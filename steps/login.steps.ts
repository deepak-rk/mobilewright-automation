import { expect } from '@mobilewright/test';
import { Given, When, Then } from './fixtures';

Given('the app is launched', async ({ screen }) => {
  await expect(screen.getByText('Welcome')).toBeVisible();
});

When('I enter {string} as email', async ({ screen }, email: string) => {
  await screen.getByLabel('Email').fill(email);
});

When('I enter {string} as password', async ({ screen }, password: string) => {
  await screen.getByLabel('Password').fill(password);
});

When('I tap the login button', async ({ screen }) => {
  await screen.getByText('Log In').tap();
});

Then('I should see {string}', async ({ screen }, text: string) => {
  await expect(screen.getByText(text)).toBeVisible();
});
