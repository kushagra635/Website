# Engineering Review Checklist

Use these questions when planning, implementing, or reviewing a change.

1. **Location:** Does each concern live in the right file and layer?
2. **Duplication:** Is the same fact or behavior implemented more than once?
3. **Restraint:** What can be removed without losing required behavior?
4. **Traceability:** Can an input be traced to its state change and output?
5. **Verification:** Which executed check demonstrates that the behavior works?
6. **Recovery:** Can the change be reverted without losing unrelated work?
7. **Contract:** Are inputs, outputs, constraints, and acceptance criteria
   recorded before a broad implementation?
8. **Repository guidance:** Should a durable decision be added to `AGENTS.md` or
   a reusable skill?
9. **Nonvisual quality:** Were accessibility, errors, performance, contrast, and
   failure states checked?

The checklist applies equally to handwritten and generated code. Findings should
name the affected file, current behavior, consequence, and concrete correction.
