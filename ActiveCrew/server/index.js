import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

// ============================================================
// IN-MEMORY DATABASE
// ============================================================

const db = {
  users: [],
  activitySlots: [],
  swipes: [],
  matchCandidates: [],
  matchConfirmations: [],
  matches: [],
  plans: [],
  ratings: [],
  reports: [],
  messages: [],
  notifications: [],
  weeklySelections: [],
};

// ============================================================
// SPORT-SPECIFIC LEVEL DEFINITIONS
// ============================================================

const SPORT_LEVELS = {
  Tennis: {
    category: 'racket',
    levels: [
      { id: 'recreational', label: 'Recreational', desc: 'Play a few times a year for fun, still learning strokes' },
      { id: 'weekly', label: 'Weekly Player', desc: 'Hit once a week, consistent rally, NTRP 2.5–3.5' },
      { id: 'experienced', label: 'Experienced', desc: 'Played competitively before, NTRP 3.5–4.5' },
      { id: 'training', label: 'Training / Competing', desc: 'NTRP 4.5+, tournament play, drilling regularly' },
    ],
  },
  Padel: {
    category: 'racket',
    levels: [
      { id: 'recreational', label: 'Recreational', desc: 'Tried it a few times, learning the basics' },
      { id: 'weekly', label: 'Weekly Player', desc: 'Play once a week, know the rules, can rally' },
      { id: 'experienced', label: 'Experienced', desc: 'Played for 1+ years, good positioning and volleys' },
      { id: 'training', label: 'Training / Competing', desc: 'Tournament level, advanced tactics' },
    ],
  },
  Running: {
    category: 'endurance',
    levels: [
      { id: 'recreational', label: 'Casual Jogger', desc: '1–3 runs/month, 10–12 min/mile, just for fun' },
      { id: 'weekly', label: 'Weekly Runner', desc: '2–3 runs/week, 8:30–10 min/mile, 5K–10K' },
      { id: 'experienced', label: 'Experienced', desc: 'Half-marathon ready, sub-8:30 pace' },
      { id: 'training', label: 'Training for Event', desc: 'Marathon/ultra prep, structured plan, sub-7:30' },
    ],
  },
  Swimming: {
    category: 'endurance',
    levels: [
      { id: 'recreational', label: 'Recreational', desc: 'Swim a few times a year, comfortable in pool' },
      { id: 'weekly', label: 'Weekly Swimmer', desc: 'Lap swim 1–2x/week, can do 1000m+' },
      { id: 'experienced', label: 'Experienced', desc: 'Swam competitively, strong technique, open water' },
      { id: 'training', label: 'Training for Event', desc: 'Triathlon/open water race prep' },
    ],
  },
  Bouldering: {
    category: 'climbing',
    levels: [
      { id: 'recreational', label: 'Beginner', desc: 'V0–V1, just starting, learning technique' },
      { id: 'weekly', label: 'Regular Climber', desc: 'V2–V4, climb 1–2x/week' },
      { id: 'experienced', label: 'Experienced', desc: 'V4–V6, projecting harder grades' },
      { id: 'training', label: 'Advanced', desc: 'V6+, hangboard, moonboard, competitions' },
    ],
  },
  'Rock Climbing': {
    category: 'climbing',
    levels: [
      { id: 'recreational', label: 'Beginner', desc: '5.6–5.8, learning rope skills' },
      { id: 'weekly', label: 'Regular Climber', desc: '5.9–5.10b, climb weekly' },
      { id: 'experienced', label: 'Experienced', desc: '5.10c–5.11c, lead climbing' },
      { id: 'training', label: 'Advanced', desc: '5.11d+, multi-pitch, trad' },
    ],
  },
  Cycling: {
    category: 'endurance',
    levels: [
      { id: 'recreational', label: 'Casual Rider', desc: 'Citi Bike, leisure, flat terrain' },
      { id: 'weekly', label: 'Weekly Rider', desc: '20–40 mile rides, 14–16 mph avg' },
      { id: 'experienced', label: 'Experienced', desc: '40–60 mile rides, group rides, 16–19 mph' },
      { id: 'training', label: 'Training for Event', desc: 'Century/race prep, 19+ mph' },
    ],
  },
  Gym: {
    category: 'strength',
    levels: [
      { id: 'recreational', label: 'Getting Started', desc: 'Go a few times a month, learning' },
      { id: 'weekly', label: 'Regular', desc: '3–4 days/week, following a program' },
      { id: 'experienced', label: 'Experienced', desc: 'Years of lifting, strong numbers' },
      { id: 'training', label: 'Training for Event', desc: 'Hyrox, powerlifting, CrossFit comp' },
    ],
  },
  Yoga: {
    category: 'mindfulness',
    levels: [
      { id: 'recreational', label: 'Curious', desc: 'Tried a few classes, want a buddy' },
      { id: 'weekly', label: 'Regular Practice', desc: '1–2 classes/week, vinyasa' },
      { id: 'experienced', label: 'Experienced', desc: 'Years of practice, inversions' },
      { id: 'training', label: 'Teacher Training', desc: 'RYT or in training' },
    ],
  },
  Basketball: {
    category: 'team',
    levels: [
      { id: 'recreational', label: 'Recreational', desc: 'Shoot around, casual games' },
      { id: 'weekly', label: 'Weekly Pickup', desc: 'Play 1–2x/week, competitive' },
      { id: 'experienced', label: 'Experienced', desc: 'Played HS/college level' },
      { id: 'training', label: 'League Player', desc: 'In a league, serious 5v5' },
    ],
  },
  Soccer: {
    category: 'team',
    levels: [
      { id: 'recreational', label: 'Recreational', desc: 'Kick around in the park' },
      { id: 'weekly', label: 'Weekly Player', desc: 'Weekly pickup or indoor' },
      { id: 'experienced', label: 'Experienced', desc: 'Played club/college' },
      { id: 'training', label: 'League Player', desc: 'Adult league, competitive' },
    ],
  },
  Golf: {
    category: 'precision',
    levels: [
      { id: 'recreational', label: 'Beginner', desc: 'Driving range, learning swing' },
      { id: 'weekly', label: 'Weekend Golfer', desc: '9–18 holes weekly' },
      { id: 'experienced', label: 'Experienced', desc: 'Single digit handicap' },
      { id: 'training', label: 'Competitive', desc: 'Scratch/plus handicap' },
    ],
  },
  Coffee: {
    category: 'social',
    levels: [
      { id: 'recreational', label: 'Coffee & Chat', desc: 'Meet over a good cup' },
    ],
  },
  Dinner: {
    category: 'social',
    levels: [
      { id: 'recreational', label: 'Down for Dinner', desc: 'Try new spots, good conversation' },
    ],
  },
  Sauna: {
    category: 'recovery',
    levels: [
      { id: 'recreational', label: 'Recovery Vibes', desc: 'Sauna, cold plunge, chill' },
    ],
  },
  Surfing: {
    category: 'outdoor',
    levels: [
      { id: 'recreational', label: 'Beginner', desc: 'Took a lesson or two, can pop up sometimes' },
      { id: 'weekly', label: 'Regular Surfer', desc: 'Catch green waves, surf 1-2x/week in season' },
      { id: 'experienced', label: 'Experienced', desc: 'Shortboard or longboard, comfortable in overhead surf' },
      { id: 'training', label: 'Advanced', desc: 'Year-round surfer, travel for waves, competitions' },
    ],
  },
  Hiking: {
    category: 'outdoor',
    levels: [
      { id: 'recreational', label: 'Casual Hiker', desc: 'Easy trails, scenic walks, 2-4 miles' },
      { id: 'weekly', label: 'Weekend Hiker', desc: 'Moderate trails, 5-8 miles, some elevation' },
      { id: 'experienced', label: 'Experienced', desc: 'Long day hikes, 10+ miles, scrambles' },
      { id: 'training', label: 'Backpacker', desc: 'Multi-day trips, thru-hiking, 15+ miles' },
    ],
  },
  Camping: {
    category: 'outdoor',
    levels: [
      { id: 'recreational', label: 'Glamping / Car Camping', desc: 'Campgrounds with facilities, cooler & tent' },
      { id: 'weekly', label: 'Regular Camper', desc: 'Camp monthly in season, gear sorted, cook outdoors' },
      { id: 'experienced', label: 'Backcountry', desc: 'Backpack in, leave no trace, multi-day' },
      { id: 'training', label: 'Wilderness Expert', desc: 'All-season, remote areas, navigation skills' },
    ],
  },
};

const ACTIVITY_IMAGES = {
  Tennis: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
  Padel: 'https://images.unsplash.com/photo-1612534847738-b3af3b1a8e00?w=800&q=80',
  Running: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',
  Swimming: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80',
  Bouldering: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
  'Rock Climbing': 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
  Cycling: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&q=80',
  Gym: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  Yoga: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  Basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
  Soccer: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
  Golf: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80',
  Coffee: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
  Dinner: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  Sauna: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=800&q=80',
  Surfing: 'https://images.unsplash.com/photo-1502680390548-bdbac40f0100?w=800&q=80',
  Hiking: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
  Camping: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
};

const ACTIVITY_EMOJI = {
  Tennis: '🎾', Padel: '🏓', Running: '🏃', Swimming: '🏊', Bouldering: '🧗',
  'Rock Climbing': '🧗', Cycling: '🚴', Gym: '🏋️', Yoga: '🧘', Basketball: '🏀',
  Soccer: '⚽', Golf: '⛳', Coffee: '☕', Dinner: '🍽️', Sauna: '🧖',
  Surfing: '🏄', Hiking: '🥾', Camping: '🏕️',
};

// ============================================================
// PROCEDURAL AVATAR GENERATOR
// ============================================================

