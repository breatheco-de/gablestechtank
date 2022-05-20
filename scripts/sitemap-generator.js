const { default: axios } = require('axios');
const fs = require('fs');
const globby = require('globby');

const getReadPages = () => {
  const resp = axios.get(
    `${process.env.BREATHECODE_HOST}/v1/admissions/public/syllabus?slug=${process.env.SYLLABUS}`,
  )
    .then((res) => res.data)
    .catch((err) => console.log(err));
  return resp;
};

const getLessons = () => {
  const data = axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset?type=lesson`)
    .then((res) => res.data)
    .catch((err) => console.log(err));
  return data;
};

const getExercises = () => {
  const data = axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset?type=exercise&big=true`)
    .then((res) => res.data)
    .catch((err) => console.log(err));
  return data;
};

const getProjects = () => {
  const data = axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset?type=project`)
    .then((res) => res.data)
    .catch((err) => console.log(err));
  return data;
};

const getHowTo = () => {
  const data = axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset?type=ARTICLE`)
    .then((res) => res.data)
    .catch((err) => console.log(err));
  return data;
};

function addPage(page) {
  const path = page.replace('src/pages', '').replace('/index', '').replace('.jsx', '').replace('.js', '');
  console.log('path:::', path);
  const route = path === '/index' ? '' : path;
  const websiteUrl = process.env.WEBSITE_URL || 'https://4geeks.com';
  return `<url>
    <loc>${`${websiteUrl}${route}`}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>`;
}

const privateRoutes = [
  '!src/pages/**/[cohortSlug]/[slug]/[version]/*{.js,.jsx}',
  '!src/pages/**/[cohortSlug]/[lesson]/[lessonSlug]/*{.js,.jsx}',
  '!src/pages/profile/*{.js,.jsx}',
  '!src/pages/choose-program/*{.js,.jsx}',
];

async function generateSitemap() {
  const readPages = await getReadPages();
  const lessonsPages = await getLessons();
  const exercisesPages = await getExercises();
  const projectsPages = await getProjects();
  const howTosPages = await getHowTo();

  const readRoute = readPages.map((l) => `/read/${l.slug}`);
  const lessonsRoute = lessonsPages.map((l) => `/lesson/${l.slug}`);
  const exercisesRoute = exercisesPages.map((l) => `/interactive-exercises/${l.slug}`);
  const projectsCodingRoute = projectsPages.map((l) => `/interactive-coding-tutorial/${l.slug}`);
  const projectsRoute = projectsPages.map((l) => `/project/${l.slug}`);
  const howTosRoute = howTosPages.map((l) => `/how-to/${l.slug}`);

  // excludes Nextjs files and API routes.
  const pages = await globby([
    'src/pages/**/*{.js,.jsx}',
    '!src/pages/**/[slug]/*{.js,.jsx}',
    '!src/pages/**/[slug]{.js,.jsx}',
    ...privateRoutes,
    '!src/pages/**/_*{.js,.jsx}',
    '!src/pages/api',
  ]);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${[
    ...pages,
    ...readRoute,
    ...lessonsRoute,
    ...exercisesRoute,
    ...projectsRoute,
    ...projectsCodingRoute,
    ...howTosRoute,
  ].map(addPage).join('\n')}
</urlset>`;
  fs.writeFileSync('public/sitemap.xml', sitemap);
}
generateSitemap();
