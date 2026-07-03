import { Injectable, signal, computed } from '@angular/core';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private items = signal<NotificationItem[]>([
    {
      id: '1',
      title: 'Atualização de Sistema',
      message: 'A plataforma AmorimTech foi atualizada com sucesso para a versão 4.2.1.',
      date: '24/06/2026, 21:05:37',
      read: false,
    },
    {
      id: '2',
      title: 'Diagnóstico IA Concluído',
      message: 'O relatório fotográfico do Bloco C foi analisado pelo Assistente de Campo.',
      date: '11/02/2026, 20:10:27',
      read: false,
    },
    {
      id: '3',
      title: 'Notificação de Teste',
      message: 'Esta é uma mensagem automatizada de validação das interfaces de engenharia.',
      date: '11/02/2026, 19:52:18',
      read: true,
    },
    {
      id: '4',
      title: 'Cronograma Preventivo',
      message: 'O cronograma anual para o condomínio Edifício Solar foi gerado e está pronto para exportação.',
      date: '04/10/2025, 18:41:13',
      read: true,
    },
    {
      id: '5',
      title: 'Novo Lead Registrado',
      message: 'Um novo profissional baixou o Ebook Completo de Engenharia Diagnóstica.',
      date: '22/09/2025, 18:25:17',
      read: true,
    },
    {
      id: '6',
      title: 'Checklist Iniciado',
      message: 'A vistoria de rotina das instalações elétricas do subsolo foi inicializada.',
      date: '22/09/2025, 18:17:49',
      read: true,
    }
  ]);

  notifications = computed(() => this.items());
  unreadCount = computed(() => this.items().filter(n => !n.read).length);

  addNotification(title: string, message: string): void {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR') + ', ' + now.toLocaleTimeString('pt-BR');
    const newItem: NotificationItem = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      date: formattedDate,
      read: false,
    };
    this.items.update(prev => [newItem, ...prev]);
  }

  markAllAsRead(): void {
    this.items.update(prev => prev.map(n => ({ ...n, read: true })));
  }

  markAsRead(id: string): void {
    this.items.update(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  deleteNotification(id: string): void {
    this.items.update(prev => prev.filter(n => n.id !== id));
  }

  clearAll(): void {
    this.items.set([]);
  }
}
