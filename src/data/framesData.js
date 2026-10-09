export const FRAMES = [
  {
    id: 'navigator-crystal',
    name: 'JJ Navigator Crystal',
    subname: 'Crystal Acetate & Titanium Double-Bar',
    shape: 'Navigator',
    price: 3499,
    rating: 4.98,
    reviews: 320,
    badge: 'Flagship Edition',
    image: '/images/navigator.jpg',
    frontChassis: '/images/frame_navigator.png',
    bridgeYRatio: 0.271,
    aspectRatio: 2.46,
    spanRatio: 0.48,
    lensKey: 'navigator',
    opticalPupilYRatio: 0.38,
    idealFaceShapes: ['Oval', 'Round', 'Square', 'Heart', 'Diamond'],
    description: 'Bespoke geometric navigator crafted from translucent Italian crystal acetate and polished Japanese beta-titanium double brow bars.',
    specs: {
      lensWidth: '56 mm',
      bridgeWidth: '16 mm',
      templeLength: '146 mm',
      weight: '18.2g',
      material: 'Crystal Acetate & Beta-Titanium'
    },
    colors: [
      { id: 'crystal-grey', name: 'Smoky Crystal Grey', hex: '#cbd5e1', transmission: 0.65, metalness: 0.18, roughness: 0.04, clearcoat: 1.0 },
      { id: 'crystal-clear', name: 'Diamond Crystal', hex: '#f8fafc', transmission: 0.78, metalness: 0.12, roughness: 0.03, clearcoat: 1.0 },
      { id: 'black-titanium', name: 'Obsidian Black & Silver', hex: '#09090b', transmission: 0.0, metalness: 0.25, roughness: 0.08, clearcoat: 1.0 }
    ],
    defaultColor: 'crystal-grey',
    defaultLens: 'clear'
  },
  {
    id: 'aviator-elite',
    name: 'Aviator Elite',
    subname: 'Iconic Teardrop Double-Bar',
    shape: 'Aviator',
    price: 2999,
    rating: 4.9,
    reviews: 142,
    badge: 'Best Seller',
    image: '/images/aviator.jpg',
    frontChassis: '/images/frame_aviator.png',
    bridgeYRatio: 0.158,
    aspectRatio: 2.64,
    spanRatio: 0.48,
    lensKey: 'aviator',
    opticalPupilYRatio: 0.36,
    idealFaceShapes: ['Square', 'Heart', 'Oval'],
    description: 'Precision-engineered dual bridge aviator crafted from aerospace-grade beta titanium with teardrop contouring.',
    specs: {
      lensWidth: '58 mm',
      bridgeWidth: '14 mm',
      templeLength: '145 mm',
      weight: '16.5g',
      material: 'Beta-Titanium Wire'
    },
    colors: [
      { id: 'gold', name: '18K Polished Gold', hex: '#eab308', metalness: 0.98, roughness: 0.12 },
      { id: 'silver', name: 'Brushed Platinum', hex: '#e2e8f0', metalness: 0.98, roughness: 0.1 },
      { id: 'black', name: 'Stealth Gunmetal', hex: '#1e293b', metalness: 0.85, roughness: 0.25 }
    ],
    defaultColor: 'gold',
    defaultLens: 'clear'
  },
  {
    id: 'wayfarer-icon',
    name: 'Wayfarer Icon',
    subname: 'Handcrafted Sculpted Acetate',
    shape: 'Square',
    price: 2499,
    rating: 4.8,
    reviews: 98,
    badge: 'Staff Pick',
    image: '/images/wayfarer.jpg',
    frontChassis: '/images/frame_wayfarer.png',
    bridgeYRatio: 0.253,
    aspectRatio: 2.78,
    spanRatio: 0.48,
    lensKey: 'wayfarer',
    opticalPupilYRatio: 0.39,
    idealFaceShapes: ['Round', 'Oval'],
    description: 'Bold geometric silhouette milled from premium Italian Mazzucchelli acetate with bevel-cut contours and reinforced 5-barrel hinges.',
    specs: {
      lensWidth: '52 mm',
      bridgeWidth: '18 mm',
      templeLength: '148 mm',
      weight: '24.2g',
      material: 'Italian Mazzucchelli Acetate'
    },
    colors: [
      { id: 'black', name: 'Obsidian Gloss', hex: '#09090b', metalness: 0.05, roughness: 0.1, clearcoat: 1.0 },
      { id: 'tortoise', name: 'Havana Tortoise', hex: '#451a03', metalness: 0.05, roughness: 0.15, clearcoat: 0.95 },
      { id: 'matte-black', name: 'Matte Onyx', hex: '#27272a', metalness: 0.1, roughness: 0.6, clearcoat: 0.2 }
    ],
    defaultColor: 'black',
    defaultLens: 'clear'
  },
  {
    id: 'round-artisan',
    name: 'Round Artisan',
    subname: 'Japanese Minimalist Wire',
    shape: 'Round',
    price: 3199,
    rating: 4.95,
    reviews: 215,
    badge: 'Trending',
    image: '/images/round.jpg',
    frontChassis: '/images/frame_round.png',
    bridgeYRatio: 0.244,
    aspectRatio: 2.50,
    spanRatio: 0.48,
    lensKey: 'round',
    opticalPupilYRatio: 0.42,
    idealFaceShapes: ['Square', 'Diamond', 'Heart'],
    description: 'A tribute to classical bespoke aesthetics. Featherlight circular rims designed to frame cheekbones with subtle architectural grace.',
    specs: {
      lensWidth: '49 mm',
      bridgeWidth: '20 mm',
      templeLength: '142 mm',
      weight: '12.8g',
      material: 'Pure Japanese Titanium'
    },
    colors: [
      { id: 'gold', name: 'Champagne Gold', hex: '#ca8a04', metalness: 0.95, roughness: 0.14 },
      { id: 'silver', name: 'Sterling Silver', hex: '#cbd5e1', metalness: 0.98, roughness: 0.1 }
    ],
    defaultColor: 'gold',
    defaultLens: 'clear'
  },
  {
    id: 'clubmaster-browline',
    name: 'Clubmaster Classic',
    subname: 'Vintage Acetate Browline & Gold Rims',
    shape: 'Clubmaster',
    price: 2799,
    rating: 4.92,
    reviews: 184,
    badge: 'Retro Icon',
    image: '/images/clubmaster.jpg',
    frontChassis: '/images/frame_clubmaster.png',
    bridgeYRatio: 0.212,
    aspectRatio: 3.02,
    spanRatio: 0.48,
    lensKey: 'clubmaster',
    opticalPupilYRatio: 0.38,
    idealFaceShapes: ['Oval', 'Round', 'Square', 'Diamond'],
    description: 'Timeless mid-century browline design combining glossy acetate brows with gold-plated titanium eye wires and sculpted bridge.',
    specs: {
      lensWidth: '51 mm',
      bridgeWidth: '19 mm',
      templeLength: '145 mm',
      weight: '20.5g',
      material: 'Acetate & Gold-Plated Alloy'
    },
    colors: [
      { id: 'black-gold', name: 'Gloss Black & 18K Gold', hex: '#09090b', metalness: 0.8, roughness: 0.15 },
      { id: 'havana-gold', name: 'Amber Havana & Gold', hex: '#78350f', metalness: 0.75, roughness: 0.2 }
    ],
    defaultColor: 'black-gold',
    defaultLens: 'clear'
  },
  {
    id: 'hexagonal-gold',
    name: 'Hexagonal Geometric',
    subname: 'Architectural Polygonal Titanium',
    shape: 'Geometric',
    price: 2899,
    rating: 4.88,
    reviews: 126,
    badge: 'Modern Chic',
    image: '/images/hexagonal.jpg',
    frontChassis: '/images/frame_hexagonal.png',
    bridgeYRatio: 0.295,
    aspectRatio: 2.66,
    spanRatio: 0.48,
    lensKey: 'hexagonal',
    opticalPupilYRatio: 0.40,
    idealFaceShapes: ['Round', 'Oval', 'Heart'],
    description: 'Striking multi-faceted hexagonal rims crafted from featherweight gold titanium wire, featuring filigree temple detailing.',
    specs: {
      lensWidth: '53 mm',
      bridgeWidth: '18 mm',
      templeLength: '145 mm',
      weight: '14.2g',
      material: 'Polished Beta-Titanium'
    },
    colors: [
      { id: 'gold', name: 'Polished 18K Gold', hex: '#eab308', metalness: 0.95, roughness: 0.12 },
      { id: 'rosegold', name: 'Rose Gold Shimmer', hex: '#fb7185', metalness: 0.92, roughness: 0.15 }
    ],
    defaultColor: 'gold',
    defaultLens: 'clear'
  },
  {
    id: 'cateye-couture',
    name: 'Cat-Eye Couture',
    subname: 'Sculpted Dramatic Wing',
    shape: 'Cat-Eye',
    price: 3299,
    rating: 4.85,
    reviews: 76,
    badge: 'Luxury Runway',
    image: '/images/cateye.jpg',
    frontChassis: '/images/frame_cateye.png',
    bridgeYRatio: 0.275,
    aspectRatio: 2.50,
    spanRatio: 0.48,
    lensKey: 'cateye',
    opticalPupilYRatio: 0.41,
    idealFaceShapes: ['Diamond', 'Round', 'Square', 'Heart'],
    description: 'High-fashion editorial elegance featuring sweeping cat-eye crests and hand-polished facets that deliver an instant optical face-lift effect.',
    specs: {
      lensWidth: '54 mm',
      bridgeWidth: '16 mm',
      templeLength: '144 mm',
      weight: '21.0g',
      material: 'Sculpted Bio-Acetate'
    },
    colors: [
      { id: 'black', name: 'Midnight Piano Gloss', hex: '#09090b', metalness: 0.08, roughness: 0.1, clearcoat: 1.0 },
      { id: 'gold-edge', name: 'Blush Gold Edge', hex: '#eab308', metalness: 0.85, roughness: 0.15 }
    ],
    defaultColor: 'black',
    defaultLens: 'clear'
  },
  {
    id: 'architect-rimless',
    name: 'Architect Rimless',
    subname: 'Frameless Tech Silhouette',
    shape: 'Rimless',
    price: 3999,
    rating: 4.9,
    reviews: 64,
    badge: 'New Arrival',
    image: '/images/rimless.jpg',
    frontChassis: '/images/frame_rimless.png',
    bridgeYRatio: 0.286,
    aspectRatio: 3.52,
    spanRatio: 0.48,
    lensKey: 'rimless',
    opticalPupilYRatio: 0.40,
    idealFaceShapes: ['Oval', 'Round', 'Heart'],
    description: 'Zero frame obstruction with diamond-beveled lens edges, custom cylindrical titanium bridge, and featherweight silicone grip temples.',
    specs: {
      lensWidth: '55 mm',
      bridgeWidth: '17 mm',
      templeLength: '145 mm',
      weight: '9.4g',
      material: 'Memory Titanium / Rimless'
    },
    colors: [
      { id: 'silver', name: 'Satin Titanium', hex: '#cbd5e1', metalness: 0.98, roughness: 0.15 },
      { id: 'black', name: 'Dark Ruthenium', hex: '#334155', metalness: 0.9, roughness: 0.25 }
    ],
    defaultColor: 'silver',
    defaultLens: 'clear'
  }
];

