import {
    Component, OnInit, HostListener, ElementRef, forwardRef, Input, OnChanges, SimpleChange,
    ViewChild, AfterViewInit, ChangeDetectorRef
} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';
import * as dateFns from 'date-fns';
import {locales} from './constants'

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

export interface NgxMenuItem {
    alias: string;
    text: string;
    operation: string;
    active?: boolean;
}

export interface NgxDateRangePickerOptions {
    theme: 'default' | 'green' | 'teal' | 'cyan' | 'grape' | 'red' | 'gray';
    range?: string;
    locale?: string;
    labels: string[];
    menu: NgxMenuItem[];
    dateFormat: string;
    outputFormat: string;
    startOfWeek: number;
    outputType?: 'string' | 'object';
    date?: NgxDateRangePickerDates;
}

export interface IDay {
    date: Date;
    day: number;
    weekday: number;
    today: boolean;
    firstMonthDay: boolean;
    lastMonthDay: boolean;
    visible: boolean;
    from: boolean;
    to: boolean;
    isWithinRange: boolean;
}

export let DATERANGEPICKER_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NgxDateRangePickerComponent),
    multi: true
};

@Component({
    selector: 'ngx-daterangepicker',
    templateUrl: 'ngx-daterangepicker.component.html',
    styleUrls: ['ngx-daterangepicker.sass'],
    providers: [DATERANGEPICKER_VALUE_ACCESSOR]
})
export class NgxDateRangePickerComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnChanges {
    @ViewChild('fromInput') fromInput: ElementRef;
    @Input() options: NgxDateRangePickerOptions;

    modelValue: string|Object;
    opened: false | 'from' | 'to';
    date: Date;
    dateFrom: Date;
    dateTo: Date;
    dayNames: string[];
    days: IDay[];
    range: string;
    defaultOptions: NgxDateRangePickerOptions = {
        theme: 'default',
        labels: ['Start', 'End'],
        locale: 'en',
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
        outputFormat: 'DD-MM-YYYY',
        outputType: 'string',
        startOfWeek: 0,
        date: null
    };

    arrowLeft: number;

    private onTouchedCallback: () => void = () => {
    };
    private onChangeCallback: (_: any) => void = () => {
    };

    constructor(private elementRef: ElementRef, private cdr: ChangeDetectorRef) {
    }

    get value(): string|Object {
        return this.modelValue;
    }

    set value(value: string|Object) {
        if (!value) {
            return;
        }
        this.modelValue = value;
        this.onChangeCallback(value);
    }

    writeValue(value: string) {
        if (!value) {
            return;
        }
        this.modelValue = value;
    }

    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

    ngAfterViewInit(): void {
        this.arrowLeft = this.fromInput.nativeElement.offsetWidth;
        this.cdr.detectChanges();
    }

    ngOnInit() {
        this.opened = false;

        this.defaultOptions.date = {
            from: {
                year: dateFns.getYear(this.date),
                month: dateFns.getMonth(this.date),
                day: dateFns.getDay(this.date)
            },
            to: {
                year: dateFns.getYear(this.date),
                month: dateFns.getMonth(this.date),
                day: dateFns.getDay(dateFns.addDays(this.date, 1))
            }
        };

        this.options = this.options || this.defaultOptions;
        this.initNames();

        if (this.options.range) {
            this.selectRange(this.options.menu.filter((item) => {
                return this.options.range === item.alias;
            })[0]);
        } else {
            if (!this.options.date) {
                this.options.date = this.defaultOptions.date;
            }

            this.selectDates(this.options.date);
        }
    }

    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        this.options = this.options || this.defaultOptions;


        if (this.options.date) {
            this.selectDates(this.options.date);
        }

