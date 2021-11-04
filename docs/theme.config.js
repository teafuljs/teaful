export default {
  github: 'https://github.com/aralroca/fragstore',
  docsRepositoryBase: 'https://github.com/aralroca/fragstore/blob/master/docs',
  titleSuffix: ' | Fragstore',
  logo: (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-layers">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
      </svg>
      <span className="ml-2 font-extrabold hidden md:inline">Fragstore</span>
    </>
  ),
  head: (
    <>
      <meta name="theme-color" content="#ffffff" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
    </>
  ),
  search: true,
  prevLinks: true,
  nextLinks: true,
  footer: true,
  footerEditLink: 'Edit this page on GitHub',
  footerText: <>&copy; {new Date().getFullYear()} Fragstore Contributors.</>,
  unstable_faviconGlyph: '👾',
  unstable_staticImage: true,
  font: false,
}