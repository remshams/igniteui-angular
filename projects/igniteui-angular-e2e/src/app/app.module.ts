import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {
  IgxIconModule, IgxGridModule, IgxExcelExporterService, IgxCsvExporterService, IgxOverlayService,
  IgxDragDropModule, IgxDividerModule, IgxTreeGridModule,  IgxHierarchicalGridModule, IgxInputGroupModule,
  IgxIconService, DisplayDensityToken, DisplayDensity, IgxDateTimeEditorModule, IgxButtonModule
} from 'igniteui-angular';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from './shared.module';
import { routing } from './app-routing';
import { GridCellEditingComponent } from './grid-cellEditing/grid-cellEditing.component';
import { IgxExtrasModule } from 'projects/igniteui-angular-extras/src/public-api';
import { GridExtrasComponent } from './grid-Extrass/grid-Extrass.component';

@NgModule({
  declarations: [
    AppComponent,
    GridCellEditingComponent,
    GridExtrasComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HammerModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    IgxIconModule,
    IgxInputGroupModule,
    IgxGridModule,
    IgxTreeGridModule,
    IgxHierarchicalGridModule,
    IgxDragDropModule,
    IgxDividerModule,
    SharedModule,
    routing,
    HammerModule,
    IgxDateTimeEditorModule,
    IgxButtonModule,
    IgxExtrasModule
],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
