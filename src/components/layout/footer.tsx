export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40 py-6">
      <div className="container flex flex-col items-center justify-center gap-4 md:h-16 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
          Built on <a href="https://sui.io/" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">Sui</a>.
          Powered by zkLogin.
        </p>
      </div>
    </footer>
  );
}
