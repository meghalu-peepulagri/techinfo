// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'PeepulAgri Tech Info',
  tagline: 'Internal Technical Documentation Portal',
  favicon: 'img/favicon.ico',

  url: 'https://techinfo.peepul.farm',
  baseUrl: '/',

  organizationName: 'peepulagri',
  projectName: 'techinfo',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'PeepulAgri Tech Info',
        logo: {
          alt: 'PeepulAgri Logo',
          src: 'img/logo.webp',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'idharaSidebar',
            position: 'left',
            label: 'iDhara',
          },
          {
            type: 'docSidebar',
            sidebarId: 'apfcSidebar',
            position: 'left',
            label: 'APFC',
          },
          {
            type: 'docSidebar',
            sidebarId: 'orcSidebar',
            position: 'left',
            label: 'ORC',
          },
          {
            type: 'docSidebar',
            sidebarId: 'demetercloudSidebar',
            position: 'left',
            label: 'DemeterCloud',
          },
          {
            href: 'https://github.com/peepulagri/techinfo',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Products',
            items: [
              { label: 'iDhara', to: '/docs/idhara/intro' },
              { label: 'APFC', to: '/docs/apfc/intro' },
              { label: 'ORC', to: '/docs/orc/intro' },
              { label: 'DemeterCloud', to: '/docs/demetercloud/intro' },
            ],
          },
          {
            title: 'Teams',
            items: [
              { label: 'Cloud / Backend', to: '/docs/demetercloud/api/overview' },
              { label: 'Firmware / Embedded', to: '/docs/idhara/firmware/overview' },
              { label: 'Mobile', to: '/docs/idhara/mobile/overview' },
              { label: 'Admin Dashboard', to: '/docs/idhara/admin/overview' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Peepul Farm. Built with Docusaurus.`,
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
        additionalLanguages: ['bash', 'json', 'yaml', 'python', 'c', 'cpp'],
      },
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
    }),
};

module.exports = config;
