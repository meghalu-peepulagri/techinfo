import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const products = [
  {
    name: 'iDhara',
    description: 'Smart irrigation and soil monitoring IoT platform.',
    link: '/docs/idhara/intro',
  },
  {
    name: 'APFC + Soft Starter',
    description: 'Automatic Power Factor Correction device documentation.',
    link: '/docs/apfc/intro',
  },
  {
    name: 'ORC',
    description: 'Organic Resource Controller — field monitoring and control.',
    link: '/docs/orc/intro',
  },
  {
    name: 'DemeterCloud',
    description: 'Cloud backend platform powering all Peepul Farm IoT devices.',
    link: '/docs/demetercloud/intro',
  },
];

function ProductCard({ name, description, link }) {
  return (
    <div className={clsx('col col--3')}>
      <div className={styles.productCard}>
        <h3>{name}</h3>
        <p>{description}</p>
        <Link className="button button--primary button--sm" to={link}>
          View Docs →
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title="Home" description={siteConfig.tagline}>
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
        </div>
      </header>
      <main>
        <section className={styles.products}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Products</h2>
            <div className="row">
              {products.map((p) => (
                <ProductCard key={p.name} {...p} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
