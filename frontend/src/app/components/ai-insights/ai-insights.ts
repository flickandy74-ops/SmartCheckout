import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ai-insights',
  standalone: true,
  templateUrl: './ai-insights.html',
  styleUrls: ['./ai-insights.css']
})
export class AiInsights {

  @Input() insights: any;

}