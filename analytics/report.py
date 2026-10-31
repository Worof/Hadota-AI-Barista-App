"""python -m analytics.report --events analytics/demo_events.jsonl --out analytics/report"""
from __future__ import annotations
import argparse, base64, json, subprocess, sys
from pathlib import Path
from . import charts, metrics as M
from .loader import load_events

ROOT = Path(__file__).resolve().parent.parent


def verdict(k: dict) -> list[tuple[str, str]]:
    """Plain-language answers to the three questions that matter. Each is tied to a number, never an opinion."""
    out, l = [], k["lift"]
    if l.get("enough_data"):
        ok = l["significant"] and l["diff"] > 0
        out.append(("Is Hadota learning?", f"{'YES' if ok else 'NOT PROVEN'}: from the {l['from_k']}th rating on, learner users rate {l['learner_mean']:.2f} vs {l['control_mean']:.2f} for the no-learning control "
                    f"(difference {l['diff']:+.2f}, 95% CI {l['ci_low']:+.2f} to {l['ci_high']:+.2f}, effect size d={l['effect_size_d']:.2f})."))
    else:
        out.append(("Is Hadota learning?", f"NOT ENOUGH DATA: need at least 5 late ratings in each group (have {l.get('n_learner', 0)} learner / {l.get('n_control', 0)} control). Keep the 10% control group on."))
    c = k["calibration_corr"]
    out.append(("Are predictions grounded?", "Not enough rated results with a prediction yet." if c != c else f"Correlation between predicted and actual reward is {c:.2f} ({'good' if c > .3 else 'weak' if c > .1 else 'poor: the model is close to guessing'})."))
    s = k["learners_improved_share"]
    out.append(("Do individual users benefit?", "Not enough long-term users yet." if s != s else f"{s * 100:.0f}% of learner users with 8+ ratings improved by more than 0.2 stars."))
    return out


def build(events: Path, out: Path) -> dict:
    df = load_events(events); out.mkdir(parents=True, exist_ok=True)
    imgs = charts.make_all(df, out); k = M.kpis(df)
    (out / "kpis.json").write_text(json.dumps(k, indent=2, default=float), encoding="utf-8")
    rows = [("Users", k["users"]), ("Results shown", k["results_shown"]), ("Ratings", k["ratings"]), ("Rating rate", f"{k['rating_rate']:.0%}"), ("Mean rating", f"{k['mean_rating']:.2f}"),
            ("Hit rate (4-5 stars)", f"{k['hit_rate']:.0%}"), ("Feedback per rating", f"{k['feedback_rate']:.0%}"), ("Skipped results", f"{k['skip_rate']:.0%}"),
            ("Mean rating - learner", f"{k['mean_rating_learner']:.2f}"), ("Mean rating - control", f"{k['mean_rating_control']:.2f}")]
    emb = "".join(f'<figure><img src="data:image/png;base64,{base64.b64encode((out / n).read_bytes()).decode()}" alt="{n}"></figure>' for n in imgs)
    html = f"""<!doctype html><meta charset="utf-8"><title>Hadota agent report</title>
<style>body{{font:15px/1.6 system-ui,sans-serif;max-width:980px;margin:2rem auto;padding:0 1rem;color:#2b1a10}}h1{{color:#b8322a}}table{{border-collapse:collapse}}td{{padding:.3rem 1rem;border-bottom:1px solid #e0cdb2}}
.v{{background:#fffaf1;border:1px solid #e0cdb2;border-radius:10px;padding:.7rem 1rem;margin:.6rem 0}}figure{{display:inline-block;margin:.4rem;vertical-align:top}}img{{max-width:460px}}</style>
<h1>Hadota agent performance</h1><p>Source: <code>{events.name}</code> - {k['users']} users, {k['ratings']} ratings.</p>
<h2>Answers</h2>{''.join(f'<div class="v"><b>{q}</b><br>{a}</div>' for q, a in verdict(k))}
<h2>KPIs</h2><table>{''.join(f'<tr><td>{a}</td><td><b>{b}</b></td></tr>' for a, b in rows)}</table><h2>Charts</h2>{emb}"""
    (out / "report.html").write_text(html, encoding="utf-8"); k["verdict"] = verdict(k); return k


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__); ap.add_argument("--events", default=str(ROOT / "analytics" / "demo_events.jsonl")); ap.add_argument("--out", default=str(ROOT / "analytics" / "report"))
    ap.add_argument("--demo", action="store_true", help="generate demo events first (needs Node)"); a = ap.parse_args(argv)
    ev = Path(a.events)
    if a.demo or not ev.exists():
        subprocess.run(["node", str(ROOT / "scripts" / "export_demo_events.mjs"), "300", "18", str(ev)], check=True, cwd=ROOT)
    k = build(ev, Path(a.out))
    for q, ans in k["verdict"]: print(f"* {q}\n  {ans}")
    print("\nreport:", Path(a.out) / "report.html")


if __name__ == "__main__":
    main()
