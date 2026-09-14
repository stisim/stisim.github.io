import { validateStudies } from './src/research/research-validation.js';

const statusRank = { 'peer-reviewed': 0, 'write-up': 1, 'in-flight': 2 };

const sitemap = `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  {%- for page in collections.all %}
  {%- if page.url %}
  <url>
    <loc>{{ site.url }}{{ page.url | url }}</loc>
  </url>
  {%- endif %}
  {%- endfor %}
</urlset>
`;

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ public: '.' });

  // Site metadata, available to every template as `site`
  eleventyConfig.addGlobalData('site', {
    title: 'STIsim',
    description:
      'Agent-based modelling of co-circulating sexually transmitted infections, including HIV, built on Starsim.',
    url: process.env.SITE_URL || 'https://stisim.org',
  });

  eleventyConfig.addTemplate('sitemap.njk', sitemap, {
    permalink: '/sitemap.xml',
    eleventyExcludeFromCollections: true,
  });

  // Studies, validated at build time: a malformed entry fails the build
  // instead of shipping broken. Ordering is peer-reviewed, then write-up, then
  // in-flight, and by `order` within each group.
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
      includes: 'includes',
    },
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
  };
}
