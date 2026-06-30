const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

function scrapeReviews(url) {
  return axios
    .get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000,
    })
    .then((response) => {
      const $ = cheerio.load(response.data);
      const platform = detectPlatform(url);
      const reviews = extractReviews($, platform);
      return reviews.slice(0, 10);
    })
    .catch((error) => {
      console.log('Error scraping reviews:', error.message);
      console.log('⚠️ Scraping gagal, menggunakan data sampel');
      return loadSampleReviews();
    });
}

function loadSampleReviews() {
  try {
    const samplePath = path.join(__dirname, '..', 'data', 'sample.json');
    const raw = fs.readFileSync(samplePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.log('Error loading sample reviews:', error.message);
    return [];
  }
}

function detectPlatform(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes('tokopedia')) return 'tokopedia';
    if (hostname.includes('shopee')) return 'shopee';
    if (hostname.includes('bukalapak')) return 'bukalapak';
  } catch (error) {
    return 'generic';
  }

  return 'generic';
}

function extractReviews($, platform) {
  const reviewBlocks = getReviewBlocks($, platform);
  const reviews = [];

  reviewBlocks.each((_, element) => {
    const review = {
      user: getText($, element, [
        '[data-testid="reviewerName"]',
        '.review-user',
        '.user-name',
        '.reviewer-name',
        '.user',
        '[class*="user"]',
      ]),
      text: getText($, element, [
        '[data-testid="lblReviewText"]',
        '.review-text',
        '.review-content',
        '.comment',
        '.content',
        '[class*="comment"]',
      ]),
      rating: getRating($, element),
      date: getText($, element, [
        '.review-date',
        '.date',
        '.review-time',
        '[class*="date"]',
        'time',
      ]),
    };

    if (review.text || review.user) {
      reviews.push(review);
    }
  });

  return reviews.filter((review) => review.text || review.user);
}

function getReviewBlocks($, platform) {
  const selectors = {
    tokopedia: [
      '[data-testid="review-item"]',
      '.review-item',
      '.review-content',
      '.prd-review-item',
      '.review-card',
    ],
    shopee: [
      '.shopee-product-rating__content',
      '.product-rating__content',
      '.review-item',
      '.comment',
      '.review-card',
    ],
    bukalapak: [
      '.review__item',
      '.review-item',
      '.product-review',
      '.comment',
      '.review-card',
    ],
    generic: ['.review-item', '.comment', '.review-card', '.review-content'],
  };

  const chosen = selectors[platform] || selectors.generic;

  for (const selector of chosen) {
    const matches = $(selector);
    if (matches.length) {
      return matches;
    }
  }

  return $();
}

function getText($, root, selectors) {
  for (const selector of selectors) {
    const found = $(root).find(selector).first();
    if (found.length) {
      const text = found.text().trim();
      if (text) return text;
    }
  }

  return '';
}

function getRating($, root) {
  const patterns = [
    '[data-rating]',
    '[data-score]',
    '[aria-label*="rating"]',
    '[aria-label*="bintang"]',
    '.star',
  ];

  for (const selector of patterns) {
    const found = $(root).find(selector).first();
    if (found.length) {
      const value = found.attr('data-rating') || found.attr('data-score') || found.attr('aria-label') || found.text();
      if (value) {
        const numeric = Number(String(value).replace(/[^0-9]/g, ''));
        if (!Number.isNaN(numeric)) {
          return numeric;
        }
      }
    }
  }

  return 0;
}

module.exports = {
  scrapeReviews,
};
