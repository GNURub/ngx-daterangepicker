import {Component, OnInit} from '@angular/core';
import {NgxDateRangePickerOptions} from '../ngx-daterangepicker';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
    value: string|Object;
    options: NgxDateRangePickerOptions;

    ngOnInit() {
        this.options = {
            theme: 'default',
            dayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            labels: ['Start', 'End'],
            menu: [
                {alias: 'td', text: 'Today', operation: '0d'},
                {alias: 'tm', text: 'This Month', operation: '0m'},
                {alias: 'lm', text: 'Last Month', operation: '-1m'},
                {alias: 'tw', text: 'This Week', operation: '0w'},
                {alias: 'lw', text: 'Last Week', operation: '-1w'},
                {alias: 'ty', text: 'This Year', operation: '0y'},
                {alias: 'ly', text: 'Last Year', operation: '-1y'},
                {alias: 'ny', text: 'Next Year', operation: '+1y'},
            ],
            dateFormat: 'yMd',
            outputFormat: 'DD/MM/YYYY',
            startOfWeek: 0,
            outputType: 'object',
            date: {
                from: {
                    year: 2017,
                    month: 1,
                    day: 5
                },
                to: {
                    year: 2017,
                    month: 1,
                    day: 5
                }
            }
        };
    }
}
