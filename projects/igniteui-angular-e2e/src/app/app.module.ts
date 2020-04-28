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

@NgModule({
  declarations: [
    AppComponent,
    GridCellEditingComponent
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
    IgxButtonModule
],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
