# Backend Issue Audit

Scope inspected: `backend/backend/settings.py`, project URLs and WSGI/ASGI, all `store` models/serializers/views/URLs/admin/tests/migrations, requirements, and frontend API call sites. The untracked backend `.env` was not opened; only variable presence was checked. No production/MySQL data was changed; tests applied migrations only to their disposable SQLite test database.

Implementation status: code fixes are in the working tree; migration `store.0006` was applied to the verified local MySQL database only. Tests run on in-memory SQLite; no production database or deployment storage was accessed.

## Verified Findings

### 1. Backend startup fails in the active Python environment
- **Affected code:** `store/views.py` import chain through `store/urls.py`; active runtime dependencies.
- **Root cause:** `python backend/manage.py check` initially failed importing `cc_delim_re` from Django. Installed versions were Django 6.1 and DRF 3.15.2, while `requirements.txt` pins Django 6.0.3 and DRF 3.17.1.
- **Severity:** Critical (the current backend process cannot start).
- **Status:** The declared versions were installed in a temporary virtual environment; `manage.py check` passes there and `pip check` reports no dependency conflicts. The active global Python environment remains mismatched and must not be used for this backend.
- **Fix/action:** Use a project virtual environment and install `backend/requirements.txt`; do not change the global Python packages.
- **Regression risk:** Low when using the isolated environment.

### 2. Production signing key is hard-coded and the configured environment has no `SECRET_KEY`
- **Affected code:** `backend/settings.py`; backend configuration.
- **Root cause:** A literal Django signing key was committed in settings; `SECRET_KEY` was absent during the initial audit.
- **Severity:** Critical.
- **Status:** Settings now require `SECRET_KEY` from the environment and fail clearly without it. The local `.env` now contains a `SECRET_KEY` entry (value deliberately not inspected); confirm it is newly generated and not the exposed key. The example file uses a placeholder only. Rotate the exposed key in deployment.
- **Fix/action:** Rotate the exposed key in deployment. Existing signed sessions may become invalid.
- **Regression risk:** Existing Django-signed data and outstanding JWTs may become invalid after rotation; users may need to sign in again. Startup will require the new environment variable.

### 3. Backend `.env` was untracked without backend-local ignore protection
- **Affected code:** `backend/.env`; root `.gitignore` is currently deleted in the worktree.
- **Root cause:** The environment file contains configured DB variables and appears as untracked; the root `.gitignore` is deleted in the current worktree.
- **Severity:** High (credential exposure risk if staged or committed; no evidence it is committed).
- **Status:** Added `backend/.gitignore` for `.env`, virtual environments, and Python caches, plus a placeholder-only `backend/.env.example`. `git check-ignore` confirms the real `.env` is ignored. No evidence was found that it is committed.
- **Fix/action:** Keep the root `.gitignore` deletion untouched; backend-local protection is in place.
- **Regression risk:** None to runtime; verify the local environment file remains untouched and ignored.

### 4. Checkout accepts fields it never persists and reports an order without payment processing
- **Affected code:** `store/views.py:create_order`, `store/models.py:Order`, migrations, and frontend `CheakoutPage.jsx`.
- **Root cause:** The frontend sends `name`, `address`, `phone`, and `payment_method`. The original API read only `phone`; `Order` had no shipping/contact/payment fields. The UI offers `credit`, but there is no payment integration.
- **Severity:** High.
- **Status:** Server-side validation and additive order fields now persist the frontend checkout data. COD is supported. The existing `credit` input is still accepted to preserve the current API contract, but no card charge occurs and the frontend currently treats an order response as success.
- **Migration:** `store.0006` has been applied to the local MySQL database; historical checkout columns use safe defaults/blank values.
- **Approval needed:** Rejecting `credit` is a breaking behavior change; implementing a gateway requires provider/credential decisions. Neither was guessed. Choose whether to disable online card checkout or provide the payment provider requirements.
- **Regression risk:** The schema change is additive. Payment behavior remains unresolved until approval/provider integration.

