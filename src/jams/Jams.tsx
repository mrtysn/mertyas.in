import { useCallback, useEffect, useMemo, useState } from "react";
import Epg from "./Epg";
import {
  BRACKEYS_PATTERNS,
  BRACKEYS_THEMES,
  JAMS,
  SPRINTS,
  AiPolicy,
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

function jamName(key: string): string {
  return JAMS.find((j) => j.key === key)?.name ?? key;
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
            <tr key={row.key} onClick={() => goTo(`jam-${row.key}`)}>
              <td>{row.name}</td>
              <td>{row.build}</td>
              <td>{fmt(row.end)}</td>
              <td className="jams-left">{countdown(row.end, now)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Epg selected={focused.replace("jam-", "")} onSelect={(k) => goTo(`jam-${k}`)} />

      <div className="jams-body">
        <nav className="jams-nav">
          <span className="jams-nav-head">Builds</span>
          {SPRINTS.map((sprint) => (
            <a
              key={sprint.key}
              href={`#build-${sprint.key}`}
              className={focused === `build-${sprint.key}` ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                goTo(`build-${sprint.key}`);
              }}
            >
              {sprint.label}
            </a>
          ))}

          <span className="jams-nav-head">Jams</span>
          {orderedJams.map((jam) => (
            <a
              key={jam.key}
              href={`#jam-${jam.key}`}
              className={focused === `jam-${jam.key}` ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                goTo(`jam-${jam.key}`);
              }}
            >
              {jam.name}
            </a>
          ))}

          <span className="jams-nav-head">Reference</span>
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
          <h3>Builds</h3>
          {SPRINTS.map((sprint) => {
            const done = sprint.tasks.filter(
              (t) => checks[`${sprint.key}:${t}`]
            ).length;
            return (
              <section
                key={sprint.key}
                id={`build-${sprint.key}`}
                className="jam-detail"
              >
                <h4>
                  {sprint.label}{" "}
                  <span className="jam-sprint-meta">
                    {fmtDay(sprint.start)} → {fmtDay(sprint.end)} · {done}/
                    {sprint.tasks.length}
                  </span>
                </h4>
                <p className="jam-sprint-shared">
                  {sprint.jams.length > 1
                    ? `One build, entered in ${sprint.jams
                        .map(jamName)
                        .join(" and ")}.`
                    : `For ${sprint.jams.map(jamName).join(", ")}.`}
                </p>
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
              </section>
            );
          })}

          <h3>Jams</h3>
          {orderedJams.map((jam) => (
            <section key={jam.key} id={`jam-${jam.key}`} className="jam-detail">
              <h4>
                <a href={jam.url} target="_blank" rel="noopener noreferrer">
                  {jam.name}
                </a>
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
                  <span className={`jam-ai ${jam.ai}`}>{AI_LABEL[jam.ai]}</span>{" "}
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
