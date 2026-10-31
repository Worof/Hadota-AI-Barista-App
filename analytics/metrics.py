"""Every number the report shows. Plain pandas/numpy so each metric is easy to read and test."""
from __future__ import annotations
import numpy as np
import pandas as pd

HIT = 4   # a rating of 4 or 5 counts as a "hit"


def rated(df: pd.DataFrame) -> pd.DataFrame:
    """One row per rating, numbered k = 1, 2, 3 ... per user (re-ratings are not counted twice)."""
    r = df[(df["name"] == "rated") & (df["rerate"].fillna(0) == 0)].copy()
    r["k"] = r.groupby("user_id").cumcount() + 1
    return r


def _ci(x: pd.Series) -> tuple[float, float, float]:
    x = x.dropna()
    if len(x) == 0:
        return (np.nan, np.nan, np.nan)
    m = float(x.mean()); h = 1.96 * float(x.std(ddof=1)) / np.sqrt(len(x)) if len(x) > 1 else 0.0
    return m, m - h, m + h


def learning_curve(df: pd.DataFrame, max_k: int = 30) -> pd.DataFrame:
    """Mean rating of the k-th recommendation, per arm, with a 95% interval."""
    r = rated(df); r = r[r["k"] <= max_k]
    rows = []
    for (arm, k), g in r.groupby(["arm", "k"]):
        m, lo, hi = _ci(g["rating"]); rows.append({"arm": arm, "k": k, "mean": m, "lo": lo, "hi": hi, "hit": float((g["rating"] >= HIT).mean()), "n": len(g)})
    return pd.DataFrame(rows)


def lift(df: pd.DataFrame, from_k: int = 6, n_boot: int = 2000, seed: int = 7) -> dict:
    """Learner minus control, using ratings from the from_k-th recommendation on (after the learner had time to learn)."""
    r = rated(df); r = r[r["k"] >= from_k]
    a, b = r[r["arm"] == "learner"]["rating"].dropna().to_numpy(), r[r["arm"] == "control"]["rating"].dropna().to_numpy()
    if len(a) < 5 or len(b) < 5:
        return {"enough_data": False, "n_learner": int(len(a)), "n_control": int(len(b))}
    rng = np.random.default_rng(seed)
    diffs = [rng.choice(a, len(a)).mean() - rng.choice(b, len(b)).mean() for _ in range(n_boot)]
    lo, hi = np.percentile(diffs, [2.5, 97.5])
    pooled = np.sqrt(((len(a) - 1) * a.var(ddof=1) + (len(b) - 1) * b.var(ddof=1)) / (len(a) + len(b) - 2))
    return {"enough_data": True, "from_k": from_k, "learner_mean": float(a.mean()), "control_mean": float(b.mean()), "diff": float(a.mean() - b.mean()),
            "ci_low": float(lo), "ci_high": float(hi), "effect_size_d": float((a.mean() - b.mean()) / pooled), "significant": bool(lo > 0 or hi < 0),
            "n_learner": int(len(a)), "n_control": int(len(b)), "hit_learner": float((a >= HIT).mean()), "hit_control": float((b >= HIT).mean())}


def per_user_improvement(df: pd.DataFrame, head: int = 3, tail: int = 3, min_ratings: int = 8) -> pd.DataFrame:
    """For each learner user: mean of the last ratings minus the first ratings. Shows how many users actually improved."""
    r = rated(df); out = []
    for (uid, arm), g in r.groupby(["user_id", "arm"]):
        if len(g) >= min_ratings:
            out.append({"user_id": uid, "arm": arm, "first": g["rating"].head(head).mean(), "last": g["rating"].tail(tail).mean()})
    o = pd.DataFrame(out)
    if not o.empty: o["delta"] = o["last"] - o["first"]
    return o


def calibration(df: pd.DataFrame, bins: int = 6) -> pd.DataFrame:
    """Predicted reward (what the model expected, -1..1) against the reward the user actually gave. A learning model should rise with the diagonal."""
    r = rated(df); r = r[r["arm"] == "learner"].dropna(subset=["pred"]).copy()
    if len(r) < 20: return pd.DataFrame(columns=["pred_mid", "actual", "n"])
    r["actual"] = (r["rating"] - 3) / 2
    r["bin"] = pd.qcut(r["pred"], q=min(bins, r["pred"].nunique()), duplicates="drop")
    g = r.groupby("bin", observed=True).agg(pred_mid=("pred", "mean"), actual=("actual", "mean"), n=("actual", "size")).reset_index(drop=True)
    return g


