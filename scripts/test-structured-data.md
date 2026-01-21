# 🧪 Structured Data Testing Guide

This guide provides step-by-step instructions for testing your structured data with Google's Rich Results Test.

## Prerequisites

- Your site must be deployed and accessible via HTTPS
- Structured data must be present in the page source

## Step-by-Step Testing

### 1. Test Homepage

1. Visit: https://search.google.com/test/rich-results
2. Enter your homepage URL: `https://cjdevelopmenttc.com/fr`
3. Click **"Test URL"**
4. Wait for results (usually 10-30 seconds)

**Expected Results:**
- ✅ Organization schema detected
- ✅ Website schema detected
- ✅ No errors (red)
- ⚠️ Warnings are acceptable (yellow)

### 2. Test Formation Detail Page

1. Get a formation slug from your database
2. Enter URL: `https://cjdevelopmenttc.com/fr/formations/[slug]`
3. Click **"Test URL"**

**Expected Results:**
- ✅ Organization schema (inherited from layout)
- ✅ Website schema (inherited from layout)
- ✅ Page-specific metadata

### 3. Test Article Detail Page

1. Get an article slug from your database
2. Enter URL: `https://cjdevelopmenttc.com/fr/actualites/[slug]`
3. Click **"Test URL"**

**Expected Results:**
- ✅ Organization schema (inherited from layout)
- ✅ Website schema (inherited from layout)
- ✅ Page-specific metadata

## Manual Validation

### Check Page Source

1. Visit your website
2. Right-click → "View Page Source"
3. Search for: `application/ld+json`
4. Copy the JSON content
5. Validate at: https://validator.schema.org/

### Expected JSON-LD Structure

```json
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "CJ Development Training Center",
  "alternateName": "CJ DTC",
  "url": "https://cjdevelopmenttc.com",
  "logo": "https://cjdevelopmenttc.com/logo.png",
  "description": "Centre Panafricain de Formation Professionnelle...",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": ["CD", "GN"]
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "contact@cjdevelopmenttc.com",
    "contactType": "Customer Service",
    "availableLanguage": ["French", "English"],
    "telephone": ["+243995136626", "+243999482140", "+224626146065"]
  },
  "sameAs": [
    "https://www.linkedin.com/company/CJDevelopmentCenter",
    "https://www.facebook.com/CJDevelopmentCenter",
    "https://x.com/CJDevelopmentCenter"
  ],
  "foundingDate": "2018",
  "areaServed": {
    "@type": "Place",
    "name": "Africa"
  }
}
```

## Common Issues & Fixes

### Issue: "No structured data found"

**Possible Causes:**
- Site not deployed
- Wrong URL
- Structured data not rendering

**Solutions:**
1. Verify site is live and accessible
2. Check page source for JSON-LD
3. Ensure `StructuredData` component is in layout
4. Clear browser cache and retry

### Issue: "Missing required field"

**Example:** Missing `logo` field

**Solution:**
1. Check `components/StructuredData.tsx`
2. Ensure `/logo.png` exists in `public/` folder
3. Verify URL is correct and accessible

### Issue: "Invalid date format"

**Solution:**
- Ensure dates are in ISO 8601 format (YYYY-MM-DD)
- Check `foundingDate` in structured data

### Issue: "Invalid URL"

**Solution:**
- Verify all URLs in structured data are absolute (include `https://`)
- Check that URLs are accessible

## Testing Checklist

- [ ] Homepage tested with Rich Results Test
- [ ] Formation detail page tested
- [ ] Article detail page tested
- [ ] No errors (red) in test results
- [ ] Warnings reviewed and addressed if critical
- [ ] JSON-LD validated manually with Schema.org validator
- [ ] All URLs in structured data are accessible
- [ ] Logo image is accessible

## Advanced Testing

### Test with cURL

```bash
curl -s "https://cjdevelopmenttc.com/fr" | grep -o '<script type="application/ld+json">.*</script>' | sed 's/<script type="application\/ld+json">//;s/<\/script>//' | jq .
```

### Test Multiple Pages

Create a script to test multiple URLs:

```bash
#!/bin/bash
URLS=(
  "https://cjdevelopmenttc.com/fr"
  "https://cjdevelopmenttc.com/fr/formations"
  "https://cjdevelopmenttc.com/fr/actualites"
)

for url in "${URLS[@]}"; do
  echo "Testing: $url"
  # Use Google's API or Rich Results Test
done
```

## Next Steps

After testing:
1. Fix any errors found
2. Address critical warnings
3. Re-test after fixes
4. Submit sitemap to Google Search Console
5. Monitor in Search Console for structured data recognition

## Resources

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- [Google Structured Data Guidelines](https://developers.google.com/search/docs/appearance/structured-data)
- [JSON-LD Playground](https://json-ld.org/playground/)
