/**
 * ONLY THE DATES IN THIS FILE ARE AUTHORITATIVE.
 *
 * Everything else — themes, constraints, AI policies, rating categories,
 * participant counts, sprint task lists — is a snapshot taken on 2026-08-10 and
 * goes stale the moment a jam page is edited or the plan changes.
 *
 * If you are an agent working on one of these games: the live project is the
 * reference. Read its own repo, docs and commits. Do not treat anything below
 * the date fields here as current, and do not carry it into your work.
 */

export type AiPolicy = "banned" | "assist" | "unstated";

export interface Jam {
  key: string;
  name: string;
  url: string;
  /** ISO 8601, UTC. Jam window as published on itch.io. */
  start: string;
  end: string;
  theme: string;
  constraints: string[];
  ai: AiPolicy;
  aiNote: string;
  ratings: string[];
  joined?: number;
  prizes?: string;
}

export interface SprintDay {
  /** UTC midnight of the day. */
  date: string;
  work: string;
}

export interface Sprint {
  key: string;
  label: string;
  /** Jam keys this sprint feeds. */
  jams: string[];
  start: string;
  end: string;
  /** One outcome per day. Present where the sprint has been planned out. */
  days?: SprintDay[];
  tasks: string[];
}

/**
 * Windows are read off each jam's itch.io page and stored in UTC.
 * Ludum Dare is not hosted on itch; its window is the announced start
 * (Oct 16, 17:00 CDT) plus the 72h Jam track.
 */
export const JAMS: Jam[] = [
  {
    key: "lowrez",
    name: "LOWREZJAM 2026",
    url: "https://itch.io/jam/lowrezjam-2026",
    start: "2026-08-01T12:00:00Z",
    end: "2026-08-16T11:00:00Z",
    theme: "None required — 10 optional",
    constraints: [
      "64×64 maximum resolution — may scale up, but the in-game view stays 64×64",
      "No restriction on graphics, sound, 2D or 3D",
      "Teams allowed",
      "Optional themes: Time Is A Construct · Save. That. For. Later. Or… Die. · Pattern Recognition · Biological Restrictions · Obey The Game Master · Fugitive · Gotta Go Fast · Seeing With Sound · You're Not Allowed To Win · Cleanup Crew",
    ],
    ai: "unstated",
    aiNote: "No AI rule stated. Procedural and shader art needs no defending.",
    ratings: ["Gameplay", "Graphics", "Audio", "Authenticity"],
    joined: 355,
  },
  {
    key: "goedware",
    name: "GoedWare Summer Jam",
    url: "https://itch.io/jam/goedware-summer-jam-2026",
    start: "2026-08-01T09:00:00Z",
    end: "2026-08-16T20:00:00Z",
    theme: "STARGAZING",
    constraints: [
      "Teams of 4 or fewer recommended",
      "One entry per participant or team — a cap on entries given to this jam, not on where else the game goes",
      "Submitting the same game to another jam is permitted; the host confirmed it in a previous edition",
      "Theme announced at jam start — already known",
    ],
    ai: "assist",
    aiNote:
      "AI may assist with coding, writing, planning or asset creation, but design, creativity and core implementation must be your own.",
    ratings: ["Ranked, with prizes"],
    joined: 175,
    prizes: "Yes",
  },
  {
    key: "postjam",
    name: 'Post Jam "Jam" #13',
    url: "https://itch.io/jam/post-jam-jam-13",
    start: "2026-08-01T17:00:00Z",
    end: "2026-08-21T17:00:00Z",
    theme: "None",
    constraints: [
      "Submit an updated build, not a new game",
      "Does not need to come from a jam — any free release you are working on qualifies",
      "Uploads are never locked; the deadline exists only to set up review swaps",
    ],
    ai: "unstated",
    aiNote: "No AI rule stated.",
    ratings: ["Feedback only — no prizes, rankings are for feedback"],
    joined: 159,
  },
  {
    key: "brackeys",
    name: "Brackeys Game Jam 2026.2",
    url: "https://itch.io/jam/brackeys-16",
    start: "2026-08-23T10:00:00Z",
    end: "2026-08-30T10:00:00Z",
    theme: "Announced at start — community vote",
    constraints: [
      "Host on itch.io — no links to external downloads",
      "Teams under 4 recommended, no hard cap",
      "Pre-made assets allowed with the proper licence; crediting encouraged",
      "Game must be mostly original",
      "No grace period — submit early",
    ],
    ai: "banned",
    aiNote: "No AI-generated content. Procedural and shader art is still yours.",
    ratings: ["Peer-rated after the jam"],
    joined: 12900,
  },
  {
    key: "uplifting",
    name: "Uplifting Game Jam #9",
    url: "https://itch.io/jam/uplifting-game-jam-9",
    start: "2026-09-01T17:00:00Z",
    end: "2026-09-14T17:01:00Z",
    theme: "Make a game that uplifts the player",
    constraints: [
      "Maximum 5 people per team",
      "Family friendly",
      "One submission per person or team",
      "External art allowed if free or properly purchased, with every artist credited",
      "Release date must fall within the submission period",
    ],
    ai: "unstated",
    aiNote:
      "No AI rule stated. Purchased and free external assets are explicitly permitted.",
    ratings: [
      "Theme",
      "Upliftment",
      "Gameplay/Fun",
      "Visuals/Art",
      "Creativity/Innovation",
      "Smoothness/Polish",
      "Music/Sfx",
    ],
    joined: 140,
    prizes: "$100 / $65 / $40 / $25 / $10 + CraftPix memberships",
  },
  {
    key: "bezi",
    name: "Bezi Mega Jam",
    url: "https://itch.io/jam/bezi-mega-jam-1",
    start: "2026-09-14T07:00:00Z",
    end: "2026-09-29T06:59:00Z",
    theme: "Announced 14 Sep, 00:00 PST",
    constraints: [
      "Any engine",
      "Teams using Bezi unlock an additional prize track",
    ],
    ai: "unstated",
    aiNote: "AI tooling is rewarded here rather than restricted.",
    ratings: ["Ranked, with prizes"],
    joined: 243,
    prizes: "$12,000+ — GDC passes, iPad Pro M5, Synty assets, cash",
  },
  {
    key: "ld60",
    name: "Ludum Dare 60",
    url: "https://ldjam.com/events/ludum-dare",
    start: "2026-10-16T22:00:00Z",
    end: "2026-10-19T22:00:00Z",
    theme: "Community-voted, announced at start",
    constraints: [
      "Jam track: 72 hours, teams allowed, pre-made assets permitted",
      "Compo track: 48 hours, solo, every asset from scratch",
      "Take the Jam track",
    ],
    ai: "unstated",
    aiNote: "No AI rule stated for the Jam track.",
    ratings: ["Peer-rated"],
  },
  {
    key: "gameoff",
    name: "Game Off 2026",
    url: "https://itch.io/jam/game-off-2026",
    start: "2026-11-01T21:37:00Z",
    end: "2026-12-01T21:37:00Z",
    theme: "Announced 1 Nov",
    constraints: [
      "Source must live in a public GitHub repository",
      "Push before 1 Dec, 13:37 PST",
      "Any language, engine or library",
    ],
    ai: "unstated",
    aiNote: "No AI rule stated.",
    ratings: [
      "Overall",
      "Gameplay",
      "Graphics",
      "Audio",
      "Innovation",
      "Theme Interpretation",
    ],
  },
];

