---
name: standard-methods-first
description: Load before writing a custom algorithm, parser, helper, script, or replacement for an existing tool. Search the repository and test documented standard methods first.
---

# Standard Methods First

## Workflow

1. Write the contract: inputs, outputs, and the observable success condition.
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

## Complete when

- [ ] Inputs, outputs, and success condition are recorded.
- [ ] Repository and installed methods were searched.
- [ ] The standard method is linked and tested on representative input.
- [ ] Any custom path has a measured, documented justification.
- [ ] Replacement and existing behavior were compared before cutover.
