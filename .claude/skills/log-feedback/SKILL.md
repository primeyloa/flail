---
name: log-feedback
description: Record the user's verdict or feedback on a panel so future work learns from it. Use after the user passes, scores, rejects or corrects a panel.
---

Record this feedback: $ARGUMENTS

1. Append one line to `memory/log.md` under the video's heading: date, panel and version, verdict or 1-5 score, what the user said in their words, what changed.
2. Update the panel's `status` in `panel.yaml`.
3. If the panel passed or scored 4 or more, add it to the pack's `golden.md` with what makes it worth copying.
4. If the same correction now appears twice in `log.md`, or the user states a general rule, add one line to a lessons file: the pack's `lessons.md` if it's about this animation type, `memory/lessons.md` if it applies to every pack. Keep each under 40 lines by merging or removing older lines.
5. Never add a verdict or score the user didn't give.
