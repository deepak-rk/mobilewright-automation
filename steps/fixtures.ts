import { test } from '@mobilewright/test';
import { createBdd } from 'playwright-bdd';

export { test };
export const { Given, When, Then, Before, After, BeforeAll, AfterAll } = createBdd(test);
