import {Component, inject} from '@angular/core';
import {Analytics} from "@angular/fire/analytics";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private analytics: Analytics = inject(Analytics);
  title = 'has-ai-taken-over';
}
