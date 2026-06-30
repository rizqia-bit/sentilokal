function analyzeSentiment(reviews) {
  const total = Array.isArray(reviews) ? reviews.length : 0;

  if (total === 0) {
    return {
      total: 0,
      averageRating: 0,
      sentiment: {
        positive: 0,
        neutral: 0,
        negative: 0,
      },
      keywords: [],
    };
  }

  let positive = 0;
  let neutral = 0;
  let negative = 0;
  let ratingSum = 0;

  const keywordCounts = {};
  const stopWords = new Set([
    'the',
    'dan',
    'yang',
    'di',
    'ini',
    'itu',
    'untuk',
    'dengan',
    'sangat',
    'sudah',
    'lebih',
    'pada',
    'adalah',
    'saya',
    'kami',
    'bisa',
    'bagus',
    'baik',
    'buruk',
    'tidak',
    'aja',
    'karena',
    'juga',
    'atau',
    'mungkin',
    'satu',
    'sangat',
  ]);

  reviews.forEach((review) => {
    const rating = Number(review.rating) || 0;
    const text = String(review.text || '').toLowerCase();
    ratingSum += rating;

    if (rating >= 4) {
      positive += 1;
    } else if (rating === 3) {
      neutral += 1;
    } else if (rating <= 2) {
      negative += 1;
    }

    const words = text
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word && word.length > 2 && !stopWords.has(word));

    words.forEach((word) => {
      keywordCounts[word] = (keywordCounts[word] || 0) + 1;
    });
  });

  const sortedKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  const averageRating = Number((ratingSum / total).toFixed(2));

  return {
    total,
    averageRating,
    sentiment: {
      positive: Number(((positive / total) * 100).toFixed(1)),
      neutral: Number(((neutral / total) * 100).toFixed(1)),
      negative: Number(((negative / total) * 100).toFixed(1)),
    },
    keywords: sortedKeywords,
  };
}

module.exports = {
  analyzeSentiment,
};
