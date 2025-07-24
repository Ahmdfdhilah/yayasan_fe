// import { Link } from 'react-router-dom';

export function DashboardFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
        <div className="flex flex-col items-center justify-between space-y-3 md:flex-row md:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2025 Yayasan. All rights reserved.
            </p>
          </div>
          {/* <div className="flex items-center space-x-6">
            <Link
              to="/help"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Help
            </Link>
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
}