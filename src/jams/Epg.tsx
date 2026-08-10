import { useEffect, useMemo, useRef } from "react";
import { JAMS, SPRINTS, Jam } from "./data";

const DAY_W = 15;
const MS_PER_DAY = 86_400_000;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function startOfUtcDay(ms: number): number {
  return Math.floor(ms / MS_PER_DAY) * MS_PER_DAY;
}

interface EpgProps {
  /** Scrolls to the section for the jam whose row was clicked. */
  onSelect: (key: string) => void;
}

function Epg({ onSelect }: EpgProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const model = useMemo(() => {
    const starts = JAMS.map((j) => Date.parse(j.start));
    const ends = JAMS.map((j) => Date.parse(j.end));
    const t0 = startOfUtcDay(Math.min(...starts));
    const t1 = startOfUtcDay(Math.max(...ends)) + MS_PER_DAY;
    const days = Math.round((t1 - t0) / MS_PER_DAY);

    const x = (iso: string) => ((Date.parse(iso) - t0) / MS_PER_DAY) * DAY_W;

    // Month bands across the timeline.
    const months: { label: string; left: number; width: number }[] = [];
    const cursor = new Date(t0);
    cursor.setUTCDate(1);
    while (cursor.getTime() < t1) {
      const monthStart = Math.max(cursor.getTime(), t0);
      const next = new Date(cursor);
      next.setUTCMonth(next.getUTCMonth() + 1);
      const monthEnd = Math.min(next.getTime(), t1);
      if (monthEnd > monthStart) {
        months.push({
          label: `${MONTHS[cursor.getUTCMonth()]} ${cursor.getUTCFullYear()}`,
          left: ((monthStart - t0) / MS_PER_DAY) * DAY_W,
          width: ((monthEnd - monthStart) / MS_PER_DAY) * DAY_W,
        });
      }
      cursor.setTime(next.getTime());
    }

    // A tick every 7 days keeps the ruler readable at this density.
    const ticks: { label: string; left: number }[] = [];
    for (let d = 0; d < days; d += 7) {
      const day = new Date(t0 + d * MS_PER_DAY);
      ticks.push({
        label: `${day.getUTCDate()}`,
        left: d * DAY_W,
      });
    }

    const rows = [...JAMS]
      .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
      .map((jam: Jam) => ({
        jam,
        left: x(jam.start),
        width: Math.max(x(jam.end) - x(jam.start), 4),
        sprints: SPRINTS.filter((s) => s.jams.includes(jam.key)).map((s) => ({
          key: s.key,
          label: s.label,
          left: x(s.start),
          width: Math.max(x(s.end) - x(s.start), 4),
        })),
      }));

    return { t0, days, width: days * DAY_W, months, ticks, rows, x };
  }, []);

  const nowLeft = ((Date.now() - model.t0) / MS_PER_DAY) * DAY_W;
  const nowVisible = nowLeft >= 0 && nowLeft <= model.width;

  // Open on today rather than on the far past.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !nowVisible) return;
    el.scrollLeft = Math.max(0, nowLeft - el.clientWidth * 0.25);
  }, [nowLeft, nowVisible]);

  return (
    <>
      <div className="epg-legend">
        <span>
          <i className="epg-key epg-key-build" /> build — the days you work on it
        </span>
        <span>
          <i className="epg-key epg-key-window" /> jam window — open to deadline
        </span>
        <span>
          <i className="epg-key epg-key-now" /> now
        </span>
        <span className="epg-legend-note">
          A build sitting outside its window is preparation done before the jam
          opens.
        </span>
      </div>

      <div className="epg">
        <div className="epg-labels">
          <div className="epg-corner" />
          {model.rows.map(({ jam }) => (
            <button
              key={jam.key}
              type="button"
              className="epg-label"
              onClick={() => onSelect(jam.key)}
            >
              {jam.name}
            </button>
          ))}
        </div>

        <div className="epg-scroll" ref={scrollRef}>
          <div className="epg-inner" style={{ width: `${model.width}px` }}>
            <div className="epg-ruler">
              <div className="epg-months">
                {model.months.map((m) => (
                  <span
                    key={m.label}
                    className="epg-month"
                    style={{ left: `${m.left}px`, width: `${m.width}px` }}
                  >
                    {m.label}
                  </span>
                ))}
              </div>
              <div className="epg-ticks">
                {model.ticks.map((t) => (
                  <span
                    key={t.left}
                    className="epg-tick"
                    style={{ left: `${t.left}px` }}
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            </div>

            {model.rows.map(({ jam, left, width, sprints }) => (
              <div
                key={jam.key}
                className="epg-row"
                onClick={() => onSelect(jam.key)}
              >
                <div
                  className="epg-window"
                  style={{ left: `${left}px`, width: `${width}px` }}
                  title={`${jam.name} — jam window`}
                />
                {sprints.map((s) => (
                  <div
                    key={s.key}
                    className="epg-sprint"
                    style={{ left: `${s.left}px`, width: `${s.width}px` }}
                    title={s.label}
                  >
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            ))}

            {nowVisible && (
              <div className="epg-now" style={{ left: `${nowLeft}px` }}>
                <span className="epg-now-dot" />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Epg;
