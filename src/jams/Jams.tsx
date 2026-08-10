import { useCallback, useEffect, useMemo, useState } from "react";
import Epg from "./Epg";
import {
  BRACKEYS_PATTERNS,
  BRACKEYS_THEMES,
  JAMS,
  SPRINTS,
  AiPolicy,
  Jam,
  Sprint,
} from "./data";

const CHECKS_KEY = "jams:checks";

/**
 * Deadlines render in a fixed zone rather than the browser's.
 * Firefox with `privacy.resistFingerprinting` reports UTC, which silently
 * showed every deadline three hours early — a jam page that lies about when a
 * jam closes is worse than useless.
 */
const TZ = "Europe/Istanbul";
const TZ_LABEL = "Istanbul time";

const AI_LABEL: Record<AiPolicy, string> = {
  banned: "AI assets banned",
  assist: "AI as assist only",
  unstated: "No AI rule stated",
};

function loadChecks(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(CHECKS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TZ,
  });
}

/**
 * Sprint bounds are day-granular, so they render in UTC — the zone they were
 * written in. Converting to local time would slide a sprint stored as
 * 15 Aug 23:59Z onto the 16th.
 */
function fmtDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function countdown(iso: string, now: number): string {
  const ms = Date.parse(iso) - now;
  if (ms <= 0) return "closed";
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function Jams() {
  const [checks, setChecks] = useState<Record<string, boolean>>(loadChecks);
  const [now, setNow] = useState<number>(() => Date.now());
  const [focused, setFocused] = useState<string>("");

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    localStorage.setItem(CHECKS_KEY, JSON.stringify(checks));
  }, [checks]);

  const toggle = useCallback((id: string) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Every section is always rendered; selecting only scrolls and highlights.
  const goTo = useCallback((id: string) => {
    setFocused(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const schedule = useMemo(
    () =>
      [...JAMS]
        .sort((a, b) => Date.parse(a.end) - Date.parse(b.end))
        .map((jam) => {
          // Brackeys has two sprints — prep and build. Span the lot, or the
          // table reports the prep window as if it were the whole effort.
          const own = SPRINTS.filter((s) => s.jams.includes(jam.key));
          return {
            key: jam.key,
            name: jam.name,
            end: jam.end,
            build: own.length
              ? `${fmtDay(own[0].start)} – ${fmtDay(own[own.length - 1].end)}`
              : "—",
          };
        }),
    []
  );

  const orderedJams = useMemo(
    () => [...JAMS].sort((a, b) => Date.parse(a.end) - Date.parse(b.end)),
    []
  );

  /**
   * One entry per thing you actually make. Builds and jams are not one-to-one —
   * the 64×64 build feeds two jams, Brackeys takes two builds — so grouping by
   * jam duplicates checklists and grouping by build duplicates jam rules.
   * Grouping by the closure of both gives each effort exactly one section.
   */
  const entries = useMemo(() => {
    const seen = new Set<string>();
    const out: {
      id: string;
      label: string;
      jams: Jam[];
      sprints: Sprint[];
    }[] = [];

    for (const jam of orderedJams) {
      if (seen.has(jam.key)) continue;

      const sprints = SPRINTS.filter((s) => s.jams.includes(jam.key));
      const keys = new Set<string>(sprints.flatMap((s) => s.jams));
      keys.add(jam.key);

      const jams = orderedJams.filter((j) => keys.has(j.key));
      jams.forEach((j) => seen.add(j.key));

      out.push({
        id: `entry-${jams.map((j) => j.key).join("-")}`,
        label: jams.map((j) => j.name).join(" + "),
        jams,
        sprints,
      });
    }
    return out;
  }, [orderedJams]);

  /** Timeline rows and table rows are per jam; sections are per entry. */
  const entryIdFor = useCallback(
    (jamKey: string) =>
      entries.find((e) => e.jams.some((j) => j.key === jamKey))?.id ?? "",
    [entries]
  );

  return (
    <div className="jams">
      <h2>Game jams</h2>

      <p className="jams-authority">
        <strong>Only the dates are authoritative.</strong> Everything else is a
        snapshot from 10 August 2026. An agent working on one of these games
        should read the live project, not this page.
      </p>

      <table className="jams-schedule">
        <thead>
          <tr>
            <th>Jam</th>
            <th>Build</th>
            <th>Closes ({TZ_LABEL})</th>
            <th>Left</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((row) => (
            <tr key={row.key} onClick={() => goTo(entryIdFor(row.key))}>
              <td>{row.name}</td>
              <td>{row.build}</td>
              <td>{fmt(row.end)}</td>
              <td className="jams-left">{countdown(row.end, now)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Epg selected="" onSelect={(k) => goTo(entryIdFor(k))} />

      <div className="jams-body">
        <nav className="jams-nav">
          {entries.map((entry) => (
            <a
              key={entry.id}
              href={`#${entry.id}`}
              className={focused === entry.id ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                goTo(entry.id);
              }}
            >
              {entry.label}
            </a>
          ))}
          <a
            href="#brackeys-themes"
            className={focused === "brackeys-themes" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              goTo("brackeys-themes");
            }}
          >
            Brackeys themes
          </a>
        </nav>

        <div className="jams-sections">
          {entries.map((entry) => (
            <section key={entry.id} id={entry.id} className="jam-detail">
              <h3>{entry.label}</h3>

              {entry.sprints.map((sprint) => {
                const done = sprint.tasks.filter(
                  (t) => checks[`${sprint.key}:${t}`]
                ).length;
                return (
                  <div key={sprint.key}>
                    <h4>
                      {sprint.label}{" "}
                      <span className="jam-sprint-meta">
                        {fmtDay(sprint.start)} → {fmtDay(sprint.end)} · {done}/
                        {sprint.tasks.length}
                      </span>
                    </h4>
                    <ul className="jam-checklist">
                      {sprint.tasks.map((task) => {
                        const id = `${sprint.key}:${task}`;
                        return (
                          <li key={id}>
                            <label className={checks[id] ? "done" : undefined}>
                              <input
                                type="checkbox"
                                checked={!!checks[id]}
                                onChange={() => toggle(id)}
                              />
                              {task}
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}

              {entry.jams.map((jam) => (
                <div key={jam.key} className="jam-rules">
                  <h4>
                    <a href={jam.url} target="_blank" rel="noopener noreferrer">
                      {jam.name}
                    </a>{" "}
                    <span className="jam-sprint-meta">the rules</span>
                  </h4>

                  <dl className="jam-facts">
                    <dt>Window</dt>
                    <dd>
                      {fmt(jam.start)} → {fmt(jam.end)}
                    </dd>
                    <dt>Theme</dt>
                    <dd>{jam.theme}</dd>
                    <dt>AI</dt>
                    <dd>
                      <span className={`jam-ai ${jam.ai}`}>
                        {AI_LABEL[jam.ai]}
                      </span>{" "}
                      {jam.aiNote}
                    </dd>
                    <dt>Rated on</dt>
                    <dd>{jam.ratings.join(" · ")}</dd>
                    {jam.prizes && (
                      <>
                        <dt>Prizes</dt>
                        <dd>{jam.prizes}</dd>
                      </>
                    )}
                  </dl>

                  <ul className="jam-constraints">
                    {jam.constraints.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))}

          <section id="brackeys-themes">
            <h3>Brackeys theme patterns</h3>
            <ul className="jam-constraints">
              {BRACKEYS_PATTERNS.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="jams-intro">
              Derived from all fourteen editions, each read off its own
              announcement banner:{" "}
              {BRACKEYS_THEMES.map((t) => t.theme).join(" · ")}.
            </p>
          </section>

          <p className="jams-intro">
            Windows are read off each jam page and stored in UTC. Times show in{" "}
            {TZ_LABEL} on a 24-hour clock rather than your browser's zone —
            Firefox with fingerprint resistance reports UTC and would show every
            deadline three hours early. Checklists live in this browser.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Jams;
