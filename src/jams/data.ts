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

export interface Sprint {
  key: string;
  label: string;
  /** Jam keys this sprint feeds. */
  jams: string[];
  start: string;
  end: string;
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
    start: "2026-08-11T00:00:00Z",
    end: "2026-08-15T23:59:00Z",
    tasks: [
      "Concept locked",
      "64×64 SubViewport rendering correctly",
      "Core loop playable",
      "Web export verified on a clean profile",
      "itch page — cover, screenshots, description",
      "Submitted to LOWREZJAM (16 Aug, 14:00 Istanbul)",
      "Submitted to GoedWare (16 Aug, 23:00 Istanbul)",
    ],
  },
  {
    key: "s-postjam",
    label: "Post Jam submission",
    jams: ["postjam"],
    start: "2026-08-17T00:00:00Z",
    end: "2026-08-21T17:00:00Z",
    tasks: [
      "Pick the build — Moji or Nine to Fine",
      "Deploy an updated web build",
      "Write the jam page",
      "Submitted (21 Aug, 20:00 Istanbul)",
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
      "Export → butler path proven end to end on a clean machine",
      "Fiction-agnostic core loop built around an inversion",
      "Shell wired: menu, pause, settings, save via OverlayService",
      "Juice: particles, screenshake, transitions, audio bus + SFX pool",
      "itch page shell created ahead of the theme",
      "Asset packs bought and imported",
    ],
  },
  {
    key: "s3",
    label: "Brackeys build",
    jams: ["brackeys"],
    start: "2026-08-23T10:00:00Z",
    end: "2026-08-29T23:59:00Z",
    tasks: [
      "Theme read at 13:00 Istanbul, 23 Aug",
      "Concept locked within 3 hours",
      "Vertical slice playable by day 3",
      "Content complete by day 5",
      "Polish and web export by day 6",
      "Submitted early — no grace period (30 Aug, 13:00 Istanbul)",
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
      "Concept locked",
      "Purchased assets sourced and every artist credited",
      "Core loop playable",
      "Web export verified",
      "Submitted (14 Sep, 20:01 Istanbul)",
    ],
  },
  {
    key: "s5",
    label: "Bezi Mega Jam",
    jams: ["bezi"],
    start: "2026-09-15T00:00:00Z",
    end: "2026-09-19T23:59:00Z",
    tasks: [
      "Theme read 14 Sep",
      "Decide on the Bezi bonus prize track",
      "Core loop playable",
      "Web export verified",
      "Submitted (29 Sep, 09:59 Istanbul)",
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
      "Theme read at 01:00 Istanbul, 17 Oct",
      "Playable by hour 24",
      "Submitted before the 72h mark",
    ],
  },
  {
    key: "s7",
    label: "Game Off",
    jams: ["gameoff"],
    start: "2026-11-01T21:37:00Z",
    end: "2026-11-07T23:59:00Z",
    tasks: [
      "Public GitHub repo created — decide whether to extract from oj or open it",
      "Theme read 1 Nov",
      "Core loop playable",
      "Web export verified",
      "Pushed and submitted",
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
