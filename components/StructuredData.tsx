export default function StructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'CJ Development Training Center',
    alternateName: 'CJ DTC',
    url: 'https://cjdevelopmenttc.com',
    logo: 'https://cjdevelopmenttc.com/logo.png',
    description: 'Centre Panafricain de Formation Professionnelle, Leadership et Insertion',
    address: {
      '@type': 'PostalAddress',
      addressCountry: ['CD', 'GN'], // RDC and Guinea
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contact@cjdevelopmenttc.com',
      contactType: 'Customer Service',
      availableLanguage: ['French', 'English'],
      telephone: ['+243995136626', '+243999482140', '+224626146065'],
    },
    sameAs: [
      'https://www.linkedin.com/company/CJDevelopmentCenter',
      'https://www.facebook.com/CJDevelopmentCenter',
      'https://x.com/CJDevelopmentCenter',
    ],
    foundingDate: '2018',
    areaServed: {
      '@type': 'Place',
      name: 'Africa',
    },
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CJ Development Training Center',
    url: 'https://cjdevelopmenttc.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://cjdevelopmenttc.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  )
}
