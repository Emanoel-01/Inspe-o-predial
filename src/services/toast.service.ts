import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);
  private lastId = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 5000): void {
    const newToast: ToastMessage = {
      id: ++this.lastId,
      message,
      type,
      duration,
    };

    this.toasts.update(currentToasts => [...currentToasts, newToast]);

    if (duration > 0) {
      setTimeout(() => this.remove(newToast.id), duration);
    }
  }

  remove(id: number): void {
    this.toasts.update(currentToasts => currentToasts.filter(toast => toast.id !== id));
  }
}
