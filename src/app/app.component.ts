import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ThutonetOrganizationPhaseTwo';

  // NOTE: Temporary debug instrumentation to capture unexpected navigations.
  // Remove after diagnosis.
  constructor(private router: Router) {
    // Log navigation starts
    this.router.events.subscribe(e => {
      if (e instanceof NavigationStart) {
        console.log('[Router Debug] NavigationStart ->', e.url);
      }
    });

    // Monkey-patch router.navigate to show a stack trace when navigation is invoked.
    // This helps identify the caller that triggers redirects like the unexpected /login navigation.
    const r: any = this.router as any;
    if (!r.__navigatePatched) {
      const origNavigate = r.navigate;
      r.navigate = function(...args: any[]) {
        console.log('[Router Debug] navigate called with', args);
        try {
          // Provide a stack trace to help find the caller
          console.trace();
        } catch (err) {
          // ignore
        }
        return origNavigate.apply(this, args);
      };
      r.__navigatePatched = true;
    }
  }
}
