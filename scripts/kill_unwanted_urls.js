const fs = require('fs');

// 1. Update app/components/LocationSelector.tsx
const locPath = 'app/components/LocationSelector.tsx';
let locContent = fs.readFileSync(locPath, 'utf8').replace(/\r\n/g, '\n');

// Remove router.replace in initial load
locContent = locContent.replace(
`            if (shouldSyncCityUrl(pathname || "/") && !isPageReload()) {
              const slug = routeSlugForLocation(parsed);
              if (slug && pathname !== \`/\${slug}\`) router.replace(\`/\${slug}\`);
            }`,
``
);

// Remove router.replace in auto-detect
locContent = locContent.replace(
`          if (shouldSyncCityUrl(pathname || "/")) {
            const slug = routeSlugForLocation(finalDetected);
            if (slug && pathname !== \`/\${slug}\`) {
              router.replace(\`/\${slug}\`);
            }
          }`,
``
);

// Remove router.push in applyLocation
locContent = locContent.replace(
`    if (!pathname || !shouldSyncCityUrl(pathname)) return;
    const slug = routeSlugForLocation(finalLocation);
    if (!slug) return;
    const nextPath = \`/\${slug}\`;
    if (pathname !== nextPath) {
      router.push(nextPath);
    }`,
``
);

fs.writeFileSync(locPath, locContent.replace(/\n/g, '\r\n'), 'utf8');
console.log('✅ app/components/LocationSelector.tsx updated: router.push and router.replace removed completely.');

// 2. Update next.config.ts to add direct 301 redirects for d-dri and gh-zi-b-d
const nextConfigPath = 'next.config.ts';
let configContent = fs.readFileSync(nextConfigPath, 'utf8').replace(/\r\n/g, '\n');

const redirectTarget = `  async redirects() {
    return [`;

const redirectAddition = `  async redirects() {
    return [
      {
        source: "/d-dri",
        destination: "/",
        permanent: true,
      },
      {
        source: "/d-dri/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/gh-zi-b-d",
        destination: "/",
        permanent: true,
      },
      {
        source: "/gh-zi-b-d/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/dadri",
        destination: "/",
        permanent: true,
      },
      {
        source: "/dadri/:path*",
        destination: "/",
        permanent: true,
      },`;

if (configContent.includes(redirectTarget) && !configContent.includes('source: "/d-dri"')) {
  configContent = configContent.replace(redirectTarget, redirectAddition);
  fs.writeFileSync(nextConfigPath, configContent.replace(/\n/g, '\r\n'), 'utf8');
  console.log('✅ next.config.ts updated with permanent 301 redirects.');
}