const AVATAR_COLORS = [
  '#10b981', '#059669', '#0d9488', '#0891b2', '#0284c7',
  '#2563eb', '#4f46e5', '#7c3aed', '#9333ea', '#c026d3',
  '#db2777', '#e11d48', '#dc2626', '#ea580c', '#d97706',
  '#ca8a04', '#65a30d', '#16a34a', '#0f766e', '#1e40af',
];

function generateSvgAvatar(name, color) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" rx="100" fill="${color}"/><text x="100" y="108" text-anchor="middle" fill="white" font-family="Inter,system-ui,sans-serif" font-size="72" font-weight="700">${initials}</text></svg>`)}`;
}

// ============================================================
// SEED USERS — 50 Procedural Personas
// ============================================================

const FIRST_NAMES_F = [
  'Marina', 'Sofia', 'Emma', 'Claire', 'Ava', 'Priya', 'Yuki', 'Camila',
  'Zara', 'Lena', 'Nadia', 'Aaliyah', 'Mia', 'Luna', 'Isla', 'Freya',
  'Amara', 'Sana', 'Ines', 'Aiko', 'Daphne', 'Celeste', 'Nia', 'Elara',
  'Sienna', 'Rosa',
];
const FIRST_NAMES_M = [
  'Marco', 'Roberto', 'Thomas', 'Daniel', 'Kai', 'Ravi', 'Mateo', 'Liam',
  'Noah', 'Jaden', 'Soren', 'Felix', 'Omar', 'Enzo', 'Hugo', 'Tariq',
  'Axel', 'Leo', 'Dev', 'Andre', 'Miles', 'Kenji', 'Sam', 'Idris',
];
const LAST_INITIALS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NEIGHBORHOODS = [
  'West Village', 'Upper East Side', 'East Village', 'SoHo', 'Williamsburg',
  'Morningside Heights', 'DUMBO', 'Chelsea', 'Flatiron', 'Greenpoint',
  'Long Island City', 'Brooklyn Heights', 'Gowanus', 'Lower East Side',
  "Hell's Kitchen", 'Upper West Side', 'Harlem', 'Washington Heights',
  'Prospect Park',
];
const JOB_TITLES = [
  'Product Designer', 'Software Engineer', 'Finance Analyst', 'Brand Strategist',
  'Physical Therapist', 'Art Director', 'PhD Candidate', 'Managing Director',
  'Marketing Manager', 'Data Scientist', 'UX Researcher', 'Photographer',
  'Architect', 'Nurse Practitioner', 'Consultant', 'Teacher', 'Founder',
  'Lawyer', 'Chef', 'Journalist', 'Account Executive', 'Mechanical Engineer',
  'Graphic Designer', 'Social Worker', 'Venture Associate',
];
const COMPANIES = [
  'Google', 'Startup', 'Freelance', 'Goldman Sachs', 'Columbia University',
  'NYU', 'Agency', 'Sports Clinic', 'Netflix', 'Meta', 'JPMorgan',
  'Hospital', 'Studio', 'Consulting', 'Own business', 'Bloomberg', 'Spotify',
];
const PROMPT_POOL = [
  { q: 'My ideal weekend looks like', answers: [
    'Morning run, farmers market, trying a new brunch spot',
    'Beach day at Rockaway, sunset drinks, early bedtime',
    'Central Park loop, museum in the afternoon, cooking dinner for friends',
    'Saturday tennis doubles, Sunday hike, Monday rest',
    'Bouldering session, long walk through the city, pizza night',
  ]},
  { q: 'I get competitive about', answers: [
    'Strava segments — if I see a PR I can beat, it is happening',
    'Nothing! I just love being outside with good people',
    'Pickup basketball — I play to win every time',
    'Board games at the bar after a group run',
    'My cold plunge time — 4 minutes and counting',
  ]},
  { q: 'A life goal of mine', answers: [
    'Run the NYC Marathon with a sub-4 time',
    'Surf in 10 different countries',
    'Open a community wellness space in Brooklyn',
    'Hike the Appalachian Trail end-to-end',
    'Learn every racquet sport before I turn 35',
  ]},
  { q: 'Typical Sunday', answers: [
    'Slow coffee, yoga, long walk, cook something elaborate',
    'Run club at 8am, brunch, nap, plan the week',
    'Sleep in, farmers market, afternoon climbing session',
    'Group ride, shower, couch, repeat',
    'Morning swim, afternoon in the park with a book',
  ]},
  { q: 'Two truths and a lie', answers: [
    'I have surfed in 6 countries, run 3 marathons, and hate coffee',
    'I climbed a V8, lived in 4 countries, and can cook exactly one dish',
    'I swim every day, own 12 tennis rackets, and have never been to Brooklyn',
    'I once biked 100 miles in a day, I speak 3 languages, I have never done yoga',
    'I played college soccer, I make great pasta, I am a morning person',
  ]},
];

const SPORT_NAMES = Object.keys(SPORT_LEVELS);
const LEVEL_IDS = ['recreational', 'weekly', 'experienced', 'training'];

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pickN(arr, n, rng) {
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, n);
}

function generatePersonas() {
  const rng = seededRandom(42);
  const personas = [];

  // Demo user (always first)
  personas.push({
    id: 'demo-user', firstName: 'You', lastName: '', age: 28, gender: 'male',
    email: 'demo@activecrew.app',
    photos: [generateSvgAvatar('You', '#10b981')],
    neighborhood: 'West Village',
    bio: 'Love running and trying new restaurants',
    jobTitle: 'Product Designer', company: '',
    prompts: [
      { question: 'My ideal weekend looks like', answer: 'Morning run along the Hudson, brunch in SoHo, afternoon bouldering' },
      { question: 'I get competitive about', answer: 'Tennis matches and who can hold the cold plunge longest' },
    ],
    showUpRate: 1.0, totalPlans: 0, verified: true, agePreference: 'no_preference',
    sports: { Running: 'weekly', Tennis: 'experienced', Bouldering: 'weekly', Gym: 'weekly', Hiking: 'weekly', Surfing: 'recreational' },
    createdAt: new Date().toISOString(),
  });

  // Generate 49 more
  for (let i = 0; i < 49; i++) {
    const isFemale = rng() < 0.55; // 55% women — women-first validation
    const gender = isFemale ? 'female' : 'male';
    const namePool = isFemale ? FIRST_NAMES_F : FIRST_NAMES_M;
    const firstName = namePool[Math.floor(rng() * namePool.length)];
    const lastInit = LAST_INITIALS[Math.floor(rng() * LAST_INITIALS.length)];
    const age = 21 + Math.floor(rng() * 35); // 21-55
    const neighborhood = NEIGHBORHOODS[Math.floor(rng() * NEIGHBORHOODS.length)];
    const jobTitle = JOB_TITLES[Math.floor(rng() * JOB_TITLES.length)];
    const company = COMPANIES[Math.floor(rng() * COMPANIES.length)];
    const color = AVATAR_COLORS[Math.floor(rng() * AVATAR_COLORS.length)];

    // 2-5 sports per persona
    const sportCount = 2 + Math.floor(rng() * 4);
    const chosenSports = pickN(SPORT_NAMES, sportCount, rng);
    const sports = {};
    chosenSports.forEach(s => {
      const sportDef = SPORT_LEVELS[s];
      const maxIdx = sportDef.levels.length - 1;
      const levelIdx = Math.min(Math.floor(rng() * (maxIdx + 1)), maxIdx);
      sports[s] = sportDef.levels[levelIdx].id;
    });

    // 2 prompts
    const chosenPrompts = pickN(PROMPT_POOL, 2, rng);
    const prompts = chosenPrompts.map(p => ({
      question: p.q,
      answer: p.answers[Math.floor(rng() * p.answers.length)],
    }));

    const showUpRate = 0.7 + rng() * 0.3; // 0.70 — 1.00
    const totalPlans = Math.floor(rng() * 30);
    const agePrefOptions = ['younger', 'older', 'same_age', 'no_preference'];

    const userId = `user-${i + 1}`;
    personas.push({
      id: userId,
      firstName,
      lastName: `${lastInit}.`,
      age,
      gender,
      email: `${firstName.toLowerCase()}${i + 1}@test.com`,
      photos: [generateSvgAvatar(`${firstName} ${lastInit}`, color)],
      neighborhood,
      bio: '',
      jobTitle,
      company,
      prompts,
      showUpRate: Math.round(showUpRate * 100) / 100,
      totalPlans,
      verified: rng() > 0.2,
      agePreference: agePrefOptions[Math.floor(rng() * agePrefOptions.length)],
      sports,
      createdAt: new Date(Date.now() - Math.floor(rng() * 90 * 86400000)).toISOString(),
    });
  }

  return personas;
}

const seedUsers = generatePersonas();

db.users = seedUsers;

// ============================================================
// SEED ACTIVITY SLOTS
// ============================================================

