import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgxDateRangePickerComponent} from './ngx-daterangepicker.component';
import {NgxFormatPipe} from './ngx-format.pipe';

@NgModule({
    declarations: [NgxDateRangePickerComponent, NgxFormatPipe],
    imports: [CommonModule, FormsModule],
    exports: [NgxDateRangePickerComponent, CommonModule, FormsModule]
})
export class NgxDateRangePickerModule {
}
