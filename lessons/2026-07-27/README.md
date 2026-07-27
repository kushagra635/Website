# Lesson 01 — Images are arrays

Build grayscale conversion and histogram equalization with NumPy, then compare
them with OpenCV.

## Before you start

- Use the `ac-cv` environment and its Jupyter kernel.
- Complete Lesson 00.
- Write files only under `results/lesson-01/`.
- Predict what happens when 20 is added to `np.uint8(250)`.
- Predict which BGR channel contributes most to grayscale.

## Key points

- OpenCV color pixels are `[B, G, R]`.
- Matplotlib normally displays RGB.
- `uint8` arithmetic wraps past 255.
- Grayscale uses weighted channels.
- Histogram equalization maps intensities through a lookup table.

## Finish

- Both grayscale checks pass.
- Histogram equalization matches OpenCV.
- `results/lesson-01/` contains the images and timings.
- You can explain one pixel calculation and one histogram lookup.

Open [the notebook](01-images-are-arrays.ipynb).
