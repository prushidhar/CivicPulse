const { JSDOM } = require("jsdom");

async function run() {
  console.log("Fetching Vercel deployment...");
  const res = await fetch("https://civic-pulse-89glii2w2-powerhouse13.vercel.app");
  const html = await res.text();
  
  console.log("Setting up JSDOM...");
  const dom = new JSDOM(html, { 
    url: "https://civic-pulse-89glii2w2-powerhouse13.vercel.app/",
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true
  });
  
  dom.window.console.error = (...args) => {
    console.log("[ERROR]", ...args);
  };
  
  setTimeout(() => {
    console.log("Done waiting for execution.");
    process.exit(0);
  }, 10000);
}

run().catch(console.error);
