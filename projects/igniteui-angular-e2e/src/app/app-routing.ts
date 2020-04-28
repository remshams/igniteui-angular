import { RouterModule } from '@angular/router';
import { GridCellEditingComponent } from './grid-cellEditing/grid-cellEditing.component';

const appRoutes = [
  {
      path: '',
      pathMatch: 'full',
      redirectTo: '/cellEditing'
  },
  {
      path: 'cellEditing',
      component: GridCellEditingComponent
  }
];
export const routing = RouterModule.forRoot(appRoutes);
