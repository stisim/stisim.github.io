import { validateStudies } from './lib/validate-studies.js';

const statusRank = { published: 0, 'in-flight': 1, upcoming: 2 };

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ public: '.' });
  eleventyConfig.addPassthroughCopy('src/assets');

  // Studies, validated at build time: a malformed entry fails the build
  // instead of shipping broken. Ordering is published, then in-flight, then
  // upcoming, and by `order` within each group.
  eleventyConfig.addCollection('studies', (collectionApi) => {
    const studies = collectionApi
      .getFilteredByTag('study')
      .filter((item) => !item.data.draft);
    validateStudies(studies);
    return studies.sort(
      (a, b) =>
        statusRank[a.data.status] - statusRank[b.data.status] ||
        a.data.order - b.data.order
    );
  });

  eleventyConfig.addFilter('findStudy', (studies, slug) =>
    studies.find((s) => s.data.slug === slug)
  );

  eleventyConfig.addFilter('countPapers', (outputs) =>
    (outputs || []).filter((o) => (o.kind || 'other') === 'paper').length
  );

  eleventyConfig.addFilter('isoDate', (value) =>
    new Date(value).toISOString().slice(0, 10)
  );

  return {
    dir: {
      input: 'src',
      output: '_site',
      includes: '_includes',
      data: '_data',
    },
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
  };
}
