#!/usr/bin/env python3
"""Safely repair Hadota's Supabase mock used by the adapter tests.

Run from the repository root:
    py -3 fix_hadota_supabase_tests.py

This changes only tests/supabase-adapter.test.mjs. It does not connect to or
modify the live Supabase database, and it does not touch the coffee agent.
"""
from __future__ import annotations

from pathlib import Path
from datetime import datetime
import shutil
import sys

TARGET = Path("tests/supabase-adapter.test.mjs")

OLD_SINGLE = '''      if (k === "single") return Promise.resolve({ data: fixtures[table + ":single"] ?? { id: "created-" + table }, error: fixtures[table + ":error"] ?? null });
      return (...a) => { if (["insert", "upsert", "delete", "update"].includes(k)) { op.op = k; op.args = a; } else op.filters.push([k, ...a]); if (k === "maybeSingle") return Promise.resolve({ data: null, error: null }); return b; };'''

NEW_SINGLE = '''      if (k === "single") return () => Promise.resolve({
        data: fixtures[table + ":single"] ?? { id: "created-" + table },
        error: fixtures[table + ":error"] ?? null
      });
      if (k === "maybeSingle") return () => Promise.resolve({
        data: fixtures[table + ":single"] ?? null,
        error: fixtures[table + ":error"] ?? null
      });
      return (...a) => {
        if (["insert", "upsert", "delete", "update"].includes(k)) {
          op.op = k;
          op.args = a;
        } else {
          op.filters.push([k, ...a]);
        }
        return b;
      };'''


def main() -> int:
    if not TARGET.is_file():
        print(f"ERROR: {TARGET} was not found. Run this script from the Hadota project root.")
        return 2

    source = TARGET.read_text(encoding="utf-8")
    if NEW_SINGLE in source:
        print("Already fixed: Supabase mock single() and maybeSingle() are callable methods.")
        return 0
    if OLD_SINGLE not in source:
        print("ERROR: The expected old mock implementation was not found.")
        print("No files were changed. Please send the current fake() / builder() section from tests/supabase-adapter.test.mjs.")
        return 3

    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = TARGET.with_name(TARGET.name + f".bak-{stamp}")
    shutil.copy2(TARGET, backup)
    updated = source.replace(OLD_SINGLE, NEW_SINGLE, 1)
    TARGET.write_text(updated, encoding="utf-8", newline="\n")

    # Verify the saved file contains callable methods and no stale implementation.
    saved = TARGET.read_text(encoding="utf-8")
    if NEW_SINGLE not in saved or OLD_SINGLE in saved:
        shutil.copy2(backup, TARGET)
        print("ERROR: Verification failed; the original test file was restored.")
        return 4

    print("Updated successfully:")
    print(f" - {TARGET}")
    print(f"Backup: {backup}")
    print("Only the test mock was changed. No production code, Supabase data, or coffee-agent configuration was modified.")
    print("Next run: npm.cmd test")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
