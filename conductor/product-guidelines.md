# Visual Design System
The app follows a **Performance-Minimalist** design system:
-   **Primary Aesthetic:** **Light-First** default experience for optimal daylight legibility and trust.
-   **Structure:** Clean, off-white surfaces with high-contrast, data-friendly typography.
-   **Accents:** Controlled use of "Cyber-Sport" accent colors (e.g., high-energy blue/green/saffron) reserved strictly for active states (countdowns, primary CTAs) and achievements.
-   **Dark Mode:** Available as a fully polished, optional alternative, never forced.
-   **Principles:** Precise, fast, and trustworthy — instrument-like clarity for all workout and performance screens.
-   **Anti-Patterns:** No gradient-heavy backgrounds, excessive animations, or decorative illustrations that reduce data clarity.

# Voice & Tone Personalization
Users can select a preferred communication style during onboarding (changeable in Settings):
1.  **Coach Mode (Default):** Motivational Hinglish ("Aaj ka run done? 💪"). Best for casual joggers and growth.
2.  **Pro Mode:** Professional, data-centric ("Interval 3 complete. Pace within target."). Best for serious athletes.
3.  **Community Mode:** Friendly, local pride-focused ("You helped Bengaluru add 5km today 🏙️"). Best for beginners and corporate wellness groups.
*   **Architecture:** Implemented via a centralized Message Layer (`message_key` + `tone_profile`) to ensure consistency.
*   **Fallback Rule:** If a message key is missing for a selected tone, the system MUST default to the **Pro Mode** copy.
*   **Guardrails:** Tone affects copy only; metrics, error messages, and health warnings remain neutral and standardized.

# User Interface Components
*   **Layouts:** Flat cards with clear content grouping and minimal shadows.
*   **Typography:** Sans-serif, optimized for data readability (large numerals for pace/time).
*   **Accessibility:** Maintain WCAG-compliant contrast ratios and touch target sizes across all modes.
*   **Interaction:** Minimal friction; high responsiveness.
