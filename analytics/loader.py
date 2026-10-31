"""Load usage events from any of the three places they live and return one tidy DataFrame.

Accepted inputs
  * Supabase export of the `events` table (CSV or JSON/JSONL): columns user_id, at, name, arm, session, props
  * The in-app "download my data" file (hadota-my-data.json): {"log": [{t, name, sid, arm, props}], ...}
  * demo_events.jsonl produced by scripts/export_demo_events.mjs
"""
from __future__ import annotations
import json
from pathlib import Path
import pandas as pd

PROP_COLUMNS = ["rating", "drink", "method", "roast", "explored", "pred", "n_rated", "rerate", "tags", "beans", "chars"]


def _props(v):
    if isinstance(v, dict):
        return v
    if isinstance(v, str) and v.strip():
        try:
            return json.loads(v)
        except json.JSONDecodeError:
            return {}
    return {}


def _normalise(rows: list[dict]) -> pd.DataFrame:
    recs = []
    for r in rows:
        p = _props(r.get("props"))
        at = r.get("at")
        if at is None and r.get("t") is not None:          # in-app export uses epoch milliseconds
            at = pd.to_datetime(r["t"], unit="ms", utc=True)
        recs.append({
            "user_id": r.get("user_id") or r.get("user") or "me",
            "at": at, "name": r.get("name"), "arm": r.get("arm"),
            "session": r.get("session") or r.get("sid"),
            **{k: p.get(k) for k in PROP_COLUMNS},
        })
    df = pd.DataFrame(recs)
    if df.empty:
        return pd.DataFrame(columns=["user_id", "at", "name", "arm", "session", *PROP_COLUMNS])
    df["at"] = pd.to_datetime(df["at"], utc=True, format="mixed")
    for c in ("rating", "pred", "n_rated", "rerate", "chars"):
        df[c] = pd.to_numeric(df[c], errors="coerce")
    df["explored"] = df["explored"].map(lambda v: bool(v) if v is not None and v == v else False)
    return df.sort_values("at", kind="stable").reset_index(drop=True)


def load_events(path: str | Path) -> pd.DataFrame:
    path = Path(path)
    text = path.read_text(encoding="utf-8")
    if path.suffix.lower() == ".csv":
        return _normalise(pd.read_csv(path).to_dict("records"))
    stripped = text.lstrip()
    if stripped.startswith("{"):
        try:
            data = json.loads(text)
            if "log" in data:                                   # in-app export
                return _normalise(data["log"])
        except json.JSONDecodeError:
            pass                                                # JSONL: one object per line
    if stripped.startswith("["):
        return _normalise(json.loads(text))
    return _normalise([json.loads(line) for line in text.splitlines() if line.strip()])
