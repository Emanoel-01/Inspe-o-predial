import { Component, ChangeDetectionStrategy, input } from '@angular/core';

interface MaintenanceScheduleItem {
  type: string;
  activity: string;
  periodicity: string;
  recommendations: string;
  tech_diagnostics: string;
}

@Component({
  selector: 'app-maintenance-table',
  templateUrl: './maintenance-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaintenanceTableComponent {
  schedule = input.required<MaintenanceScheduleItem[]>();
}