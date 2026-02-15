/**
 * Fetches current 24K gold price in INR per gram for India (including 4% GST).
 * Uses web scraping (Goodreturns.in, then Financial Express), then env fallback.
 * ~1.6L per 10gm ≈ 16000/g used as default when all else fails.
 */
const GST_RATE = 0.04; // 4% GST on gold

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const fetchOpts = {
  headers: {
    "User-Agent": UA,
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-IN,en;q=0.9",
  },
};

/**
 * Scrape 24K gold INR/gram from Goodreturns.in (India retail rates)
 */
async function scrapeGoodreturns() {
  const res = await fetch("https://www.goodreturns.in/gold-rates/", fetchOpts);
  if (!res.ok) throw new Error(`Goodreturns: ${res.status}`);
  const html = await res.text();
  const patterns = [
    /24K\s*Gold\s*\/\s*g[\s\S]{0,300}?[₹]\s*([0-9,]+)/i,
    /Today\s+24\s+Carat\s+Gold\s+Rate[\s\S]*?1\s*\|[^0-9]*[₹]\s*([0-9,]+)/i,
    /(?:24K|24\s*[Kk]arat)[^₹]*[₹]\s*([0-9,]+)/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) {
      const num = Number(m[1].replace(/,/g, ""));
      if (num > 1000 && num < 100000) return num;
    }
  }
  throw new Error("Could not parse 24K price from Goodreturns");
}

/**
 * Scrape 24K gold INR/gram from Financial Express (India gold rate today)
 */
async function scrapeFinancialExpress() {
  const res = await fetch(
    "https://www.financialexpress.com/market/gold-rate-today/",
    fetchOpts
  );
  if (!res.ok) throw new Error(`Financial Express: ${res.status}`);
  const html = await res.text();
  // 24-karat gold ... Rs 15,422 per gram (prefer per-gram)
  const perGram = html.match(
    /24[- ]?[kK]arat[^0-9]*Rs\.?\s*([0-9,]+)\s*per\s*gram/i
  );
  if (perGram && perGram[1]) {
    const num = Number(perGram[1].replace(/,/g, ""));
    if (num > 1000 && num < 100000) return num;
  }
  // Rs 1,52,200 per 10 grams -> divide by 10
  const per10 = html.match(/Rs\.?\s*([0-9,]+)\s*per\s*10\s*gram/i);
  if (per10 && per10[1]) {
    const num = Number(per10[1].replace(/,/g, ""));
    if (num > 10000 && num < 500000) return num / 10;
  }
  throw new Error("Could not parse 24K price from Financial Express");
}

async function fetchGoldPriceIndiaFromWeb() {
  const sources = [scrapeGoodreturns, scrapeFinancialExpress];
  for (const fn of sources) {
    try {
      const price = await fn();
      if (price > 0) return price;
    } catch (err) {
      continue;
    }
  }
  throw new Error("All scrapers failed");
}

function withGst(pricePerGram) {
  const withGst = pricePerGram * (1 + GST_RATE);
  return Math.round(withGst * 100) / 100;
}

async function fetchCurrentGoldPriceInrPerGram() {
  const fixedRate = process.env.GOLD_PRICE_INR_PER_GRAM;
  if (fixedRate != null && fixedRate !== "") {
    const num = Number(fixedRate);
    if (!Number.isNaN(num) && num > 0) return withGst(num);
  }

  try {
    const price = await fetchGoldPriceIndiaFromWeb();
    return withGst(price);
  } catch (err) {
    const fallback = process.env.GOLD_PRICE_INR_PER_GRAM;
    if (fallback != null && fallback !== "") {
      const num = Number(fallback);
      if (!Number.isNaN(num) && num > 0) return withGst(num);
    }
    // Default India 24K: ~1.6L per 10gm = 16000/g (before GST)
    const defaultIndia = 16000;
    console.warn(
      "Gold scrape failed (%s). Using India default ₹%s/g (incl. GST). Set GOLD_PRICE_INR_PER_GRAM in .env to override.",
      err.message,
      withGst(defaultIndia)
    );
    return withGst(defaultIndia);
  }
}

module.exports = { fetchCurrentGoldPriceInrPerGram };
