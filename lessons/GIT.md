# Git — Your Safety Net

This is Skill #6 in [CURRICULUM.md](CURRICULUM.md): aggressive AI use is only safe when every experiment is cheap to undo. Your agent will type most of these commands for you — but you must know what they mean, because git is the difference between "the AI broke my site" and "the AI broke my site, so I rolled back in ten seconds."

## What is git, actually?

Strip away the mystique: **git is a hidden folder on your machine.** Inside your project sits a folder called `.git` (the dot makes it hidden — `ls -a` reveals it), and that folder contains every snapshot you've ever committed, every commit message, the whole history. That's the repository. Not a cloud service, not an app, not magic — a folder of files, sitting on your laptop, owned by you.

Everything follows from this:

- **Commits are instant and work offline** — committing just writes into that local folder. No internet involved.
- **GitHub is not git.** GitHub is just another computer that holds a *copy* of your `.git` folder. `push` and `pull` are how the two folders trade snapshots. If GitHub vanished tomorrow, your full history would still be sitting in `.git` on your machine.
- **Copy the project folder, and the history comes with it** — because the history *is* in the folder.
- **Delete `.git`, and the history is gone** — your files survive, but every save point disappears. (That's why it's in the dangerous list below.)

When git feels confusing, come back to this: there's a folder on your machine keeping snapshots, and a copy of that folder on GitHub. Every command is just reading from or writing to one of them.

## The mental model

Your code lives in four places. Every git command just moves changes between them:

```text
 working directory ──add──▶ staging ──commit──▶ local history ──push──▶ GitHub
 (files right now)         (next snapshot)      (saved snapshots)      (the cloud copy)

                                                local history ◀──pull── GitHub
```

If a command confuses you, ask: *which of the four places is it moving things between?*

## The commands

### `git status`
"What's changed since my last snapshot?" Your situational-awareness command — check it before and after everything. If `status` shows something you don't understand, stop and find out before committing.

### `git add <file>`
Choose what goes into the next snapshot (moves changes into staging). `git add .` stages everything — convenient when your work is small and focused, dangerous when it isn't. Know what you're adding.

### `git commit -m "message"`
Take a permanent snapshot of everything staged. Commits are your save points: small, frequent, one logical change each. The message says *what and why*, honestly — "Fix theme toggle conflict with seasonal theme" beats "update" every time. Six months from now, the log is the only memory anyone has.

### `git push`
Upload your local commits to GitHub. **Until you push, your commits exist only on your laptop** — if the laptop dies, unpushed work dies with it. Push at least at the end of every session.

### `git pull`
Download commits from GitHub that you don't have locally — needed when work happened somewhere else (another computer, the GitHub web editor, a collaborator). Start your session with a pull if there's any chance the remote is ahead. Gotcha: if you and the remote changed the same lines, you'll get a **merge conflict**. Don't panic and don't run random commands — read what git says, have your agent walk you through it, and understand the resolution before accepting it.

### `git diff`
Exactly what changed, line by line. **This is the review command — and reviewing is now most of your job.** Read the diff before every commit; it's where you catch the thing the agent did that you didn't ask for.

### `git log --oneline`
The list of snapshots so far. Reading the log is reading the story of the project — and it's how you find the save point to go back to.

### `git stash` / `git stash pop`
The drawer. `stash` sweeps all your uncommitted changes into a drawer, leaving everything clean as of the last commit. `stash pop` takes them back out. Use it when you're mid-mess and need a clean slate — to pull, or to check whether a bug exists *without* your current changes. Gotcha: things in the drawer are easy to forget. `git stash list` shows what's in there; pop promptly.

### `git restore <file>`
Throw away uncommitted changes to a file and go back to the last commit. **Destructive** — uncommitted work that's discarded is gone for good, because it was never in a snapshot. Be sure.

### `git revert <commit>`
Undo a committed change by creating a *new* commit that reverses it. Nothing is erased — history shows both the mistake and the fix, and it's safe even after pushing. **A revert is not a failure; it's the system working.** The willingness to revert is what makes bold experiments cheap.

### `git branch` / `git switch <name>`
A branch is a parallel line of history — a place to try something without touching `main`. You'll mostly live on one branch for now; just know branches exist, they're free, and "I'll experiment on a branch" is always an available move.

## Dangerous commands — stop before running

Everything above is safe to use freely. The commands below destroy work or rewrite history. They have legitimate uses, but they are **never routine** — if your agent proposes one, or a tutorial tells you to run one, that is a stop-and-think moment: understand exactly what's about to be lost before you say yes.

### `git reset --hard`
Throws away **all** uncommitted changes and can move history backwards. The most common way beginners lose work. If the goal is "get back to a clean state," `git stash` does it *recoverably* — reach for that instead.

### `git clean -fd`
Deletes every untracked file and folder. Those files were never committed, so there is **no recovery** — git can't restore what it was never given.

### `git push --force`
Overwrites GitHub's history with your local version. Can permanently erase commits — including someone else's. If you think you need this, something already went wrong; stop and ask before running it.

### `git restore .` / `git checkout .`
The repo-wide version of `restore <file>`: discards uncommitted changes to **everything at once**. One mistyped dot can erase a whole session of unsaved work.

### `git rebase`
Rewrites history instead of adding to it. There's a time for it — that time is not this month.

### Deleting the `.git` folder
The files survive, but every snapshot, every save point, the entire history — gone. There is no undo for this one.

**Rule of thumb:** anything with `--force` or `--hard` in it, anything described as "rewriting history," and anything that touches files git isn't tracking. The safe undo is `revert`; the safe clean-slate is `stash`. And never, ever run one of these to "fix" a state you don't understand — that's how recoverable problems become unrecoverable ones.

## The rules of this class

1. **Commit small and often.** A commit should be one decision.
2. **Read the diff before every commit.** No exceptions — that's the review job.
3. **Push before you walk away.** Unpushed work doesn't really exist.
4. **Revert without shame.** The healthiest repos have reverts in their history.
5. **Weird state? Stop.** Run `git status`, read it, ask. Never fire random commands at a confused repo — that's how recoverable problems become unrecoverable ones.
