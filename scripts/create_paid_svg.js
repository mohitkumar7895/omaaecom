const fs = require('fs');

// We can convert the pure vector SVG with exact paths and zero background to a crisp stamp
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  <g transform="rotate(-12 60 60)">
    <!-- Scalloped 16-point Stamp Ring -->
    <path 
      d="M 60 6 
         C 68 8, 73 14, 78 17 C 84 20, 91 21, 95 27 C 100 32, 101 39, 105 45 C 109 52, 114 57, 114 60 C 114 63, 109 68, 105 75 C 101 81, 100 88, 95 93 C 91 99, 84 100, 78 103 C 73 106, 68 112, 60 114 C 52 112, 47 106, 42 103 C 36 100, 29 99, 25 93 C 20 88, 19 81, 15 75 C 11 68, 6 63, 6 60 C 6 57, 11 52, 15 45 C 19 39, 20 32, 25 27 C 29 21, 36 20, 42 17 C 47 14, 52 8, 60 6 Z" 
      fill="#00853c" 
    />
    
    <!-- Outer Inset Ring -->
    <circle cx="60" cy="60" r="44" fill="none" stroke="#ffffff" stroke-width="2" />
    
    <!-- Top Arc Line -->
    <path d="M 30 52 A 34 34 0 0 1 90 52" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />

    <!-- Center Text: PAID -->
    <text 
      x="60" 
      y="57" 
      text-anchor="middle" 
      fill="#ffffff" 
      font-family="Arial, Helvetica, sans-serif" 
      font-size="19" 
      font-weight="900" 
      letter-spacing="1"
    >
      PAID
    </text>

    <!-- Bottom Text: THANK YOU -->
    <text 
      x="60" 
      y="74" 
      text-anchor="middle" 
      fill="#ffffff" 
      font-family="Arial, Helvetica, sans-serif" 
      font-size="7.5" 
      font-weight="800" 
      letter-spacing="1"
    >
      THANK YOU
    </text>

    <!-- Bottom Arc Line -->
    <path d="M 32 68 A 34 34 0 0 0 88 68" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
  </g>
</svg>`;

fs.writeFileSync('public/paid.svg', svgContent, 'utf8');
console.log('Created ultra-crisp transparent public/paid.svg');
