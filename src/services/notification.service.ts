import { Injectable, signal, computed } from '@angular/core';
import { Vistoria } from '../components/checklist-inspecao/checklist-inspecao.component';
import { UserProfile } from '../models/user-profile.model';

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
  private items = signal<NotificationItem[]>([]);

  private readonly STORAGE_KEY = 'predial4_notificacoes_lidas';

  notifications = computed(() => this.items());
  unreadCount = computed(() => this.items().filter(n => !n.read).length);

  private carregarLidas(): Set<string> {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  }

  private salvarLidas(lidas: Set<string>): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...lidas]));
  }

  gerarLembretesLocais(vistorias: Vistoria[], profile: UserProfile | null): void {
    const lidas = this.carregarLidas();
    const novos: NotificationItem[] = [];

    // Lembrete 1: vistoria "em campo" há mais de 5 dias sem finalizar (progress < 100)
    const CINCO_DIAS_MS = 5 * 24 * 60 * 60 * 1000;
    vistorias.forEach(v => {
      const idadeMs = Date.now() - new Date(v.dateCreated).getTime();
      if (v.progress < 100 && idadeMs > CINCO_DIAS_MS) {
        const id = `lembrete-vistoria-parada-${v.id}`;
        if (!lidas.has(id)) {
          novos.push({
            id,
            title: 'Vistoria em aberto',
            message: `A vistoria "${v.buildingName}" está iniciada há mais de 5 dias sem ser concluída.`,
            date: new Date().toLocaleString('pt-BR'),
            read: false,
          });
        }
      }
    });

    // Lembrete 2: perfil sem categoria profissional definida
    if (profile && !profile.categoriaProfissional) {
      const id = 'lembrete-perfil-sem-categoria';
      if (!lidas.has(id)) {
        novos.push({
          id,
          title: 'Perfil incompleto',
          message: 'Defina sua categoria profissional no Perfil — isso ajusta a base legal citada nos laudos (Seção 2.0).',
          date: new Date().toLocaleString('pt-BR'),
          read: false,
        });
      }
    }

    if (novos.length > 0) {
      this.items.update(atuais => {
        const filtradosNovos = novos.filter(n => !atuais.some(a => a.id === n.id));
        return [...filtradosNovos, ...atuais];
      });
    }
  }

  async checarAvisosExternos(): Promise<void> {
    try {
      const resp = await fetch('https://raw.githubusercontent.com/Emanoel-01/Inspe-o-predial/main/avisos.json', { cache: 'no-store' });
      if (!resp.ok) return;
      const avisos: { id: string; title: string; message: string; date: string }[] = await resp.json();
      const lidas = this.carregarLidas();
      const novos = avisos.filter(a => !lidas.has(a.id)).map(a => ({ ...a, read: false }));
      if (novos.length > 0) {
        this.items.update(atuais => {
          const filtradosNovos = novos.filter(n => !atuais.some(a => a.id === n.id));
          return [...filtradosNovos, ...atuais];
        });
      }
    } catch {
      // Falha silenciosa — sem internet ou arquivo indisponível não deve quebrar o app
    }
  }

  addNotification(title: string, message: string): void {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR') + ', ' + now.toLocaleTimeString('pt-BR');
    const id = Math.random().toString(36).substring(2, 9);
    const newItem: NotificationItem = {
      id,
      title,
      message,
      date: formattedDate,
      read: false,
    };
    this.items.update(prev => [newItem, ...prev]);
  }

  markAllAsRead(): void {
    const currentItems = this.items();
    this.items.update(prev => prev.map(n => ({ ...n, read: true })));
    const lidas = this.carregarLidas();
    currentItems.forEach(n => lidas.add(n.id));
    this.salvarLidas(lidas);
  }

  markAsRead(id: string): void {
    this.items.update(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    const lidas = this.carregarLidas();
    lidas.add(id);
    this.salvarLidas(lidas);
  }

  deleteNotification(id: string): void {
    this.items.update(prev => prev.filter(n => n.id !== id));
    const lidas = this.carregarLidas();
    lidas.add(id);
    this.salvarLidas(lidas);
  }

  clearAll(): void {
    const currentItems = this.items();
    this.items.set([]);
    const lidas = this.carregarLidas();
    currentItems.forEach(n => lidas.add(n.id));
    this.salvarLidas(lidas);
  }
}