def calibration_corr(df: pd.DataFrame) -> float:
    r = rated(df); r = r[r["arm"] == "learner"].dropna(subset=["pred"])
    return float(np.corrcoef(r["pred"], (r["rating"] - 3) / 2)[0, 1]) if len(r) > 20 and r["pred"].std() > 0 else float("nan")


def explore_effect(df: pd.DataFrame) -> pd.DataFrame:
    r = rated(df); r = r[r["arm"] == "learner"]
    return r.groupby("explored")["rating"].agg(["mean", "count"]).reset_index()


def explore_rate_by_k(df: pd.DataFrame, max_k: int = 30) -> pd.DataFrame:
    r = rated(df); r = r[(r["arm"] == "learner") & (r["k"] <= max_k)]
    return r.groupby("k")["explored"].mean().reset_index(name="explored_share")


def tag_effect(df: pd.DataFrame) -> pd.DataFrame:
    """After a user reports a taste problem, is their NEXT rating better than the one that triggered the feedback? Learner arm only."""
    rows = []
    d = df[df["arm"] == "learner"]
    for uid, g in d.groupby("user_id"):
        g = g.sort_values("at")
        ev = g[g["name"].isin(["rated", "feedback_sent"])].reset_index(drop=True)
        for i, e in ev.iterrows():
            if e["name"] != "feedback_sent" or not isinstance(e["tags"], (list, tuple, np.ndarray)) or pd.isna(e["rating"]):
                continue
            nxt = ev.iloc[i + 1:][ev.iloc[i + 1:]["name"] == "rated"].head(1)
            if nxt.empty: continue
            for t in e["tags"]:
                rows.append({"tag": t, "before": e["rating"], "after": float(nxt.iloc[0]["rating"])})
    o = pd.DataFrame(rows)
    if o.empty: return pd.DataFrame(columns=["tag", "n", "before", "after", "delta"])
    g = o.groupby("tag").agg(n=("after", "size"), before=("before", "mean"), after=("after", "mean")).reset_index()
    g["delta"] = g["after"] - g["before"]
    return g.sort_values("n", ascending=False)


def funnel(df: pd.DataFrame) -> pd.DataFrame:
    steps = [("Saw a result", "result_shown"), ("Rated it", "rated"), ("Gave feedback", "feedback_sent"), ("Started an order", "order_started")]
    return pd.DataFrame([{"step": label, "users": int(df[df["name"] == ev]["user_id"].nunique())} for label, ev in steps])


def retention(df: pd.DataFrame) -> pd.DataFrame:
    s = df[df["name"] == "result_shown"].copy()
    s["week"] = s["at"].dt.tz_convert(None).dt.to_period("W").dt.start_time
    first = s.groupby("user_id")["week"].min().rename("first_week")
    s = s.join(first, on="user_id")
    wk = s.groupby("week")["user_id"].nunique().rename("active")
    returning = s[s["week"] > s["first_week"]].groupby("week")["user_id"].nunique().rename("returning")
    return pd.concat([wk, returning], axis=1).fillna(0).reset_index()


def segments(df: pd.DataFrame, min_n: int = 15) -> pd.DataFrame:
    r = rated(df); r = r[r["arm"] == "learner"]
    g = r.groupby(["drink", "roast"])["rating"].agg(["mean", "count"]).reset_index()
    return g[g["count"] >= min_n]


def kpis(df: pd.DataFrame) -> dict:
    r = rated(df); res = df[df["name"] == "result_shown"]
    out = {"users": int(df["user_id"].nunique()), "results_shown": int(len(res)), "ratings": int(len(r)),
           "rating_rate": float(len(r) / max(1, len(res))), "mean_rating": float(r["rating"].mean()) if len(r) else float("nan"),
           "hit_rate": float((r["rating"] >= HIT).mean()) if len(r) else float("nan"),
           "feedback_rate": float(df[df["name"] == "feedback_sent"].shape[0] / max(1, len(r))),
           "skip_rate": float(df[df["name"] == "skipped"].shape[0] / max(1, len(res))),
           "calibration_corr": calibration_corr(df)}
    for arm in ("learner", "control"):
        a = r[r["arm"] == arm]; out[f"mean_rating_{arm}"] = float(a["rating"].mean()) if len(a) else float("nan"); out[f"users_{arm}"] = int(a["user_id"].nunique())
    imp = per_user_improvement(df); l = imp[imp["arm"] == "learner"] if not imp.empty else imp
    out["learners_improved_share"] = float((l["delta"] > 0.2).mean()) if len(l) else float("nan")
    out["lift"] = lift(df)
    return out
