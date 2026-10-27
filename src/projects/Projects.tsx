import { useEffect, type ReactNode } from "react";
import Outlink from "../utils/Outlink";

interface Work {
  title: string;
  outcome: string;
  roles: string;
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
    title: "Mobile game backend",
    outcome: "Built alone for two games; Royal Smash reached 4.4M+ players",
    roles: "backend · CTO",
    detail: (
      <>
        Sole backend engineer for{" "}
        <Outlink text="Match Squad" link="https://apps.apple.com/us/app/match-squad/id6473704944" /> and{" "}
        <Outlink text="Royal Smash" link="https://apps.apple.com/us/app/royal-smash-physics-puzzle/id6780891673" />, built
        from scratch on .NET, SignalR, MongoDB and Redis. One platform keeps each game's data and live traffic apart.
      </>
    ),
    facts: [
      "Royal Smash: top 10 worldwide by daily downloads, #2 Top Free Game on US Google Play, #1 in the Turkish App Store",
      "A LiveOps engine (scheduled events, season passes, team events, real-time leaderboards), an admin dashboard and server-side cheat detection",
      "Terraform-managed AWS, zero-downtime deployments, k6 load tests and OpenTelemetry observability",
    ],
  },
  {
    title: "Game frameworks",
    outcome: "One shape across Godot, Roblox and three.js; 12 games on the first",
    roles: "backend · CTO",
    detail:
      "A solo developer can start a new mobile game without rebuilding the plumbing. Three frameworks share one shape: engine-free services, one game per folder, one command-line tool that checks, tests and builds.",
    facts: [
      "oj (Godot) carries 12 games; robloj (Roblox) keeps Luau in Git and is built and checked from the command line; threej (three.js) is for very small playables",
      "A written spec of what an agent reads and drives in any of them: snapshots, actions, a journal and state diffs",
    ],
  },
  {
    title: "AI agent infrastructure",
    outcome: "Fact-checking, local decisions, polite fetching and a request limiter",
    roles: "AI engineer · researcher",
    detail:
      "Agents make confident mistakes and, left alone, hammer websites. Four tools address that: a fact-check layer, a local decision model, one fetch service and a request limiter.",
    facts: [
      "The fact-check layer fixes a claim's competing hypotheses before any retrieval, decides numeric relations with the Z3 solver and answers “unknown” when it has no source",
      "The local decision model answers yes/no, scoring and pick-one-of-N questions with a probability for each option, and nothing leaves the machine",
      "The fetch service requests each page once under a per-site budget and archives it; the limiter was built after an agent sent about 100 requests to Google in 90 minutes and got two IPs answered with 429",
    ],
  },
  {
    title: "Local AI asset pipeline",
    outcome: "Generated game art, reviewed by hand before any engine imports it",
    roles: "AI engineer",
    detail:
      "AI-generated game art usually ends in a folder of unreviewed files. This pipeline generates 2D images, 3D meshes, procedural geometry, shaders and video locally for Unity and Godot, and printable solids for a 3D printer.",
    facts: [
      "One loop: generate, review, move to the reviewed folder, and only then do the engines import it",
      "Only the reviewed folder is read by the engines and the slicer; nothing crosses that boundary automatically",
    ],
  },
  {
    title: "One-command project lifecycle",
    outcome: "Test, build, install, deploy and report on any project the same way",
    roles: "CTO · backend",
    detail:
      "A one-person company runs dozens of projects, and each needs the same discipline. One command reads each repo's manifest and drives the right toolchain, with a shared base for Mac apps.",
    facts: [
      "A dashboard shows every ongoing and past project from one generated data file",
      "Self-hosted app stacks run on one box behind a shared reverse proxy, each as its own Docker Compose stack, with a runbook covering backups and security",
    ],
  },
  {
    title: "Public tools",
    outcome: "Link Keeper, cc-statusline and agents-shared, open on GitHub",
    roles: "AI engineer · CTO",
    detail: (
      <>
        <Outlink text="Link Keeper" link="https://github.com/mrtysn/link-keeper" /> is a Firefox extension for working through
        a pile of saved links and capturing what is worth keeping.{" "}
        <Outlink text="cc-statusline" link="https://github.com/mrtysn/cc-statusline" /> is a single-file Claude Code status
        line with no dependencies. <Outlink text="agents-shared" link="https://github.com/mrtysn/agents-shared" /> is a set of
        shared rules, skills and commands for Claude Code.
      </>
    ),
    facts: [],
  },
];

function Projects() {
  useEffect(() => {
    document.title = "Projects — Mert Yaşin";
  }, []);

  return (
    <div>
      <h1>Projects</h1>
      <p>Backend, CTO, AI engineering and research work. Private repositories are described, not linked.</p>
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
              <span className="work-roles">{w.roles}</span>
            </summary>
            <p>{w.detail}</p>
            {w.facts.length > 0 && (
              <ul>
                {w.facts.map((f, j) => (
                  <li key={j}>{f}</li>
                ))}
              </ul>
            )}
          </details>
        ))}
      </div>
    </div>
  );
}

export default Projects;
