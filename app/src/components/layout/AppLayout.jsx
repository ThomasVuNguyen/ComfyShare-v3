// Writebook-style grid layout
export default function AppLayout({ header, toolbar, sidebar, children, footer }) {
  return (
    <>
      {header && (
        <header id="header">
          {header}
        </header>
      )}

      {toolbar && (
        <div id="toolbar">
          {toolbar}
        </div>
      )}

      <main id="main">
        {children}
      </main>

      {sidebar && (
        <aside id="sidebar" aria-label="Table of Contents">
          {sidebar}
        </aside>
      )}

      {footer && (
        <footer id="footer">
          {footer}
        </footer>
      )}
    </>
  )
}
