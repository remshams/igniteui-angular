import { RouterModule } from '@angular/router';
import { GridCellEditingComponent } from './grid-cellEditing/grid-cellEditing.component';
import { GridExtrasComponent } from './grid-Extrass/grid-Extrass.component';

const appRoutes = [
  {
      path: '',
      pathMatch: 'full',
      redirectTo: '/cellEditing'
  },
  {
      path: 'cellEditing',
      component: GridCellEditingComponent
  } ,
  {
      path: 'gridExtras',
      component: GridExtrasComponent
  }
];
export const routing = RouterModule.forRoot(appRoutes);
