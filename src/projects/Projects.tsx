import type { ReactNode } from "react";
import Outlink from "../utils/Outlink";

interface Work {
  title: string;
  summary: ReactNode;
  facts: ReactNode[];
  roles: string;
}

const work: Work[] = [
  {
    title: "A multi-tenant mobile game backend, built alone",
    summary: (
      <>
        Sole backend engineer for{" "}
        <Outlink text="Match Squad" link="https://apps.apple.com/us/app/match-squad/id6473704944" /> and{" "}
        <Outlink text="Royal Smash" link="https://apps.apple.com/us/app/royal-smash-physics-puzzle/id6780891673" />, built
        from scratch on .NET, SignalR, MongoDB and Redis. One platform keeps each game's data and live traffic apart.
      </>
    ),
    facts: [
      "Royal Smash reached 4.4M+ players and 1M+ daily players within four weeks, top 10 worldwide by daily downloads, #2 Top Free Game on US Google Play and #1 in the Turkish App Store",
      "A LiveOps engine (scheduled events, season passes, team events, real-time leaderboards), an admin dashboard and server-side cheat detection",
      "Terraform-managed AWS, zero-downtime deployments, k6 load tests and OpenTelemetry observability",
    ],
    roles: "backend · CTO",
  },
  {
    title: "One game-framework shape across Godot, Roblox and three.js",
    summary:
      "A solo developer can start a new mobile game without rebuilding the plumbing. Three frameworks share one shape: engine-free services, one game per folder, one command-line tool that checks, tests and builds.",
    facts: [
      "oj (Godot) carries 12 games; robloj (Roblox) keeps Luau in Git and is built and checked from the command line; threej (three.js) is for very small playables",
      "A written spec of what an agent reads and drives in any of them: snapshots, actions, a journal and state diffs",
    ],
    roles: "backend · CTO",
  },
  {
    title: "Infrastructure that makes AI agents reliable",
    summary:
      "Agents make confident mistakes and, left alone, hammer websites. Four tools address that: a fact-check layer, a local decision model, one fetch service and a request limiter.",
    facts: [
      "The fact-check layer fixes a claim's competing hypotheses before any retrieval, decides numeric relations with the Z3 solver and answers “unknown” when it has no source",
      "The local decision model answers yes/no, scoring and pick-one-of-N questions with a probability for each option, and nothing leaves the machine",
      "The fetch service requests each page once under a per-site budget and archives it; the limiter was built after an agent sent about 100 requests to Google in 90 minutes and got two IPs answered with 429",
    ],
    roles: "AI engineer · researcher",
  },
  {
    title: "A local AI asset pipeline for game engines",
    summary:
      "AI-generated game art usually ends in a folder of unreviewed files. This pipeline generates 2D images, 3D meshes, procedural geometry, shaders and video locally for Unity and Godot, and printable solids for a 3D printer.",
    facts: [
      "One loop: generate, review, move to the reviewed folder, and only then do the engines import it",
      "Only the reviewed folder is read by the engines and the slicer; nothing crosses that boundary automatically",
    ],
    roles: "AI engineer",
  },
  {
    title: "One command to test, build, install, deploy and report on any project",
    summary:
      "A one-person company runs dozens of projects, and each needs the same discipline. One command reads each repo's manifest and drives the right toolchain, with a shared base for Mac apps.",
    facts: [
      "A dashboard shows every ongoing and past project from one generated data file",
      "Self-hosted app stacks run on one box behind a shared reverse proxy, each as its own Docker Compose stack, with a runbook covering backups and security",
    ],
    roles: "CTO · backend",
  },
  {
    title: "Public tools other people can install",
    summary: (
      <>
        <Outlink text="Link Keeper" link="https://github.com/mrtysn/link-keeper" /> is a Firefox extension for working through
        a pile of saved links and capturing what is worth keeping.{" "}
        <Outlink text="cc-statusline" link="https://github.com/mrtysn/cc-statusline" /> is a single-file Claude Code status
        line with no dependencies. <Outlink text="agents-shared" link="https://github.com/mrtysn/agents-shared" /> is a set of
        shared rules, skills and commands for Claude Code.
      </>
    ),
    facts: [],
    roles: "AI engineer · CTO",
  },
];

function Projects() {
  return (
    <div>
      <h1 className="page-title">Projects</h1>
      <p>Six pieces of work, grouped by what they show. Private repositories are described, not linked.</p>
      {work.map((w) => (
        <section key={w.title}>
          <h2>{w.title}</h2>
          <p>{w.summary}</p>
          {w.facts.length > 0 && (
            <ul>
              {w.facts.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          )}
          <p>
            <small>{w.roles}</small>
          </p>
        </section>
      ))}
    </div>
  );
}

export default Projects;
