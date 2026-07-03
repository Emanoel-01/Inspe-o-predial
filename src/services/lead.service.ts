import { Injectable, signal, computed } from '@angular/core';

export interface LeadItem {
  id: string;
  name: string;
  email: string;
  plan: string;
  date: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class LeadService {
  private items = signal<LeadItem[]>([
    {
      id: 'L1',
      name: 'Emanoel Amorim',
      email: 'emanoel@amorimtech.com.br',
      plan: 'Professional FM',
      date: '27/06/2026, 10:14:22',
      status: 'Ativo',
    },
    {
      id: 'L2',
      name: 'Carlos Albuquerque',
      email: 'carlos.albu@gmail.com',
      plan: 'Inspetor Autônomo',
      date: '26/06/2026, 18:32:05',
      status: 'Pendente',
    },
    {
      id: 'L3',
      name: 'Mariana Costa Siqueira',
      email: 'mariana.costa@siqueiraeng.com.br',
      plan: 'Enterprise FM',
      date: '25/06/2026, 14:45:11',
      status: 'Sob Consulta',
    },
    {
      id: 'L4',
      name: 'Roberto de Oliveira',
      email: 'roberto@facilitysolutions.com.br',
      plan: 'Professional FM',
      date: '24/06/2026, 09:12:44',
      status: 'Ativo',
    },
    {
      id: 'L5',
      name: 'Ana Cláudia Vieira',
      email: 'ana.claudia@crea-pe.org.br',
      plan: 'Inspetor Autônomo',
      date: '23/06/2026, 16:55:30',
      status: 'Cancelado',
    }
  ]);

  leads = computed(() => this.items());

  addLead(name: string, email: string, plan: string, status = 'Pendente'): void {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR') + ', ' + now.toLocaleTimeString('pt-BR');
    const newLead: LeadItem = {
      id: 'L' + (this.items().length + 1),
      name,
      email,
      plan,
      date: formattedDate,
      status,
    };
    this.items.update(prev => [newLead, ...prev]);
  }

  deleteLead(id: string): void {
    this.items.update(prev => prev.filter(l => l.id !== id));
  }

  updateLeadStatus(id: string, status: string): void {
    this.items.update(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  }
}
