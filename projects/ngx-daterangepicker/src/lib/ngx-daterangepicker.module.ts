import { NgModule } from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import { NgxDateRangePickerComponent } from './ngx-daterangepicker/ngx-daterangepicker.component';
import { NgxFormatPipe } from './ngx-daterangepicker/ngx-format.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [NgxDateRangePickerComponent, NgxFormatPipe],
  exports: [NgxDateRangePickerComponent, NgxFormatPipe, FormsModule]
})
export class NgxDateRangePickerModule { }
