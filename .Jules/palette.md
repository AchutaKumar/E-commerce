# Palette's Journal - Critical UX/Accessibility Learnings

## 2025-03-01 - [Direct Watchlist Removal in Saved Items]
**Learning:** Users experience high friction when they cannot manage their saved items directly from the watchlist page. Requiring navigation into each product's detail page to remove an item is tedious and disorienting.
**Action:** Implement an overlay action button directly on the product card within the Saved Items view, ensuring `e.preventDefault` is used to prevent page navigation, and design with proper keyboard accessibility and clean screen reader labels.