### 5. Order creation is not atomic and catches every exception
- **Affected code:** `store/views.py:create_order`.
- **Root cause:** Order, item rows, and cart deletion were separate writes without `transaction.atomic()`. Raw exception text was returned to clients with HTTP 500.
- **Severity:** High.
- **Status:** Fixed. Checkout now validates fields, locks the cart, calculates from database Decimal prices, writes order/items, and clears the cart atomically. Database errors are logged server-side with a generic response.
- **Regression risk:** Locking may serialize simultaneous cart/order writes; API success response can remain compatible.

### 6. Cart quantity and identifiers are not consistently validated
- **Affected code:** `store/views.py:add_to_cart`, `update_cart_quantity`, and `remove_from_cart`.
- **Root cause:** Raw request values were coerced with `int()` in views; invalid strings could raise uncaught `ValueError`, add accepted non-positive values, and missing remove IDs silently returned success. First insertion also ignored the requested quantity and used the model default of 1.
- **Severity:** High.
- **Status:** Fixed. Dedicated serializers validate IDs/quantities; endpoints return 400/404 appropriately, preserve user ownership checks, and new cart rows now use the requested quantity. Regression tests cover successful add/update/remove and foreign-user item access.
- **Regression risk:** Malformed requests that previously produced 500/no-op will return 400; valid frontend payloads remain unchanged.

### 7. Product creation bypasses serializer validation and exposes exception details
- **Affected code:** `store/views.py:create_product`, `store/serializers.py`, product model.
- **Root cause:** The admin endpoint manually wrote request fields without model serializer validation for positive price or uploaded image content/size.
- **Severity:** Medium-High.
- **Status:** Fixed. Product creation uses an explicit serializer, validates category/positive price/image type, applies a 10 MB image limit, and no longer returns raw database exception text. Admin permission and endpoint/response shape are preserved.
- **Regression risk:** Invalid products/uploads will receive 400 instead of reaching storage/database errors; valid admin form submissions remain compatible.

### 8. Registration bypasses configured Django password validators and profile creation is not atomic
- **Affected code:** `store/serializers.py:UserRegistrationSerializer`.
- **Root cause:** `create_user()` hashes the password but did not run configured `AUTH_PASSWORD_VALIDATORS`; user/profile writes could split if profile creation failed.
- **Severity:** Medium-High.
- **Status:** Fixed. Password validation runs in the registration serializer and account/profile creation is atomic.
- **Regression risk:** Weak passwords previously accepted will be rejected with normal serializer validation errors; valid registration response remains unchanged.

### 9. Authenticated profile reads assume every user has a related profile
- **Affected code:** `store/views.py:get_profile`, `UserProfileSerializer`.
- **Root cause:** Profile-backed serialization raised `UserProfile.DoesNotExist` for accounts created outside registration or with incomplete historical data. `is_staff` was also declared writable in the serializer, though the old view ignored it.
- **Severity:** Medium.
- **Status:** Fixed. Reads ensure the profile exists, updates use explicit serializer validation, and `is_staff` is read-only.
- **Regression risk:** Missing profiles become recoverable; existing profile response fields remain the same.

### 10. Product/category deletion can erase historical order lines
- **Affected code:** `store/models.py` foreign keys for `Product.category` and `OrderItem.product`; Django admin registrations.
- **Root cause:** Cascading deletes propagated from category to product and product to order items. A deletion through Django admin could remove sales history.
- **Severity:** High data-integrity risk.
- **Status:** Models and applied migration use `PROTECT` for category/product references, preserving historical order lines.
- **Regression risk:** Admin deletion of referenced records will be blocked instead of cascading. No deletion endpoints exist in the React frontend.

### 11. Production URL configuration serves static and uploaded files through Django's development helper
- **Affected code:** `backend/backend/urls.py` under `DEBUG=False`.
- **Root cause:** `django.views.static.serve` routes were enabled in production for both media and static files.
- **Severity:** Medium.
- **Status:** Static files now use the already-pinned WhiteNoise middleware and manifest storage; the production static `serve` route is removed. Media remains served through Django because persistent storage/host setup is not verified.
- **Remaining risk:** Uploaded media on an ephemeral deployment filesystem may not persist across deploys. Configure persistent disk/object storage for the actual host.