function generateSlots() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const slots = [];
  const templates = [
    { sport: 'Tennis', level: 'weekly', title: 'Casual Singles Rally', location: 'Tompkins Square Courts', neighborhood: 'East Village', day: 'Tuesday', timeStart: '18:00', timeEnd: '19:30' },
    { sport: 'Tennis', level: 'experienced', title: 'Competitive Hitting Session', location: 'Central Park Courts', neighborhood: 'Central Park', day: 'Saturday', timeStart: '09:00', timeEnd: '10:30' },
    { sport: 'Tennis', level: 'training', title: 'Match Play — NTRP 4.5+', location: 'Riverside Tennis', neighborhood: 'Upper West Side', day: 'Sunday', timeStart: '08:00', timeEnd: '10:00' },
    { sport: 'Running', level: 'weekly', title: 'Hudson River Path Run', location: 'Chelsea Piers', neighborhood: 'West Village', day: 'Wednesday', timeStart: '07:00', timeEnd: '08:00' },
    { sport: 'Running', level: 'training', title: 'Central Park Tempo Run', location: "Engineers' Gate", neighborhood: 'Upper East Side', day: 'Tuesday', timeStart: '06:30', timeEnd: '07:30' },
    { sport: 'Running', level: 'recreational', title: 'Easy Brooklyn Bridge Jog', location: 'Brooklyn Bridge', neighborhood: 'DUMBO', day: 'Saturday', timeStart: '09:00', timeEnd: '10:00' },
    { sport: 'Running', level: 'experienced', title: 'Prospect Park Long Run', location: 'Grand Army Plaza', neighborhood: 'Prospect Park', day: 'Sunday', timeStart: '08:00', timeEnd: '09:30' },
    { sport: 'Bouldering', level: 'weekly', title: 'Bouldering Session', location: 'Brooklyn Boulders', neighborhood: 'Gowanus', day: 'Thursday', timeStart: '18:00', timeEnd: '20:00' },
    { sport: 'Bouldering', level: 'experienced', title: 'Project Session V4–V6', location: 'The Cliffs LIC', neighborhood: 'Long Island City', day: 'Saturday', timeStart: '11:00', timeEnd: '13:00' },
    { sport: 'Gym', level: 'weekly', title: 'Upper Body Push Day', location: 'Equinox Flatiron', neighborhood: 'Flatiron', day: 'Monday', timeStart: '07:00', timeEnd: '08:15' },
    { sport: 'Gym', level: 'training', title: 'Hyrox Prep Workout', location: 'CrossFit Williamsburg', neighborhood: 'Williamsburg', day: 'Wednesday', timeStart: '18:00', timeEnd: '19:30' },
    { sport: 'Gym', level: 'weekly', title: 'Leg Day Partner Workout', location: 'Lifetime Fitness', neighborhood: 'Flatiron', day: 'Friday', timeStart: '17:30', timeEnd: '19:00' },
    { sport: 'Swimming', level: 'weekly', title: 'Lap Swim', location: 'McCarren Pool', neighborhood: 'Greenpoint', day: 'Monday', timeStart: '07:00', timeEnd: '08:00' },
    { sport: 'Swimming', level: 'training', title: 'Open Water Swim', location: 'Coney Island Beach', neighborhood: 'Coney Island', day: 'Saturday', timeStart: '07:00', timeEnd: '08:30' },
    { sport: 'Cycling', level: 'weekly', title: 'Brooklyn Bridge to Prospect Park', location: 'Brooklyn Bridge', neighborhood: 'Brooklyn Heights', day: 'Sunday', timeStart: '08:00', timeEnd: '10:00' },
    { sport: 'Cycling', level: 'training', title: 'Palisades Ride — 50 miles', location: 'GW Bridge', neighborhood: 'Washington Heights', day: 'Saturday', timeStart: '06:30', timeEnd: '10:00' },
    { sport: 'Yoga', level: 'weekly', title: 'Morning Vinyasa Flow', location: 'Prospect Park', neighborhood: 'Prospect Park', day: 'Sunday', timeStart: '08:00', timeEnd: '09:00' },
    { sport: 'Yoga', level: 'experienced', title: 'Power Yoga Session', location: 'Y7 Studio', neighborhood: 'Williamsburg', day: 'Thursday', timeStart: '18:30', timeEnd: '19:30' },
    { sport: 'Basketball', level: 'weekly', title: 'Pickup Basketball', location: 'The Cage', neighborhood: 'West 4th Street', day: 'Wednesday', timeStart: '18:00', timeEnd: '19:30', groupSize: 5 },
    { sport: 'Basketball', level: 'experienced', title: 'Full Court 5v5 Runs', location: 'Rucker Park', neighborhood: 'Harlem', day: 'Saturday', timeStart: '10:00', timeEnd: '12:00', groupSize: 5 },
    { sport: 'Soccer', level: 'weekly', title: 'Pickup Soccer', location: 'Pier 40', neighborhood: 'Hudson River Park', day: 'Sunday', timeStart: '10:00', timeEnd: '12:00', groupSize: 5 },
    { sport: 'Padel', level: 'weekly', title: 'Padel Doubles', location: 'Padel Haus', neighborhood: 'Williamsburg', day: 'Tuesday', timeStart: '19:00', timeEnd: '20:30', groupSize: 4 },
    { sport: 'Coffee', level: 'recreational', title: 'Coffee & Walk', location: 'Think Coffee', neighborhood: 'SoHo', day: 'Wednesday', timeStart: '08:00', timeEnd: '09:00' },
    { sport: 'Coffee', level: 'recreational', title: 'Morning Espresso Meetup', location: 'Devocion', neighborhood: 'Williamsburg', day: 'Saturday', timeStart: '09:00', timeEnd: '10:00', groupSize: 3 },
    { sport: 'Dinner', level: 'recreational', title: 'Try a New Spot', location: 'TBD — LES', neighborhood: 'Lower East Side', day: 'Friday', timeStart: '19:30', timeEnd: '21:30', groupSize: 4 },
    { sport: 'Dinner', level: 'recreational', title: 'Group Dinner Crew', location: 'TBD — Hells Kitchen', neighborhood: "Hell's Kitchen", day: 'Thursday', timeStart: '19:00', timeEnd: '21:00', groupSize: 5 },
    { sport: 'Sauna', level: 'recreational', title: 'Sauna & Cold Plunge', location: 'Bathhouse', neighborhood: 'Williamsburg', day: 'Sunday', timeStart: '14:00', timeEnd: '16:00', groupSize: 3 },
    { sport: 'Sauna', level: 'recreational', title: 'Russian Baths Recovery', location: 'Russian & Turkish Baths', neighborhood: 'East Village', day: 'Saturday', timeStart: '15:00', timeEnd: '17:00', groupSize: 4 },
    { sport: 'Golf', level: 'weekly', title: 'Driving Range Session', location: 'Chelsea Piers Golf', neighborhood: 'Chelsea', day: 'Thursday', timeStart: '17:00', timeEnd: '18:30' },
    { sport: 'Running', level: 'weekly', title: 'Group Run Club — 5K', location: 'Brooklyn Bridge Park', neighborhood: 'DUMBO', day: 'Thursday', timeStart: '18:30', timeEnd: '19:30', groupSize: 5 },
    { sport: 'Cycling', level: 'weekly', title: 'Group Ride — Prospect to Coney', location: 'Grand Army Plaza', neighborhood: 'Prospect Park', day: 'Saturday', timeStart: '07:00', timeEnd: '09:30', groupSize: 4 },
    { sport: 'Bouldering', level: 'weekly', title: 'Bouldering Crew Night', location: 'Brooklyn Boulders', neighborhood: 'Gowanus', day: 'Friday', timeStart: '19:00', timeEnd: '21:00', groupSize: 4 },
    // Outdoor / Adventure Activities
    { sport: 'Surfing', level: 'recreational', title: 'Beginner Surf Session', location: 'Rockaway Beach 67th St', neighborhood: 'Rockaway Beach', day: 'Saturday', timeStart: '08:00', timeEnd: '10:00' },
    { sport: 'Surfing', level: 'weekly', title: 'Dawn Patrol — Rockaway', location: 'Rockaway Beach 90th St', neighborhood: 'Rockaway Beach', day: 'Sunday', timeStart: '06:30', timeEnd: '08:30' },
    { sport: 'Surfing', level: 'experienced', title: 'Shortboard Session — Low Tide', location: 'Rockaway Beach 67th St', neighborhood: 'Rockaway Beach', day: 'Saturday', timeStart: '07:00', timeEnd: '09:00' },
    { sport: 'Hiking', level: 'recreational', title: 'Easy Trail Walk — Harriman', location: 'Harriman State Park', neighborhood: 'Harriman State Park', day: 'Saturday', timeStart: '09:00', timeEnd: '13:00' },
    { sport: 'Hiking', level: 'weekly', title: 'Bear Mountain Summit Hike', location: 'Bear Mountain State Park', neighborhood: 'Bear Mountain', day: 'Sunday', timeStart: '08:00', timeEnd: '14:00' },
    { sport: 'Hiking', level: 'experienced', title: 'Breakneck Ridge Scramble', location: 'Breakneck Ridge Trailhead', neighborhood: 'Cold Spring', day: 'Saturday', timeStart: '07:30', timeEnd: '13:30' },
    { sport: 'Hiking', level: 'weekly', title: 'Palisades Cliffs Trail', location: 'Palisades Interstate Park', neighborhood: 'Palisades', day: 'Sunday', timeStart: '09:00', timeEnd: '13:00', groupSize: 4 },
    { sport: 'Camping', level: 'recreational', title: 'Weekend Car Camping — Harriman', location: 'Beaver Pond Campground', neighborhood: 'Harriman State Park', day: 'Saturday', timeStart: '10:00', timeEnd: '18:00', groupSize: 4 },
    { sport: 'Camping', level: 'weekly', title: 'Overnight Backpack — Catskills', location: 'Slide Mountain Trailhead', neighborhood: 'Catskills', day: 'Saturday', timeStart: '08:00', timeEnd: '18:00', groupSize: 3 },
    { sport: 'Hiking', level: 'recreational', title: 'Prospect Park Nature Walk', location: 'Prospect Park Audubon Center', neighborhood: 'Prospect Park', day: 'Wednesday', timeStart: '17:30', timeEnd: '19:00' },
    { sport: 'Surfing', level: 'recreational', title: 'Surf Lesson + Tacos After', location: 'Locals Surf School', neighborhood: 'Rockaway Beach', day: 'Sunday', timeStart: '10:00', timeEnd: '12:00', groupSize: 4 },
  ];

  templates.forEach(t => {
    // Find users who play this sport at a matching level
    const levelOrder = ['recreational', 'weekly', 'experienced', 'training'];
    const tIdx = levelOrder.indexOf(t.level);
    const matchingUsers = db.users.filter(u => {
      if (u.id === 'demo-user') return false;
      const userLevel = u.sports[t.sport];
      if (!userLevel) return false;
      const uIdx = levelOrder.indexOf(userLevel);
      return Math.abs(uIdx - tIdx) <= 1; // within 1 level
    });

    const spotsTotal = t.groupSize || (Math.random() > 0.5 ? 4 : 6);
    // Auto-join some matching users as participants
    const autoJoined = matchingUsers.slice(0, Math.min(Math.floor(Math.random() * 3) + 1, matchingUsers.length));
    slots.push({
      id: uuidv4(),
      ...t,
      image: ACTIVITY_IMAGES[t.sport] || '',
      emoji: ACTIVITY_EMOJI[t.sport] || '🏃',
      groupSize: spotsTotal,
      isGroup: spotsTotal > 2,
      spotsTotal,
      participants: autoJoined.map(u => u.id),
      spotsRemaining: spotsTotal - autoJoined.length,
      availableUsers: matchingUsers.map(u => u.id),
      availableCount: matchingUsers.length,
    });
  });

  return slots;
}

