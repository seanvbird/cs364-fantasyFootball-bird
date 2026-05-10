#!/usr/bin/env python3
"""
One-time script: fetch 2025 NFL season data from Sleeper API and
generate sql/seed-players-stats.sql.

Usage:
    python3 sql/gen_seed.py > sql/seed-players-stats.sql
"""
import json, sys, time
import urllib.request

BASE = "https://api.sleeper.app/v1"
POSITIONS = {"QB", "RB", "WR", "TE", "K"}
WEEKS = range(1, 19)          # 2025 regular season weeks 1-18
TOP_N = 200                   # keep top N players by total fantasy points


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


def calc_fp(s):
    """Standard (non-PPR) fantasy scoring used by this app."""
    pass_yd  = float(s.get("pass_yd",  0) or 0)
    rush_yd  = float(s.get("rush_yd",  0) or 0)
    rec_yd   = float(s.get("rec_yd",   0) or 0)
    pass_td  = float(s.get("pass_td",  0) or 0)
    rush_td  = float(s.get("rush_td",  0) or 0)
    rec_td   = float(s.get("rec_td",   0) or 0)
    # Kicker
    fgm_0_19  = float(s.get("fgm_0_19",  0) or 0)
    fgm_20_29 = float(s.get("fgm_20_29", 0) or 0)
    fgm_30_39 = float(s.get("fgm_30_39", 0) or 0)
    fgm_40_49 = float(s.get("fgm_40_49", 0) or 0)
    fgm_50p   = float(s.get("fgm_50p",   0) or 0)
    xpm       = float(s.get("xpm",        0) or 0)
    tds = pass_td + rush_td + rec_td
    return (pass_yd * 0.04
            + rush_yd  * 0.1
            + rec_yd   * 0.1
            + tds      * 6
            + fgm_0_19 * 3 + fgm_20_29 * 3 + fgm_30_39 * 3
            + fgm_40_49 * 4 + fgm_50p * 5
            + xpm * 1)


def esc(s):
    return (s or "").replace("'", "''")


# ── 1. Fetch all players ──────────────────────────────────────────────────────
print("-- Fetching all NFL players from Sleeper...", file=sys.stderr)
players_raw = fetch(f"{BASE}/players/nfl")
print(f"--   Total records: {len(players_raw)}", file=sys.stderr)

# Filter: skill positions with an active NFL team
relevant = {
    pid: p
    for pid, p in players_raw.items()
    if p.get("position") in POSITIONS and p.get("team")
}
print(f"--   Relevant (skill pos + has team): {len(relevant)}", file=sys.stderr)

# ── 2. Fetch weekly stats (weeks 1-18) ────────────────────────────────────────
print("-- Fetching weekly stats (this may take ~30 s)...", file=sys.stderr)
weekly_stats = {}   # pid -> {week_num: stat_dict}

for week in WEEKS:
    print(f"--   Week {week}...", file=sys.stderr, end=" ", flush=True)
    try:
        week_data = fetch(f"{BASE}/stats/nfl/regular/2025/{week}")
        count = 0
        for pid, s in week_data.items():
            if pid in relevant:
                weekly_stats.setdefault(pid, {})[week] = s
                count += 1
        print(f"{count} players", file=sys.stderr)
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
    time.sleep(0.35)   # be polite to the free API

# ── 3. Rank players by total fantasy points ───────────────────────────────────
def total_fp(pid):
    return sum(calc_fp(weekly_stats.get(pid, {}).get(w, {})) for w in WEEKS)

# Only players who actually played (had any stat in any week)
played = [pid for pid in weekly_stats
          if any(weekly_stats[pid].get(w) for w in WEEKS)]

played.sort(key=total_fp, reverse=True)
top_pids = played[:TOP_N]
print(f"-- Keeping top {len(top_pids)} players by fantasy points", file=sys.stderr)

# ── 4. Emit SQL ───────────────────────────────────────────────────────────────
print("-- ─────────────────────────────────────────────────────────────")
print("-- PLAYERS (2025 NFL regular season)")
print("-- Source: https://api.sleeper.app/v1/players/nfl")
print("-- ─────────────────────────────────────────────────────────────")
print("INSERT INTO player (first_name, last_name, position, nfl_team, status, bye_week) VALUES")

player_rows = []
for pid in top_pids:
    p = relevant[pid]
    first   = esc(p.get("first_name", ""))
    last    = esc(p.get("last_name",  ""))
    pos     = esc(p.get("position",   ""))
    team    = esc(p.get("team",       ""))
    status  = "Active"
    bye     = 0    # Reason: 2025 bye weeks not in Sleeper player endpoint; set to 0
    player_rows.append(f"('{first}', '{last}', '{pos}', '{team}', '{status}', {bye})")

print(",\n".join(player_rows) + ";")

# ── 5. Emit player_stats ──────────────────────────────────────────────────────
print()
print("-- ─────────────────────────────────────────────────────────────")
print("-- PLAYER STATS — weeks 1-18 (2025 regular season)")
print("-- Source: https://api.sleeper.app/v1/stats/nfl/regular/2025/<week>")
print("-- Formula: pass_yd*0.04 + (rush_yd+rec_yd)*0.1 + td*6  (K uses FG/XP pts)")
print("-- ─────────────────────────────────────────────────────────────")
print("INSERT INTO player_stats (player_id, week_number, passing_yards, rushing_yards, receiving_yards, touchdowns, fantasy_points) VALUES")

stat_rows = []
for row_id, pid in enumerate(top_pids, start=1):
    for week in WEEKS:
        s = weekly_stats.get(pid, {}).get(week)
        if not s:
            continue
        pass_yd = int(float(s.get("pass_yd",  0) or 0))
        rush_yd = int(float(s.get("rush_yd",  0) or 0))
        rec_yd  = int(float(s.get("rec_yd",   0) or 0))
        pass_td = int(float(s.get("pass_td",  0) or 0))
        rush_td = int(float(s.get("rush_td",  0) or 0))
        rec_td  = int(float(s.get("rec_td",   0) or 0))
        tds     = pass_td + rush_td + rec_td
        fp      = round(calc_fp(s), 2)
        # Only insert rows where the player had some activity
        if fp > 0 or (pass_yd + rush_yd + rec_yd + tds) > 0:
            stat_rows.append(
                f"({row_id}, {week}, {pass_yd}, {rush_yd}, {rec_yd}, {tds}, {fp:.2f})"
            )

print(",\n".join(stat_rows) + ";")
print(f"-- Generated {len(top_pids)} players, {len(stat_rows)} stat rows", file=sys.stderr)
