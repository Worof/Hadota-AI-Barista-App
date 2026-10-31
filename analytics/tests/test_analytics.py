import json, tempfile, unittest
from pathlib import Path
import numpy as np, pandas as pd
from analytics import metrics as M
from analytics.loader import load_events
from analytics.report import build


def synth(learner_gain: float, n_users=80, n_rate=12, seed=1) -> pd.DataFrame:
    rng = np.random.default_rng(seed); rows = []
    for u in range(n_users):
        arm = "control" if u % 5 == 0 else "learner"
        for k in range(n_rate):
            base = 2.8 + (learner_gain * min(1, k / 6) if arm == "learner" else 0)
            rows.append({"user_id": f"u{u}", "at": f"2026-09-{1 + k:02d}T10:00:00Z", "name": "rated", "arm": arm, "session": f"s{u}-{k}",
                         "props": {"rating": int(np.clip(round(base + rng.normal(0, .8)), 1, 5)), "drink": "espresso", "roast": "medium", "explored": False, "pred": 0.0, "rerate": 0}})
    return pd.DataFrame(rows)


def write(rows, suffix=".jsonl") -> Path:
    p = Path(tempfile.mkdtemp()) / f"e{suffix}"
    p.write_text("\n".join(json.dumps(r) for r in rows) + "\n", encoding="utf-8"); return p


class Metrics(unittest.TestCase):
    def test_detects_a_real_improvement(self):
        df = load_events(write(synth(1.0).to_dict("records"))); l = M.lift(df)
        self.assertTrue(l["enough_data"] and l["significant"] and l["diff"] > 0.5, l)

    def test_does_not_invent_an_improvement(self):
        df = load_events(write(synth(0.0).to_dict("records"))); l = M.lift(df)
        self.assertLess(abs(l["diff"]), 0.35, l); self.assertLess(l["effect_size_d"], 0.5)

    def test_k_counts_each_users_ratings_in_order_and_ignores_rerates(self):
        rows = [{"user_id": "a", "at": f"2026-09-0{i}T10:00:00Z", "name": "rated", "arm": "learner", "props": {"rating": 3, "rerate": 1 if i == 2 else 0}} for i in range(1, 5)]
        r = M.rated(load_events(write(rows))); self.assertEqual(list(r["k"]), [1, 2, 3])

    def test_in_app_export_format_is_understood(self):
        data = {"user": {"name": "x"}, "log": [{"t": 1788000000000, "name": "rated", "sid": "s1", "arm": "learner", "props": {"rating": 4}}]}
        p = Path(tempfile.mkdtemp()) / "mine.json"; p.write_text(json.dumps(data)); df = load_events(p)
        self.assertEqual(len(df), 1); self.assertEqual(int(df.loc[0, "rating"]), 4)

    def test_supabase_csv_with_json_props_is_understood(self):
        p = Path(tempfile.mkdtemp()) / "events.csv"
        pd.DataFrame([{"user_id": "a", "at": "2026-09-01T10:00:00+00:00", "name": "rated", "arm": "control", "session": "s", "props": json.dumps({"rating": 2})}]).to_csv(p, index=False)
        self.assertEqual(int(load_events(p).loc[0, "rating"]), 2)

    def test_calibration_correlation_is_positive_when_predictions_are_informative(self):
        rng = np.random.default_rng(3); rows = []
        for i in range(300):
            pred = rng.uniform(-1, 1); rating = int(np.clip(round(3 + 2 * pred + rng.normal(0, .6)), 1, 5))
            rows.append({"user_id": f"u{i}", "at": "2026-09-01T10:00:00Z", "name": "rated", "arm": "learner", "props": {"rating": rating, "pred": pred, "rerate": 0}})
        self.assertGreater(M.calibration_corr(load_events(write(rows))), 0.7)

    def test_tag_effect_compares_next_rating_with_the_triggering_one(self):
        rows = [{"user_id": "a", "at": "2026-09-01T10:00:00Z", "name": "rated", "arm": "learner", "props": {"rating": 2, "rerate": 0}},
                {"user_id": "a", "at": "2026-09-01T10:01:00Z", "name": "feedback_sent", "arm": "learner", "props": {"tags": ["too-bitter"], "rating": 2}},
                {"user_id": "a", "at": "2026-09-02T10:00:00Z", "name": "rated", "arm": "learner", "props": {"rating": 4, "rerate": 0}}]
        t = M.tag_effect(load_events(write(rows))); self.assertEqual(float(t.loc[0, "delta"]), 2.0)

    def test_report_builds_every_file(self):
        out = Path(tempfile.mkdtemp()); k = build(write(synth(1.0).to_dict("records")), out)
        for f in ["report.html", "kpis.json", "01_learning_curve.png", "11_segments.png"]: self.assertTrue((out / f).exists(), f)
        self.assertIn("YES", k["verdict"][0][1])

    def test_report_says_not_enough_data_instead_of_guessing(self):
        rows = [r for r in synth(1.0).to_dict("records") if r["arm"] == "learner"]
        out = Path(tempfile.mkdtemp()); k = build(write(rows), out); self.assertIn("NOT ENOUGH DATA", k["verdict"][0][1])


if __name__ == "__main__":
    unittest.main()
