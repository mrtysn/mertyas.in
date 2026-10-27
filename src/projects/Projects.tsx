import { useEffect, type ReactNode } from "react";
import Outlink from "../utils/Outlink";

interface Work {
  title: string;
  outcome: string;
  where: string;
  detail: ReactNode;
  facts: ReactNode[];
}

const figures = [
  { value: "4.4M+", label: "players on a backend built alone" },
  { value: "1M+", label: "daily players within four weeks of launch" },
  { value: "#2", label: "Top Free Game on US Google Play" },
];

const work: Work[] = [
  {
    title: "Backend",
    outcome: "Sole backend engineer for two mobile games; Royal Smash reached 4.4M+ players",
    where: "Cypher Games, 2024–26",
    detail: (
      <>
        Built the backends for{" "}
        <Outlink text="Match Squad" link="https://apps.apple.com/us/app/match-squad/id6473704944" /> and{" "}
        <Outlink text="Royal Smash" link="https://apps.apple.com/us/app/royal-smash-physics-puzzle/id6780891673" /> from
        scratch on .NET, SignalR, MongoDB and Redis. One multi-tenant platform keeps each game’s data and live traffic apart.
      </>
    ),
    facts: [
      "Royal Smash: top 10 worldwide by daily downloads, #2 Top Free Game on US Google Play, #1 in the Turkish App Store",
      "A LiveOps engine (scheduled events, season passes, team events, real-time leaderboards), an admin dashboard and server-side cheat detection",
      "Terraform-managed AWS, zero-downtime deployments, k6 load tests and OpenTelemetry observability",
    ],
  },
  {
    title: "CTO",
    outcome: "Led the technical team of a startup at the Garanti BBVA Partners accelerator",
    where: "appliedAI, 2017–18",
    detail:
      "Coordinated core product development with the team, interns and freelance developers, and kept the full stack running with zero-downtime deployments.",
    facts: [
      "Scaled the B2B data analytics and AI platform to 2,700+ monthly active users",
      "Curated a database of 3,000+ AI companies through web crawling and organic user acquisition, and built a lead pipeline through proof-of-concept partnerships with vendors",
      "Migrated the front end from Angular to React; the stack was ReactJS, MobX, Django REST Framework and PostgreSQL on Heroku",
    ],
  },
  {
    title: "AI engineering",
    outcome: "Agents that check their claims, a local decision model and a local asset pipeline",
    where: "own work, 2026",
    detail:
      "Agents make confident mistakes and, left alone, hammer websites. Four tools address that, and a fifth turns generation into a reviewed pipeline.",
    facts: [
      "A fact-check layer fixes a claim’s competing hypotheses before any retrieval, decides numeric relations with the Z3 solver and answers “unknown” when it has no source",
      "A local decision model answers yes/no, scoring and pick-one-of-N questions with a probability for each option, and nothing leaves the machine",
      "One fetch service requests each page once under a per-site budget and archives it, and a request limiter keeps every agent within that budget",
      "A local asset pipeline generates 2D images, 3D meshes, shaders and video for Unity and Godot; only the reviewed folder is ever read by the engines",
    ],
  },
  {
    title: "Research",
    outcome: "PhD research in machine learning, a winning AI project and a funded grant proposal",
    where: "2016–",
    detail:
      "PhD ABD in Computer Science at Wayne State University, with the qualifying exam passed in 2020 and research in early seizure detection from EEG and in disease subtyping from genomic data.",
    facts: [
      <>
        Ranked 1st at inzva’s <Outlink text="AI Projects #7" link="https://inzva.com/reports/2022/ai-projects-7" /> with a
        deep-learning project on procedural pattern generation, in 2022
      </>,
      <>
        Authored the successful{" "}
        <Outlink
          text="TÜBİTAK 1501"
          link="https://tubitak.gov.tr/en/funds/industrial/national-support-programs/1501-industrial-rd-projects-grant-programme"
        />{" "}
        industrial R&amp;D proposal at VenueX, using computer vision and large language models to process merchant data
      </>,
      "Machine learning consultant at ING Bank’s OrangeLab (ATM predictive maintenance, credit-limit and NPS prediction); later taught deep learning and data mining at Wayne State",
    ],
  },
  {
    title: "Built for myself",
    outcome: "Game frameworks, one-command tooling and tools open on GitHub",
    where: "own work, 2025–26",
    detail: (
      <>
        <Outlink text="Link Keeper" link="https://github.com/mrtysn/link-keeper" /> is a Firefox extension for working through
        a pile of saved links, <Outlink text="cc-statusline" link="https://github.com/mrtysn/cc-statusline" /> is a
        single-file Claude Code status line, and <Outlink text="agents-shared" link="https://github.com/mrtysn/agents-shared" />{" "}
        is a set of shared rules, skills and commands for Claude Code. The rest is private and described here.
      </>
    ),
    facts: [
      "One game-framework shape across Godot, Roblox and three.js: engine-free services, one game per folder, one command-line tool that checks, tests and builds; the Godot one carries 12 games",
      "One command to test, build, install, deploy and report on any project, plus a dashboard of every ongoing and past project",
      "Self-hosted app stacks on one box behind a shared reverse proxy, each its own Docker Compose stack, with a runbook covering backups and security",
    ],
  },
];

function Projects() {
  useEffect(() => {
    document.title = "Projects — Mert Yaşin";
  }, []);

  return (
    <div>
      <h1>Projects</h1>
      <p>One row per role, with the work that backs it. Private repositories are described, not linked.</p>
      <ul className="figures">
        {figures.map((f) => (
          <li key={f.value}>
            <strong>{f.value}</strong>
            <span>{f.label}</span>
          </li>
        ))}
      </ul>
      <div className="work">
        {work.map((w, i) => (
          <details key={w.title} open={i === 0}>
            <summary>
              <span className="work-title">{w.title}</span>
              <span className="work-outcome">{w.outcome}</span>
              <span className="work-where">{w.where}</span>
            </summary>
            <p>{w.detail}</p>
            <ul>
              {w.facts.map((f, j) => (
                <li key={j}>{f}</li>
              ))}
            </ul>
          </details>
        ))}
      </div>
      <p>
        Building a game backend or need a fractional CTO?{" "}
        <Outlink text="Message me on LinkedIn" link="https://linkedin.com/in/mert-yasin/" />.
      </p>
    </div>
  );
}

export default Projects;
