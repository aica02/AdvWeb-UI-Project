# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience right now: the graders of an Advanced Web course project, watching a demo or clicking through the site. The site must look impressive and make every feature easy to find and show.

The in-product persona is a shopper at a Philippine online bookstore who has no particular title in mind and wants to discover something to read. Prices are in pesos.

## Product Purpose

BookWise is an online bookstore. Shoppers browse books, save them to a wishlist, buy them through a cart and checkout, and track their orders. Admins manage the catalog, orders and accounts, and download sales reports. Success for this phase is a class demo where the design reads as a finished, professional store and all features can be shown.

## Positioning

Undecided. No differentiating claim has been confirmed, so design work must not invent one.

## Operating Context

Live demo and grader walkthrough, on desktop and phone widths. The first thing a visitor should do on the home page is discover something new, through curated shelves and genres.

## Capabilities and Constraints

- React and Vite frontend, Express and MongoDB backend. Every existing route and feature must keep working.
- Shopper features: home shelves (Best Sellers, New Releases), browse with filters (category, language, recommended age, on sale) and sorting, search, book detail with Add to Cart and Buy Now, wishlist, cart with selectable items, payment, order list with cancel and mark-as-received, profile, edit profile, change password, forgot password with emailed OTP, help.
- Admin features: dashboard stats, best-selling table, sales report PDF (daily, weekly, monthly), add book, edit and delete books, user accounts, all orders, activity logs.
- Checkout charges a flat ₱100 shipping fee.
- Categories in use: Coding, Fiction, Romance, Humanities, Thriller, Non-Fiction.

## Brand Commitments

Confirmed by the owner: keep the name BookWise, the existing colors (primary blue #035c96, navy #01203f, red #ff3131) and the Montserrat headings. Redesign work improves structure, hierarchy and polish rather than replacing this identity.

The login page still holds placeholder text ("Logo", "BooksStore Logo") and a broken logo image. No logo asset exists yet.

## Evidence on Hand

- Real catalog in MongoDB: 68 books with cover images in `frontend/public/uploads`, 17 on sale, 21 trending.
- No testimonials, customer counts, ratings, reviews or delivery-time promises exist. Do not fabricate them.

## Product Principles

- Every feature should be easy to find and easy to demonstrate.
- Lead with the books: real covers and real catalog data carry the page.
- Discovery before transaction on the home page; clarity and speed once the shopper has chosen.
- Keep working behavior intact. Design changes must not break a flow.
