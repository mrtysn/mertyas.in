import { useCallback, useEffect, useMemo, useState } from "react";
import Epg from "./Epg";
import {
  BRACKEYS_PATTERNS,
  BRACKEYS_THEMES,
  JAMS,
  SPRINTS,
  AiPolicy,
  Jam,
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

  const nextOpen = useMemo(
    () =>
      [...JAMS]
        .filter((j) => Date.parse(j.end) > now)
        .sort((a, b) => Date.parse(a.end) - Date.parse(b.end)),
    [now]
  );

  // Jams fed by one shared sprint are one piece of work, so they get one card.
  const nextCards = useMemo(() => {
    const seen = new Set<string>();
    const cards: { key: string; jams: Jam[]; label: string; end: string }[] = [];

    for (const jam of nextOpen) {
      if (seen.has(jam.key)) continue;
      const shared = SPRINTS.find(
        (s) => s.jams.includes(jam.key) && s.jams.length > 1
      );
      const group = shared
        ? nextOpen.filter((j) => shared.jams.includes(j.key))
        : [jam];
      group.forEach((j) => seen.add(j.key));
      cards.push({
        key: group.map((j) => j.key).join("+"),
        jams: group,
        label: group.map((j) => j.name).join(" + "),
        end: group[0].end,
      });
    }
    return cards;
  }, [nextOpen]);

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
        <strong>Only the dates are authoritative.</strong> Themes, constraints,
        AI policies and rating categories below are a snapshot from 10 August
        2026 and go stale as soon as a jam page changes. Any agent working on
        one of these games should treat the live project — its own repo, docs
        and commits — as the reference, and read no further than this schedule.
      </p>

      <h3>Schedule</h3>
      <table className="jams-schedule">
        <thead>
          <tr>
            <th>Jam</th>
            <th>Build</th>
            <th>Deadline ({TZ_LABEL})</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((row) => (
            <tr key={row.key} onClick={() => goTo(`jam-${row.key}`)}>
              <td>{row.name}</td>
              <td>{row.build}</td>
              <td>{fmt(row.end)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="jams-intro">
        Windows are read off each jam page and stored in UTC. Every time on this
        page is shown in {TZ_LABEL} on a 24-hour clock, not in your browser's
        zone — Firefox with fingerprint resistance reports UTC and would show
        every deadline three hours early. Checklists live in this browser.
      </p>

      <div className="jams-next">
        {nextCards.slice(0, 4).map((card) => (
          <button
            key={card.key}
            type="button"
            className="jams-next-card"
            onClick={() => goTo(`jam-${card.jams[0].key}`)}
          >
            <span className="jams-next-time">{countdown(card.end, now)}</span>
            <span className="jams-next-name">{card.label}</span>
            {card.jams.length > 1 ? (
              <>
                <span className="jams-next-close">
                  one build · first deadline {fmt(card.end)}
                </span>
                <span className="jams-next-close">
                  then {fmt(card.jams[card.jams.length - 1].end)}
                </span>
              </>
            ) : (
              <span className="jams-next-close">closes {fmt(card.end)}</span>
            )}
          </button>
        ))}
      </div>

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
                {jam.joined && (
                  <>
                    <dt>Joined</dt>
                    <dd>{jam.joined.toLocaleString()}</dd>
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
            <h3>Brackeys theme history</h3>
            <p className="jams-intro">
              Every theme below was read off the announcement banner on its own
              jam page. The patterns are what the prep list is built against.
            </p>
            <div className="jams-themes">
              {BRACKEYS_THEMES.map((t) => (
                <div key={t.edition} className="jams-theme">
                  <span className="jams-theme-ed">{t.edition}</span>
                  <span className="jams-theme-name">{t.theme}</span>
                </div>
              ))}
            </div>
            <ul className="jam-constraints">
              {BRACKEYS_PATTERNS.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Jams;
