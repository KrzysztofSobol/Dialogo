import { test as setup, expect, request } from '@playwright/test';
import { AuthPage } from './pages/AuthPage';
import { AppLayout } from './pages/AppLayout';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authDir = path.join(__dirname, '.auth');
const authFile = path.join(authDir, 'user.json');

setup('authenticate', async ({ page }) => {
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const apiContext = await request.newContext();
  await apiContext.post('http://localhost:3000/api/auth/register', {
    data: { username: 'SetupUser', password: 'Test1234!' },
    ignoreHTTPSErrors: true,
  });
  await apiContext.dispose();

  const auth = new AuthPage(page);
  const layout = new AppLayout(page);

  await auth.goto();
  await auth.login('SetupUser', 'Test1234!');

  await expect(layout.mainView).toBeVisible({ timeout: 10000 });

  await page.context().storageState({ path: authFile });
});
