import { Component, ChangeDetectionStrategy, input, signal, computed } from '@angular/core';
import { DetailsModalComponent } from '../details-modal/details-modal.component';
import { PathologyModalContentComponent } from '../pathology-modal-content/pathology-modal-content.component';
import { MaintenanceTableComponent } from '../maintenance-table/maintenance-table.component';
import { Pathology } from '../../models/pathology.model';
import { UserProfile } from '../../models/user-profile.model';

// In-line model definitions based on data structure
interface Typology {
  title: string;
  definicao: string;
  componentes: string;
  aplicacoes: string;
  vantagens: string;
  desvantagens: string;
}

interface Diagnostic {
  title: string;
  desc: string;
}

interface Technology {
  icon: string;
  title: string;
  desc: string;
}

interface MaintenanceSchedule {
  [typologyTitle: string]: {
    type: string;
    activity: string;
    periodicity: string;
    recommendations: string;
    tech_diagnostics: string;
  }[];
}

interface SystemData {
  title: string;
  icon: string;
  tipologias: Typology[];
  patologias: Pathology[];
  diagnostico: Diagnostic[];
  tecnologias: Technology[];
  maintenance_schedules: MaintenanceSchedule;
}

@Component({
  selector: 'app-system-card',
  templateUrl: './system-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DetailsModalComponent,
    PathologyModalContentComponent,
    MaintenanceTableComponent,
  ],
})
export class SystemCardComponent {
  system = input.required<SystemData>();
  userProfile = input<UserProfile | null>(null);

  modalData = signal<{ isOpen: boolean; type: 'typology' | 'pathology' | null; data: Typology | Pathology | null }>({
    isOpen: false,
    type: null,
    data: null,
  });

  activeScheduleKey = signal<string | null>(null);
  pathologyFilter = signal<string | null>(null);

  activeSchedule = computed(() => {
    const key = this.activeScheduleKey();
    if (!key) return null;
    return this.system().maintenance_schedules[key] || null;
  });

  modalTitle = computed(() => this.modalData().data?.title || '');

  openTypologyModal(typology: Typology): void {
    this.modalData.set({ isOpen: true, type: 'typology', data: typology });
  }

  openPathologyModal(pathology: Pathology): void {
    this.modalData.set({ isOpen: true, type: 'pathology', data: pathology });
  }

  closeModal(): void {
    this.modalData.set({ isOpen: false, type: null, data: null });
  }

  showMaintenanceSchedule(typologyTitle: string): void {
    this.activeScheduleKey.set(typologyTitle);
  }

  getLinkedPathologies(typologyTitle: string): Pathology[] {
    return this.system().patologias.filter(p => p.typology_link === typologyTitle);
  }

  setPathologyFilter(typologyTitle: string | null): void {
    this.pathologyFilter.set(typologyTitle);
  }
}