import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { registroValido, generateStandardFooter } from '../../services/gemini.service';

@Component({
  selector: 'app-ebook-generator',
  templateUrl: './ebook-generator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EbookGeneratorComponent {
  generating = signal(false);
  private dataService = inject(DataService);
  private toastService = inject(ToastService);

  generateCompleteEbook(): void {
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
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Plano de Manutenção Predial - Guia Completo</title>
            <style>
                body { font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.7; font-size: 11pt; margin: 0; padding: 0; color: #333; background-color: #fff; }
                p { margin-bottom: 1em; }
                .page { padding: 2.5cm 2cm; page-break-after: always; position: relative; }
                .cover { text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; padding: 2cm; }
                .cover h1 { font-size: 3.5em; color: #0c4a6e; margin-bottom: 30px; font-weight: bold; border-bottom: 4px solid #0f766e; padding-bottom: 25px; }
                .cover h2 { font-size: 2.2em; color: #0f766e; margin-bottom: 60px; font-weight: normal; }
                .cover p { font-size: 1.4em; color: #555; margin-bottom: 20px; }
                .toc h2, .chapter-title { color: #0c4a6e; font-size: 2.8em; margin-bottom: 40px; border-bottom: 2px solid #0c4a6e; padding-bottom: 15px; }
                .toc ul { list-style: none; padding: 0; }
                .toc li { margin-bottom: 20px; }
                .toc a { text-decoration: none; color: #0f766e; font-weight: bold; font-size: 1.3em; }
                .chapter-intro { font-size: 1.2em; color: #444; margin-bottom: 45px; padding: 25px; background-color: #f8fafc; border-left: 5px solid #0f766e; border-radius: 4px; }
                .system { margin-bottom: 50px; page-break-inside: avoid; }
                .system-header { background: #0c4a6e; color: white; padding: 18px 25px; border-radius: 8px 8px 0 0; }
                .system-title { font-size: 2.2em; margin: 0; font-weight: bold; }
                .system-content { padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; }
                .section { margin-bottom: 40px; }
                .section:last-child { margin-bottom: 0; }
                .section-title { color: #0f766e; font-size: 1.6em; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; }
                .tipology, .pathology, .tech-item { margin-bottom: 25px; padding: 20px; border-radius: 6px; border-left: 5px solid #ccc; page-break-inside: avoid; }
                .tipology { background-color: #f8fafc; border-left-color: #0c4a6e; }
                .pathology { background-color: #fffbeb; border-left-color: #f59e0b; }
                .tech-item { background-color: #f0fdf4; border-left-color: #059669; }
                .item-title { font-size: 1.3em; font-weight: bold; margin-bottom: 12px; }
                .tipology-title { color: #0c4a6e; }
                .pathology-title { color: #b45309; }
                .tech-title { color: #047857; }
                .disclaimer { background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 40px; border-left: 4px solid #f59e0b; font-size: 0.9em; }
                @page { margin: 2.5cm 2cm; }
                @media print { .page { page-break-after: always; } }
            </style>
        </head>
        <body>
            <div class="page cover">
                <h1>Plano de Manutenção Predial</h1>
                <h2>Gestão de Sistemas Essenciais na Construção 4.0</h2>
                <p style="margin-top: 50px;"><strong>Especialização em Engenharia e Gestão da Manutenção Predial</strong></p>
                <p>Autor: Mestre Arq. e Urb. Emanoel Silva de Amorim</p>
                <p>Data: ${new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
                    <div class="chapter-intro">${category.intro}</div>
                    ${Object.entries(category.systems).map(([systemKey, system]: [string, any]) => `
                        <div class="system">
                            <div class="system-header"><h2 class="system-title">${system.icon} ${system.title}</h2></div>
                            <div class="system-content">
                                <div class="section">
                                    <h3 class="section-title">Tipologias</h3>
                                    ${system.tipologias.map((tip: any) => `
                                        <div class="tipology">
                                            <h4 class="item-title tipology-title">${tip.title}</h4>
                                            <p>${tip.definicao}</p>
                                        </div>`).join('')}
                                </div>
                                <div class="section">
                                    <h3 class="section-title">Patologias Comuns</h3>
                                    ${system.patologias.map((pat: any) => `
                                        <div class="pathology">
                                            <h4 class="item-title pathology-title">${pat.title}</h4>
                                            <p><strong>Sintomas:</strong> ${pat.sintomas}</p>
                                        </div>`).join('')}
                                </div>
                                <div class="section">
                                    <h3 class="section-title">Tecnologias 4.0 Aplicadas</h3>
                                    ${system.tecnologias.map((tech: any) => `
                                        <div class="tech-item">
                                            <h4 class="item-title tech-title">${tech.icon} ${tech.title}</h4>
                                            <p>${tech.desc}</p>
                                        </div>`).join('')}
                                </div>
                            </div>
                        </div>`).join('')}
                </div>`).join('')}
            
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