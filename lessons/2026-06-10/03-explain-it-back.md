# Lesson 3: Explain It Back

**Trains:** Skill #4 — Reading code you didn't write (*"could I explain this line to someone else?"*) — see [CURRICULUM.md](../CURRICULUM.md)
**Time estimate:** 1–2 hours, no code changes

## The problem

Most of this site's architecture — the glass-morphism design system, the staggered timeline, the View Transitions usage — arrived in large generated commits. It works, but working code you can't explain is a liability: you can't debug it, extend it safely, or know what's safe to delete.

## The exercise

Write a file `lessons/notes.md` in your own words (no AI for the writing — it will be obvious, and it defeats the purpose) answering:

1. **The particle network:** what does the `dist < 150` check do? What happens visually if you change it to 50? To 400? Try both — this is a two-second edit even by hand — and describe what you saw.
2. **The theme system:** trace exactly what happens, step by step, from clicking the theme toggle to the colors changing. Where does `data-theme` get set? How do the CSS variables react? Why does the choice survive a page reload?
3. **The timeline stagger:** the timeline uses increasing `transition-delay`s per item. Why does that create the cascade effect? What's the downside if the timeline grows to 30 items?
4. **One deletion:** name one feature or CSS block in this repo that you would delete because it doesn't earn its complexity, and make the case in 3–4 sentences. (You don't have to actually delete it — but you do have to commit to an opinion.)

Then walk me through your answers live. I'll ask follow-ups.

## Done when

- [ ] `lessons/notes.md` exists, in your voice
- [ ] You experimented with the particle distance values and described what you saw
- [ ] You can answer follow-up questions without looking at the notes

## After this

You're ready for the next tier: a project with a backend (database + API + deployment), and then a component framework — you'll appreciate React much more once you've felt the pain of the same card markup repeated across four files.
