# Lesson 1: Extract the Duplicated JavaScript

**Trains:** Skill #2 — Spotting duplication (*"have I seen this code before?"*) — see [CURRICULUM.md](../CURRICULUM.md)
**Time estimate:** 1–2 hours

## The problem

The canvas particle animation, the theme toggle, and the scroll-observer logic are copy-pasted nearly identically into **four** HTML files — roughly 120 lines, four times. Proof of the pain: find a bug in the particle math and you fix it in four places, hoping you didn't miss one. This is the #1 failure mode of AI-generated code: each page was generated complete, so nobody noticed the same code piling up.

## The exercise

1. **The drift question.** Are the four copies *actually* identical? Have your agent compare the four script blocks and report every difference. Read the report — any drift between copies is a bug waiting to happen. Decide which version is the correct one, and why.
2. **Write the spec.** One shared JS file, loaded by all four pages. Your spec must answer the question the agent won't ask on its own: *what happens on a page that doesn't have a canvas or an accordion?* The shared code has to handle every page, not assume one. And the constraint: nothing changes visually.
3. Let the agent execute, one page per commit.
4. **You verify, in the browser:** particles animate on all four pages, the theme choice survives navigating between pages, scroll reveals still fire.

## Done when

- [ ] A change to particle behavior means editing exactly **one** file
- [ ] You can name at least one difference that had crept in between the four copies (there almost always is one)
- [ ] You checked all four pages yourself — not the agent's word for it
