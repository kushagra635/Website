# Answer — Lesson Studio 01

Answer in your own words and cite your own work. The agent may ask follow-up
questions, but it may not write or rewrite these answers.

## Mechanism

1. Starting at the Calculator desktop icon, name every function that runs until
   its window appears. Cite the function names and source locations.
2. Which subsystem owns `openApps`? Which code only renders a view of that
   state?
3. What makes minimized different from closed in the DOM, `openApps`, and the
   taskbar?
4. Why did the launcher search fail? Explain callback scope using the actual
   callback parameter and the name that was out of scope.
5. For your selected timer or media app, what resource is acquired, who owns
   it, and exactly where is it released?
6. What boundary did you extract? Name its inputs, outputs, and one dependency
   that remains outside it.

## Failure and evidence

1. What exact action reproduced the failure? Record the exact error rather than
   paraphrasing it.
2. What was your initial hypothesis? Which evidence supported or rejected it?
3. Why was your correction smaller and safer than rewriting the launcher?
4. Which lifecycle behaviors did you retest, and what evidence would have
   caused you to reject the change?
5. What did repeated open/close cycles reveal about resource cleanup?
6. What limitation remains in the lifecycle or storage architecture?

## Agent supervision

1. What did the agent propose, and which claims did you verify yourself?
2. Which suggestion did you reject, narrow, or correct? Why?
3. What evidence would make you reject an agent's success claim?

## Transfer

1. Choose a second Serenity app. Predict its full window lifecycle and cleanup
   obligations without asking the agent to trace it for you.
2. If Serenity later used modules or a framework, which ownership boundaries
   would remain the same?
3. Apply the four Git states—working directory, staging, local history, and
   remote history—to one of your own commits.
4. Which simulated or unsafe feature would you remove next, and what user value
   would remain afterward?

## Defense notes

- One mechanism I can demonstrate without the agent:
- One failure I can reproduce and explain:
- One limitation I would state publicly:
- One thing I still cannot explain:
- The next piece of evidence I would collect:
