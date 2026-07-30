# Claim calibration (worked examples)

Each example shows a claim a project actually produced, what the evidence
supported, and the rewrite. The pattern is always the same: the number is real,
the sentence around it is too big.

## 1. One machine is not every machine

> "The new image loader is 40% faster."

Evidence: one laptop, one 800x600 JPEG, five runs, Chrome only.

The measurement is fine. The sentence implies every image on every device.

> "On this laptop in Chrome, median load time for `sample-800x600.jpg` fell from
> 210 ms to 126 ms across five runs (40%). Other image sizes, browsers, and
> machines are untested."

## 2. Repeated measurements are not independent samples

> "Tested on 300 samples, accuracy was 94%."

Evidence: 300 frames from one video of one object.

The 300 frames are one recording, correlated with each other. The independent
sample count is one object under one lighting condition.

> "Across 300 consecutive frames of a single recording, 94% were classified
> correctly. This is one object under one lighting condition; the result does
> not estimate accuracy on new objects."

Fixing this needs new recordings, not more frames from the old one.

## 3. Sample data proves the code runs, not that it works

> "The detector reaches 30 FPS."

Evidence: the sample clip that ships with the tutorial.

> "The detector reaches 30 FPS on the bundled 640x480 sample clip. On webcam
> input at 1280x720 it has not been measured."

## 4. A difference smaller than the noise is not a difference

> "Version B is faster."

Evidence: B median 182 ms, A median 186 ms; run-to-run spread within each
version is about 25 ms.

> "A and B are indistinguishable at this sample size: the 4 ms difference is far
> inside the 25 ms run-to-run spread. Resolving it needs more runs or a larger
> workload."

`benchmarking` produces the spread that makes this call possible. Reporting the
4 ms as a win is the single most common failure in project write-ups.

## 5. Correlation, stated as cause

> "Adding the cache made the page load faster."

Evidence: the cache was added, and the next measurement was faster. The browser
was also restarted, and the network changed.

> "Load time fell after the cache was added, but the browser restart and network
> conditions changed at the same time. To attribute the change to the cache,
> measure both versions back to back on the same machine and network."

Change one variable at a time, or you cannot say which one acted.

## 6. The anomaly you did not report

> "Accuracy was 91% (three outlier frames excluded)."

Excluding data changes the claim. If the exclusion has a stated, pre-committed
reason it is legitimate; if it was chosen after seeing which frames hurt the
number, it is not.

> "Accuracy was 87% across all 40 frames, or 91% excluding three frames where
> the object left the field of view. Both numbers are reported because the
> exclusion rule was decided after the run."
