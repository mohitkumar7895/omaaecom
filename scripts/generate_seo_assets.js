const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateAssets() {
  const publicDir = path.resolve(__dirname, '../public');

  // 1. Convert logoomaa.webp to high-res logo.png
  const logoWebpPath = path.join(publicDir, 'logoomaa.webp');
  const logoPngPath = path.join(publicDir, 'logo.png');
  if (fs.existsSync(logoWebpPath)) {
    await sharp(logoWebpPath).png().toFile(logoPngPath);
    console.log('✅ Created public/logo.png');
  }

  // 2. Generate og-image.jpg (1200x630) with rich branding & service badges
  const svgBanner = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e1b4b" />
          <stop offset="40%" stop-color="#312e81" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
        <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.12)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0.04)" />
        </linearGradient>
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#6366f1" />
          <stop offset="100%" stop-color="#8b5cf6" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bgGrad)" />
      
      <!-- Ambient light circles -->
      <circle cx="120" cy="120" r="280" fill="#4f46e5" opacity="0.2" />
      <circle cx="1080" cy="480" r="260" fill="#7c3aed" opacity="0.2" />
      
      <!-- Top Brand Tag -->
      <rect x="80" y="55" width="260" height="42" rx="21" fill="url(#accentGrad)" />
      <text x="210" y="82" fill="#ffffff" font-family="Segoe UI, Roboto, sans-serif" font-size="17" font-weight="bold" text-anchor="middle" letter-spacing="1">
        OMAA COMPANY
      </text>

      <!-- Main Headline -->
      <text x="80" y="150" fill="#ffffff" font-family="Segoe UI, Roboto, sans-serif" font-size="46" font-weight="800" letter-spacing="-0.5">
        Doorstep Appliance Repair
      </text>
      <text x="80" y="202" fill="#a5b4fc" font-family="Segoe UI, Roboto, sans-serif" font-size="38" font-weight="700">
        &amp; Maintenance Services
      </text>

      <!-- Service Highlights 3 Cards -->
      <!-- Card 1: RO Repair & Service -->
      <rect x="80" y="250" width="320" height="190" rx="16" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" />
      <rect x="105" y="275" width="46" height="46" rx="12" fill="#0284c7" />
      <text x="128" y="306" fill="#ffffff" font-family="Segoe UI, Roboto, sans-serif" font-size="22" font-weight="bold" text-anchor="middle">RO</text>
      <text x="105" y="352" fill="#ffffff" font-family="Segoe UI, Roboto, sans-serif" font-size="21" font-weight="700">RO Repair &amp; Service</text>
      <text x="105" y="382" fill="#cbd5e1" font-family="Segoe UI, Roboto, sans-serif" font-size="14">Water Purifiers, Filters &amp; AMC</text>
      <text x="105" y="414" fill="#38bdf8" font-family="Segoe UI, Roboto, sans-serif" font-size="15" font-weight="700">Starts ₹160 • All Brands</text>

      <!-- Card 2: Refrigerator Repair -->
      <rect x="440" y="250" width="320" height="190" rx="16" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" />
      <rect x="465" y="275" width="46" height="46" rx="12" fill="#4f46e5" />
      <text x="488" y="306" fill="#ffffff" font-family="Segoe UI, Roboto, sans-serif" font-size="22" font-weight="bold" text-anchor="middle">REF</text>
      <text x="465" y="352" fill="#ffffff" font-family="Segoe UI, Roboto, sans-serif" font-size="21" font-weight="700">Refrigerator Repair</text>
      <text x="465" y="382" fill="#cbd5e1" font-family="Segoe UI, Roboto, sans-serif" font-size="14">Single, Double Door &amp; Inverter</text>
      <text x="465" y="414" fill="#818cf8" font-family="Segoe UI, Roboto, sans-serif" font-size="15" font-weight="700">Starts ₹199 • Genuine Parts</text>

      <!-- Card 3: Washing Machine -->
      <rect x="800" y="250" width="320" height="190" rx="16" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" />
      <rect x="825" y="275" width="46" height="46" rx="12" fill="#7c3aed" />
      <text x="848" y="306" fill="#ffffff" font-family="Segoe UI, Roboto, sans-serif" font-size="22" font-weight="bold" text-anchor="middle">WM</text>
      <text x="825" y="352" fill="#ffffff" font-family="Segoe UI, Roboto, sans-serif" font-size="21" font-weight="700">Washing Machines</text>
      <text x="825" y="382" fill="#cbd5e1" font-family="Segoe UI, Roboto, sans-serif" font-size="14">Front &amp; Top Load, Jet Wash</text>
      <text x="825" y="414" fill="#c084fc" font-family="Segoe UI, Roboto, sans-serif" font-size="15" font-weight="700">Starts ₹199 • 30-Day Warranty</text>

      <!-- Bottom Trust Bar -->
      <line x1="80" y1="480" x2="1120" y2="480" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
      
      <!-- Trust badges -->
      <text x="80" y="525" fill="#4ade80" font-family="Segoe UI, Roboto, sans-serif" font-size="17" font-weight="bold">✓ 30-Day Service Warranty</text>
      <text x="360" y="525" fill="#4ade80" font-family="Segoe UI, Roboto, sans-serif" font-size="17" font-weight="bold">✓ Verified Technicians</text>
      <text x="640" y="525" fill="#4ade80" font-family="Segoe UI, Roboto, sans-serif" font-size="17" font-weight="bold">✓ Upfront Honest Pricing</text>
      <text x="940" y="525" fill="#38bdf8" font-family="Segoe UI, Roboto, sans-serif" font-size="17" font-weight="bold">📍 Delhi NCR Service</text>

      <text x="80" y="580" fill="#94a3b8" font-family="Segoe UI, Roboto, sans-serif" font-size="16">Call &amp; WhatsApp: +91 9999251966</text>
      <text x="1120" y="580" fill="#94a3b8" font-family="Segoe UI, Roboto, sans-serif" font-size="16" text-anchor="end">www.omaacompany.com</text>
    </svg>
  `;

  const ogImagePath = path.join(publicDir, 'og-image.jpg');
  await sharp(Buffer.from(svgBanner))
    .jpeg({ quality: 92 })
    .toFile(ogImagePath);
  console.log('✅ Created public/og-image.jpg (1200x630)');
}

generateAssets().catch(console.error);
