# Lesson 01.5 — One pixel to one kernel

This lesson explains how a small kernel changes an image.

## Concepts

- A kernel is a small grid of numbers.
- One output pixel is the sum of kernel values multiplied by nearby pixels.
- Correlation uses the kernel as written.
- Convolution flips the kernel before use.
- A symmetric kernel does not change after a flip.
- Border rules change results near the image edge.
- Kernel direction reverses an emboss effect.

Running the notebook applies each filter to a photograph and creates the images.

## Visible results

The notebook displays and saves these images:

1. Box blur and changed pixels
2. Correlation edge response
3. Convolution edge response
4. Symmetric-kernel edge response
5. Constant and reflected border effects
6. Emboss in two directions
7. A summary of all filters

## Files

Open [the notebook](01-5-one-pixel-to-one-kernel.ipynb).

- Conda environment: `ac-cv`
- Results directory: `results/lesson-01-5/`
- Saved results: seven PNG files and `measurements.txt`
