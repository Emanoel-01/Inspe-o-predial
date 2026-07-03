import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { DataService } from '../../services/data.service';
import { SystemCardComponent } from '../system-card/system-card.component';
import { UserProfile } from '../../models/user-profile.model';

@Component({
  selector: 'app-system-category',
  templateUrl: './system-category.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SystemCardComponent],
})
export class SystemCategoryComponent {
  categoryKey = input.required<string>();
  userProfile = input<UserProfile | null>(null);
  
  private dataService = inject(DataService);
  
  category = computed(() => {
    const allData = this.dataService.getData();
    return allData[this.categoryKey()];
  });

  categorySystems = computed(() => {
    const cat = this.category();
    if (!cat) return [];
    return Object.values(cat.systems);
  });
}