db.activitySlots = generateSlots();

// Pre-seed swipes from other users on various slots
const otherUserIds = db.users.filter(u => u.id !== 'demo-user').map(u => u.id);
db.activitySlots.forEach(slot => {
  slot.availableUsers.forEach(uid => {
    if (Math.random() > 0.3) { // 70% chance each matching user swiped yes
      db.swipes.push({
        id: uuidv4(), userId: uid, slotId: slot.id,
        direction: 'yes', createdAt: new Date().toISOString(),
      });
    }
  });
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// Compatibility score (Hinge "Most Compatible" inspired)
function computeCompatibility(userA, userB) {
  let score = 0;
  let maxScore = 0;

  // Shared sports (weighted heavily)
  const sportsA = Object.keys(userA.sports || {});
  const sportsB = Object.keys(userB.sports || {});
  const sharedSports = sportsA.filter(s => sportsB.includes(s));
  maxScore += 40;
  score += Math.min(sharedSports.length * 10, 40);

  // Level proximity for shared sports
  const levelOrder = ['recreational', 'weekly', 'experienced', 'training'];
  sharedSports.forEach(s => {
    const diff = Math.abs(levelOrder.indexOf(userA.sports[s]) - levelOrder.indexOf(userB.sports[s]));
    maxScore += 15;
    score += diff === 0 ? 15 : diff === 1 ? 10 : 3;
  });

  // Same neighborhood
  maxScore += 10;
  if (userA.neighborhood && userB.neighborhood && userA.neighborhood === userB.neighborhood) score += 10;

  // Shared interests
  const intA = userA.interests || [];
  const intB = userB.interests || [];
  const sharedInterests = intA.filter(i => intB.includes(i));
  maxScore += 20;
  score += Math.min(sharedInterests.length * 4, 20);

  // Reliability bonus
  maxScore += 10;
  if (userB.showUpRate >= 0.8 && userB.totalPlans >= 2) score += 10;
  else if (userB.showUpRate >= 0.6) score += 5;

  // Age proximity (within 5 years = full points)
  maxScore += 10;
  const ageDiff = Math.abs((userA.age || 28) - (userB.age || 28));
  score += ageDiff <= 3 ? 10 : ageDiff <= 6 ? 7 : ageDiff <= 10 ? 4 : 1;

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;
}

// Streaks & Achievements
function computeStreaksAndBadges(userId) {
  const userMatches = db.matches.filter(m => m.user1Id === userId || m.user2Id === userId);
  const completedPlans = db.plans.filter(p => p.status === 'confirmed' &&
    userMatches.some(m => m.id === p.matchId));

  // Weekly streak: how many consecutive weeks with a plan
  let weekStreak = 0;
  const now = new Date();
  for (let w = 0; w < 52; w++) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (w * 7) - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const hasActivity = completedPlans.some(p => {
      const d = new Date(p.createdAt);
      return d >= weekStart && d < weekEnd;
    });
    if (hasActivity || w === 0) weekStreak++;
    else break;
  }

  // Badges
  const badges = [];
  const user = db.users.find(u => u.id === userId);
  const sportsCount = Object.keys(user?.sports || {}).length;
  const totalPlans = user?.totalPlans || 0;

  if (user?.verified) badges.push({ id: 'verified', icon: '✓', label: 'Verified', color: 'blue' });
  if (totalPlans >= 1) badges.push({ id: 'first_plan', icon: '🎉', label: 'First Plan', color: 'green' });
  if (totalPlans >= 5) badges.push({ id: 'regular', icon: '🔥', label: 'Regular', color: 'orange' });
  if (totalPlans >= 10) badges.push({ id: 'dedicated', icon: '💎', label: 'Dedicated', color: 'purple' });
  if (totalPlans >= 25) badges.push({ id: 'legend', icon: '👑', label: 'Legend', color: 'gold' });
  if (sportsCount >= 3) badges.push({ id: 'multi_sport', icon: '🏅', label: 'Multi-Sport', color: 'teal' });
  if (sportsCount >= 5) badges.push({ id: 'athlete', icon: '⚡', label: 'Athlete', color: 'orange' });
  if ((user?.showUpRate || 0) >= 0.9 && totalPlans >= 3) badges.push({ id: 'reliable', icon: '🎯', label: 'Reliable', color: 'green' });
  if (weekStreak >= 2) badges.push({ id: 'streak_2', icon: '🔥', label: `${weekStreak}w Streak`, color: 'red' });
  if (weekStreak >= 4) badges.push({ id: 'streak_4', icon: '💪', label: 'Month Warrior', color: 'purple' });

  return { weekStreak, badges, totalCompleted: completedPlans.length };
}

 const NEIGHBORHOOD_COORDS = {
   'West Village': { lat: 40.7359, lng: -74.0036 },
   'Upper East Side': { lat: 40.7736, lng: -73.9566 },
   'East Village': { lat: 40.7265, lng: -73.9815 },
   'SoHo': { lat: 40.7233, lng: -74.0030 },
   'Williamsburg': { lat: 40.7081, lng: -73.9571 },
   'Morningside Heights': { lat: 40.8075, lng: -73.9626 },
   'DUMBO': { lat: 40.7033, lng: -73.9881 },
   'Central Park': { lat: 40.7829, lng: -73.9654 },
   'Upper West Side': { lat: 40.7870, lng: -73.9754 },
   'Prospect Park': { lat: 40.6602, lng: -73.9690 },
   'Gowanus': { lat: 40.6737, lng: -73.9903 },
   'Long Island City': { lat: 40.7447, lng: -73.9485 },
   'Flatiron': { lat: 40.7411, lng: -73.9897 },
   'Greenpoint': { lat: 40.7245, lng: -73.9419 },
   'Coney Island': { lat: 40.5749, lng: -73.9850 },
   'Brooklyn Heights': { lat: 40.6960, lng: -73.9933 },
   'Washington Heights': { lat: 40.8417, lng: -73.9397 },
   'Harlem': { lat: 40.8116, lng: -73.9465 },
   'Hudson River Park': { lat: 40.7397, lng: -74.0100 },
   'West 4th Street': { lat: 40.7323, lng: -74.0009 },
   'Lower East Side': { lat: 40.7150, lng: -73.9843 },
   "Hell's Kitchen": { lat: 40.7638, lng: -73.9918 },
   'Chelsea': { lat: 40.7465, lng: -74.0014 },
   'Rockaway Beach': { lat: 40.5834, lng: -73.8155 },
   'Bear Mountain': { lat: 41.3123, lng: -73.9882 },
   'Harriman State Park': { lat: 41.2270, lng: -74.0460 },
   'Cold Spring': { lat: 41.4201, lng: -73.9548 },
   'Palisades': { lat: 40.8582, lng: -73.9636 },
   'Catskills': { lat: 42.0400, lng: -74.2510 },
 };

 const WEEKLY_TIME_WINDOWS = {
   early_morning: { start: 6 * 60, end: 8 * 60 },
   morning: { start: 8 * 60, end: 11 * 60 },
   lunch: { start: 11 * 60 + 30, end: 13 * 60 + 30 },
   afternoon: { start: 14 * 60, end: 17 * 60 },
   evening: { start: 17 * 60, end: 20 * 60 },
   night: { start: 20 * 60, end: 22 * 60 },
 };

 function parseTimeToMinutes(t) {
   if (!t || typeof t !== 'string') return null;
   const [hStr, mStr] = t.split(':');
   const h = parseInt(hStr, 10);
   const m = parseInt(mStr || '0', 10);
   if (Number.isNaN(h) || Number.isNaN(m)) return null;
   return h * 60 + m;
 }

 function rangesOverlap(aStart, aEnd, bStart, bEnd) {
   if (aStart == null || aEnd == null || bStart == null || bEnd == null) return true;
   return aStart < bEnd && aEnd > bStart;
 }
 
 function slotMatchesWeeklyTimeSlot(slot, timeSlotId) {
   const window = WEEKLY_TIME_WINDOWS[timeSlotId];
   if (!window) return true;
   const slotStart = parseTimeToMinutes(slot.timeStart);
   if (slotStart == null) return true;
   return slotStart >= window.start && slotStart < window.end;
 }

 function toRadians(deg) {
   return (deg * Math.PI) / 180;
 }

 function haversineMiles(a, b) {
   const R = 3958.8;
   const dLat = toRadians(b.lat - a.lat);
   const dLng = toRadians(b.lng - a.lng);
   const lat1 = toRadians(a.lat);
   const lat2 = toRadians(b.lat);
   const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * (Math.sin(dLng / 2) ** 2);
   const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
   return R * c;
 }

 function isWithinRadiusMiles(fromNeighborhood, toNeighborhood, radiusMiles) {
   if (!radiusMiles || typeof radiusMiles !== 'number') return true;
   if (!fromNeighborhood || !toNeighborhood) return true;
   if (fromNeighborhood === toNeighborhood) return true;
   const a = NEIGHBORHOOD_COORDS[fromNeighborhood];
   const b = NEIGHBORHOOD_COORDS[toNeighborhood];
   if (!a || !b) return true;
   return haversineMiles(a, b) <= radiusMiles;
 }

function getAvailableUsersForSlot(slotId, excludeUserId) {
  const slot = db.activitySlots.find(s => s.id === slotId);
  if (!slot) return [];
  const yesSwipes = db.swipes.filter(s => s.slotId === slotId && s.direction === 'yes' && s.userId !== excludeUserId);
  return yesSwipes.map(s => {
    const user = db.users.find(u => u.id === s.userId);
    return user;
  }).filter(Boolean);
}

function checkAndCreateMatchCandidate(userId, slotId, targetUserId) {
  const exists = db.matchCandidates.find(
    mc => mc.slotId === slotId &&
      ((mc.user1Id === userId && mc.user2Id === targetUserId) ||
       (mc.user1Id === targetUserId && mc.user2Id === userId))
  );
  if (exists) return exists;

  const candidate = {
    id: uuidv4(),
    slotId,
    user1Id: userId,
    user2Id: targetUserId,
    status: 'pending_preview',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  db.matchCandidates.push(candidate);

  [userId, targetUserId].forEach(uid => {
    db.notifications.push({
      id: uuidv4(), userId: uid, type: 'match_preview_available',
      title: 'New Match Preview!',
      body: 'Someone wants to do the same activity. Check it out!',
      data: { matchCandidateId: candidate.id },
      read: false, createdAt: new Date().toISOString(),
    });
  });

  return candidate;
}

// ============================================================
// API ROUTES
// ============================================================

// --- Sport Levels ---
app.get('/api/sport-levels', (req, res) => {
  res.json(SPORT_LEVELS);
});

app.get('/api/activity-images', (req, res) => {
  res.json(ACTIVITY_IMAGES);
});

// --- Auth ---
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  let user = db.users.find(u => u.email === email);
  if (!user) {
    user = { id: uuidv4(), firstName: '', lastName: '', email, photos: [], neighborhood: '', bio: '', jobTitle: '', company: '', height: '', prompts: [], showUpRate: 1.0, totalPlans: 0, verified: false, sports: {}, createdAt: new Date().toISOString() };
    db.users.push(user);
  }
  res.json({ user, token: 'mvp-token-' + user.id });
});

