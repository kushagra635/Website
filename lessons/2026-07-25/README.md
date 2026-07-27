# Lesson 00 — Build a Python environment you can rebuild

**Time:** 90–120 minutes of focused work, plus download time. Section 0 is a
one-time install; if the download is slow, stop after Section 2 and continue in
the next session.

By the end you will have a named Conda environment containing Python, NumPy,
OpenCV, Matplotlib, and JupyterLab; a committed `environment.yml` that rebuilds
it; a notebook whose kernel you have proven runs that environment's Python; and
a `machine-profile.json` recording the before and after state of your machine.

This file is your copy of the lesson, at `lessons/2026-07-25/README.md`. Write your
notes and answers directly into it — it is both the instructions and your
evidence record. Commit it as you go.

## Why this matters

Every lesson after this one runs Python against OpenCV. Those lessons compare
results across machines. That comparison is meaningless unless the Python and
library versions for each result are recorded.

The failure this prevents is specific and common: code runs on your machine,
fails on someone else's, and nobody can tell whether the cause is the code, the
Python, the library version, or the operating system. An environment plus a
recipe makes that answerable instead of a guess.

## What a virtual environment is

Running a Python project requires more than its source code:

- a Python interpreter;
- installed Python packages such as NumPy;
- command-line tools such as pip;
- native libraries used by compiled packages such as OpenCV.

Those pieces must have compatible versions. If every project uses the same
Python installation, changing a package for one project changes it for all of
them.

A virtual environment is a directory that holds a separate Python setup for one
purpose. A Conda environment looks roughly like this:

```text
miniforge3/envs/ac-cv/
├── bin/python                        (Windows: python.exe at the top level)
├── bin/pip
├── lib/python3.12/site-packages/numpy/
├── lib/python3.12/site-packages/cv2.*
└── conda-meta/
```

The environment has its own Python executable, installed packages, native
libraries, commands, and Conda package records. Another project can have a
different environment with different versions.

`conda activate ac-cv` changes the current terminal so that environment's
executable directory comes first on `PATH`. After activation, typing `python`
finds the environment's Python before any other Python on the machine. That
Python then imports packages from its own environment.

Activation affects only the current terminal. It does not move your repository
into the environment, and it does not automatically change the Python selected
by another terminal, an editor, or a notebook. You will prove this in Section 7.

An environment separates installed software. It does **not** isolate your
source files, data, GPU driver, camera, network, services, or secrets.

The environment directory stays on your machine and is never committed.
`environment.yml` is the short recipe that belongs in Git.

## Why not use `base`?

`base` is the environment Conda uses for itself. If every project installs into
`base`, all projects share one changing package collection.

For example:

- Project A works with one NumPy and OpenCV combination.
- Project B installs a newer NumPy.
- Project A now imports the newer NumPy too and may stop working.

Separate environments let both projects keep the versions they need.

## Common mistakes and stop conditions

- **Installing project packages into `base`.** Create a named environment
  instead.
- **Using one environment for several unrelated projects.** A later upgrade can
  break all of them.
- **Installing the same package with Conda and pip.** The two tools can
  overwrite each other's files. Conda owns Python, pip, NumPy, OpenCV,
  Matplotlib, and JupyterLab in this lesson.
- **Trusting the prompt.** The name in your prompt is a label, not proof. Check
  `sys.executable`, `numpy.__file__`, and `cv2.__file__`.
- **Assuming an editor uses the activated terminal.** Check `sys.executable`
  inside the editor or notebook, not just in the shell.
- **Ignoring an existing dependency file.** Read it before creating a second
  setup.
- **Copying or committing an environment directory.** It contains
  machine-specific files and absolute paths. Commit `environment.yml`.
- **Approving an install without reading it.** Check the target environment,
  package sources, upgrades, removals, and requested packages.

**Stop condition:** the repository already has an unresolved dependency setup,
a proposed transaction removes packages outside the request, a package source
contains a credential, or a command requests administrator access beyond the
Miniforge installer.

## 0. Install Miniforge

