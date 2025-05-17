import { Artwork } from '@/types';

export const artworks: Artwork[] = [
  {
    id: 'digital-cosmos',
    title: 'Digital Cosmos',
    description: 'An exploration of the digital cosmos through abstract forms and colors. This piece combines particle systems and custom shaders to create an immersive space-like environment where viewers can navigate through fields of light and color.',
    year: 2023,
    category: '3D Model',
    thumbnail: 'https://pixabay.com/get/gfc1daa2494d3a6ec2d4a7053a4ebe32ebea6f56138ec66843ebe899308f7f3b4faf1ad275e04983a775fc537ddbf63564f0fb8c26756bc5254b06d1b2ee7cd91_1280.jpg',
    images: [
      'https://pixabay.com/get/gfc1daa2494d3a6ec2d4a7053a4ebe32ebea6f56138ec66843ebe899308f7f3b4faf1ad275e04983a775fc537ddbf63564f0fb8c26756bc5254b06d1b2ee7cd91_1280.jpg',
      'https://pixabay.com/get/g7a40e79b93b6115270ab5358b6db344d81ce868b234343f523ff46ffe89cb4b90f8946ceb9222b642ebaf3640e52d07e2dbeede84be6d0b7030003dc354f5a7f_1280.jpg'
    ],
    modelUrl: '/geometries/heart.gltf',
    techniques: ['WebGL', 'Custom Shaders', 'Particle Systems'],
    dimensions: '1920 x 1080 px',
    featured: true
  },
  {
    id: 'neural-structures',
    title: 'Neural Structures',
    description: 'Inspired by neural networks and brain connectivity, this piece visualizes the complex structures of artificial intelligence. The interconnected glowing nodes represent data points, while the flowing connections illustrate the movement of information through the network.',
    year: 2023,
    category: 'Abstract Render',
    thumbnail: 'https://pixabay.com/get/gd78eafacbb7d58e20bf1325df58d9bf1ce6110dc6855aa27d74f387e6102961d79c35e80183d6517a270687f98e18071398b576273dbb8b5fef1cdf86c462220_1280.jpg',
    images: [
      'https://pixabay.com/get/gd78eafacbb7d58e20bf1325df58d9bf1ce6110dc6855aa27d74f387e6102961d79c35e80183d6517a270687f98e18071398b576273dbb8b5fef1cdf86c462220_1280.jpg',
      'https://pixabay.com/get/gec28a40a888c8572961e381e5c8ec34c70ea167fe90c057a5d9baf4f746564478ecc048377f2e91bd9b0e5e97d2c8006abb7fa3e2e4729b2b2eaa1bbfb5cba46_1280.jpg'
    ],
    techniques: ['3D Modeling', 'Raytracing', 'Procedural Generation'],
    dimensions: '4K Resolution',
    featured: true
  },
  {
    id: 'geometric-harmony',
    title: 'Geometric Harmony',
    description: 'This piece explores the balance and tension between primitive geometric forms. Through careful composition and material studies, the work creates a harmonious interplay of light, shadow, and reflection across multiple geometric objects.',
    year: 2022,
    category: 'Digital Sculpture',
    thumbnail: 'https://pixabay.com/get/gaef9043ceac840472ca4acfd1ee0f4be71b0d612adee9266766d783dce2f845db058d7b87928d4db7f727ea608bf4f2d171bdb2305db61af79bab08d4f9cc1fb_1280.jpg',
    images: [
      'https://pixabay.com/get/gaef9043ceac840472ca4acfd1ee0f4be71b0d612adee9266766d783dce2f845db058d7b87928d4db7f727ea608bf4f2d171bdb2305db61af79bab08d4f9cc1fb_1280.jpg',
      'https://pixabay.com/get/g23a216060a04463b94fcb2e83f2009230afff42e03b79aa2759e880a1435d9a287904563c7730959ccae22c66c5b002dc928b2c8c80b16004aeb40cb0cf1534c_1280.jpg'
    ],
    modelUrl: '/geometries/heart.gltf',
    techniques: ['3D Modeling', 'Material Studies', 'Lighting Design'],
    dimensions: 'Variable Dimensions',
    featured: true
  },
  {
    id: 'fluid-dreams',
    title: 'Fluid Dreams',
    description: 'An exploration of fluidity and motion through digital medium. This piece uses advanced particle simulations to create organic, flowing movements that mimic natural fluid dynamics while introducing unexpected color transitions and temporal shifts.',
    year: 2023,
    category: 'Abstract Render',
    thumbnail: 'https://pixabay.com/get/gb7579da2bdce96359fa26aa9ec578c3ee882e9be100fe60d464017749a5fa59b5c51641b949209117b2526e747832a5011e715885a39e7c07209df4331f8ca2f_1280.jpg',
    images: [
      'https://pixabay.com/get/gb7579da2bdce96359fa26aa9ec578c3ee882e9be100fe60d464017749a5fa59b5c51641b949209117b2526e747832a5011e715885a39e7c07209df4331f8ca2f_1280.jpg',
      'https://pixabay.com/get/g45ad3e4e63541ea414e5b260926d116640938aae63f7d0e6aee2ece54868cf2ff2bf7e93d8f4c6097052e535932633f3eae483cfe7032761c425c9d5114ef6ae_1280.jpg'
    ],
    techniques: ['Fluid Simulation', 'Particle Systems', 'Color Theory'],
    dimensions: '1920 x 1080 px',
    featured: false
  },
  {
    id: 'synthetic-organism',
    title: 'Synthetic Organism',
    description: 'A conceptual exploration of artificial life and biomimicry in digital art. This piece imagines a synthetic organism that blends mechanical and organic elements, challenging our understanding of what constitutes "life" in the digital age.',
    year: 2022,
    category: 'Digital Sculpture',
    thumbnail: 'https://pixabay.com/get/g69d9ab1c6c7e4f5f91095caf69a708e0ef27f483cdef9a12e60ec0593f2a510ff777167a7d46366156bfe48d7421a8565881ce4cc7f9d2d875f832ed094433b9_1280.jpg',
    images: [
      'https://pixabay.com/get/g69d9ab1c6c7e4f5f91095caf69a708e0ef27f483cdef9a12e60ec0593f2a510ff777167a7d46366156bfe48d7421a8565881ce4cc7f9d2d875f832ed094433b9_1280.jpg',
      'https://pixabay.com/get/gd366680c7d3033c2a68264e82a517eca5666f75e4597ba811f62234d9720a0410d298059a30247f2c867180dda1173db7b568169321e4c1c0d902688876a7f59_1280.jpg'
    ],
    modelUrl: '/geometries/heart.gltf',
    techniques: ['Digital Sculpting', 'Procedural Texturing', 'Conceptual Design'],
    dimensions: 'Variable Dimensions',
    featured: false
  },
  {
    id: 'quantum-architecture',
    title: 'Quantum Architecture',
    description: 'This work imagines architectural spaces influenced by quantum mechanics principles. The impossible structures and non-Euclidean geometries create spaces that could only exist in the digital realm, challenging our perception of spatial reality.',
    year: 2023,
    category: '3D Model',
    thumbnail: 'https://pixabay.com/get/g29a9de64043d04f5c85344d7844e4da8bb461796c9f471bb5b0231e054e2c6796f577251b30cc3cf18c2062676adca0a926d11c913411f25f5919544fdf022d8_1280.jpg',
    images: [
      'https://pixabay.com/get/g29a9de64043d04f5c85344d7844e4da8bb461796c9f471bb5b0231e054e2c6796f577251b30cc3cf18c2062676adca0a926d11c913411f25f5919544fdf022d8_1280.jpg',
      'https://pixabay.com/get/g876836e37bf2f4c3db8fc72277c670537fee7675f3a14aa4d7143dc6cc08f6e946822a4de995a83cd5c06923b0e0e59d25eddfa7fd73f9809e83a33aa354fa37_1280.jpg'
    ],
    techniques: ['Architectural Visualization', 'Non-Euclidean Geometry', '3D Modeling'],
    dimensions: '4K Resolution',
    featured: true
  },
  {
    id: 'cybernetic-relic',
    title: 'Cybernetic Relic',
    description: 'This digital sculpture imagines ancient cultural artifacts reinterpreted through a technological lens. The piece combines elements of historical art forms with digital-age aesthetics to create a fictional relic from an alternative technological past.',
    year: 2022,
    category: 'Digital Sculpture',
    thumbnail: 'https://pixabay.com/get/g9cc5c6f0c5ea2ae79d71e509d5f55a4a557657bcf1ff52aa2f8bd925befed09199fb33c349e0861bd8550461068482ab6555775109702f597dbbcdbaa71c691d_1280.jpg',
    images: [
      'https://pixabay.com/get/g9cc5c6f0c5ea2ae79d71e509d5f55a4a557657bcf1ff52aa2f8bd925befed09199fb33c349e0861bd8550461068482ab6555775109702f597dbbcdbaa71c691d_1280.jpg',
      'https://pixabay.com/get/gcc125ec6889b6ea05821705d51cde6531748d0e9938f601d860a3cbbcfa3dd4de0411485b74bf6f42c532d32ee9d0ec3_1280.jpg'
    ],
    modelUrl: '/geometries/heart.gltf',
    techniques: ['Digital Sculpting', 'Cultural References', 'Speculative Design'],
    dimensions: 'Variable Dimensions',
    featured: true
  },
  {
    id: 'chromatic-convergence',
    title: 'Chromatic Convergence',
    description: 'An abstract exploration of color theory and visual perception. This piece uses a precisely calculated color palette to create optical effects that change based on viewing distance and movement. The converging elements create a sense of depth and dimensional shifting.',
    year: 2023,
    category: 'Abstract Render',
    thumbnail: 'https://pixabay.com/get/g876836e37bf2f4c3db8fc72277c670537fee7675f3a14aa4d7143dc6cc08f6e946822a4de995a83cd5c06923b0e0e59d25eddfa7fd73f9809e83a33aa354fa37_1280.jpg',
    images: [
      'https://pixabay.com/get/g876836e37bf2f4c3db8fc72277c670537fee7675f3a14aa4d7143dc6cc08f6e946822a4de995a83cd5c06923b0e0e59d25eddfa7fd73f9809e83a33aa354fa37_1280.jpg'
    ],
    techniques: ['Color Theory', 'Visual Perception', 'Abstract Composition'],
    dimensions: '1920 x 1080 px',
    featured: false
  },
  {
    id: 'luminous-construct',
    title: 'Luminous Construct',
    description: 'This work explores the interaction between light and form in a digital environment. Using volumetric lighting and carefully constructed surfaces, the piece creates ethereal spaces defined by how light interacts with the geometric structures.',
    year: 2023,
    category: '3D Model',
    thumbnail: 'https://pixabay.com/get/g45ad3e4e63541ea414e5b260926d116640938aae63f7d0e6aee2ece54868cf2ff2bf7e93d8f4c6097052e535932633f3eae483cfe7032761c425c9d5114ef6ae_1280.jpg',
    images: [
      'https://pixabay.com/get/g45ad3e4e63541ea414e5b260926d116640938aae63f7d0e6aee2ece54868cf2ff2bf7e93d8f4c6097052e535932633f3eae483cfe7032761c425c9d5114ef6ae_1280.jpg'
    ],
    techniques: ['Volumetric Lighting', 'Environment Design', 'Atmospheric Effects'],
    dimensions: '4K Resolution',
    featured: false
  }
];
