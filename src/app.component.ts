import { Component, ChangeDetectionStrategy, signal, computed, inject, WritableSignal } from '@angular/core';

// Component Imports
import { VisaoGeralComponent } from './components/visao-geral/visao-geral.component';
import { SystemCategoryComponent } from './components/system-category/system-category.component';
import { ImageDiagnosisModalComponent } from './components/image-diagnosis-modal/image-diagnosis-modal.component';
import { InspectionAssistantModalComponent } from './components/inspection-assistant-modal/inspection-assistant-modal.component';
import { TechDiagnosisModalComponent } from './components/tech-diagnosis-modal/tech-diagnosis-modal.component';
import { MaintenanceScheduleModalComponent } from './components/maintenance-schedule-modal/maintenance-schedule-modal.component';
import { UserProfileModalComponent } from './components/user-profile-modal/user-profile-modal.component';
import { UserProfile } from './models/user-profile.model';
import { ToastComponent } from './components/toast/toast.component';
import { LoginComponent } from './components/login/login.component';
import { ToastService } from './services/toast.service';
import { ChecklistInspecaoComponent } from './components/checklist-inspecao/checklist-inspecao.component';
import { OcorrenciaComponent } from './components/ocorrencia/ocorrencia.component';
import { ReformaComponent } from './components/reforma/reforma.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: [
    `
      .assist-button {
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      }
      .assist-button:hover {
        transform: translateY(-3px) scale(1.03);
        box-shadow: 0 6px 20px rgba(0,0,0,0.15);
      }
      .sidebar {
        transition: transform 0.3s ease-in-out;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VisaoGeralComponent,
    SystemCategoryComponent,
    ImageDiagnosisModalComponent,
    InspectionAssistantModalComponent,
    TechDiagnosisModalComponent,
    MaintenanceScheduleModalComponent,
    UserProfileModalComponent,
    ToastComponent,
    LoginComponent,
    ChecklistInspecaoComponent,
    OcorrenciaComponent,
    ReformaComponent,
    AdminPanelComponent,
  ],
})
export class AppComponent {
  activeView = signal('visao-geral');
  isMenuOpen = signal(false);
  isDiagnosisModalOpen = signal(false);
  isInspectionModalOpen = signal(false);
  isTechDiagnosisModalOpen = signal(false);
  isMaintenanceScheduleModalOpen = signal(false);
  isProfileModalOpen = signal(false);
  isNotificationDropdownOpen = signal(false);
  userName = signal('');
  userProfile = signal<UserProfile | null>(null);

  // New signals for Interactive Tour and Admin Panel
  isTourActive = signal(false);
  tourStep = signal(1);
  isAdminModalOpen = signal(false);
  simulateOffline = signal(true);
  advancedSyncMode = signal(false);

  showLogin = signal(true);
  isLoggedIn = signal(false);
  private toastService = inject(ToastService);
  public notificationService = inject(NotificationService);

  navItems = [
    { id: 'visao-geral', label: 'Visão Geral', icon: 'M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10' },
    { id: 'estrutura', label: 'Estrutura & Envoltória', icon: 'M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.33l-7.5-5-7.5 5V21h15z' },
    { id: 'instalacoes', label: 'Instalações', icon: 'M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.83-5.83M11.42 15.17l4.242-4.242a2.652 2.652 0 0 0-3.75-3.75L4.5 15.75l-2.25 2.25 4.5 4.5 2.25-2.25Z' },
    { id: 'seguranca', label: 'Segurança & Transporte', icon: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Z' },
    { id: 'externas', label: 'Áreas Externas', icon: 'M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25v2.25A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z' },
    { id: 'checklist', label: 'Vistoria RTIPA', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z' },
    { id: 'ocorrencias', label: 'Chamados U/E', icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z' },
    { id: 'reforma', label: 'Reforma', icon: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z' },
    { id: 'admin', label: 'Ferramentas Admin', icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z' },
  ];

  activeViewLabel = computed(() => {
    const currentView = this.activeView();
    const navItem = this.navItems.find(item => item.id === currentView);
    return navItem ? navItem.label : 'Visão Geral';
  });
  
  constructor() {
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.userProfile.set(parsed);
        return;
      } catch (e) {
        console.error('Error parsing user_profile', e);
      }
    }
    const initialProfile: UserProfile = {
      fullName: 'Emanoel Amorim',
      professionalTitle: 'Arquiteto e Urbanista',
      professionalId: 'CAU-PE 123456',
      companyName: 'AmorimTech',
      position: 'Diretor de Engenharia',
      companyCnpj: '12.345.678/0001-90',
      companyAddress: 'Recife - PE, Brasil',
    };
    this.userProfile.set(initialProfile);
    localStorage.setItem('user_profile', JSON.stringify(initialProfile));
  }

  startTour(): void {
    if (!this.isLoggedIn()) {
      this.showLoginRequiredToast();
      return;
    }
    this.activeView.set('visao-geral');
    this.tourStep.set(1);
    this.isTourActive.set(true);
    this.isMenuOpen.set(false);
    this.toastService.show('Tour do Ecossistema iniciado!', 'success');
  }

  nextTourStep(): void {
    if (this.tourStep() < 4) {
      this.tourStep.update(s => s + 1);
    } else {
      this.isTourActive.set(false);
      this.toastService.show('Tour concluído! Explore livremente.', 'success');
    }
  }

  prevTourStep(): void {
    if (this.tourStep() > 1) {
      this.tourStep.update(s => s - 1);
    }
  }

  openAdminModal(): void {
    if (!this.isLoggedIn()) {
      this.showLoginRequiredToast();
      return;
    }
    this.isAdminModalOpen.set(true);
    this.isMenuOpen.set(false);
  }

  resetLocalState(): void {
    localStorage.removeItem('inspections_checklist_progress');
    this.toastService.show('Progresso do Checklist de Campo limpo com sucesso!', 'success');
    this.isAdminModalOpen.set(false);
  }

  setActiveView(view: string): void {
    if (!this.isLoggedIn() && view !== 'visao-geral') {
      this.showLoginRequiredToast();
      return;
    }
    this.activeView.set(view);
    this.isMenuOpen.set(false);
  }

  onProfileUpdate(profile: UserProfile): void {
    this.userProfile.set(profile);
    localStorage.setItem('user_profile', JSON.stringify(profile));
    if (this.isLoggedIn() && profile && profile.fullName) {
      this.userName.set(profile.fullName.split(' ')[0]);
    } else {
      this.userName.set('');
    }
  }

  handleLoginSuccess(): void {
    const profile = this.userProfile();
    if (profile && profile.fullName) {
      this.userName.set(profile.fullName.split(' ')[0]);
    }
    this.isLoggedIn.set(true);
    this.showLogin.set(false);
    this.toastService.show(`Bem-vindo, ${this.userName()}!`, 'success');
  }

  handleGuestAccess(): void {
    this.userName.set('');
    this.isLoggedIn.set(false);
    this.showLogin.set(false);
    this.activeView.set('visao-geral');
  }

  showLoginRequiredToast(): void {
    this.toastService.show('Faça login para acessar esta funcionalidade.', 'info');
  }

  openAssistant(modalSignal: WritableSignal<boolean>): void {
    if (this.isLoggedIn()) {
      modalSignal.set(true);
    } else {
      this.showLoginRequiredToast();
    }
  }

  openProfile(): void {
    if (this.isLoggedIn()) {
      this.isProfileModalOpen.set(true);
    } else {
      this.showLoginRequiredToast();
    }
  }

  handleLogout(): void {
    this.isProfileModalOpen.set(false);
    this.isLoggedIn.set(false);
    this.showLogin.set(true);
    this.userName.set('');
    this.activeView.set('visao-geral');
    this.toastService.show('Você saiu com sucesso.', 'info');
  }
}