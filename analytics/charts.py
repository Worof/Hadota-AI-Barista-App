"""Matplotlib charts. English labels on purpose: matplotlib does not shape Arabic text reliably."""
from __future__ import annotations
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from . import metrics as M

BROWN, RED, OLIVE, GREY = "#3b2314", "#b8322a", "#3f4a2b", "#9a8b7c"
plt.rcParams.update({"figure.dpi": 130, "axes.spines.top": False, "axes.spines.right": False, "axes.grid": True, "grid.alpha": .25, "font.size": 10})
COL = {"learner": RED, "control": GREY}


def _save(fig, out: Path, name: str) -> str:
    p = out / name; fig.tight_layout(); fig.savefig(p); plt.close(fig); return name


def learning_curve(df, out):
    c = M.learning_curve(df); fig, ax = plt.subplots(figsize=(7, 4))
    for arm, g in c.groupby("arm"):
        g = g[g["n"] >= 5]; ax.plot(g["k"], g["mean"], color=COL.get(arm, BROWN), label=f"{arm} (n={int(g['n'].sum())})", lw=2); ax.fill_between(g["k"], g["lo"], g["hi"], color=COL.get(arm, BROWN), alpha=.15)
    ax.set(xlabel="k-th rated recommendation", ylabel="mean rating (1-5)", title="Is Hadota learning? Rating vs experience"); ax.legend(); return _save(fig, out, "01_learning_curve.png")


def hit_rate(df, out):
    c = M.learning_curve(df); fig, ax = plt.subplots(figsize=(7, 4))
    for arm, g in c.groupby("arm"):
        g = g[g["n"] >= 5]; ax.plot(g["k"], g["hit"] * 100, color=COL.get(arm, BROWN), label=arm, lw=2)
    ax.set(xlabel="k-th rated recommendation", ylabel="% rated 4 or 5", title="Hit rate over time"); ax.legend(); return _save(fig, out, "02_hit_rate.png")


def lift(df, out):
    l = M.lift(df); fig, ax = plt.subplots(figsize=(5.5, 3.4))
    if l.get("enough_data"):
        ax.barh(["control", "learner"], [l["control_mean"], l["learner_mean"]], color=[GREY, RED]); ax.set_xlim(1, 5)
        for y, v in enumerate([l["control_mean"], l["learner_mean"]]): ax.text(v + .03, y, f"{v:.2f}", va="center")
        ax.set(title=f"Ratings from #{l['from_k']} on: +{l['diff']:.2f} (95% CI {l['ci_low']:.2f} to {l['ci_high']:.2f})", xlabel="mean rating")
    else: ax.text(.5, .5, "not enough control-group data yet", ha="center"); ax.axis("off")
    return _save(fig, out, "03_ab_lift.png")


def per_user(df, out):
    o = M.per_user_improvement(df); fig, ax = plt.subplots(figsize=(6, 3.8))
    if not o.empty:
        for arm, g in o.groupby("arm"): ax.hist(g["delta"], bins=np.linspace(-3, 3, 25), alpha=.7, color=COL.get(arm, BROWN), label=f"{arm} (n={len(g)})")
        ax.axvline(0, color="k", lw=1); ax.legend()
    ax.set(xlabel="last 3 ratings minus first 3 ratings (per user)", ylabel="users", title="How many users got better recommendations?"); return _save(fig, out, "04_per_user_improvement.png")


def distribution(df, out):
    r = M.rated(df); fig, ax = plt.subplots(figsize=(6, 3.6)); w = .38
    for i, arm in enumerate(["control", "learner"]):
        s = r[r["arm"] == arm]["rating"].value_counts(normalize=True).reindex([1, 2, 3, 4, 5]).fillna(0) * 100
        ax.bar(np.arange(1, 6) + (i - .5) * w, s, w, color=COL[arm], label=arm)
    ax.set(xlabel="rating", ylabel="% of ratings", title="Rating distribution by group"); ax.legend(); return _save(fig, out, "05_rating_distribution.png")


