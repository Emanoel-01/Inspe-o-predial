import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { LeadService } from '../../services/lead.service';
import { ToastService } from '../../services/toast.service';

interface UserItem {
  id: string;
  name: string;
  initials: string;
  title: string;
  company: string;
  role: string;
  active: boolean;
}

interface InviteCodeItem {
  id: string;
  code: string;
  created: string;
}

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class AdminPanelComponent {
  private notificationService = inject(NotificationService);
  private leadService = inject(LeadService);
  private toastService = inject(ToastService);

  // Tabs structure
  tabs = [
    { id: 'atividade', label: 'Análise de Atividade', icon: '📊' },
    { id: 'leads', label: 'Análise de Leads', icon: '📈' },
    { id: 'usuarios', label: 'Gestão de Usuários', icon: '👥' },
    { id: 'notificacoes', label: 'Central de Notificações', icon: '🔔' },
    { id: 'convites', label: 'Convites e Acessos', icon: '🎫' },
    { id: 'configuracoes', label: 'Configurações', icon: '⚙️' },
  ];

  activeTab = signal('atividade');
  isRefreshing = signal(false);

  // Stats signals
  totalActivities = signal(1000);
  activeUsers = signal(1);

  // Show form state
  showAddLeadForm = signal(false);

  // Leads computed from shared LeadService
  leads = computed(() => this.leadService.leads());

  // Notifications computed from shared NotificationService
  notifications = computed(() => this.notificationService.notifications());

  // Local state for users list
  users = signal<UserItem[]>([
    {
      id: 'U1',
      name: 'Emanoel Amorim',
      initials: 'EA',
      title: 'Arquiteto e Urbanista',
      company: 'AmorimTech',
      role: 'Administrador',
      active: true,
    },
    {
      id: 'U2',
      name: 'João da Silva',
      initials: 'JS',
      title: 'Engenheiro Civil',
      company: 'AmorimTech',
      role: 'Engenheiro Pleno',
      active: true,
    },
    {
      id: 'U3',
      name: 'Carla Vasconcelos',
      initials: 'CV',
      title: 'Técnica de Edificações',
      company: 'Facility Solutions',
      role: 'Técnico de Campo',
      active: true,
    },
    {
      id: 'U4',
      name: 'Cláudio Mendes',
      initials: 'CM',
      title: 'Estagiário de Engenharia',
      company: 'AmorimTech',
      role: 'Estagiário',
      active: false,
    },
  ]);

  // Invite codes signals
  inviteCodes = signal<InviteCodeItem[]>([
    { id: 'C1', code: 'AMORIM-4.0-ENG88', created: '26/06/2026, 17:40' },
    { id: 'C2', code: 'AMORIM-4.0-VIS21', created: '27/06/2026, 09:15' }
  ]);

  // Sync parameters
  simulateOffline = signal(true);
  advancedSyncMode = signal(false);

  constructor() {
    // Sync settings from local storage if available
    const offlineSim = localStorage.getItem('simulateOffline');
    if (offlineSim !== null) {
      this.simulateOffline.set(offlineSim === 'true');
    }
    const advancedSync = localStorage.getItem('advancedSyncMode');
    if (advancedSync !== null) {
      this.advancedSyncMode.set(advancedSync === 'true');
    }
  }

  refreshStats(): void {
    if (this.isRefreshing()) return;
    this.isRefreshing.set(true);

    setTimeout(() => {
      this.isRefreshing.set(false);
      // Randomly tweak stats slightly for demonstration of real refreshing
      this.totalActivities.update(t => t + Math.floor(Math.random() * 15) + 5);
      if (Math.random() > 0.6) {
        this.activeUsers.update(u => u + 1);
      }
      this.toastService.show('Dados de atividade atualizados com sucesso!', 'success');
    }, 1000);
  }

  // Lead actions
  addManualLead(name: string, email: string, plan: string): void {
    if (!name.trim() || !email.trim()) {
      this.toastService.show('Preencha o nome e o e-mail do lead.', 'error');
      return;
    }
    this.leadService.addLead(name, email, plan);
    this.toastService.show(`Lead "${name}" registrado com sucesso!`, 'success');
    this.showAddLeadForm.set(false);
  }

  toggleLeadStatus(id: string, currentStatus: string): void {
    const statuses = ['Pendente', 'Ativo', 'Sob Consulta', 'Cancelado'];
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];
    this.leadService.updateLeadStatus(id, nextStatus);
    this.toastService.show('Status do lead alterado para: ' + nextStatus, 'info');
  }

  deleteLead(id: string): void {
    if (confirm('Deseja realmente remover este lead do sistema?')) {
      this.leadService.deleteLead(id);
      this.toastService.show('Lead removido com sucesso.', 'info');
    }
  }

  // User actions
  toggleUserActive(id: string): void {
    this.users.update(prev => 
      prev.map(u => {
        if (u.id === id) {
          const nextActive = !u.active;
          this.toastService.show(
            `Usuário "${u.name}" foi ${nextActive ? 'ativado' : 'bloqueado'} com sucesso.`,
            nextActive ? 'success' : 'info'
          );
          return { ...u, active: nextActive };
        }
        return u;
      })
    );
  }

  // Notification actions
  sendNotification(title: string, message: string): void {
    if (!title.trim() || !message.trim()) {
      this.toastService.show('Por favor, preencha o título e a mensagem da notificação.', 'error');
      return;
    }
    this.notificationService.addNotification(title, message);
    this.toastService.show('Notificação adicionada à sua lista local. Este app não tem backend — a notificação não é enviada a outros dispositivos.', 'success');
  }

  clearNotifications(): void {
    if (confirm('Deseja limpar todo o histórico de notificações?')) {
      this.notificationService.clearAll();
      this.toastService.show('Histórico de notificações limpo com sucesso.', 'info');
    }
  }

  markAsRead(id: string): void {
    this.notificationService.markAsRead(id);
  }

  deleteNotification(id: string): void {
    this.notificationService.deleteNotification(id);
    this.toastService.show('Notificação removida.', 'info');
  }

  // Invite actions
  generateInviteCode(): void {
    const randomSuffix = Math.floor(10 + Math.random() * 90).toString();
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomLetters = '';
    for (let i = 0; i < 3; i++) {
      randomLetters += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const newCode = `AMORIM-4.0-${randomLetters}${randomSuffix}`;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR') + ', ' + now.toLocaleTimeString('pt-BR').substring(0, 5);
    
    const newItem: InviteCodeItem = {
      id: Math.random().toString(36).substring(2, 9),
      code: newCode,
      created: formattedDate,
    };

    this.inviteCodes.update(prev => [newItem, ...prev]);
    this.toastService.show('Novo código de convite gerado: ' + newCode, 'success');
  }

  // Config actions
  toggleSimulateOffline(): void {
    const nextState = !this.simulateOffline();
    this.simulateOffline.set(nextState);
    localStorage.setItem('simulateOffline', String(nextState));
    this.toastService.show(
      `Sincronização Local ${nextState ? 'Habilitada' : 'Desabilitada'}.`,
      'info'
    );
  }

  toggleAdvancedSync(): void {
    const nextState = !this.advancedSyncMode();
    this.advancedSyncMode.set(nextState);
    localStorage.setItem('advancedSyncMode', String(nextState));
    this.toastService.show(
      `Sincronização em Nuvem ${nextState ? 'Habilitada' : 'Desabilitada'}.`,
      'info'
    );
  }

  resetLocalChecklist(): void {
    if (confirm('Atenção: isto apagará todo o progresso do Checklist de Campo e vistorias offline salvos no navegador. Confirmar?')) {
      localStorage.removeItem('inspections_checklist_progress');
      this.toastService.show('Progresso do Checklist de Campo limpo com sucesso!', 'success');
    }
  }
}