export const SPRINTS: Sprint[] = [
  {
    key: "s1",
    label: "64×64 stargazing",
    jams: ["lowrez", "goedware"],
    start: "2026-08-10T00:00:00Z",
    end: "2026-08-15T23:59:00Z",
    days: [
      {
        date: "2026-08-10",
        work: "Join both jams, choose the game, and get a placeholder build running at 64×64 on itch",
      },
      { date: "2026-08-11", work: "Build the core loop until it plays" },
      { date: "2026-08-12", work: "Add rounds, difficulty and scoring" },
      { date: "2026-08-13", work: "Draw the stars and add sound" },
      {
        date: "2026-08-14",
        work: "Add juice, menu and save — then stop adding features",
      },
      {
        date: "2026-08-15",
        work: "Fix bugs, write the itch page, submit to both jams",
      },
    ],
    tasks: [
      "Join LOWREZJAM on itch",
      "Join GoedWare on itch",
      "Choose the game and write its pitch in one sentence",
      "Add the game to oj — registry row, source folder, web profile",
      "Render the game at 64×64 and scale it up without blurring",
      "Publish a placeholder web build to itch",
      "Build the core loop until it plays",
      "Open the itch build on a machine you have never used",
      "Write the itch page — cover, screenshots, description",
      "Submit to LOWREZJAM before 16 Aug, 14:00",
      "Submit to GoedWare before 16 Aug, 23:00",
    ],
  },
  {
    key: "s-postjam",
    label: "Post Jam submission",
    jams: ["postjam"],
    start: "2026-08-17T00:00:00Z",
    end: "2026-08-21T17:00:00Z",
    tasks: [
      "Choose which game to update — Moji or Nine to Fine",
      "Deploy an updated web build",
      "Write the jam page",
      "Submit before 21 Aug, 20:00",
      "Sign up for the Discord review swap",
    ],
  },
  {
    key: "s2",
    label: "Brackeys prep — theme-independent",
    jams: ["brackeys"],
    start: "2026-08-18T00:00:00Z",
    end: "2026-08-22T23:59:00Z",
    tasks: [
      "Run the export and butler chain on a clean machine",
      "Build a core loop around an inversion, with no story attached to it",
      "Wire up menu, pause, settings and save through OverlayService",
      "Wire up particles, screenshake, transitions and the audio bus",
      "Create the itch page before the theme lands",
      "Buy and import the asset packs",
    ],
  },
  {
    key: "s3",
    label: "Brackeys build",
    jams: ["brackeys"],
    start: "2026-08-23T10:00:00Z",
    end: "2026-08-29T23:59:00Z",
    tasks: [
      "Read the theme when it lands on 23 Aug",
      "Choose the game the same day",
      "Get a vertical slice playable by day 3",
      "Finish the content by day 5",
      "Polish and export for web by day 6",
      "Submit on day 6 — there is no grace period",
      "Rate other entries",
    ],
  },
  {
    key: "s4",
    label: "Uplifting",
    jams: ["uplifting"],
    start: "2026-09-01T17:00:00Z",
    end: "2026-09-05T23:59:00Z",
    tasks: [
      "Choose the game",
      "Buy the assets and credit every artist",
      "Build the core loop until it plays",
      "Open the itch build on a machine you have never used",
      "Submit before 14 Sep, 20:01",
    ],
  },
  {
    key: "s5",
    label: "Bezi Mega Jam",
    jams: ["bezi"],
    start: "2026-09-15T00:00:00Z",
    end: "2026-09-19T23:59:00Z",
    tasks: [
      "Read the theme when it lands on 14 Sep",
      "Decide whether to enter the Bezi bonus prize track",
      "Build the core loop until it plays",
      "Open the itch build on a machine you have never used",
      "Submit before 29 Sep, 09:59",
    ],
  },
  {
    key: "s6",
    label: "Ludum Dare 60",
    jams: ["ld60"],
    start: "2026-10-16T22:00:00Z",
    end: "2026-10-19T22:00:00Z",
    tasks: [
      "Enter the Jam track, not Compo",
      "Read the theme when it lands on 17 Oct",
      "Get it playable on day 1",
      "Submit before the 72 hours are up",
    ],
  },
  {
    key: "s7",
    label: "Game Off",
    jams: ["gameoff"],
    start: "2026-11-01T21:37:00Z",
    end: "2026-11-07T23:59:00Z",
    tasks: [
      "Create a public GitHub repo — extract from oj, or open oj itself",
      "Read the theme when it lands on 1 Nov",
      "Build the core loop until it plays",
      "Open the itch build on a machine you have never used",
      "Push the repo and submit",
    ],
  },
];

