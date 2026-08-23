const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4173/map', { waitUntil: 'networkidle0' });
  
  const html = await page.evaluate(() => {
    return document.querySelector('.gm-style')?.innerHTML;
  });
  
  const fs = require('fs');
  fs.writeFileSync('map_dom.html', html || 'no map');
  console.log('Done');
  await browser.close();
})();
