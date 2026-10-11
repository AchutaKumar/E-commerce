# LoyalKart UI/UX Audit

## Existing Surface
The storefront includes the product catalog/search and category filters, product details and related items, saved items, cart, checkout, login/register, profile, About, Shipping Info, 404, plus protected admin login and product creation. Shared UI is the navbar, product card, footer, icons, and loading skeletons. Catalog/category/product, cart/order, profile, and product-creation data use the existing Django API; auth uses stored tokens, while saved items use local storage.

## Findings
1. **Current design problems:** The experience feels assembled from separate templates: a minimal storefront, generic photo hero, account dashboard, and visually unrelated blue admin screens. Cards, gradients, hover elevation, and rounded controls are repeated without a clear product identity.
2. **UX problems:** Search is mostly hidden on mobile; useful destinations such as About, Shipping, and Saved Items are not prominent in the main navigation. Some account actions are placeholders, and auth-required actions rely on blocking browser alerts. Success, loading, and error feedback varies by page.
3. **Inconsistent components:** Buttons, inputs, status messages, back links, and cards have page-local implementations and conflicting shared class names. The profile, checkout, admin, and storefront each apply different interaction and component conventions.
4. **Spacing and layout:** Most content is centered inside repeated bordered panels. The catalog hero consumes space without helping users browse, while the five-column desktop catalog and stacked narrow-screen account stats reduce product legibility and scanning.
5. **Typography:** Most pages use system defaults; some declare Inter without loading it. Type scales and label styles vary, with several overly small uppercase labels and oversized headings competing for attention.
6. **Color:** Purple, blue, slate, and gray palettes coexist. The global blue gradient is largely superseded by local colors, and many hard-coded values prevent consistent states and components.
7. **Mobile/responsive:** Search becomes a full-screen overlay and the remaining navigation is icon-heavy. Profile navigation wraps into an irregular row, stats become a tall single column, and dense cart rows/forms need more deliberate touch-sized layouts. Product imagery and grid density change abruptly across breakpoints.
8. **Redesign targets:** Establish one restrained retail design system; clarify the catalog/navigation hierarchy; make product cards and the product detail purchase flow more legible; give cart and checkout distinct, focused compositions; bring account/auth/admin pages into the same system without making them look alike; refine informational/empty/error/loading states; and make mobile controls and page layouts intentional.

## Preservation Constraints
Keep all existing routes, API endpoints, authentication guards, form fields and submissions, product/cart/order/profile state, local watchlist behavior, and admin create flow. Visual and interaction changes should not alter backend or business rules.
