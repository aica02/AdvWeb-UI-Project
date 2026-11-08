---
version: 1
slug: "frontend-src-pages-banner-jsx"
primary_target: "frontend/src/pages/banner.jsx"
related_targets: ["frontend/src/pages/header.jsx","frontend/src/pages/home.jsx"]
---

# Surface brief: BookWise storefront (home first, then every screen)

Mode: Persuade for the home page; Operate for cart, orders, profile and admin.

Audience: class-project graders in a live demo, plus the in-product shopper who wants to discover something to read. Job: show the catalog, the discovery flow and every feature clearly. Action: pick a genre, see one book, add it to the cart or buy it. Proof: the real catalog (68 books, real covers, real prices, 17 on sale). Constraints: keep the BookWise name, blue #035c96, navy #01203f, red #ff3131 and Montserrat; every existing route and behavior keeps working; no invented ratings, reviews or claims.

## Direction contract

THESIS: Genre Spotlight. Choose a genre and one book owns the screen; the catalog is explored one cover at a time, not as a grid of equal cards. Refuses the banner carousel plus rows of identical cards.

OWN-WORLD: Primary blue field, navy header chrome, white type, red reserved for the buy action and sale badges. Montserrat 800-900 for genre names and titles, Nunito for body. Real covers shown large at their natural proportions with soft neutral shadows. No kickers, no card-in-card, no gradient text.

STORY: The visitor sees the genres, picks one, immediately sees a real book with its price and sale, and can add it to the cart or buy it in one tap, then keep browsing that genre.

FIRST VIEWPORT: Desktop 1440x900: white header then navy sub-nav; below it the blue stage. Left 360px: six genre names as large type with counts, current one white with a red marker, others pale blue. Centre: one tall cover (up to 640px high, natural width). Right 420px: sale badge, title (Montserrat 900), author, short description, price with struck-through old price, Add to Cart (white) and Buy Now (red), then four more covers from the same genre. Phone: genre chips scroll sideways above the cover, details and full-width buttons below.

FORM: Spotlight structure, dealt lead (position 1 of the dealt hand), seed:6d683e37f0fdf080.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
