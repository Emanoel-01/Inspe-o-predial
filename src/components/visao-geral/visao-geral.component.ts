import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { EbookGeneratorComponent } from '../ebook-generator/ebook-generator.component';
import { SummaryEbookGeneratorComponent } from '../summary-ebook-generator/summary-ebook-generator.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-visao-geral',
  templateUrl: './visao-geral.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EbookGeneratorComponent,
    SummaryEbookGeneratorComponent
  ],
})
export class VisaoGeralComponent {
  private toastService = inject(ToastService);

  // States for interactive community subscription
  isSubscribing = signal(false);
  subscribedEmail = signal('');
  showSubscribedSuccess = signal(false);

  // License activation states
  selectedLicense = signal<string | null>(null);
  showLicenseModal = signal(false);
  licenseEmail = signal('');
  licenseName = signal('');
  activatedLicense = signal<string | null>(null);

  scrollToFeatures(): void {
    const element = document.getElementById('funcionalidades');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      this.toastService.show('Rolar para ferramentas centralizadas', 'info');
    }
  }

  handleCommunitySubscribe(event: Event): void {
    event.preventDefault();
    if (!this.subscribedEmail().trim()) return;

    this.isSubscribing.set(true);
    setTimeout(() => {
      this.isSubscribing.set(false);
      this.showSubscribedSuccess.set(true);
      this.toastService.show('Inscrição realizada com sucesso!', 'success');
    }, 1200);
  }

  openLicenseForm(plan: string): void {
    this.selectedLicense.set(plan);
    this.showLicenseModal.set(true);
  }

  submitLicenseRequest(): void {
    if (!this.licenseName().trim() || !this.licenseEmail().trim()) {
      this.toastService.show('Por favor, preencha todos os campos.', 'error');
      return;
    }

    this.toastService.show('Processando ativação de plano...', 'info');
    setTimeout(() => {
      this.activatedLicense.set(this.selectedLicense());
      this.showLicenseModal.set(false);
      this.toastService.show(`Plano ${this.selectedLicense()} ativado para testes!`, 'success');
    }, 1500);
  }
}
