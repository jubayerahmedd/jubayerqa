import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from '@tanstack/react-router';

import {BrandMark} from '../components/brand';
import {NotFound} from '../components/not-found';
import {getSite, type Site} from '../lib/api';
import appCss from '../styles.css?url';

export const Route = createRootRoute({
  /**
   * The brand is fetched ONCE here and reused by every page (header, footer,
   * `<title>`, favicon, the home hero). `getSite` is a server function, so this
   * runs on the Worker on first paint and as an RPC on client navigation — the
   * browser never talks to the API itself.
   */
  loader: async () => ({site: await getSite()}),
  head: ({loaderData}) => {
    const site = (loaderData as {site: Site | null} | undefined)?.site ?? null;
    return {
      meta: [
        {charSet: 'utf-8'},
        {name: 'viewport', content: 'width=device-width, initial-scale=1'},
        {title: site?.name ?? 'Community'},
      ],
      links: [
        // Inter, to match the portfolio home page's typeface (public/portfolio.html).
        {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
        {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous'},
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
        },
        {rel: 'stylesheet', href: appCss},
        ...(site?.favIcon ? [{rel: 'icon', href: site.favIcon}] : []),
      ],
    };
  },
  component: RootComponent,
  notFoundComponent: NotFoundRoute,
});

/** The brand, for any component under the root route. */
export function useSite(): Site | null {
  return Route.useLoaderData().site;
}

function NotFoundRoute() {
  return <NotFound site={useSite()} />;
}

function RootComponent() {
  const site = useSite();
  const name = site?.name ?? 'Community';

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header className="site-header">
          <div className="wrap site-header-inner">
            {/*
              Plain <a>, NOT <Link>: `/` is a raw server-route response (the
              portfolio page), not a route this app's component tree renders —
              a client-side navigation here would show nothing.
            */}
            <a href="/" className="brand">
              <BrandMark site={site} />
              <span className="brand-name">{name}</span>
            </a>
            <nav className="site-nav">
              <a href="/">Home</a>
              <Link to="/blog">Blog</Link>
              {/*
                Plain <a>, NOT <Link>: `/ezystudio` is a raw server-route
                response (like `/`), not a route this app's component tree
                renders — a client-side navigation here would show nothing.
              */}
              <a href="/ezystudio">EzyStudio</a>
              {/*
                Plain <a>, NOT <Link>: `/feeds` is served by the platform App on
                this same hostname, not by this template. Routing it through the
                client router would 404 inside this app instead of leaving it.
              */}
              <a href="/feeds">EzyCommunity</a>
              {/* A real route in this app's own tree, so a <Link> is correct here. */}
              <Link to="/testing/form">Form</Link>
            </nav>
          </div>
        </header>

        <Outlet />

        <footer className="site-footer">
          <div className="wrap site-footer-inner">
            <span>
              © {new Date().getUTCFullYear()} {name}
            </span>
            {/*
              TODO(ticket: reseller branding): white-label communities on a
              reseller agency show the RESELLER's name here, and communities on
              a paid plan show no attribution at all. The attribution rule lives
              on the platform, so this line must come from an API field rather
              than being decided here. Placeholder until that ticket lands.
            */}
            <span className="muted">Powered by EzyCommunity</span>
          </div>
        </footer>

        <Scripts />
      </body>
    </html>
  );
}
