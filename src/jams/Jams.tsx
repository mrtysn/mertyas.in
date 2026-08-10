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

/** Sprint bounds are day-granular; showing a 03:00 start would be noise. */
function fmtDay(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
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

  const active: Jam | undefined =
    JAMS.find((j) => j.key === selected) ?? nextOpen[0];

  const sprints = SPRINTS.filter((s) => active && s.jams.includes(active.key));

  return (
    <div className="jams">
      <h2>Game jams</h2>
      <p className="jams-intro">
        Eight jams between August and December 2026. Windows are read off each
        jam page and stored in UTC; times below are shown in your local zone.
        Checklists live in this browser.
      </p>

      <div className="jams-next">
        {nextOpen.slice(0, 4).map((jam) => (
          <button
            key={jam.key}
            type="button"
            className={`jams-next-card${active?.key === jam.key ? " active" : ""}`}
            onClick={() => setSelected(jam.key)}
          >
            <span className="jams-next-time">{countdown(jam.end, now)}</span>
            <span className="jams-next-name">{jam.name}</span>
            <span className="jams-next-close">closes {fmt(jam.end)}</span>
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
