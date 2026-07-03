import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { registroValido, generateStandardFooter } from '../../services/gemini.service';

@Component({
  selector: 'app-summary-ebook-generator',
  templateUrl: './summary-ebook-generator.component.html',
})
export class SummaryEbookGeneratorComponent {
  generating = signal(false);
  private dataService = inject(DataService);
  private toastService = inject(ToastService);

  generateSummaryEbook(): void {
    const saved = localStorage.getItem('user_profile');
    const profile = saved ? JSON.parse(saved) : null;
    if (!profile || !registroValido(profile.professionalId)) {
      this.toastService.show('Emissão bloqueada. É necessário possuir um registro profissional (CAU/CREA) válido cadastrado no seu perfil para emitir documentos técnicos.', 'error');
      return;
    }

    this.generating.set(true);

    setTimeout(() => {
      const appData = this.dataService.getData();
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Guia Rápido de Manutenção Predial 4.0</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
                body { font-family: 'Inter', sans-serif; line-height: 1.6; font-size: 10pt; margin: 0; padding: 0; color: #374151; background-color: #fff; }
                .page { padding: 2cm; page-break-after: always; position: relative; }
                .cover { text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; background-color: #f8fafc; }
                .cover h1 { font-size: 3em; color: #0c4a6e; margin-bottom: 20px; }
                .cover h2 { font-size: 1.5em; color: #0369a1; margin-bottom: 50px; font-weight: 400; }
                .cover p { font-size: 1.1em; color: #4b5563; }
                .toc h2 { color: #0c4a6e; font-size: 2.2em; border-bottom: 2px solid #93c5fd; padding-bottom: 10px; margin-bottom: 30px; }
                .toc ul { list-style: none; padding: 0; column-count: 2; }
                .toc li { margin-bottom: 15px; }
                .toc a { text-decoration: none; color: #0369a1; font-weight: 700; font-size: 1.1em; }
                .chapter-title { font-size: 2.5em; color: #0c4a6e; margin-bottom: 15px; }
                .chapter-intro { font-size: 1.1em; color: #4b5563; margin-bottom: 30px; border-left: 4px solid #93c5fd; padding-left: 15px; font-style: italic; }
                .system-card { margin-bottom: 25px; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); page-break-inside: avoid; background: white; }
                .system-header { background-color: #f8fafc; color: #0c4a6e; padding: 12px 18px; border-top-left-radius: 8px; border-top-right-radius: 8px; border-bottom: 1px solid #e5e7eb; }
                .system-title { font-size: 1.6em; margin: 0; font-weight: 700; }
                .system-content { padding: 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .section-title { color: #0369a1; font-size: 1.1em; font-weight: 700; margin-bottom: 10px; }
                .section ul { list-style: none; padding: 0; margin: 0; }
                .section li { margin-bottom: 8px; display: flex; align-items: start; }
                .section li svg { width: 16px; height: 16px; margin-right: 8px; margin-top: 3px; flex-shrink: 0; }
                .disclaimer { background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 40px; border-left: 4px solid #f59e0b; font-size: 0.9em; }
                @page { margin: 2cm; }
                @media print { .page { page-break-after: always; } }
            </style>
        </head>
        <body>
            <div class="page cover">
                <h1>Guia Rápido de Manutenção Predial 4.0</h1>
                <h2>Resumo Estratégico de Sistemas, Patologias e Tecnologias</h2>
                <p style="margin-top: 50px;"><strong>Autor:</strong> Mestre Arq. e Urb. Emanoel Silva de Amorim</p>
                <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            <div class="page toc">
                <h2>Sumário</h2>
                <ul>
                    ${Object.entries(appData).map(([key, cat]: [string, any]) => `<li><a href="#${key}">${cat.title}</a></li>`).join('')}
                </ul>
            </div>

            ${Object.entries(appData).map(([categoryKey, category]: [string, any]) => `
                <div class="page chapter" id="${categoryKey}">
                    <h1 class="chapter-title">${category.title}</h1>
                    <p class="chapter-intro">${category.intro}</p>
                    
                    ${Object.entries(category.systems).map(([systemKey, system]: [string, any]) => `
                        <div class="system-card">
                            <div class="system-header"><h2 class="system-title">${system.icon} ${system.title}</h2></div>
                            <div class="system-content">
                                <div class="section">
                                    <h3 class="section-title">Patologias Comuns</h3>
                                    <ul>
                                        ${system.patologias.slice(0, 5).map((pat: any) => `
                                            <li>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#f59e0b" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                                                <span><strong>${pat.title}:</strong> ${pat.sintomas}</span>
                                            </li>`).join('')}
                                    </ul>
                                </div>
                                 <div class="section">
                                    <h3 class="section-title">Tecnologias 4.0</h3>
                                    <ul>
                                        ${system.tecnologias.slice(0, 4).map((tech: any) => `
                                            <li>
                                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#059669" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V8.25a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 8.25v7.5A2.25 2.25 0 0 0 6.75 18z" /></svg>
                                                <span><strong>${tech.title}:</strong> ${tech.desc}</span>
                                            </li>`).join('')}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `).join('')}
            <div class="page">
              <div class="disclaimer">
                  <p><strong>Aviso de Validação Técnica de IA:</strong> Este documento contém sugestões geradas por sistemas de inteligência artificial aplicadas à engenharia diagnóstica predial. Todas as avaliações, cronogramas e dados de manutenção devem ser obrigatoriamente submetidos ao crivo técnico, verificação presencial e responsabilidade de um profissional habilitado.</p>
              </div>
              ${generateStandardFooter(profile)}
            </div>
        </body>
        </html>
      `;

      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        setTimeout(() => {
          newWindow.print();
          this.generating.set(false);
        }, 1000);
      } else {
        this.toastService.show('Não foi possível abrir uma nova janela. Por favor, desative o bloqueador de pop-ups.', 'error');
        this.generating.set(false);
      }
    }, 500);
  }
}