        this.initNames();
    }

    initNames(): void {
        this.dayNames = [];
        for (let i = 1; i < 7; ++i) {
            this.dayNames.push(this.getDayOfWeek(i));
        }

        this.dayNames.push(this.getDayOfWeek(0));
    }

    getDayOfWeek(day: number): string {
        let date = new Date();
        let dayOfWeek = dateFns.format(dateFns.setDay(date, day, {weekStartsOn: 1}), "dd", { locale: locales[this.options.locale]});
        return dayOfWeek[0].toUpperCase() + dayOfWeek.substring(1);
    }

    generateCalendar(): void {
        this.days = [];
        let start: Date = dateFns.startOfMonth(this.date);
        let end: Date = dateFns.endOfMonth(this.date);

        let days: IDay[] = dateFns.eachDay(start, end).map(d => {
            let startOfWeek = this.options.startOfWeek;
            let endOfWeek = startOfWeek === 0 ? 6 : 0;
            return {
                date: d,
                day: dateFns.getDate(d),
                weekday:  dateFns.getDay(d),
                startOfWeek,
                endOfWeek,
                today: dateFns.isToday(d),
                firstMonthDay: dateFns.isFirstDayOfMonth(d),
                lastMonthDay: dateFns.isLastDayOfMonth(d),
                visible: true,
                from: dateFns.isSameDay(this.dateFrom, d),
                to: dateFns.isSameDay(this.dateTo, d),
                isWithinRange: dateFns.isWithinRange(d, this.dateFrom, this.dateTo)
            };
        });

        let prevMonthDayNum = dateFns.getDay(start) - 1;
        let prevMonthDays: IDay[] = [];
        if (prevMonthDayNum > 0) {
            prevMonthDays = Array.from(Array(prevMonthDayNum).keys()).map(i => {
                let d = dateFns.subDays(start, prevMonthDayNum - i);
                return {
                    date: d,
                    day: dateFns.getDate(d),
                    weekday: dateFns.getDay(d),
                    firstMonthDay: dateFns.isFirstDayOfMonth(d),
                    lastMonthDay: dateFns.isLastDayOfMonth(d),
                    today: false,
                    visible: false,
                    from: false,
                    to: false,
                    isWithinRange: false
                };
            });
        }

        this.days = prevMonthDays.concat(days);
        if (this.options.outputType === 'object') {
            this.value = {
                from: dateFns.format(this.dateFrom, this.options.outputFormat),
                to: dateFns.format(this.dateTo, this.options.outputFormat)
            };
        } else {
            this.value =
                `${dateFns.format(this.dateFrom, this.options.outputFormat)}-${dateFns.format(this.dateTo, this.options.outputFormat)}`;
        }
    }

    toggleCalendar(e: MouseEvent, selection: 'from' | 'to'): void {
        // Arrow position
        if (selection === 'from') {
            this.arrowLeft = this.fromInput.nativeElement.offsetWidth * 0.4;
        } else {
            this.arrowLeft = this.fromInput.nativeElement.offsetWidth + this.fromInput.nativeElement.offsetWidth * 0.4;
        }

        if (this.opened && this.opened !== selection) {
            this.opened = selection;
        } else {
            this.opened = this.opened ? false : selection;
        }
    }

    closeCalendar(e: MouseEvent): void {
        this.opened = false;
    }

    selectDate(e: MouseEvent, index: number): void {
        e.preventDefault();
        let selectedDate: Date = this.days[index].date;

        if ((this.opened === 'to' && dateFns.isBefore(selectedDate, this.dateFrom))) {
            this.opened = 'from';
        }

        if ((this.opened === 'from' && dateFns.isAfter(selectedDate, this.dateTo))) {
            this.dateFrom = selectedDate;
            this.dateTo = selectedDate;
        }

        if (this.opened === 'from') {
            this.dateFrom = selectedDate;
            this.opened = 'to';
        } else if (this.opened === 'to') {
            this.dateTo = selectedDate;
            this.opened = 'from';
        }

        if (this.opened === 'from') {
            this.arrowLeft = this.fromInput.nativeElement.offsetWidth * 0.4;
        } else {
            this.arrowLeft = this.fromInput.nativeElement.offsetWidth + this.fromInput.nativeElement.offsetWidth * 0.4;
        }

        if (this.options.menu && this.options.menu.length > 0) {
            this.options.menu.map((item) => {
                item.active = false;
            });
        }

        this.generateCalendar();
    }

    prevMonth(): void {
        this.date = dateFns.subMonths(this.date, 1);
        this.generateCalendar();
    }

    nextMonth(): void {
        this.date = dateFns.addMonths(this.date, 1);
        this.generateCalendar();
    }

    selectDates(dates: NgxDateRangePickerDates): void {
        this.dateFrom = dateFns.startOfDay(new Date(dates.from.year, dates.from.month - 1, dates.from.day));
        this.dateTo = dateFns.startOfDay(new Date(dates.to.year, dates.to.month - 1, dates.to.day));

        if (dateFns.isAfter(this.dateFrom, this.dateTo)) {
            this.dateTo = this.dateFrom;
        }

        this.date = dateFns.startOfDay(this.dateFrom);

        this.generateCalendar();
    }

    selectRange(range: NgxMenuItem): void {
        let today = dateFns.startOfDay(new Date());

        this.options.menu.map((item) => {
            item.active = item.alias === range.alias;
        });

        let operand = range.operation[0] === '-' ? -1 : 1;
        let amount = parseInt(range.operation, 10);
        let unit = range.operation.slice(-1);

        switch (unit) {
            case 'm':
                if (operand < 0) {
                    today = dateFns.subMonths(today, amount * operand);
                } else {
                    today = dateFns.addMonths(today, amount * operand);
                }

                this.dateFrom = dateFns.startOfMonth(today);
                this.dateTo = dateFns.endOfMonth(today);
                break;
            case 'w':
                if (operand < 0) {
                    today = dateFns.subWeeks(today, amount * operand);
                } else {
                    today = dateFns.addWeeks(today, amount * operand);
                }

                this.dateFrom = dateFns.startOfWeek(today, {weekStartsOn: this.options.startOfWeek});
                this.dateTo = dateFns.endOfWeek(today, {weekStartsOn: this.options.startOfWeek});
                break;
            case 'y':
                if (operand < 0) {
                    today = dateFns.subYears(today, amount * operand);
                } else {
                    today = dateFns.addYears(today, amount * operand);
                }

                this.dateFrom = dateFns.startOfYear(today);
                this.dateTo = dateFns.endOfYear(today);
                break;
            default:
                if (operand < 0) {
                    today = dateFns.subDays(today, amount * operand);
                } else {
                    today = dateFns.addDays(today, amount * operand);
                }

                this.dateFrom = dateFns.startOfDay(today);
                this.dateTo = dateFns.endOfDay(today);
                break;
        }

        this.date = dateFns.startOfDay(this.dateFrom);

        this.range = range.alias;
        this.generateCalendar();
    }

    @HostListener('document:click', ['$event'])
    handleBlurClick(e: MouseEvent) {
        let target = e.srcElement || e.target;
        if (!this.elementRef.nativeElement.contains(e.target) && !(<Element>target).classList.contains('day-num')) {
            this.opened = false;
        }
    }
}
