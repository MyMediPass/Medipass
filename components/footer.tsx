export function Footer() {
  return (
    <footer className="border-t py-4 px-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Healie. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
            Terms
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
            Contact
          </a>
        </div>
      </div>
    </footer>
  )
}
