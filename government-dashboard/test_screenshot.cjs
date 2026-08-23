const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:4173/');
  await page.evaluate(() => {
    localStorage.setItem('isAdminAuthenticated', 'true');
    localStorage.setItem('token', 'fake-token');
  });

  await page.goto('http://localhost:4173/recommendations', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'screenshot.png' });
  
  console.log('Done screenshot');
  await browser.close();
})();
