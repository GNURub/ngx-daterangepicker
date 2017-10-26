Angular DateRange Picker
---

This date range picker was heavily inspired by PayPal's datepicker as seen on website.

Demo: https://gnurub.github.io/ngx-daterangepicker/

### Installation

```sh
npm install ngx-daterangepicker --save
```

or

```sh
yarn add ngx-daterangepicker --save
```

### Example

```ts
import { NgxDateRangePickerModule } from 'ngx-daterangepicker';

// app.module.ts
@NgModule({
  ...
  imports: [ ..., NgxDateRangePickerModule, ... ],
  ...
})
export class AppModule { }
```

```ts
// app.component.ts
import { Component, OnInit } from '@angular/core';
import { NgxDateRangePickerOptions } from 'ngx-daterangepicker';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  options: NgxDateRangePickerOptions;

  ngOnInit() {
    this.options = {
	  theme: 'default',
	  range: 'td', // The alias of item menu
	  dayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
	  menu: [
          {alias: 'td', text: 'Today', operation: '0d'},
          {alias: 'tm', text: 'This Month', operation: '0m'},
          {alias: 'lm', text: 'Last Month', operation: '-1m'},
          {alias: 'tw', text: 'This Week', operation: '0w'},
          {alias: 'lw', text: 'Last Week', operation: '-1w'},
          {alias: 'ty', text: 'This Month', operation: '0y'},
          {alias: 'ly', text: 'Last Year', operation: '-1y'},
      ],
      dateFormat: 'yMd',
      outputFormat: 'DD/MM/YYYY',
      outputType: "string",
      startOfWeek: 0
	};
  }
}
```

```html
<!-- app.component.html -->
<ngx-daterangepicker [(ngModel)]="value" [options]="options"></ngx-daterangepicker>
```

### Configuration

```ts
export interface NgxDateRangePickerDates {
    from: {
        year: number,
        month: number,
        day: number
    }
    to: {
        year: number,
        month: number,
        day: number
    }
}

export interface NgxDateRangePickerOptions {
    theme: 'default' | 'green' | 'teal' | 'cyan' | 'grape' | 'red' | 'gray';
    range?: string;
    dayNames: string[];
    labels: string[];
    menu: NgxMenuItem[];
    dateFormat: string;
    outputFormat: string
    startOfWeek: number;
    outputType?: 'string' | 'object';
    date?: NgxDateRangePickerDates;
}
```

### Running the demo

```sh
git clone https://github.com/GNURub/ngx-daterangepicker.git --depth 1
cd ngx-daterangepicker
npm start
```

### Licence

MIT