def calibration(df, out):
    c = M.calibration(df); fig, ax = plt.subplots(figsize=(4.8, 4.4))
    if len(c):
        ax.plot([-1, 1], [-1, 1], "k--", lw=1, label="perfect"); ax.plot(c["pred_mid"], c["actual"], "o-", color=RED, label=f"r = {M.calibration_corr(df):.2f}")
        ax.set(xlabel="reward the model predicted", ylabel="reward the user gave", title="Are predictions grounded?"); ax.legend()
    else: ax.text(.5, .5, "needs more ratings", ha="center"); ax.axis("off")
    return _save(fig, out, "06_calibration.png")


def explore(df, out):
    e = M.explore_rate_by_k(df); fig, ax = plt.subplots(figsize=(6.5, 3.6))
    ax.plot(e["k"], e["explored_share"] * 100, color=OLIVE, lw=2); ax.set(xlabel="k-th rated recommendation", ylabel="% exploratory picks", title="Exploration share over time"); return _save(fig, out, "07_exploration.png")


def tags(df, out):
    t = M.tag_effect(df); fig, ax = plt.subplots(figsize=(7, 4))
    if len(t):
        t = t.sort_values("delta"); ax.barh(t["tag"], t["delta"], color=[RED if d < 0 else OLIVE for d in t["delta"]])
        for y, (d, n) in enumerate(zip(t["delta"], t["n"])): ax.text(d + (.02 if d >= 0 else -.02), y, f"n={n}", va="center", ha="left" if d >= 0 else "right", fontsize=8)
        ax.axvline(0, color="k", lw=1); ax.set(xlabel="next rating minus the rating that triggered the feedback", title="Does telling Hadota what was wrong help?")
    else: ax.text(.5, .5, "no feedback yet", ha="center"); ax.axis("off")
    return _save(fig, out, "08_feedback_effect.png")


def funnel(df, out):
    f = M.funnel(df); fig, ax = plt.subplots(figsize=(6, 3.4)); ax.barh(f["step"][::-1], f["users"][::-1], color=BROWN)
    for y, v in enumerate(f["users"][::-1]): ax.text(v, y, f" {v}", va="center")
    ax.set(title="Engagement funnel (unique users)"); return _save(fig, out, "09_funnel.png")


def retention(df, out):
    r = M.retention(df); fig, ax = plt.subplots(figsize=(7, 3.6))
    ax.plot(r["week"], r["active"], color=BROWN, lw=2, label="active users"); ax.plot(r["week"], r["returning"], color=RED, lw=2, label="returning (not first week)")
    ax.set(title="Weekly activity and returning users"); ax.legend(); fig.autofmt_xdate(); return _save(fig, out, "10_retention.png")


def segments(df, out):
    s = M.segments(df); fig, ax = plt.subplots(figsize=(7, 4.6))
    if len(s):
        p = s.pivot(index="drink", columns="roast", values="mean"); order = [c for c in ["light", "medium", "mediumdark", "dark"] if c in p.columns]; p = p[order]
        im = ax.imshow(p.values, cmap="RdYlGn", vmin=1.5, vmax=4.5, aspect="auto"); ax.set_xticks(range(len(order)), order); ax.set_yticks(range(len(p.index)), p.index, fontsize=7); ax.grid(False)
        fig.colorbar(im, ax=ax, label="mean rating"); ax.set_title("Where are we strong or weak? (drink x roast)")
    else: ax.text(.5, .5, "needs more ratings per segment", ha="center"); ax.axis("off")
    return _save(fig, out, "11_segments.png")


ALL = [learning_curve, hit_rate, lift, per_user, distribution, calibration, explore, tags, funnel, retention, segments]


def make_all(df, out_dir) -> list[str]:
    out = Path(out_dir); out.mkdir(parents=True, exist_ok=True); return [f(df, out) for f in ALL]
