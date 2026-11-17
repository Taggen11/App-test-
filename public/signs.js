// Förenklade vägmärken ritade som SVG (inspirerade av svenska märken).
const tri = (inner, down = false) => `
<svg viewBox="0 0 100 92" class="sign" aria-hidden="true">
  <polygon points="${down ? "4,6 96,6 50,88" : "50,4 96,86 4,86"}" fill="#ffd200" stroke="#d6001c" stroke-width="9" stroke-linejoin="round"/>
  ${inner}
</svg>`;
const circleProhib = (inner, bg = "#ffd200") => `
<svg viewBox="0 0 100 100" class="sign" aria-hidden="true">
  <circle cx="50" cy="50" r="44" fill="${bg}" stroke="#d6001c" stroke-width="10"/>
  ${inner}
</svg>`;
const blueCircle = (inner) => `
<svg viewBox="0 0 100 100" class="sign" aria-hidden="true">
  <circle cx="50" cy="50" r="46" fill="#0a5bb5" stroke="#fff" stroke-width="3"/>
  ${inner}
</svg>`;
const blueSquare = (inner) => `
<svg viewBox="0 0 100 100" class="sign" aria-hidden="true">
  <rect x="4" y="4" width="92" height="92" rx="8" fill="#0a5bb5" stroke="#fff" stroke-width="3"/>
  ${inner}
</svg>`;

export const SIGNS = {
  vajningsplikt: tri("", true),
  stopp: `
<svg viewBox="0 0 100 100" class="sign" aria-hidden="true">
  <polygon points="30,3 70,3 97,30 97,70 70,97 30,97 3,70 3,30" fill="#d6001c" stroke="#fff" stroke-width="4"/>
  <text x="50" y="62" font-size="28" font-weight="900" fill="#fff" text-anchor="middle" font-family="Arial, sans-serif">STOP</text>
</svg>`,
  huvudled: `
<svg viewBox="0 0 100 100" class="sign" aria-hidden="true">
  <polygon points="50,3 97,50 50,97 3,50" fill="#fff" stroke="#333" stroke-width="2"/>
  <polygon points="50,18 82,50 50,82 18,50" fill="#ffd200"/>
</svg>`,
  huvudledUpphor: `
<svg viewBox="0 0 100 100" class="sign" aria-hidden="true">
  <polygon points="50,3 97,50 50,97 3,50" fill="#fff" stroke="#333" stroke-width="2"/>
  <polygon points="50,18 82,50 50,82 18,50" fill="#ffd200"/>
  <line x1="22" y1="78" x2="78" y2="22" stroke="#222" stroke-width="7"/>
</svg>`,
  alg: tri(`<path d="M30 70 L34 55 L45 52 L60 52 L66 46 L72 40 L74 48 L70 56 L68 70 M40 70 L40 58 M60 70 L60 58 M70 40 L64 32 M72 40 L80 34" stroke="#111" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  barn: tri(`<circle cx="42" cy="40" r="5" fill="#111"/><circle cx="60" cy="44" r="4" fill="#111"/><path d="M42 47 L40 62 L34 74 M40 62 L46 74 M42 50 L52 56 M60 50 L60 62 L56 74 M60 62 L64 74" stroke="#111" stroke-width="5" fill="none" stroke-linecap="round"/>`),
  korsning: tri(`<path d="M50 30 L50 78 M30 54 L70 54" stroke="#111" stroke-width="8" stroke-linecap="round"/>`),
  vagarbete: tri(`<circle cx="46" cy="38" r="5" fill="#111"/><path d="M46 45 L44 60 L36 74 M44 60 L52 74 M45 50 L58 58 L64 70" stroke="#111" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M60 74 L74 74 L70 66 Z" fill="#111"/>`),
  slirig: tri(`<path d="M38 64 q12 -6 24 0" stroke="#111" stroke-width="4" fill="none"/><rect x="40" y="40" width="20" height="14" rx="4" fill="#111"/><path d="M38 76 q6 -6 10 0 q6 6 12 0" stroke="#111" stroke-width="4" fill="none"/>`),
  maxHast50: circleProhib(`<text x="50" y="64" font-size="40" font-weight="900" fill="#111" text-anchor="middle" font-family="Arial, sans-serif">50</text>`),
  maxHast30: circleProhib(`<text x="50" y="64" font-size="40" font-weight="900" fill="#111" text-anchor="middle" font-family="Arial, sans-serif">30</text>`),
  forbudInfart: `
<svg viewBox="0 0 100 100" class="sign" aria-hidden="true">
  <circle cx="50" cy="50" r="46" fill="#d6001c"/>
  <rect x="18" y="42" width="64" height="16" fill="#fff"/>
</svg>`,
  parkeringsforbud: circleProhib(`<line x1="20" y1="20" x2="80" y2="80" stroke="#d6001c" stroke-width="10"/>`, "#0a5bb5"),
  stannandeforbud: circleProhib(`<line x1="20" y1="20" x2="80" y2="80" stroke="#d6001c" stroke-width="10"/><line x1="80" y1="20" x2="20" y2="80" stroke="#d6001c" stroke-width="10"/>`, "#0a5bb5"),
  omkorningsforbud: circleProhib(`<rect x="22" y="42" width="22" height="18" rx="4" fill="#d6001c"/><rect x="56" y="42" width="22" height="18" rx="4" fill="#111"/>`),
  pabjudenHoger: blueCircle(`<path d="M28 50 L66 50 M54 34 L70 50 L54 66" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  cirkulation: blueCircle(`<path d="M50 24 a26 26 0 1 1 -22 12" stroke="#fff" stroke-width="8" fill="none"/><path d="M18 30 L30 34 L30 20" fill="#fff"/>`),
  overgangsstalle: blueSquare(`<polygon points="50,14 88,86 12,86" fill="#fff"/><circle cx="50" cy="44" r="5" fill="#111"/><path d="M50 50 L48 64 L42 78 M48 64 L56 78 M49 54 L58 60" stroke="#111" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="26" y="80" width="48" height="4" fill="#111"/>`),
  motorvag: blueSquare(`<path d="M30 88 L44 30 M70 88 L56 30 M50 88 L50 78 M50 66 L50 56 M50 44 L50 36" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M30 28 q20 -18 40 0" stroke="#fff" stroke-width="6" fill="none"/>`),
  motesplats: blueSquare(`<text x="50" y="70" font-size="56" font-weight="900" fill="#fff" text-anchor="middle" font-family="Arial, sans-serif">M</text>`),
  parkering: blueSquare(`<text x="50" y="72" font-size="62" font-weight="900" fill="#fff" text-anchor="middle" font-family="Arial, sans-serif">P</text>`),
  gangfart: blueSquare(`<rect x="14" y="14" width="72" height="72" fill="#fff"/><circle cx="34" cy="34" r="5" fill="#111"/><path d="M34 40 L32 54 L26 66 M32 54 L38 66" stroke="#111" stroke-width="4" fill="none"/><rect x="50" y="56" width="26" height="12" rx="4" fill="#111"/><path d="M58 26 L70 26 L70 44 L58 44 Z" fill="#111"/>`),
};
