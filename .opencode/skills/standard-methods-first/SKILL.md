---
name: standard-methods-first
description: Load before writing a custom algorithm, parser, helper, or script, or when replacing a library that seems awkward - including on "I will just write my own", "this library is confusing", or "it would be easier to build it". Chooses the tool; `api-docs-first` then verifies it.
metadata:
  upstream: standard-methods-first
---

# Standard Methods First

Run the established solution before building a replacement. Search before
designing, and measure before claiming custom work is necessary.

## Entry gate

Do not start a custom implementation until all four have answers:

1. What exact problem, output, and success condition must be met?
2. What already exists in this repository or its declared dependencies?
3. What does current official documentation establish as the standard workflow?
4. How does the standard method actually perform on the real input?

A missing answer means keep searching, not start coding.

## Workflow

1. Write the contract: inputs, outputs, units, and the observable success
   condition.
2. Search the repository for an existing implementation or established pattern.
3. Check the language, platform, and installed libraries for a standard method.
4. Verify the exact installed version through primary documentation.
5. Run the standard method on one representative input.
6. Build a custom implementation only when the standard method cannot meet the
   recorded contract, and record the specific mismatch.
7. Compare both implementations on the same input before removing either path.

Search findings should include file paths, exact functions, installed versions,
documentation links, and observed behavior. Installing a dependency changes the
environment contract and should be an explicit scoped change.

## Failure patterns

- Writing a custom date parser, CSV splitter, or URL builder that the standard
  library already provides.
- Treating inconvenience as incompatibility. An unfamiliar API is not a
  technical blocker.
- Abandoning a maintained library because the first integration attempt failed.
- Listing candidate tools without running one.
- Letting an unmeasured custom path quietly become the real path.
- Reimplementing something that already exists elsewhere in this same
  repository.

Until the standard method has been run and failed the recorded contract, keep
custom output labeled exploratory and out of any reported result.

## Complete when

- [ ] Inputs, outputs, and success condition are recorded.
- [ ] Repository and installed methods were searched.
- [ ] The standard method is linked and tested on representative input.
- [ ] Any custom path has a measured, documented justification.
- [ ] Replacement and existing behavior were compared before cutover.