app.post('/api/auth/demo', (req, res) => {
  const user = db.users.find(u => u.id === 'demo-user');
  res.json({ user, token: 'mvp-token-demo-user' });
});

// --- Users ---
app.get('/api/users/:id', (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.put('/api/users/:id', (req, res) => {
  const idx = db.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  db.users[idx] = { ...db.users[idx], ...req.body };
  res.json(db.users[idx]);
});

// --- Streaks & Badges ---
app.get('/api/streaks/:userId', (req, res) => {
  const user = db.users.find(u => u.id === req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(computeStreaksAndBadges(req.params.userId));
});

// --- Top Pick (Hinge "Standouts" inspired) ---
app.get('/api/top-pick/:userId', (req, res) => {
  const user = db.users.find(u => u.id === req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Find the best-matching user based on compatibility
  const others = db.users.filter(u => u.id !== req.params.userId);
  const scored = others.map(u => ({
    ...u,
    compatibility: computeCompatibility(user, u),
    sharedSports: Object.keys(user.sports || {}).filter(s => u.sports?.[s]),
  })).sort((a, b) => b.compatibility - a.compatibility);

  // Find a slot they could match on
  const topUser = scored[0];
  if (!topUser) return res.json(null);

  const sharedSlot = db.activitySlots.find(s =>
    topUser.sharedSports.includes(s.sport) &&
    s.availableUsers.includes(topUser.id)
  );

  res.json({
    user: topUser,
    compatibility: topUser.compatibility,
    sharedSports: topUser.sharedSports,
    suggestedSlot: sharedSlot || null,
  });
});

// --- Activity Feed (Strava-inspired) ---
app.get('/api/feed/:userId', (req, res) => {
  const user = db.users.find(u => u.id === req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Generate fake feed items from confirmed plans and matches
  const feed = [];

  // Recent matches
  db.matches.forEach(m => {
    const u1 = db.users.find(u => u.id === m.user1Id);
    const u2 = db.users.find(u => u.id === m.user2Id);
    const slot = db.activitySlots.find(s => s.id === m.slotId);
    if (!u1 || !u2 || !slot) return;

    const plan = db.plans.find(p => p.matchId === m.id);
    if (plan?.status === 'confirmed') {
      feed.push({
        id: `feed-plan-${m.id}`,
        type: 'plan_confirmed',
        users: [u1, u2].map(u => ({ id: u.id, firstName: u.firstName, photo: u.photos?.[0] })),
        sport: slot.sport,
        emoji: slot.emoji,
        title: slot.title,
        location: slot.location,
        day: slot.day,
        time: `${slot.timeStart}–${slot.timeEnd}`,
        createdAt: plan.createdAt || m.createdAt,
        kudos: Math.floor(Math.random() * 8),
      });
    }
  });

  // Simulated community activity
  const communityEvents = [
    { type: 'milestone', userId: db.users[1]?.id, text: 'completed their 10th plan!', icon: '🎉' },
    { type: 'streak', userId: db.users[2]?.id, text: 'is on a 3-week streak!', icon: '🔥' },
    { type: 'new_sport', userId: db.users[3]?.id, text: 'added Bouldering to their sports', icon: '🧗' },
    { type: 'joined', userId: db.users[4]?.id, text: 'joined ActiveCrew!', icon: '👋' },
  ];

  communityEvents.forEach((ev, i) => {
    const u = db.users.find(u => u.id === ev.userId);
    if (!u) return;
    feed.push({
      id: `feed-comm-${i}`,
      type: ev.type,
      user: { id: u.id, firstName: u.firstName, photo: u.photos?.[0] },
      text: ev.text,
      icon: ev.icon,
      createdAt: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
      kudos: Math.floor(Math.random() * 12),
    });
  });

  feed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(feed);
});

// --- Sessions (session-first browsing) ---
app.get('/api/sessions', (req, res) => {
  const { sport, day, userId } = req.query;
  let sessions = [...db.activitySlots];
  if (sport) sessions = sessions.filter(s => s.sport === sport);
  if (day) sessions = sessions.filter(s => s.day === day);

  const enriched = sessions.map(s => {
    const participantUsers = (s.participants || []).map(pid => {
      const u = db.users.find(u => u.id === pid);
      return u ? { id: u.id, firstName: u.firstName, photo: u.photos?.[0], neighborhood: u.neighborhood } : null;
    }).filter(Boolean);
    return {
      ...s,
      participantProfiles: participantUsers,
      spotsRemaining: s.spotsRemaining ?? (s.spotsTotal - (s.participants || []).length),
      joined: userId ? (s.participants || []).includes(userId) : false,
    };
  });

  res.json(enriched);
});

app.get('/api/sessions/:id', (req, res) => {
  const session = db.activitySlots.find(s => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const participantUsers = (session.participants || []).map(pid => {
    const u = db.users.find(u => u.id === pid);
    return u ? { id: u.id, firstName: u.firstName, lastName: u.lastName, photo: u.photos?.[0], neighborhood: u.neighborhood, sports: u.sports, showUpRate: u.showUpRate } : null;
  }).filter(Boolean);

  res.json({
    ...session,
    participantProfiles: participantUsers,
    spotsRemaining: session.spotsRemaining ?? (session.spotsTotal - (session.participants || []).length),
  });
});

app.post('/api/sessions/:id/join', (req, res) => {
  const { userId } = req.body;
  const session = db.activitySlots.find(s => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  if (!session.participants) session.participants = [];
  if (session.participants.includes(userId)) return res.status(400).json({ error: 'Already joined' });
  if (session.spotsRemaining <= 0) return res.status(400).json({ error: 'Session is full' });

  session.participants.push(userId);
  session.spotsRemaining = session.spotsTotal - session.participants.length;

  const participantUsers = session.participants.map(pid => {
    const u = db.users.find(u => u.id === pid);
    return u ? { id: u.id, firstName: u.firstName, photo: u.photos?.[0], neighborhood: u.neighborhood } : null;
  }).filter(Boolean);

  res.json({ ...session, participantProfiles: participantUsers, joined: true });
});

app.post('/api/sessions/:id/leave', (req, res) => {
  const { userId } = req.body;
  const session = db.activitySlots.find(s => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  if (!session.participants) session.participants = [];
  session.participants = session.participants.filter(id => id !== userId);
  session.spotsRemaining = session.spotsTotal - session.participants.length;

  res.json({ ...session, joined: false });
});

// --- Seed Mode (cold-start: founder creates sessions) ---
app.post('/api/sessions/seed', (req, res) => {
  // Re-generate all slots and auto-join first N users to each
  db.activitySlots = generateSlots();
  const nonDemo = db.users.filter(u => u.id !== 'demo-user');
  db.activitySlots.forEach(slot => {
    const matching = nonDemo.filter(u => u.sports[slot.sport]);
    const toJoin = matching.slice(0, Math.min(3, matching.length));
    slot.participants = toJoin.map(u => u.id);
    slot.spotsRemaining = slot.spotsTotal - slot.participants.length;
  });
  res.json({ success: true, sessionsSeeded: db.activitySlots.length });
});

// --- Activity Slots ---
app.get('/api/activity-slots', (req, res) => {
  const { userId, sport, level } = req.query;
  let slots = [...db.activitySlots];
  if (sport) slots = slots.filter(s => s.sport === sport);
  if (level) slots = slots.filter(s => s.level === level);

  // Enrich with available user count (excluding requester)
  const enriched = slots.map(s => {
    const userSwipe = db.swipes.find(sw => sw.slotId === s.id && sw.userId === userId);
    const availUsers = getAvailableUsersForSlot(s.id, userId);
    return {
      ...s,
      availableCount: availUsers.length,
      alreadySwiped: !!userSwipe,
    };
  });

  res.json(enriched);
});

// --- Weekly Selection ---
app.post('/api/weekly-selection', (req, res) => {
  const { userId, sports, availability, radius } = req.body;
  const user = db.users.find(u => u.id === userId);
  // Store the user's weekly selection
  const existing = db.weeklySelections.findIndex(w => w.userId === userId);
  const sel = { userId, sports, availability, radius, updatedAt: new Date().toISOString() };
  if (existing >= 0) {
    db.weeklySelections[existing] = sel;
  } else {
    db.weeklySelections.push(sel);
  }

  // Return matching activity slots
  const matchingSlots = db.activitySlots.filter(slot => {
    const sportMatch = Array.isArray(sports) && sports.some(s => s.sport === slot.sport);
    if (!sportMatch) return false;

    if (typeof radius === 'number' && user?.neighborhood) {
      if (!isWithinRadiusMiles(user.neighborhood, slot.neighborhood, radius)) return false;
    }

    if (Array.isArray(availability) && availability.length > 0) {
      const dayPref = availability.find(a => a.day === slot.day);
      if (!dayPref) return false;
      const timeSlots = Array.isArray(dayPref.timeSlots) ? dayPref.timeSlots : [];
      if (timeSlots.length > 0) {
        const timeMatch = timeSlots.some(ts => slotMatchesWeeklyTimeSlot(slot, ts));
        if (!timeMatch) return false;
      }
      return true;
    }
    return true;
  });

  const enriched = matchingSlots.map(s => {
    const userSwipe = db.swipes.find(sw => sw.slotId === s.id && sw.userId === userId);
    return {
      ...s,
      availableCount: getAvailableUsersForSlot(s.id, userId).length,
      alreadySwiped: !!userSwipe,
    };
  });

  res.json({ selection: sel, matchingSlots: enriched });
});

app.get('/api/weekly-selection/:userId', (req, res) => {
  const sel = db.weeklySelections.find(w => w.userId === req.params.userId);
  res.json(sel || null);
});

// --- Swipes on Activity Slots ---
app.post('/api/swipes', (req, res) => {
  const { userId, slotId, direction } = req.body;
  const existing = db.swipes.find(s => s.userId === userId && s.slotId === slotId);
  if (existing) return res.status(400).json({ error: 'Already swiped' });

  const swipe = { id: uuidv4(), userId, slotId, direction, createdAt: new Date().toISOString() };
  db.swipes.push(swipe);

  // If swiped yes, return the pool of available users for this slot with compatibility
  let availableUsers = [];
  if (direction === 'yes') {
    availableUsers = getAvailableUsersForSlot(slotId, userId);
  }

  res.json({ swipe, availableUsers });
});

// --- Select a Person from Pool ---
app.post('/api/select-person', (req, res) => {
  const { userId, slotId, targetUserId } = req.body;
  const candidate = checkAndCreateMatchCandidate(userId, slotId, targetUserId);
  res.json({ matchCandidate: candidate });
});

// --- Match Candidates ---
app.get('/api/match-candidates/:userId', (req, res) => {
  const candidates = db.matchCandidates.filter(
    mc => (mc.user1Id === req.params.userId || mc.user2Id === req.params.userId) && mc.status === 'pending_preview'
  );
  const enriched = candidates.map(mc => {
    const otherUserId = mc.user1Id === req.params.userId ? mc.user2Id : mc.user1Id;
    const otherUser = db.users.find(u => u.id === otherUserId);
    const slot = db.activitySlots.find(s => s.id === mc.slotId);
    return { ...mc, otherUser, activitySlot: slot };
  });
  res.json(enriched);
});

// --- Match Confirmations ---
app.post('/api/match-confirmations', (req, res) => {
  const { matchCandidateId, userId, confirmed } = req.body;
  const candidate = db.matchCandidates.find(mc => mc.id === matchCandidateId);
  if (!candidate) return res.status(404).json({ error: 'Match candidate not found' });

  const confirmation = { id: uuidv4(), matchCandidateId, userId, confirmed, createdAt: new Date().toISOString() };
  db.matchConfirmations.push(confirmation);

  if (!confirmed) {
    candidate.status = 'passed';
    return res.json({ status: 'passed' });
  }

  const otherUserId = candidate.user1Id === userId ? candidate.user2Id : candidate.user1Id;
  const otherConfirmation = db.matchConfirmations.find(
    mc => mc.matchCandidateId === matchCandidateId && mc.userId === otherUserId && mc.confirmed
  );

  if (otherConfirmation) {
    candidate.status = 'matched';
    const slot = db.activitySlots.find(s => s.id === candidate.slotId);
    const match = {
      id: uuidv4(), matchCandidateId, slotId: candidate.slotId,
      user1Id: candidate.user1Id, user2Id: candidate.user2Id,
      status: 'pending_plan', createdAt: new Date().toISOString(),
    };
    db.matches.push(match);

    [candidate.user1Id, candidate.user2Id].forEach(uid => {
      db.notifications.push({
        id: uuidv4(), userId: uid, type: 'matched',
        title: "It's a Match! ⚡", body: `Time to lock in your ${slot?.sport || 'activity'} plan!`,
        data: { matchId: match.id }, read: false, createdAt: new Date().toISOString(),
      });
    });

    return res.json({ status: 'matched', match });
  }

  return res.json({ status: 'waiting_for_other' });
});

// --- Matches ---
app.get('/api/matches/:userId', (req, res) => {
  const userMatches = db.matches.filter(
    m => m.user1Id === req.params.userId || m.user2Id === req.params.userId
  );
  const enriched = userMatches.map(m => {
    const otherUserId = m.user1Id === req.params.userId ? m.user2Id : m.user1Id;
    const otherUser = db.users.find(u => u.id === otherUserId);
    const slot = db.activitySlots.find(s => s.id === m.slotId);
    const plan = db.plans.find(p => p.matchId === m.id);
    const msgs = db.messages.filter(msg => msg.matchId === m.id).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return { ...m, otherUser, activitySlot: slot, plan, messages: msgs };
  });
  res.json(enriched);
});

// --- Plans (scheduling) ---
app.post('/api/plans', (req, res) => {
  const { matchId, userId, timeSlot, place, note } = req.body;
  const match = db.matches.find(m => m.id === matchId);
  if (!match) return res.status(404).json({ error: 'Match not found' });

  let plan = db.plans.find(p => p.matchId === matchId);
  if (!plan) {
    plan = {
      id: uuidv4(), matchId, proposedBy: userId,
      timeSlot, place, note: note || '',
      user1Confirmed: match.user1Id === userId,
      user2Confirmed: match.user2Id === userId,
      status: 'proposed',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    db.plans.push(plan);
  } else {
    if (match.user1Id === userId) plan.user1Confirmed = true;
    if (match.user2Id === userId) plan.user2Confirmed = true;
  }

  if (plan.user1Confirmed && plan.user2Confirmed) {
    plan.status = 'confirmed';
    match.status = 'plan_confirmed';
  }

  res.json(plan);
});

app.put('/api/plans/:id/confirm', (req, res) => {
  const { userId } = req.body;
  const plan = db.plans.find(p => p.id === req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  const match = db.matches.find(m => m.id === plan.matchId);
  if (match.user1Id === userId) plan.user1Confirmed = true;
  if (match.user2Id === userId) plan.user2Confirmed = true;

  if (plan.user1Confirmed && plan.user2Confirmed) {
    plan.status = 'confirmed';
    match.status = 'plan_confirmed';
  }
  res.json(plan);
});

// --- Messages ---
app.get('/api/messages/:matchId', (req, res) => {
  const match = db.matches.find(m => m.id === req.params.matchId);
  if (!match) return res.status(404).json({ error: 'Match not found' });
  const plan = db.plans.find(p => p.matchId === match.id);
  if (!plan || plan.status !== 'confirmed') {
    return res.status(403).json({ error: 'Messaging locked until plan is confirmed' });
  }
  const msgs = db.messages.filter(m => m.matchId === req.params.matchId);
  res.json(msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
});

app.post('/api/messages', (req, res) => {
  const { matchId, userId, text, quickReply } = req.body;
  const match = db.matches.find(m => m.id === matchId);
  if (!match) return res.status(404).json({ error: 'Match not found' });
  const plan = db.plans.find(p => p.matchId === matchId);
  if (!plan || plan.status !== 'confirmed') {
    return res.status(403).json({ error: 'Messaging locked' });
  }
  const msg = {
    id: uuidv4(), matchId, userId,
    text: quickReply || text, isQuickReply: !!quickReply,
    createdAt: new Date().toISOString(),
  };
  db.messages.push(msg);
  res.json(msg);
});

// --- Ratings ---
app.post('/api/ratings', (req, res) => {
  const { planId, raterId, rateeId, showedUp, respectful, onTime, vibe } = req.body;
  const rating = { id: uuidv4(), planId, raterId, rateeId, showedUp, respectful, onTime, vibe, createdAt: new Date().toISOString() };
  db.ratings.push(rating);

  const ratee = db.users.find(u => u.id === rateeId);
  if (ratee) {
    const allRatings = db.ratings.filter(r => r.rateeId === rateeId);
    const showUps = allRatings.filter(r => r.showedUp).length;
    ratee.showUpRate = allRatings.length > 0 ? showUps / allRatings.length : 1.0;
    ratee.totalPlans = allRatings.length;
  }

  const plan = db.plans.find(p => p.id === planId);
  if (plan) plan.status = 'completed';
  const match = db.matches.find(m => m.id === plan?.matchId);
  if (match) match.status = 'completed';

  res.json(rating);
});

// --- Reports ---
app.post('/api/reports', (req, res) => {
  const report = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
  db.reports.push(report);
  res.json({ success: true });
});

// --- Notifications ---
app.get('/api/notifications/:userId', (req, res) => {
  const notifs = db.notifications.filter(n => n.userId === req.params.userId);
  res.json(notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// --- Group Events (open RSVP events) ---
app.get('/api/group-events', (req, res) => {
  if (!db.groupEvents) {
    db.groupEvents = [
      {
        id: 'ge-1', title: 'Saturday Run Club — 5K', sport: 'Running', emoji: '🏃',
        location: 'Brooklyn Bridge Park', neighborhood: 'DUMBO',
        day: 'Saturday', timeStart: '08:00', timeEnd: '09:00',
        image: ACTIVITY_IMAGES.Running,
        description: 'Weekly community run! All paces welcome. We regroup at the water fountain.',
        maxAttendees: 20,
        attendees: ['user-claire', 'user-thomas', 'user-sofia'].map(id => {
          const u = db.users.find(u => u.id === id);
          return u ? { id: u.id, firstName: u.firstName, photo: u.photos?.[0] } : null;
        }).filter(Boolean),
        host: (() => { const u = db.users.find(u => u.id === 'user-claire'); return u ? { id: u.id, firstName: u.firstName, photo: u.photos?.[0] } : null; })(),
        tags: ['beginner-friendly', 'social', 'free'],
      },
      {
        id: 'ge-2', title: 'Bouldering & Beers', sport: 'Bouldering', emoji: '🧗',
        location: 'Brooklyn Boulders', neighborhood: 'Gowanus',
        day: 'Friday', timeStart: '19:00', timeEnd: '21:30',
        image: ACTIVITY_IMAGES.Bouldering,
        description: 'Climb for 2 hours, then we hit the bar next door. Bring a friend!',
        maxAttendees: 12,
        attendees: ['user-sofia', 'user-thomas'].map(id => {
          const u = db.users.find(u => u.id === id);
          return u ? { id: u.id, firstName: u.firstName, photo: u.photos?.[0] } : null;
        }).filter(Boolean),
        host: (() => { const u = db.users.find(u => u.id === 'user-sofia'); return u ? { id: u.id, firstName: u.firstName, photo: u.photos?.[0] } : null; })(),
        tags: ['social', 'bring-a-friend', '$20 day pass'],
      },
      {
        id: 'ge-3', title: 'Sunset Yoga in the Park', sport: 'Yoga', emoji: '🧘',
        location: 'Sheep Meadow', neighborhood: 'Central Park',
        day: 'Sunday', timeStart: '17:30', timeEnd: '18:30',
        image: ACTIVITY_IMAGES.Yoga,
        description: 'Free outdoor yoga session. Bring your own mat. All levels welcome.',
        maxAttendees: 30,
        attendees: ['user-marina', 'user-emma', 'user-sofia'].map(id => {
          const u = db.users.find(u => u.id === id);
          return u ? { id: u.id, firstName: u.firstName, photo: u.photos?.[0] } : null;
        }).filter(Boolean),
        host: (() => { const u = db.users.find(u => u.id === 'user-emma'); return u ? { id: u.id, firstName: u.firstName, photo: u.photos?.[0] } : null; })(),
        tags: ['free', 'outdoor', 'all-levels'],
      },
      {
        id: 'ge-4', title: 'Padel Mixer — Doubles', sport: 'Padel', emoji: '🏓',
        location: 'Padel Haus', neighborhood: 'Williamsburg',
        day: 'Thursday', timeStart: '19:00', timeEnd: '21:00',
        image: ACTIVITY_IMAGES.Padel,
        description: 'Rotating doubles round-robin. Great way to meet new people. All levels.',
        maxAttendees: 16,
        attendees: ['user-emma', 'user-roberto'].map(id => {
          const u = db.users.find(u => u.id === id);
          return u ? { id: u.id, firstName: u.firstName, photo: u.photos?.[0] } : null;
        }).filter(Boolean),
        host: (() => { const u = db.users.find(u => u.id === 'user-roberto'); return u ? { id: u.id, firstName: u.firstName, photo: u.photos?.[0] } : null; })(),
        tags: ['social', 'bring-a-friend', '$35/person'],
      },
      {
        id: 'ge-5', title: 'Group Dinner — New Italian Spot', sport: 'Dinner', emoji: '🍽️',
        location: "Via Carota", neighborhood: 'West Village',
        day: 'Saturday', timeStart: '19:30', timeEnd: '22:00',
        image: ACTIVITY_IMAGES.Dinner,
        description: 'Trying the new Italian spot everyone\'s talking about. Bring a friend if you want!',
        maxAttendees: 8,
        attendees: ['user-marina', 'user-marco'].map(id => {
          const u = db.users.find(u => u.id === id);
          return u ? { id: u.id, firstName: u.firstName, photo: u.photos?.[0] } : null;
        }).filter(Boolean),
        host: (() => { const u = db.users.find(u => u.id === 'user-marina'); return u ? { id: u.id, firstName: u.firstName, photo: u.photos?.[0] } : null; })(),
        tags: ['social', 'bring-a-friend', 'double-date-friendly'],
      },
      // Outdoor / Adventure Group Events
      {
        id: 'ge-6', title: 'Rockaway Surf Day — All Levels', sport: 'Surfing', emoji: '🏄',
        location: 'Rockaway Beach 67th St', neighborhood: 'Rockaway Beach',
        day: 'Saturday', timeStart: '08:00', timeEnd: '12:00',
        image: ACTIVITY_IMAGES.Surfing,
        description: 'Surf session for all levels! Board rentals available at Boarders ($20). We meet at 67th St entrance, warm up, and hit the water. Tacos after at Tacoway Beach.',
        maxAttendees: 15,
        attendees: ['user-thomas', 'user-marina'].map(id => {
          const u = db.users.find(u => u.id === id);
          return u ? { id: u.id, firstName: u.firstName, photo: u.photos?.[0] } : null;
        }).filter(Boolean),
        host: (() => { const u = db.users.find(u => u.id === 'user-thomas'); return u ? { id: u.id, firstName: u.firstName, photo: u.photos?.[0] } : null; })(),
        tags: ['all-levels', 'bring-a-friend', 'board rental $20', 'A train accessible'],
      },
      {
        id: 'ge-7', title: 'Bear Mountain Group Hike', sport: 'Hiking', emoji: '🥾',
        location: 'Bear Mountain State Park', neighborhood: 'Bear Mountain',
        day: 'Sunday', timeStart: '08:00', timeEnd: '15:00',
        image: ACTIVITY_IMAGES.Hiking,
        description: 'Carpool from the city at 7am or meet at the trailhead at 8. We summit Bear Mountain (4mi round trip, moderate), picnic at the top, and optional swim at Hessian Lake. Perfect for transplants looking for nature friends!',
        maxAttendees: 12,
        attendees: ['user-sofia', 'user-claire', 'user-thomas'].map(id => {
          const u = db.users.find(u => u.id === id);
          return u ? { id: u.id, firstName: u.firstName, photo: u.photos?.[0] } : null;
        }).filter(Boolean),
        host: (() => { const u = db.users.find(u => u.id === 'user-claire'); return u ? { id: u.id, firstName: u.firstName, photo: u.photos?.[0] } : null; })(),
        tags: ['carpool', 'bring-a-friend', 'moderate', 'transplant-friendly'],
      },
      {
        id: 'ge-8', title: 'Overnight Camping — Harriman', sport: 'Camping', emoji: '🏕️',
        location: 'Beaver Pond Campground, Harriman', neighborhood: 'Harriman State Park',
        day: 'Saturday', timeStart: '10:00', timeEnd: '22:00',
        image: ACTIVITY_IMAGES.Camping,
        description: 'Car camping at Harriman — just 1 hour from the city! Hike during the day, campfire and s\'mores at night. Gear sharing available (we have extra tents). Great way to meet other outdoorsy transplants.',
        maxAttendees: 10,
        attendees: ['user-sofia', 'user-claire'].map(id => {
          const u = db.users.find(u => u.id === id);
          return u ? { id: u.id, firstName: u.firstName, photo: u.photos?.[0] } : null;
        }).filter(Boolean),
        host: (() => { const u = db.users.find(u => u.id === 'user-sofia'); return u ? { id: u.id, firstName: u.firstName, photo: u.photos?.[0] } : null; })(),
        tags: ['overnight', 'gear sharing', 'bring-a-friend', 'transplant-friendly'],
      },
      {
        id: 'ge-9', title: 'Breakneck Ridge Adventure', sport: 'Hiking', emoji: '🥾',
        location: 'Breakneck Ridge Trailhead, Cold Spring', neighborhood: 'Cold Spring',
        day: 'Saturday', timeStart: '07:30', timeEnd: '14:00',
        image: ACTIVITY_IMAGES.Hiking,
        description: 'One of the best scrambles near NYC! Metro-North from Grand Central to Cold Spring. Challenging but incredible views. We grab lunch in Cold Spring village after. Must be comfortable with scrambling.',
        maxAttendees: 8,
        attendees: ['user-thomas', 'user-sofia'].map(id => {
          const u = db.users.find(u => u.id === id);
          return u ? { id: u.id, firstName: u.firstName, photo: u.photos?.[0] } : null;
        }).filter(Boolean),
        host: (() => { const u = db.users.find(u => u.id === 'user-thomas'); return u ? { id: u.id, firstName: u.firstName, photo: u.photos?.[0] } : null; })(),
        tags: ['challenging', 'Metro-North', 'scramble', 'experienced'],
      },
    ];
  }
  res.json(db.groupEvents);
});

app.post('/api/group-events/:eventId/rsvp', (req, res) => {
  const { userId } = req.body;
  const event = db.groupEvents?.find(e => e.id === req.params.eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const already = event.attendees.find(a => a.id === userId);
  if (already) {
    event.attendees = event.attendees.filter(a => a.id !== userId);
    return res.json({ ...event, rsvpStatus: 'cancelled' });
  }

  if (event.attendees.length >= event.maxAttendees) {
    return res.status(400).json({ error: 'Event is full' });
  }

  const user = db.users.find(u => u.id === userId);
  event.attendees.push({ id: user.id, firstName: user.firstName, photo: user.photos?.[0] });
  res.json({ ...event, rsvpStatus: 'going' });
});

// --- Nearby Spots (coffee/food after an activity) ---
app.get('/api/nearby-spots', (req, res) => {
  const { neighborhood } = req.query;
  const SPOTS = {
    'West Village': [
      { name: "Jack's Stir Brew Coffee", type: 'coffee', rating: 4.5, distance: '0.2 mi', emoji: '☕' },
      { name: 'Via Carota', type: 'food', rating: 4.8, distance: '0.3 mi', emoji: '🍝' },
      { name: "Joe's Pizza", type: 'food', rating: 4.4, distance: '0.1 mi', emoji: '🍕' },
    ],
    'East Village': [
      { name: 'Abraço', type: 'coffee', rating: 4.7, distance: '0.1 mi', emoji: '☕' },
      { name: 'Veselka', type: 'food', rating: 4.5, distance: '0.2 mi', emoji: '🥟' },
      { name: "B&H Dairy", type: 'food', rating: 4.3, distance: '0.2 mi', emoji: '🥣' },
    ],
    'Williamsburg': [
      { name: 'Devocion', type: 'coffee', rating: 4.6, distance: '0.2 mi', emoji: '☕' },
      { name: 'Lilia', type: 'food', rating: 4.9, distance: '0.4 mi', emoji: '🍝' },
      { name: 'Sunday in Brooklyn', type: 'food', rating: 4.6, distance: '0.3 mi', emoji: '🥞' },
    ],
    'DUMBO': [
      { name: 'Brooklyn Roasting Company', type: 'coffee', rating: 4.4, distance: '0.1 mi', emoji: '☕' },
      { name: 'Juliana\'s Pizza', type: 'food', rating: 4.7, distance: '0.2 mi', emoji: '🍕' },
      { name: 'Time Out Market', type: 'food', rating: 4.3, distance: '0.3 mi', emoji: '🍔' },
    ],
    'SoHo': [
      { name: 'Gasoline Alley Coffee', type: 'coffee', rating: 4.5, distance: '0.2 mi', emoji: '☕' },
      { name: "Balthazar", type: 'food', rating: 4.6, distance: '0.3 mi', emoji: '🥐' },
      { name: 'Prince Street Pizza', type: 'food', rating: 4.5, distance: '0.1 mi', emoji: '🍕' },
    ],
    'Upper East Side': [
      { name: 'Blue Bottle Coffee', type: 'coffee', rating: 4.4, distance: '0.3 mi', emoji: '☕' },
      { name: "JG Melon", type: 'food', rating: 4.5, distance: '0.4 mi', emoji: '🍔' },
    ],
    'Gowanus': [
      { name: 'Sey Coffee', type: 'coffee', rating: 4.6, distance: '0.3 mi', emoji: '☕' },
      { name: 'Runner & Stone', type: 'food', rating: 4.5, distance: '0.2 mi', emoji: '🥖' },
    ],
    'Chelsea': [
      { name: 'Intelligentsia Coffee', type: 'coffee', rating: 4.5, distance: '0.2 mi', emoji: '☕' },
      { name: 'Los Tacos No. 1', type: 'food', rating: 4.7, distance: '0.3 mi', emoji: '🌮' },
    ],
    'Central Park': [
      { name: 'Think Coffee', type: 'coffee', rating: 4.3, distance: '0.3 mi', emoji: '☕' },
      { name: 'Le Pain Quotidien', type: 'food', rating: 4.2, distance: '0.2 mi', emoji: '🥐' },
    ],
    'Prospect Park': [
      { name: 'Café Regular du Nord', type: 'coffee', rating: 4.5, distance: '0.2 mi', emoji: '☕' },
      { name: 'Ample Hills Creamery', type: 'food', rating: 4.7, distance: '0.3 mi', emoji: '🍦' },
    ],
    'Rockaway Beach': [
      { name: 'Tacoway Beach', type: 'food', rating: 4.6, distance: '0.1 mi', emoji: '🌮' },
      { name: 'Rockaway Brewing Co.', type: 'food', rating: 4.5, distance: '0.3 mi', emoji: '🍺' },
      { name: 'Cuisine by Claudette', type: 'food', rating: 4.4, distance: '0.2 mi', emoji: '🥗' },
      { name: 'Boarders Surf Shop Coffee', type: 'coffee', rating: 4.3, distance: '0.1 mi', emoji: '☕' },
    ],
    'Bear Mountain': [
      { name: 'Bear Mountain Inn', type: 'food', rating: 4.2, distance: 'on site', emoji: '🍔' },
      { name: 'Hessian Lake Snack Bar', type: 'food', rating: 3.9, distance: '0.2 mi', emoji: '🌭' },
      { name: 'Peekskill Brewery', type: 'food', rating: 4.5, distance: '15 min drive', emoji: '🍺' },
    ],
    'Cold Spring': [
      { name: 'Cold Spring Depot', type: 'food', rating: 4.4, distance: '0.5 mi', emoji: '🍔' },
      { name: 'Brasserie le Bouchon', type: 'food', rating: 4.6, distance: '0.6 mi', emoji: '🥐' },
      { name: 'Cold Spring Coffee Pantry', type: 'coffee', rating: 4.5, distance: '0.5 mi', emoji: '☕' },
    ],
    'Harriman State Park': [
      { name: 'Woody\'s Smokehouse', type: 'food', rating: 4.3, distance: '10 min drive', emoji: '🍖' },
      { name: 'Mission Taqueria', type: 'food', rating: 4.4, distance: '15 min drive', emoji: '🌮' },
    ],
    'Palisades': [
      { name: 'The Park Café', type: 'coffee', rating: 4.2, distance: 'at trailhead', emoji: '☕' },
      { name: 'Clinton Inn Diner', type: 'food', rating: 4.0, distance: '0.5 mi', emoji: '🍳' },
    ],
    'Catskills': [
      { name: 'Phoenicia Diner', type: 'food', rating: 4.7, distance: '20 min drive', emoji: '🍳' },
      { name: 'Tinker Taco Lab', type: 'food', rating: 4.5, distance: '15 min drive', emoji: '🌮' },
    ],
  };

  const spots = SPOTS[neighborhood] || SPOTS['West Village'];
  res.json(spots);
});

// --- Reset Demo ---
app.post('/api/reset-demo', (req, res) => {
  // Wipe all dynamic data, re-seed from scratch
  db.swipes = [];
  db.matchCandidates = [];
  db.matchConfirmations = [];
  db.matches = [];
  db.plans = [];
  db.ratings = [];
  db.reports = [];
  db.messages = [];
  db.notifications = [];
  db.weeklySelections = [];
  db.groupEvents = null; // will re-generate on next fetch

  // Reset demo user stats
  const demoUser = db.users.find(u => u.id === 'demo-user');
  if (demoUser) {
    demoUser.totalPlans = 0;
    demoUser.showUpRate = 1.0;
  }

  // Re-generate activity slots
  db.activitySlots = generateSlots();

  // Re-seed other users' swipes
  db.activitySlots.forEach(slot => {
    slot.availableUsers.forEach(uid => {
      if (Math.random() > 0.3) {
        db.swipes.push({
          id: uuidv4(), userId: uid, slotId: slot.id,
          direction: 'yes', createdAt: new Date().toISOString(),
        });
      }
    });
  });

  const user = db.users.find(u => u.id === 'demo-user');
  res.json({ success: true, user });
});

// --- Admin ---
app.get('/api/admin/stats', (req, res) => {
  res.json({
    totalUsers: db.users.length,
    totalSlots: db.activitySlots.length,
    totalSwipes: db.swipes.length,
    totalMatchCandidates: db.matchCandidates.length,
    totalMatches: db.matches.length,
    totalConfirmedPlans: db.plans.filter(p => p.status === 'confirmed').length,
    totalCompletedPlans: db.plans.filter(p => p.status === 'completed').length,
  });
});

// ============================================================
// START SERVER
// ============================================================

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`⚡ ActiveCrew API running on port ${PORT}`);
  console.log(`   ${db.activitySlots.length} activity slots seeded`);
  console.log(`   ${db.users.length} users seeded`);
});

server.on('error', (err) => {
  if (err?.code === 'EADDRINUSE') {
    console.log(`⚠️  Port ${PORT} is already in use.`);
    process.exit(0);
  }
  console.error(err);
  process.exit(1);
});
