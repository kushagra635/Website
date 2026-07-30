---
name: science
description: Load when writing a conclusion, filling in the results section of a lesson README or notebook, comparing two approaches, preparing a science-fair claim, or saying that a result proves, shows, or means something. Match the size of the claim to the inputs, sampling, measurement, and uncertainty.
metadata:
  upstream: science
---

# Science

A claim may be no larger than the evidence behind it.

## Record for every result

1. What was measured, including units and direction.
2. Which inputs were tested and how they were selected.
3. The number of independent samples. Repeated measurements of one input are
   not independent samples.
4. The code, commit, and saved artifact that produced the result.
5. The strongest plausible alternative explanation.

## Traceability test

Before reporting a number, answer all five:

1. What exact input produced this?
2. What exact code produced this?
3. Where is the saved output file?
4. Which commit was checked out?
5. What does one sample represent, and how many independent ones are there?

If one answer is missing, the result is provisional. Say so instead of reporting
it as a finding.

## Claim discipline

Lay out observation, assumption, logic, and conclusion, and name the weakest
link. Keep the claim limited to the tested inputs and conditions. Correlation
does not establish causation.

Synthetic or sample data demonstrates that code runs. It never supports a claim
about real-world performance. Label exploratory output as exploratory; do not
promote it to a conclusion because it looks clean.

Report unexplained anomalies and unresolved results directly. An anomaly you
cannot explain is a finding, not an embarrassment.

Worked examples of claims cut down to their evidence:
[references/claim-calibration.md](references/claim-calibration.md).

Review and revision may be collaborative. Never invent a number, omit a material
limitation, or convert exploratory evidence into a general claim.

## Complete when

- [ ] Every number has units and a stated meaning.
- [ ] Inputs and selection are recorded.
- [ ] Independent sample count is explicit.
- [ ] All five traceability answers exist.
- [ ] The claim covers no more than what was tested.
- [ ] Alternative explanations and unresolved uncertainty are stated.