/** Themes are lifted from the announcement banner on each jam page. */
export const BRACKEYS_THEMES: { edition: string; theme: string }[] = [
  { edition: "2019.1", theme: "Love is blind" },
  { edition: "2020.1", theme: "Holes" },
  { edition: "2020.2", theme: "Rewind" },
  { edition: "2021.1", theme: "Stronger Together" },
  { edition: "2021.2", theme: "Let There Be Chaos" },
  { edition: "2022.1", theme: "It Is Not Real" },
  { edition: "2022.2", theme: "You're Not Alone" },
  { edition: "2023.1", theme: "An End Is A New Beginning" },
  { edition: "2023.2", theme: "Diving Deeper" },
  { edition: "2024.1", theme: "What's Behind The Door?" },
  { edition: "2024.2", theme: "Calm Before The Storm" },
  { edition: "2025.1", theme: "Nothing Can Go Wrong…" },
  { edition: "2025.2", theme: "Risk It For The Biscuit" },
  { edition: "2026.1", theme: "Strange Places" },
];

export const BRACKEYS_PATTERNS: string[] = [
  "They reappropriate an English idiom — six of fourteen are stock phrases, and the jam expects the cliché subverted rather than illustrated.",
  "A phrase, not a noun. Both single-word themes are from 2020; every theme since is two to five words.",
  "A reversal is built in — the theme itself carries the twist, and winning entries invert it.",
  "Never mechanical. Not one theme names a genre, a control scheme or a constraint, so no mechanic can be pre-derived from it.",
  "Community-voted, so punchy beats literary.",
];
