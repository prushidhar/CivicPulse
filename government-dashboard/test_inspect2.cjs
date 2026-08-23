const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4173/map');
  await new Promise(r => setTimeout(r, 5000));
  
  const elements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*')).map(el => {
      if (el.textContent && el.textContent.includes('can\\'t load Google Maps')) {
        return {
          tag: el.tagName,
          className: el.className,
          id: el.id,
          html: el.outerHTML
        };
      }
      return null;
    }).filter(Boolean);
  });
  
  const fs = require('fs');
  fs.writeFileSync('map_error.json', JSON.stringify(elements, null, 2));
  console.log('Done');
  await browser.close();
})();