export const LENS_TINTS = [
  {
    id: 'clear',
    name: 'Zeiss Anti-Glare Clear',
    subname: 'Sapphire & emerald AR coating with crystal specular glint',
    transmission: 0.96,
    opacity: 0.18,
    colorHex: '#f8fafc',
    reflectionColorHex: '#38bdf8',
    roughness: 0.02,
    metalness: 0.05,
    isSunglasses: false
  },
  {
    id: 'polarized-green',
    name: 'G-15 Polarized Smoke',
    subname: 'Iconic aviator deep military green/grey optical glass',
    transmission: 0.35,
    opacity: 0.88,
    colorHex: '#14281d',
    reflectionColorHex: '#4ade80',
    roughness: 0.04,
    metalness: 0.25,
    isSunglasses: true
  },
  {
    id: 'gradient-smoke',
    name: 'Gradient Midnight',
    subname: 'High-fashion deep charcoal fading to crystal clear',
    transmission: 0.42,
    opacity: 0.82,
    colorHex: '#0f172a',
    reflectionColorHex: '#cbd5e1',
    roughness: 0.04,
    metalness: 0.20,
    isSunglasses: true
  },
  {
    id: 'amber-bronze',
    name: 'Bronze Amber Drive',
    subname: 'High-contrast warm driving bronze with golden sheen',
    transmission: 0.40,
    opacity: 0.78,
    colorHex: '#451a03',
    reflectionColorHex: '#f59e0b',
    roughness: 0.04,
    metalness: 0.25,
    isSunglasses: true
  },
  {
    id: 'sapphire-mirror',
    name: 'Sapphire Mirror Luxe',
    subname: 'Polarized cobalt mirror with brilliant flash glint',
    transmission: 0.28,
    opacity: 0.85,
    colorHex: '#0c4a6e',
    reflectionColorHex: '#38bdf8',
    roughness: 0.03,
    metalness: 0.65,
    isSunglasses: true
  }
];
