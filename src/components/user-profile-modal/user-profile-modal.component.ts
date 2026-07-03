import { Component, ChangeDetectionStrategy, input, output, inject, signal, effect } from '@angular/core';
import { UserProfile } from '../../models/user-profile.model';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-user-profile-modal',
  templateUrl: './user-profile-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class UserProfileModalComponent {
  isOpen = input.required<boolean>();
  closeModal = output<void>();
  profileUpdate = output<UserProfile>();
  logout = output<void>();
  profileData = input<UserProfile | null>(null);

  private toastService = inject(ToastService);

  profile: UserProfile = {
    fullName: 'Emanoel Amorim',
    professionalTitle: 'Arquiteto e Urbanista',
    professionalId: 'CAU-PE 123456',
    companyName: 'AmorimTech',
    position: 'Diretor de Engenharia',
    companyCnpj: '12.345.678/0001-90',
    companyAddress: 'Recife - PE, Brasil',
  };

  saveState = signal<'idle' | 'saving' | 'saved'>('idle');

  constructor() {
    effect(() => {
      const data = this.profileData();
      if (data) {
        this.profile = { ...data };
      } else {
        const saved = localStorage.getItem('user_profile');
        if (saved) {
          try {
            this.profile = JSON.parse(saved);
          } catch {}
        }
      }
    });
  }

  onClose(): void {
    this.saveState.set('idle');
    this.closeModal.emit();
  }

  saveProfile(): void {
    if (this.saveState() !== 'idle') return;

    this.saveState.set('saving');

    // In a real app, this would be an async operation
    setTimeout(() => {
      this.profileUpdate.emit(this.profile);
      this.saveState.set('saved');
      this.toastService.show('Perfil atualizado com sucesso!', 'success');
      
      setTimeout(() => {
        this.onClose();
      }, 1500); // Wait in "saved" state before closing
    }, 500); // Simulate API call
  }

  onLogoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      // Comprimir logo para no máximo 200×80px JPEG
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 400;
        const maxH = 160;
        let w = img.width;
        let h = img.height;
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        if (h > maxH) { w = Math.round(w * maxH / h); h = maxH; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          this.profile = { ...this.profile, companyLogoBase64: canvas.toDataURL('image/png') };
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  removerLogo(): void {
    this.profile = { ...this.profile, companyLogoBase64: undefined };
  }

  onLogout(): void {
    this.logout.emit();
  }
}
