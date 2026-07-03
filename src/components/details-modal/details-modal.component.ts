import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-details-modal',
  templateUrl: './details-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsModalComponent {
  isOpen = input.required<boolean>();
  title = input<string>('Detalhes');
  closeModal = output<void>();

  onClose(): void {
    this.closeModal.emit();
  }
}