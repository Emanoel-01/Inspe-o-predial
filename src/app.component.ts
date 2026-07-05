import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';

// Component Imports
import { VisaoGeralComponent } from './components/visao-geral/visao-geral.component';
import { UserProfileModalComponent } from './components/user-profile-modal/user-profile-modal.component';
import { UserProfile } from './models/user-profile.model';
import { ToastComponent } from './components/toast/toast.component';
import { LoginComponent } from './components/login/login.component';
import { ToastService } from './services/toast.service';
import { ChecklistInspecaoComponent } from './components/checklist-inspecao/checklist-inspecao.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { OrcamentoRoadmapComponent } from './components/orcamento-roadmap/orcamento-roadmap.component';
import { NotificationService } from './services/notification.service';
import { VistoriaDbService } from './services/vistoria-db.service';
import { Vistoria } from './components/checklist-inspecao/checklist-inspecao.component';

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
    UserProfileModalComponent,
    ToastComponent,
    LoginComponent,
    ChecklistInspecaoComponent,
    AdminPanelComponent,
    OrcamentoRoadmapComponent,
  ],
})
export class AppComponent implements OnInit {
  private dbService = inject(VistoriaDbService);
  todasVistorias = signal<Vistoria[]>([]);

  private readonly EMAIL_ADM = 'emanoel.s.amorim@gmail.com';
  private readonly SENHA_ADM = 'Amorim$123*';
  private readonly PIN_ADM = '8803';

  mostrarPinAdm = signal<boolean>(false);
  admAcessoLiberado = signal<boolean>(false);

  activeView = signal('visao-geral');
  isMenuOpen = signal(false);
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
    { id: 'checklist', label: 'Check-up', pageTitle: 'Laudo Técnico de Inspeção Predial', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z' },
    { id: 'orcamento', label: 'Orçamento', pageTitle: 'Módulo de Orçamento e Planejamento', icon: 'M9 14l6-6m-5.5.5h.01M15 15v-3.5a1.5 1.5 0 00-3 0V15M3 9v10a1 1 0 001 1h16a1 1 0 001-1V9M3 9l9-6 9 6' },
    { id: 'admin', label: 'Ferramentas Admin', icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z' },
  ];

  navItemsVisiveis = computed(() => {
    return this.navItems.filter(item => item.id !== 'admin' || this.admAcessoLiberado());
  });

  activeViewLabel = computed(() => {
    const currentView = this.activeView();
    const navItem = this.navItems.find(item => item.id === currentView);
    return navItem ? (navItem.pageTitle ?? navItem.label) : 'Visão Geral';
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
    this.notificationService.gerarLembretesLocais(this.todasVistorias(), profile);
  }

  onLoginSuccess(cred: { email: string; password: string }): void {
    console.log('onLoginSuccess disparado'); // prova de evento 0.4
    const profile = this.userProfile();
    if (profile && profile.fullName) {
      this.userName.set(profile.fullName.split(' ')[0]);
    }
    this.isLoggedIn.set(true);
    this.showLogin.set(false);
    this.toastService.show(`Bem-vindo, ${this.userName()}!`, 'success');

    const emailMatch = cred.email.toLowerCase() === this.EMAIL_ADM.toLowerCase();
    const senhaMatch = cred.password === this.SENHA_ADM;

    if (emailMatch && senhaMatch) {
      this.mostrarPinAdm.set(true); // login segue normal; só pede a confirmação extra por cima
    }
  }

  confirmarPinAdm(pin: string): void {
    console.log('confirmarPinAdm disparado'); // prova de evento 0.4
    if (pin.trim() === this.PIN_ADM) {
      this.admAcessoLiberado.set(true);
      this.mostrarPinAdm.set(false);
      this.toastService.show('Acesso ADM liberado.', 'success');
    } else {
      this.toastService.show('PIN incorreto.', 'error');
    }
  }

  cancelarPinAdm(): void {
    this.mostrarPinAdm.set(false);
  }

  handleGuestAccess(): void {
    this.userName.set('');
    this.isLoggedIn.set(false);
    this.showLogin.set(false);
    this.activeView.set('visao-geral');
    this.admAcessoLiberado.set(false);
    this.mostrarPinAdm.set(false);
  }

  showLoginRequiredToast(): void {
    this.toastService.show('Faça login para acessar esta funcionalidade.', 'info');
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
    this.admAcessoLiberado.set(false);
    this.mostrarPinAdm.set(false);
    this.toastService.show('Você saiu com sucesso.', 'info');
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.dbService.migrarDoLocalStorageSeNecessario();
      const list = await this.dbService.getAllVistorias();
      this.todasVistorias.set(list);
    } catch (e) {
      console.error('Erro ao inicializar vistorias no app:', e);
    }

    this.notificationService.gerarLembretesLocais(this.todasVistorias(), this.userProfile());
    void this.notificationService.checarAvisosExternos();
  }
}