### 12. Production HTTPS settings need deployment-specific values
- **Affected code:** `backend/settings.py`.
- **Root cause:** A deployment check with defaults reported missing HSTS and HTTPS redirect configuration. Enabling these without confirming proxy/TLS termination can cause redirect loops or lock out subdomains.
- **Severity:** Medium.
- **Status:** Cookie security follows `DEBUG`; redirect, HSTS, and trusted-proxy behavior are now environment-controlled. Set these deliberately for the deployment platform.
- **Regression risk:** Incorrect proxy/HSTS values can make the site inaccessible; HSTS should only be enabled after validating all affected hosts use HTTPS.

### 13. Requirements contained unrelated environment packages
- **Affected code:** `backend/requirements.txt`.
- **Root cause:** The dependency file included unrelated libraries not imported by the backend, resembling a broad environment freeze rather than the app's runtime requirements.
- **Severity:** Low.
- **Status:** Replaced with the nine verified Django/runtime/database/static-serving/deployment packages. The isolated environment reports no broken requirements.
- **Regression risk:** Low; reinstall from the trimmed manifest and add a package back only when backend code or the deployment command uses it.

### 14. Cart ownership and item uniqueness are not enforced by the database
- **Affected code:** `store/models.py:Cart` and `CartItem`.
- **Root cause:** `Cart.user` is a nullable foreign key and `(cart, product)` has no unique constraint. Concurrent first-cart creation or duplicate legacy rows can make `get_or_create()` ambiguous or create repeated product rows.
- **Severity:** Medium, conditional on concurrent requests or existing duplicate records.
- **Status:** Existing cart operations lock an existing cart during mutations, but database uniqueness remains unverified. No constraint migration was added because the production MySQL data could not be checked for duplicates.
- **Proposed fix:** Inspect for duplicate carts/items on a database backup, merge them safely if present, then add uniqueness constraints in a migration and handle duplicate-creation races.
- **Regression risk:** Constraint migration can fail if duplicate records exist; do not apply until data is checked.

### 15. Category endpoint referenced an unimported model
- **Affected code:** `store/views.py:get_category`.
- **Root cause:** `Category` had been removed from the module imports while the endpoint still queried `Category.objects`, causing a `NameError` and HTTP 500.
- **Severity:** High (the catalog category filters could not load).
- **Status:** Restored the import and added a regression test. The live endpoint now returns HTTP 200 and five categories.
- **Regression risk:** Low.

### 16. Local frontend API base URL targeted another service
- **Affected code:** `frontend/.env`.
- **Root cause:** The frontend requested `127.0.0.1:8000`, which was owned by an unrelated Django project and returned 404 for store API routes.
- **Severity:** Critical for local use (product/category API calls were sent to the wrong app).
- **Status:** Changed the local base URL to port 8001, where this e-commerce backend now runs. The unrelated service on 8000 was left untouched. Verify the correct API host in each deployment environment.
- **Regression risk:** Local-only configuration change; deployed frontend environment values are unaffected.

## Missing Evidence / Decisions
- The local `.env` has a `SECRET_KEY`; its value was not inspected. Verify privately that it is unique and rotated from the exposed source key.
- The additive migration ran against the verified local MySQL database. No production database was connected.
- Payment provider and deployment media storage are unspecified. Online card checkout remains an approval/provider decision; uploaded media persistence must be configured for the actual host.
- `python backend/manage.py check --deploy` still reports HSTS and HTTPS redirect warnings when their opt-in environment variables are left at development-safe defaults.
- Existing MySQL cart rows were not inspected for duplicates, so cart uniqueness constraints remain pending that data check.
- The regression suite now contains 13 API tests; all pass on SQLite. SQLite does not reproduce MySQL locking behavior; production concurrency remains unverified.
