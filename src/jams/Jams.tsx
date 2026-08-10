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
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Sprint bounds are day-granular, so they render in UTC — the zone they were
 * written in. Converting to local time would slide a sprint stored as
 * 15 Aug 23:59Z onto the 16th.
 */
function fmtDay(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
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
  const [selected, setSelected] = useState<string>("");
  const [checks, setChecks] = useState<Record<string, boolean>>(loadChecks);
  const [now, setNow] = useState<number>(() => Date.now());

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

  // Default to whatever closes next, so the page opens on what matters.
  const nextOpen = useMemo(
    () =>
      [...JAMS]
        .filter((j) => Date.parse(j.end) > now)
        .sort((a, b) => Date.parse(a.end) - Date.parse(b.end)),
    [now]
  );

  // Jams fed by one shared sprint are one piece of work, so they get one card.
  // Two cards would read as two games to make.
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
        // nextOpen is sorted by deadline, so the first is the binding one.
        end: group[0].end,
      });
    }

    return cards;
  }, [nextOpen]);

  const active: Jam | undefined =
    JAMS.find((j) => j.key === selected) ?? nextOpen[0];

  const sprints = SPRINTS.filter((s) => active && s.jams.includes(active.key));

  // Dates only — the one part of this page that stays true.
  const schedule = useMemo(
    () =>
      [...JAMS]
        .sort((a, b) => Date.parse(a.end) - Date.parse(b.end))
        .map((jam) => {
          // Brackeys has two sprints — prep and build. Span the lot, or the
          // table reports the prep window as if it were the whole effort.
          const own = SPRINTS.filter((s) => s.jams.includes(jam.key));
          const first = own[0];
          const last = own[own.length - 1];
          return {
            key: jam.key,
            name: jam.name,
            end: jam.end,
            build: first ? `${fmtDay(first.start)} – ${fmtDay(last.end)}` : "—",
          };
        }),
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
            <th>Deadline</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((row) => (
            <tr
              key={row.key}
              className={active?.key === row.key ? "active" : undefined}
              onClick={() => setSelected(row.key)}
            >
              <td>{row.name}</td>
              <td>{row.build}</td>
              <td>{fmt(row.end)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="jams-intro">
        Windows are read off each jam page and stored in UTC; times are shown in
        your local zone. Checklists live in this browser.
      </p>

      <div className="jams-next">
        {nextCards.slice(0, 4).map((card) => (
          <button
            key={card.key}
            type="button"
            className={`jams-next-card${
              card.jams.some((j) => j.key === active?.key) ? " active" : ""
            }`}
            onClick={() => setSelected(card.jams[0].key)}
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

      <Epg selected={active?.key ?? ""} onSelect={setSelected} />

      {active && (
        <div className="jam-detail">
          <h3>
            <a href={active.url} target="_blank" rel="noopener noreferrer">
              {active.name}
            </a>
          </h3>

          <dl className="jam-facts">
            <dt>Window</dt>
            <dd>
              {fmt(active.start)} → {fmt(active.end)}
            </dd>
            <dt>Theme</dt>
            <dd>{active.theme}</dd>
            <dt>AI</dt>
            <dd>
              <span className={`jam-ai ${active.ai}`}>
                {AI_LABEL[active.ai]}
              </span>{" "}
              {active.aiNote}
            </dd>
            <dt>Rated on</dt>
            <dd>{active.ratings.join(" · ")}</dd>
            {active.prizes && (
              <>
                <dt>Prizes</dt>
                <dd>{active.prizes}</dd>
              </>
            )}
            {active.joined && (
              <>
                <dt>Joined</dt>
                <dd>{active.joined.toLocaleString()}</dd>
              </>
            )}
          </dl>

          <h4>Constraints</h4>
          <ul className="jam-constraints">
            {active.constraints.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          {sprints.map((sprint) => {
            const done = sprint.tasks.filter(
              (t) => checks[`${sprint.key}:${t}`]
            ).length;
            return (
              <div key={sprint.key} className="jam-sprint">
                <h4>
                  {sprint.label}{" "}
                  <span className="jam-sprint-meta">
                    {fmtDay(sprint.start)} → {fmtDay(sprint.end)} · {done}/
                    {sprint.tasks.length}
                  </span>
                </h4>
                {sprint.jams.length > 1 && (
                  <p className="jam-sprint-shared">
                    One build, entered in{" "}
                    {sprint.jams
                      .map((k) => JAMS.find((j) => j.key === k)?.name)
                      .filter(Boolean)
                      .join(" and ")}
                    . This checklist is shared — it appears under each jam, but
                    it is a single effort, and ticking an item ticks it in both.
                  </p>
                )}
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
        </div>
      )}

      <h3>Brackeys theme history</h3>
      <p className="jams-intro">
        Every theme below was read off the announcement banner on its own jam
        page. The patterns are what the prep week is built against.
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
    </div>
  );
}

export default Jams;
