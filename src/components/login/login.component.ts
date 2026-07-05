import { Component, ChangeDetectionStrategy, output, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class LoginComponent {
  loginSuccess = output<{ email: string; password: string }>();
  loginAsGuest = output<void>();

  email = signal('');
  password = signal('');

  private toastService = inject(ToastService);

  handleLogin(): void {
    if (this.email().trim() && this.password().trim()) {
      // Mock login successful
      this.loginSuccess.emit({ email: this.email().trim(), password: this.password().trim() });
    } else {
      this.toastService.show('Por favor, insira o e-mail e a senha.', 'error');
    }
  }

  handleGuestAccess(): void {
    this.loginAsGuest.emit();
  }
}