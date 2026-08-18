# Frontend Aesthetics

You tend to converge toward generic, "on distribution" outputs.
In frontend design, this creates what users call the "AI slop" aesthetic. 
Avoid this: make creative, distinctive frontends that surprise and delight.

These are the common Coding Styles/Traps AI models follow. STRICTLY AVOID THESE!
1. The Inter/Roboto/Open Sans trap
Inter, Roboto, Arial, Open Sans — these are the safe defaults that appear in every AI output because they're the most common fonts in training data. One writer started calling Inter "the Comic Sans of AI" — not because it's ugly, but because it's the default choice that signals no real thought went into typography. Also: purple-to-blue gradients. Always. 

2. Wrapper div soup
AI will over-generate wrappers, components, abstractions and APIs. You ask for a button, you get a ButtonWrapper inside a ButtonContainer inside a ButtonGroup with props for every possible future state that will never exist. 

3. Duplication instead of abstraction
Duplication is up 81%, reuse down 70%. AI doesn't refactor — it copy-pastes patterns. Your codebase becomes bloated with repeated logic. 

4. Error swallowing
AI strongly prefers to write code that won't be labeled as a defect. The result: density of rescue/catch blocks, safe-navigation operators, and stubbed methods that squelch unexpected-input signals — code that silently catches errors without evaluating their underlying cause, up 47%. 

5. Business logic bleeding into JSX
Without guardrails, AI might embed business logic directly into components — API calls in a useEffect hook inside a display component. JSX with its declarative nature is particularly prone to bloat under AI influence. 

6. Stale Tailwind syntax
AI coding assistants are trained on Tailwind v3 data. They generate tailwind.config.js, @tailwind directives, bg-opacity-50, and other patterns that don't exist in Tailwind v4. Someone literally made a GitHub repo of rules specifically to stop this.

7. Accessibility as an afterthought
AI assistants proved insufficiently helpful when not specifically prompted for accessibility — critical steps like replacing placeholder alt attributes with real content get skipped, and compliance can't be verified. 

8. Layout that breaks outside the screenshot
A generated layout can look fine at 1440px with short English labels and then break with long content, browser zoom, a narrow container, a sticky header, a nested scroll area, or an unexpected image ratio. AI predicts a plausible layout pattern without knowing the actual page, the container it will live inside, or the device constraints.
