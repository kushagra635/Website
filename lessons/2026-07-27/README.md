# Lesson: Pixels, Precision, and Histogram Equalization

Date: July 27, 2026

Today is about understanding what happens at the pixel level: how grayscale conversion works, why integer arithmetic can betray you, and how histogram equalization remaps intensities.

## Work through these in order

1. **Setup cell** — imports, `make_test_image()`, and `bgr`/`rgb` generation
2. **uint8 wraparound demo** — observe `250 + 20 = 14` and the widening/clip/cast fix
3. **Grayscale: float vs fixed-point** — implement `student_gray_float()` and `student_gray_exact()`, compare both against `cv2.cvtColor`
4. **Histogram equalization** — implement `student_equalize()` from scratch (histogram → CDF → LUT → remap), match `cv2.equalizeHist` exactly
5. **Benchmark and save results** — measure runtime, save output images

## Results

| Metric | Value |
|---|---|
| Float maximum difference | ≤1 (float rounding at .5 boundaries) |
| Integer maximum difference | 0 |
| Equalization maximum difference | 0 |
| Runtime repeat count | 25 |
| Student grayscale runtime | _fill after running_ |
| OpenCV grayscale runtime | _fill after running_ |

**Visible effect of equalization:** The washed-out, narrow-range image becomes sharp with true blacks and whites — the histogram spreads across the full 0–255 range.

## Review Questions

### Why are the grayscale weights not one third each?

Human eyes are more sensitive to green (~59%) and less to blue (~11%). The BT.601 luma formula `Y = 0.299R + 0.587G + 0.114B` matches perceived brightness. Equal thirds would make a pure blue pixel look as bright as pure green, which is not how we see.

### Why can the float version differ by 1?

The float path computes `0.114*B + 0.587*G + 0.299*R` and rounds with `np.rint` (banker's rounding: .5 → nearest even). OpenCV uses integer arithmetic with upward rounding. When the unrounded value lands exactly on .5, the two rounding conventions can disagree by 1. Neither is wrong — they're different valid conventions.

### What causes uint8 wraparound?

`uint8` only holds values 0–255. Arithmetic that goes outside this range wraps modulo 256:

```python
np.uint8(250) + np.uint8(20)  # → 14  (270 % 256)
```

The fix: widen to `int16`, compute, clip to [0, 255], then cast back to `uint8`.

### Trace one intensity through your equalization lookup table

Say a pixel has value 120. After building the CDF, the cumulative count at bin 120 is 8,000 out of 10,000 total pixels (ignoring leading zero bins). Then:

```
lut[120] = round(8000 / 10000 * 255) = 204
```

Pixel 120 → 204. Every pixel with the same original value gets the same new value. Darker pixels (lower CDF) map to lower outputs; brighter pixels map to higher outputs.

### When could global equalization make an image worse?

When the image has large naturally dark or bright regions. For example: a photo with a dark background and a well-exposed subject. Equalization would brighten the background noise and blow out the subject. It also amplifies noise in uniform regions and can create unnatural color shifts if applied per-channel to color images.

## Skills Trained

- **Skill #4** (reading code you didn't write) — tracing pixel values through the equalization LUT
- **Skill #5** (defining "done" and proving it) — exact-match assertions against OpenCV reference
- **Skill #7** (writing intent before code) — the TODO comments in stubs are the spec; the implementation follows
