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
  // ───── Nya märken ─────
  farligKurva: tri(`<path d="M42 76 L42 56 Q42 42 58 38 L58 32" stroke="#111" stroke-width="8" fill="none" stroke-linejoin="round"/><polygon points="50,34 58,22 66,34" fill="#111"/>`),
  korsningUtanForetrade: tri(`<path d="M50 28 L50 80" stroke="#111" stroke-width="11" stroke-linecap="round"/><path d="M30 56 L70 56" stroke="#111" stroke-width="5" stroke-linecap="round"/>`),
  cyklister: tri(`<circle cx="36" cy="66" r="9" stroke="#111" stroke-width="4" fill="none"/><circle cx="64" cy="66" r="9" stroke="#111" stroke-width="4" fill="none"/><path d="M36 66 L46 50 L58 50 L64 66 M46 50 L52 66 L58 50 M44 46 L50 46 M58 50 L56 42 L62 42" stroke="#111" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  radjur: tri(`<ellipse cx="46" cy="56" rx="15" ry="7" fill="#111"/><path d="M34 58 L32 76 M40 60 L40 76 M52 60 L54 76 M58 58 L62 76 M58 52 L64 38" stroke="#111" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="67" cy="36" rx="6" ry="4" fill="#111"/><path d="M64 33 L62 24 M64 28 L60 26 M68 33 L70 24 M70 28 L74 26" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/>`),
  avsmalnande: tri(`<path d="M34 80 L34 64 L42 52 L42 36 M66 80 L66 64 L58 52 L58 36" stroke="#111" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  plankorsningBommar: tri(`<rect x="28" y="50" width="44" height="7" fill="#111"/><rect x="28" y="64" width="44" height="7" fill="#111"/><rect x="30" y="42" width="6" height="36" fill="#111"/><rect x="64" y="42" width="6" height="36" fill="#111"/>`),
  kryssmarke: `
<svg viewBox="0 0 100 100" class="sign" aria-hidden="true">
  <g transform="rotate(35 50 50)"><rect x="4" y="40" width="92" height="20" fill="#fff" stroke="#d6001c" stroke-width="5"/></g>
  <g transform="rotate(-35 50 50)"><rect x="4" y="40" width="92" height="20" fill="#fff" stroke="#d6001c" stroke-width="5"/></g>
  <g transform="rotate(35 50 50)"><rect x="6.5" y="42.5" width="87" height="15" fill="#fff"/></g>
</svg>`,
  forbudVanster: circleProhib(`<path d="M62 78 L62 60 Q62 50 52 50 L40 50" stroke="#111" stroke-width="8" fill="none"/><polygon points="26,50 42,38 42,62" fill="#111"/><line x1="22" y1="22" x2="78" y2="78" stroke="#d6001c" stroke-width="9"/>`),
  forbudUsvang: circleProhib(`<path d="M64 76 L64 44 Q64 28 50 28 Q36 28 36 44 L36 58" stroke="#111" stroke-width="8" fill="none"/><polygon points="26,56 46,56 36,72" fill="#111"/><line x1="22" y1="22" x2="78" y2="78" stroke="#d6001c" stroke-width="9"/>`),
  forbudMotorfordon: circleProhib(`<circle cx="37" cy="40" r="6" stroke="#111" stroke-width="4" fill="none"/><circle cx="63" cy="40" r="6" stroke="#111" stroke-width="4" fill="none"/><path d="M40 34 L48 28 L58 28 L62 34 Z" fill="#111"/><path d="M58 28 L56 22 L62 22" stroke="#111" stroke-width="3" fill="none"/><path d="M28 64 L33 54 L67 54 L72 64 Z" fill="#111"/><rect x="25" y="62" width="50" height="10" rx="3" fill="#111"/><circle cx="36" cy="74" r="5" fill="#111"/><circle cx="64" cy="74" r="5" fill="#111"/>`),
  enkelriktad: blueSquare(`<path d="M50 84 L50 34" stroke="#fff" stroke-width="14"/><polygon points="50,14 74,40 26,40" fill="#fff"/>`),
  gagata: blueSquare(`<rect x="12" y="12" width="76" height="76" fill="#fff"/><circle cx="40" cy="28" r="6" fill="#111"/><path d="M40 36 L40 58 L32 78 M40 58 L48 78 M40 42 L30 54 M40 42 L52 50" stroke="#111" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="62" cy="48" r="5" fill="#111"/><path d="M62 54 L62 66 L56 78 M62 66 L68 78 M62 58 L52 50" stroke="#111" stroke-width="4" fill="none" stroke-linecap="round"/>`),
  cykelbana: blueCircle(`<circle cx="32" cy="62" r="12" stroke="#fff" stroke-width="5" fill="none"/><circle cx="68" cy="62" r="12" stroke="#fff" stroke-width="5" fill="none"/><path d="M32 62 L44 42 L62 42 L68 62 M44 42 L52 62 L62 42 M40 36 L48 36 M62 42 L60 32 L68 32" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  gangCykelbana: blueCircle(`<circle cx="50" cy="16" r="5" fill="#fff"/><path d="M50 22 L50 36 L44 46 M50 36 L56 46 M50 26 L42 32 M50 26 L58 32" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="34" cy="70" r="10" stroke="#fff" stroke-width="4" fill="none"/><circle cx="66" cy="70" r="10" stroke="#fff" stroke-width="4" fill="none"/><path d="M34 70 L44 54 L60 54 L66 70 M44 54 L50 70 L60 54 M41 50 L48 50" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  atervandsvag: blueSquare(`<rect x="40" y="34" width="20" height="54" fill="#fff"/><rect x="22" y="16" width="56" height="18" fill="#d6001c"/>`),
  motortrafikled: blueSquare(`<path d="M16 60 L22 46 Q26 40 34 40 L60 40 Q66 40 72 48 L84 52 L84 62 L16 62 Z" fill="#fff"/><circle cx="32" cy="64" r="8" fill="#fff" stroke="#0a5bb5" stroke-width="3"/><circle cx="70" cy="64" r="8" fill="#fff" stroke="#0a5bb5" stroke-width="3"/>`),
  motorvagSlut: blueSquare(`<path d="M30 88 L44 30 M70 88 L56 30 M50 88 L50 78 M50 66 L50 56 M50 44 L50 36" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M30 28 q20 -18 40 0" stroke="#fff" stroke-width="6" fill="none"/><line x1="12" y1="88" x2="88" y2="12" stroke="#d6001c" stroke-width="9"/>`),
  tattbebyggt: blueSquare(`<path d="M14 76 L14 52 L26 40 L38 52 L38 44 L50 30 L62 44 L62 56 L72 48 L86 60 L86 76 Z" fill="#fff"/><rect x="47" y="58" width="7" height="18" fill="#0a5bb5"/><rect x="22" y="58" width="7" height="7" fill="#0a5bb5"/><rect x="71" y="62" width="7" height="7" fill="#0a5bb5"/>`),
  annanFara: tri(`<rect x="45" y="30" width="10" height="32" rx="3" fill="#111"/><circle cx="50" cy="72" r="6" fill="#111"/>`),
  farthinder: tri(`<path d="M24 72 L34 72 Q50 46 66 72 L76 72" stroke="#111" stroke-width="7" fill="none" stroke-linejoin="round"/>`),
  maxHast70: circleProhib(`<text x="50" y="64" font-size="40" font-weight="900" fill="#111" text-anchor="middle" font-family="Arial, sans-serif">70</text>`),
};
