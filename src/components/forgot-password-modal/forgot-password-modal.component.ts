import { Component, ChangeDetectionStrategy, input, output, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-forgot-password-modal',
  templateUrl: './forgot-password-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class ForgotPasswordModalComponent {
  isOpen = input.required<boolean>();
  closeModal = output<void>();

  email = signal('');
  private toastService = inject(ToastService);

  onClose(): void {
    this.email.set('');
    this.closeModal.emit();
  }

  sendRecoveryEmail(): void {
    const emailAddress = this.email().trim();
    if (emailAddress && this.isValidEmail(emailAddress)) {
      this.toastService.show(`Um e-mail de recuperação foi enviado para ${emailAddress}.`, 'success');
      this.onClose();
    } else {
      this.toastService.show('Por favor, insira um endereço de e-mail válido.', 'error');
    }
  }

  private isValidEmail(email: string): boolean {
    // Simple email validation
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}
