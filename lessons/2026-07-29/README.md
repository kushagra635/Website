# Lesson 01.5 — One pixel to one kernel

This lesson explains how a small kernel changes an image.

## Concepts

- A kernel is a small grid of numbers.
- One output pixel comes from one image neighborhood.
- Each kernel value multiplies one pixel value.
- The products are added to make the output pixel.
- Correlation uses the kernel as written.
- Convolution flips the kernel before use.
- A symmetric kernel gives the same result after a flip.
- Border rules change results near the image edge.
- Kernel direction changes the direction of an emboss effect.

The notebook applies each concept to a photograph with NumPy and OpenCV.
Running the notebook from top to bottom creates the result images.

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

- Notebook: [01-5-one-pixel-to-one-kernel.ipynb](01-5-one-pixel-to-one-kernel.ipynb)
- Conda environment: `ac-cv`
- Results directory: `results/lesson-01-5/`
- Saved results: seven PNG files and `measurements.txt`
