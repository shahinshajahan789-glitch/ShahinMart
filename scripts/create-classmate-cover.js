import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1250" width="1000" height="1250">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3875a6" />
      <stop offset="50%" stop-color="#2d6190" />
      <stop offset="100%" stop-color="#b6d5ec" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="25" stdDeviation="30" flood-color="#000000" flood-opacity="0.35" />
    </filter>
    <linearGradient id="foxDarkBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
    <linearGradient id="foxMidBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="foxLightBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7dd3fc" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
  </defs>

  <!-- Split background like in user photo -->
  <rect width="1000" height="1250" fill="url(#bgGrad)" />
  <polygon points="0,1250 1000,700 1000,1250" fill="#e2edf7" opacity="0.9" />

  <!-- Book Card with realistic shadow -->
  <g filter="url(#shadow)">
    <!-- Book Background -->
    <rect x="160" y="80" width="680" height="1020" rx="8" fill="#f97316" />
    
    <!-- Red Accent Top & Bottom Bands -->
    <rect x="160" y="80" width="680" height="24" rx="4" fill="#dc2626" />
    <rect x="160" y="1076" width="680" height="24" rx="4" fill="#dc2626" />

    <!-- Top Header Bar -->
    <!-- ITC Logo -->
    <g transform="translate(195, 120)">
      <polygon points="25,5 45,40 5,40" fill="#ffffff" />
      <polygon points="25,12 39,36 11,36" fill="#dc2626" />
      <text x="25" y="32" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle">ITC</text>
      <text x="25" y="52" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="#ffffff" text-anchor="middle">Enduring Value</text>
    </g>

    <!-- Classmate Brand Badge -->
    <g transform="translate(560, 115)">
      <rect x="0" y="0" width="220" height="52" rx="6" fill="#0f172a" />
      <text x="110" y="36" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="30" fill="#ffffff" text-anchor="middle" letter-spacing="1">
        classmate
      </text>
      <text x="110" y="70" font-family="'Outfit', Arial, sans-serif" font-weight="800" font-size="15" fill="#f8fafc" text-anchor="middle" letter-spacing="1.5">
        interaktiv <tspan font-weight="400" font-size="11" fill="#f8fafc">Series</tspan>
      </text>
    </g>

    <!-- Stylized Paper Tree Silhouettes -->
    <!-- Left Tree -->
    <path d="M 230 460 C 230 350 280 270 360 270 C 440 270 480 340 480 430 C 480 470 450 490 440 500 L 400 500 L 400 640 L 360 640 L 360 500 L 250 500 Z" fill="#ea580c" opacity="0.9" />
    <!-- Right Tree -->
    <path d="M 640 450 C 640 370 670 310 730 310 C 790 310 820 370 820 440 C 820 480 800 500 780 510 L 755 510 L 755 600 L 725 600 L 725 510 L 650 510 Z" fill="#ea580c" opacity="0.8" />

    <!-- Horizon Ground line -->
    <path d="M 160 600 L 840 600 L 840 850 L 160 850 Z" fill="#fb923c" opacity="0.4" />

    <!-- Origami Fox Drop Shadow -->
    <ellipse cx="610" cy="740" rx="90" ry="22" fill="#7c2d12" opacity="0.45" />

    <!-- Central Origami Fox 3D Polygons -->
    <g transform="translate(420, 420)">
      <!-- Left Ear -->
      <polygon points="80,0 20,110 80,110" fill="url(#foxLightBlue)" stroke="#ffffff" stroke-width="1.5" />
      <!-- Right Ear -->
      <polygon points="170,0 170,110 230,110" fill="url(#foxDarkBlue)" stroke="#ffffff" stroke-width="1.5" />
      <!-- Central Face/Forehead -->
      <polygon points="80,110 170,110 125,180" fill="url(#foxMidBlue)" stroke="#ffffff" stroke-width="1.5" />
      <!-- Left Cheek Fold -->
      <polygon points="20,110 80,110 125,180 30,220" fill="url(#foxLightBlue)" stroke="#ffffff" stroke-width="1.5" />
      <!-- Right Cheek Fold -->
      <polygon points="170,110 230,110 220,220 125,180" fill="url(#foxDarkBlue)" stroke="#ffffff" stroke-width="1.5" />
      <!-- Snout Tip / Nose -->
      <polygon points="125,180 115,220 135,220" fill="#0f172a" />
      <!-- Body Main Fold -->
      <polygon points="30,220 125,180 160,330 0,330" fill="url(#foxMidBlue)" stroke="#ffffff" stroke-width="1.5" />
      <!-- Body Right Shaded Flap -->
      <polygon points="125,180 220,220 200,330 160,330" fill="url(#foxDarkBlue)" stroke="#ffffff" stroke-width="1.5" />
      <!-- Folded Tail Accent on Right -->
      <polygon points="200,260 270,300 200,330" fill="url(#foxLightBlue)" stroke="#ffffff" stroke-width="1.5" />
    </g>

    <!-- ORIGAMI FOX Red Badge -->
    <g transform="translate(190, 780)">
      <!-- Left small label -->
      <rect x="0" y="0" width="160" height="74" rx="6" fill="#dc2626" />
      <text x="80" y="26" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="10.5" fill="#ffffff" text-anchor="middle">
        ENHANCE YOUR
      </text>
      <text x="80" y="44" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="10.5" fill="#ffffff" text-anchor="middle">
        CREATIVITY BY
      </text>
      <text x="80" y="62" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="9" fill="#fed7aa" text-anchor="middle">
        MAKING YOUR OWN
      </text>

      <!-- Big ORIGAMI FOX box -->
      <rect x="160" y="0" width="240" height="74" rx="6" fill="#b91c1c" />
      <text x="280" y="46" font-family="'Outfit', Arial, sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="1">
        ORIGAMI <tspan font-weight="700" font-size="24" fill="#fef08a">FOX</tspan>
      </text>
      <text x="280" y="65" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#fecaca" text-anchor="middle" letter-spacing="0.5">
        SCAN IMAGE TO KNOW MORE
      </text>
    </g>

    <!-- Bottom Features Strip -->
    <g transform="translate(190, 990)">
      <text x="0" y="45" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="16" fill="#ffffff" letter-spacing="0.5">
        EXERCISE NOTEBOOK
      </text>
      <text x="0" y="66" font-family="'Outfit', Arial, sans-serif" font-weight="700" font-size="13" fill="#fef08a" letter-spacing="0.5">
        WITH A FUN ACTIVITY
      </text>
    </g>

    <!-- Circular Origami Sheet Badge in Bottom Right -->
    <g transform="translate(680, 975)">
      <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#0284c7" stroke-width="4" />
      <path d="M 50 15 L 85 50 L 50 85 L 15 50 Z" fill="#38bdf8" />
      <polygon points="50,15 85,50 50,50" fill="#0284c7" />
      <text x="50" y="118" font-family="Arial, sans-serif" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">
        2 TEAR-OUT SHEETS
      </text>
    </g>
  </g>
</svg>`;

async function run() {
  await sharp(Buffer.from(svg))
    .png()
    .toFile('public/products/classmate-origami-fox.jpg');
  console.log('Classmate Origami Fox cover created successfully!');
}

run().catch(console.error);
