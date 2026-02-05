
## 2026-02-05 - [Frontend Bundle Optimization]
**Learning:** Vite handles `React.lazy` chunk splitting automatically without configuration. `Suspense` placement is critical for UX; wrapping `Outlet` preserves the layout while loading pages.
**Action:** Always verify bundle output (chunks) after implementing lazy loading to ensure splitting actually occurred.