Miniforge is a minimal Conda installer that defaults to the `conda-forge`
package channel. Skip this section if `conda --version` already prints a
version **and** `conda config --show channels` lists `conda-forge`.

Everything after this section is the same on both platforms unless a step says
otherwise.

### macOS

Check your architecture first:

```bash
uname -m
```

`arm64` means Apple Silicon; `x86_64` means Intel. Download the matching
installer:

```bash
# Apple Silicon (arm64)
curl -L -o Miniforge3.sh https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-MacOSX-arm64.sh

# Intel (x86_64)
curl -L -o Miniforge3.sh https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-MacOSX-x86_64.sh
```

Install it into your home directory and load it into this terminal:

```bash
bash Miniforge3.sh -b -p "$HOME/miniforge3"
source "$HOME/miniforge3/etc/profile.d/conda.sh"
conda init zsh
```

Close the terminal, open a new one, and verify.

### Windows

Download `Miniforge3-Windows-x86_64.exe` from the
[Miniforge releases page](https://github.com/conda-forge/miniforge/releases/latest)
and run it. Accept the defaults. Install **for your user only**; do not install
for all users, which requires an administrator and puts the environment
somewhere you cannot write freely.

When it finishes, open **Miniforge Prompt** from the Start menu. Conda works
there immediately.

To also use Conda from PowerShell — which is what your editor's terminal will
use — run this **once**, inside Miniforge Prompt:

```powershell
conda init powershell
```

Close PowerShell and open a new window. If it reports that running scripts is
disabled, allow signed local scripts for your user only and open another new
window:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### Verify the install (both platforms)

```bash
conda --version
conda config --show channels
```

You should see a version number and `conda-forge` in the channel list. Record:

- Conda version:
- Channels listed:
- Terminal you are using (macOS Terminal, Miniforge Prompt, PowerShell):

Continue after `conda --version` prints a version.

## 1. Plan

Fill this in **before** installing anything or running any command in Section 3.
This is a prediction, not a summary. You will compare it against what actually
happens.

**Starting state**

- Repository root:
- Git branch and worktree state:
- Active Conda environment (or none):
- Current `python --version` and path:
- Existing dependency files in the repository:

**Intended change**

- Environment name I will create:
- Packages I am requesting, and why each one is needed:
- Files I expect to add or modify in the repository:

**Allowed scope**

- Files this lesson may change:
- Anything in this repository that must not change:

**Expected result**

- What I predict `python --version` will print after activation:
- What I predict `sys.executable` will be after activation:
- What I predict the *before* machine profile will say about NumPy and OpenCV:

**Verification**

- The exact command I will run to prove the environment is active:
- The observation that would prove I am in the wrong environment:

**Recovery**

- If the environment is broken or wrong, the command that removes it:
- What I would lose by removing it, and what I would not lose:

**Stop condition**

- The result that would make me stop and ask for help:

Now gather the starting state:

```bash
pwd
git status --short --branch

conda --version
conda info --envs
```

Print the current environment variables and Python. These two blocks differ by
shell; run the one that matches your terminal.

```bash
# macOS Terminal, or Git Bash on Windows
echo "CONDA_DEFAULT_ENV=${CONDA_DEFAULT_ENV:-<unset>}"
echo "CONDA_PREFIX=${CONDA_PREFIX:-<unset>}"
command -v python
python --version
```

```powershell
# Windows PowerShell or Miniforge Prompt
echo "CONDA_DEFAULT_ENV=$env:CONDA_DEFAULT_ENV"
echo "CONDA_PREFIX=$env:CONDA_PREFIX"
Get-Command python
python --version
```

Look for dependency files that already exist:

```bash
# macOS Terminal, or Git Bash on Windows
find . -maxdepth 2 -type f \( -name 'environment*.yml' -o -name 'environment*.yaml' \
  -o -name 'pyproject.toml' -o -name 'requirements*.txt' -o -name 'uv.lock' \) -print
```

```powershell
# Windows PowerShell or Miniforge Prompt
Get-ChildItem -Depth 1 -File -Include environment*.yml,environment*.yaml,pyproject.toml,requirements*.txt,uv.lock -Recurse
```

Update the starting-state fields with what you found. Resolve the purpose and
ownership of any existing dependency file before adding another one.

## 2. Capture the "before" machine profile

`tools/machine_inventory.py` uses only the Python standard library, so it needs
no environment — but it does need Python 3.11 or newer. The Python that
Miniforge installed in `base` is new enough, so run this from **Miniforge
Prompt** on Windows, or a normal terminal on macOS, before creating anything.

From your repository root:

```bash
python tools/machine_inventory.py
```

It writes `machine-profile.json` and prints a summary line. Record:

- Summary line it printed:
- `python.executable` from the file:
- `python.virtual_environment` from the file:
- `libraries` status for numpy:
- `libraries` status for opencv:

Compare this against the *expected result* from Section 1. If the profile
disagrees with the prediction, record the mismatch and update the model before
continuing.

## 3. Create the environment

Use the shared environment name `ac-cv` so commands and error messages are
comparable across the three repositories. The name describes
the work the environment serves — the Applied Computing computer-vision block —
not the folder it sits next to.

Check that the name is free:

```bash
conda info --envs
```

If `ac-cv` already exists, stop and inspect it rather than overwriting it.
Otherwise:

```bash
conda create --name ac-cv --channel conda-forge --override-channels python=3.12 pip numpy opencv matplotlib pillow jupyterlab
```

`--channel conda-forge --override-channels` tells Conda to use only the
conda-forge channel and ignore any other channel configured on the machine.
Mixing channels is a common source of packages that install but fail to import,
because compiled packages built against different underlying libraries end up
in the same environment.

Before answering `y`, confirm:

- the target is `ac-cv`, not `base`;
- the requested packages are the seven you asked for;
- every package comes from `conda-forge`;
- the transaction contains no unexpected removal or downgrade.

Conda will install far more packages than the six you named. Write down two of
them that are there only because a requested package needs them:

1.
2.

## 4. Activate it and check the paths

Predict before you look. Write these two now:

- I predict `sys.executable` will be:
- I predict `cv2.__file__` will be:

Then activate:

```bash
conda activate ac-cv
```

On macOS, if the shell says activation is not configured, load Conda into this
terminal and retry:

```bash
source "$(conda info --base)/etc/profile.d/conda.sh"
conda activate ac-cv
```

Now check the real paths. Run the inventory again — same command, but this time
from inside the activated environment:

```bash
python tools/machine_inventory.py
python -m pip check
conda list --show-channel-urls
```

This overwrites `machine-profile.json` with the "after" state. That is intended
— the committed profile should describe your working environment. You already
recorded the "before" numbers in Section 2.

Record from the regenerated `machine-profile.json`:

- Summary line it printed:
- `python.version`:
- `python.executable`:
- `python.virtual_environment`:
- numpy version and status:
- opencv version and status:
- `python -m pip check` result:

Then answer:

- Did `sys.executable` match your prediction? If not, what did you misunderstand?
- Which part of the path proves this Python came from `ac-cv` and not from
  somewhere else on your machine?

Python, NumPy, and OpenCV must all resolve to paths inside the `ac-cv`
environment. If any one of them does not, stop here — the rest of the lesson
will produce misleading results.

## 5. Write `environment.yml`

At the repository root, create:

```yaml
name: ac-cv
channels:
  - conda-forge
  - nodefaults
dependencies:
  - python=3.12
  - pip
  - numpy
  - opencv
  - matplotlib
  - pillow
  - jupyterlab
```

`nodefaults` excludes Anaconda's `defaults` channel, keeping this environment on
conda-forge alone for the same reason as the flag in Section 3.

Review it:

```bash
git diff -- environment.yml
conda env export --from-history
```

The file lists the packages you chose, not every package Conda installed. It
must contain no absolute path and no credential.

**This file is a recipe, not a lock.** It pins Python to 3.12 but leaves NumPy,
OpenCV, Matplotlib, and JupyterLab unpinned, so rebuilding it next month can
legitimately produce different versions. That is the difference between "this
builds something that works" and "this builds exactly what I had." You will see
this directly in the next section.

- Predict now: will the rebuild produce identical versions? Why?

## 6. Rebuild from the file

Create a second environment from the recipe alone:

```bash
conda env create --name ac-cv-rebuild --file environment.yml

conda run --no-capture-output --name ac-cv-rebuild python -m pip check
conda run --no-capture-output --name ac-cv-rebuild python -c "import sys, numpy, cv2, matplotlib; print(sys.executable); print('python', sys.version.split()[0]); print('numpy', numpy.__version__); print('opencv', cv2.__version__); print('matplotlib', matplotlib.__version__)"
```

Record:

- Python executable:
- Python version:
- NumPy, OpenCV, Matplotlib versions:
- Differences from `ac-cv`, or `none`:
- Was your Section 5 prediction right?

This proves `environment.yml` builds a working environment on this machine
today. It does not test another operating system, another architecture, a
driver, a device, a data file, or a future state of the package repository.

## 7. Bind a notebook kernel and prove it

Every lesson in the OpenCV block runs in a notebook, so the kernel must be the
`ac-cv` Python and you must be able to prove it.

With `ac-cv` activated, from your repository root:

```bash
conda activate ac-cv
jupyter lab
```

JupyterLab opens in your browser. Create a new Python 3 notebook and save it as
`lessons/2026-07-25/env-check.ipynb`. In the first cell, run:

```python
import sys, numpy, cv2, matplotlib
print(sys.executable)
print("python", sys.version.split()[0])
print("numpy", numpy.__version__, numpy.__file__)
print("opencv", cv2.__version__, cv2.__file__)
print("matplotlib", matplotlib.__version__)
```

Record:

- `sys.executable` printed by the **notebook**:
- Is it the same path Section 4 printed in the **terminal**?
- If your editor runs notebooks (VS Code and similar), open the same notebook
  there, select the `ac-cv` interpreter, run the cell, and record
  `sys.executable`:

Shut JupyterLab down with `Ctrl+C` in the terminal, twice. Save the notebook
with its output visible — that output is your evidence.

## 8. Cause one harmless failure

Import a package that does not exist:

```bash
conda run --name ac-cv python -c "import lesson00_intentionally_missing"
```

Expected result: `ModuleNotFoundError`.

Record:

- Exact error text:
- Why the import failed:
- Why reinstalling OpenCV would not fix it:

Confirm the environment still works:

```bash
conda run --name ac-cv python -c "import sys, cv2; print(sys.executable); print(cv2.__file__)"
```

- Python path:
- OpenCV path:

## 9. Remove the rebuild environment

`ac-cv-rebuild` has done its job. Environments are disposable; the recipe is the
thing worth keeping. Removing it also reclaims real disk space.

Check what you are about to delete, then delete only that:

```bash
conda info --envs
conda env remove --name ac-cv-rebuild
conda info --envs
```

Confirm the name says `ac-cv-rebuild` before you press enter. Removing `ac-cv`
instead means redoing Sections 3 through 7.

Record:

- Environments listed after removal:
- What you can still rebuild from the repository, and what is now gone:

## 10. Explain what happened

Answer with direct references to the recorded output. Assistance may include
drafting, explanation, or review; every factual claim must still trace to the
executed commands.

1. What is inside a Conda environment, and what is not?
2. What exactly changes when you run `conda activate`, and what does it leave
   unchanged?
3. Which paths in your own records prove Python, NumPy, and OpenCV came from
   `ac-cv`? Quote them.
4. What belongs in Git, and what stays on your machine? Why that split?
5. Why can installing into `base` break an unrelated project?
6. Why can installing the same package with both Conda and pip cause a package
   that installs successfully but fails to import?
7. What did the rebuild prove, and name two things it did not prove.
8. Your notebook and your terminal each printed `sys.executable`. Why can those
   two differ, and how would you detect it if they did?
9. Compare your before and after machine profiles. Which single field changed
   that best demonstrates the environment is isolated?
10. If automation ran commands, what files or environments changed, and which
    output verifies the result?

## 11. Review and commit

```bash
git status --short
git add environment.yml machine-profile.json lessons/2026-07-25/README.md lessons/2026-07-25/env-check.ipynb
git diff --cached
git commit -m "lesson: add reproducible conda environment"
```

Read `git diff --cached` before committing. It must contain only those four
paths. It must not contain an environment directory, a package cache, or a
credential.

Record:

- Path to `environment.yml`:
- Commit hash:
- Remaining problem, or `none`:

## Troubleshooting

| Problem | Check | Next step |
| --- | --- | --- |
| `conda: command not found` (macOS) | `ls "$HOME/miniforge3"` | Re-run `source "$HOME/miniforge3/etc/profile.d/conda.sh"`, then `conda init zsh` and open a new terminal. |
| Inventory script fails with `SyntaxError` or `ImportError: cannot import name 'UTC'` | `python --version` | It needs Python 3.11+. Run it from Miniforge Prompt or an activated environment, not an older system Python. |
| `can't open file 'tools/machine_inventory.py'` | `pwd`, and `git pull` | Run it from your repository root, and pull the latest commit that added `tools/`. |
| Windows: `python` opens the Microsoft Store | Whether the terminal is Miniforge Prompt | Use Miniforge Prompt, or finish `conda init powershell` and open a new window. |
| `conda` works in Miniforge Prompt but not PowerShell | Did `conda init powershell` run? | Run it in Miniforge Prompt, then open a new PowerShell window. |
| PowerShell: "running scripts is disabled" | `Get-ExecutionPolicy -Scope CurrentUser` | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then open a new window. |
| `conda activate` fails in a shell script or Git Bash | `conda info --base` | Source `conda.sh` as shown in Section 4. |
| `import cv2` fails after installation | `sys.executable`, `cv2.__file__`, `conda list --show-channel-urls` | Confirm the active environment, and check whether both Conda and pip installed OpenCV. |
| Terminal works but the editor fails | `sys.executable` inside the editor | Select the `ac-cv` interpreter in the editor, then restart its Python or notebook process. |
| Notebook `sys.executable` differs from the terminal | Which kernel the notebook selected | Launch `jupyter lab` from an activated `ac-cv` terminal, or select the `ac-cv` kernel. |
| Conda reports a package conflict | Requested versions, platform, channels | Save the full error and find the smallest set of requests that still conflicts. |
| The rebuild has different versions | Both version lists and package sources | Record the difference; decide whether this project needs exact pinning. |
| Install is extremely slow | Network, and whether the transaction is unexpectedly large | Let it finish once; do not interrupt a partial transaction. Note the duration. |

## Finished when

- `conda --version` works in the terminal you actually use.
- `ac-cv` exists, and the inventory prints `All tracked libraries are available`.
- Every recorded Python and package path points inside `ac-cv`.
- `environment.yml` contains only the intended direct dependencies.
- The rebuild ran, and you recorded whether versions matched your prediction.
- A notebook cell printed `sys.executable` from inside `ac-cv`, and the output is
  saved.
- The harmless failure is recorded and explained.
- `ac-cv-rebuild` is removed.
- Before and after machine profiles are captured, and the changed field is named.
- The staged diff contains no environment directory.
- The activation explanation cites the recorded paths and environment values.

## Documentation

- [Miniforge releases and installers](https://github.com/conda-forge/miniforge/releases/latest)
- [Conda: managing environments](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html)
- [Conda: managing channels](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-channels.html)
- [Conda command reference](https://docs.conda.io/projects/conda/en/latest/commands/index.html)
- [Python: the module search path](https://docs.python.org/3/tutorial/modules.html#the-module-search-path)
- [JupyterLab: starting and using](https://jupyterlab.readthedocs.io/en/stable/getting_started/starting.html)
