import {
    Component, OnInit, HostListener, ElementRef, forwardRef, Input, OnChanges, SimpleChange,
    ViewChild, AfterViewInit, ChangeDetectorRef
} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';
import * as dateFns from 'date-fns';
import {locales} from './constants';

export interface NgxDateRangePickerDates {
    from: Date | {
        year: number,
        month: number,
        day: number
    };
    to: Date | {
        year: number,
        month: number,
        day: number,
    };
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
    minDate?: Date | {
        year: number,
        month: number,
        day: number,
    };
    maxDate?: Date | {
        year: number,
        month: number,
        day: number,
    };
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
    styleUrls: ['ngx-daterangepicker.component.sass'],
    providers: [DATERANGEPICKER_VALUE_ACCESSOR]
})
export class NgxDateRangePickerComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnChanges {
    @ViewChild('fromInput', { static: true }) fromInput: ElementRef<HTMLDivElement>;
    @Input() options: NgxDateRangePickerOptions;

    modelValue: string | Object;
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
        menu: [],
        dateFormat: 'DD-MM-YYYY',
        outputFormat: 'DD-MM-YYYY',
        outputType: 'string',
        startOfWeek: 1,
        date: null
    };

    arrowLeft: number;

    private onTouchedCallback: () => void = () => {
    };

    private onChangeCallback: (_: any) => void = () => {
    };

    constructor(private elementRef: ElementRef, private cdr: ChangeDetectorRef) {
    }

    get value(): string | Object {
        return this.modelValue;
    }

    set value(value: string | Object) {
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
            from: this.date,
            to: dateFns.addDays(this.date, 1)
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

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
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
        const date = new Date();
        const dayOfWeek = dateFns.format(dateFns.setDay(date, day, {weekStartsOn: 1}), 'dd', {locale: locales[this.options.locale]});
        return dayOfWeek[0].toUpperCase() + dayOfWeek.substring(1);
    }

    generateCalendar(): void {
        this.days = [];
        const start: Date = dateFns.startOfMonth(this.date);
        const end: Date = dateFns.endOfMonth(this.date);

        const days: IDay[] = dateFns.eachDay(start, end).map(d => {
            const startOfWeek = this.options.startOfWeek;
            const endOfWeek = startOfWeek === 0 ? 6 : 0;
            return {
                date: d,
                day: dateFns.getDate(d),
                weekday: dateFns.getDay(d),
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

        const prevMonthDayNum = dateFns.getDay(start) - 1;
        let prevMonthDays: IDay[] = [];
        if (prevMonthDayNum > 0) {
            prevMonthDays = Array.from(Array(prevMonthDayNum).keys()).map(i => {
                const d = dateFns.subDays(start, prevMonthDayNum - i);
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
        const selectedDate: Date = this.days[index].date;

        if ((this.getDate(this.options.minDate) &&
            !dateFns.isAfter(dateFns.startOfDay(selectedDate), this.getDate(this.options.minDate))) ||
            (this.getDate(this.options.maxDate) &&
                !dateFns.isBefore(dateFns.startOfDay(selectedDate), this.getDate(this.options.maxDate)))) {
            return;
        }

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
        this.dateFrom = this.getDate(dates.from);

        this.dateTo = this.getDate(dates.to);

        if (dateFns.isAfter(this.dateFrom, this.dateTo)) {
            this.dateTo = this.dateFrom;
        }

        this.date = dateFns.startOfDay(this.dateFrom);

        this.generateCalendar();
    }

    selectRange(range: NgxMenuItem): void {
        const today = dateFns.startOfDay(new Date());
        let fromDate = today;
        let toDate = today;

        this.options.menu.map((item) => {
            item.active = item.alias === range.alias;
        });

        const operand = range.operation.charAt(0) === '-' ? -1 : 1;
        const amount = Math.abs(parseInt(range.operation, 10));
        const ope = range.operation.match(/[d,w,m,y]t?/);
        const unit = ope.length > 0 ? ope[0] : '';

        switch (unit) {
            case 'm':
                if (amount) {
                    fromDate = dateFns.addMonths(fromDate, amount * operand);
                    toDate = dateFns.addMonths(fromDate, (amount - 1));
                }

                this.dateFrom = dateFns.startOfMonth(fromDate);
                this.dateTo = dateFns.endOfMonth(toDate);
                break;
            case 'w':
                if (amount) {
                    fromDate = dateFns.addWeeks(fromDate, amount * operand);
                    toDate = dateFns.addWeeks(fromDate, (amount - 1));
                }

                this.dateFrom = dateFns.startOfWeek(fromDate, {weekStartsOn: this.options.startOfWeek});
                this.dateTo = dateFns.endOfWeek(toDate, {weekStartsOn: this.options.startOfWeek});
                break;
            case 'y':
                if (amount) {
                    fromDate = dateFns.addYears(fromDate, amount * operand);
                    toDate = dateFns.addYears(fromDate, (amount - 1));
                }

                this.dateFrom = dateFns.startOfYear(fromDate);
                this.dateTo = dateFns.endOfYear(toDate);
                break;
            case 'd':
                if (amount) {
                    fromDate = dateFns.addDays(fromDate, amount * operand);
                    toDate = dateFns.addDays(fromDate, (amount - 1));
                }

                this.dateFrom = dateFns.startOfDay(fromDate);
                this.dateTo = dateFns.startOfDay(toDate);
                break;
            // From today
            case 'mt':
                if (operand < 0) {
                    fromDate = dateFns.subMonths(today, amount);
                } else {
                    toDate = dateFns.addMonths(today, amount);
                }

                this.dateFrom = fromDate;
                this.dateTo = toDate;
                break;
            case 'wt':
                if (operand < 0) {
                    fromDate = dateFns.subWeeks(today, amount);
                } else {
                    toDate = dateFns.addWeeks(today, amount);
                }

                this.dateFrom = fromDate;
                this.dateTo = toDate;
                break;
            case 'yt':
                if (operand < 0) {
                    fromDate = dateFns.subYears(today, amount);
                } else {
                    toDate = dateFns.addYears(today, amount);
                }

                this.dateFrom = fromDate;
                this.dateTo = toDate;
                break;
            default:
                if (operand < 0) {
                    fromDate = dateFns.subDays(today, amount);
                } else {
                    toDate = dateFns.addDays(today, amount);
                }
                this.dateFrom = fromDate;
                this.dateTo = toDate;
                break;
        }

        this.date = dateFns.startOfDay(this.dateFrom);

        this.range = range.alias;
        this.generateCalendar();
    }

    @HostListener('document:click', ['$event'])
    handleBlurClick(e: MouseEvent) {
        const target = e.srcElement || e.target;
        if (!this.elementRef.nativeElement.contains(e.target) && !(<Element>target).classList.contains('day-num')) {
            this.opened = false;
        }
    }

    /**
     * Method to open calendar
     */
    public open(opened: 'from' | 'to' = 'from') {
        this.toggleCalendar(null, opened);
    }

    /**
     * Method to close calendar
     */
    public close() {
        this.opened = false;
    }

    /**
     * Method to toggle calendar
     */
    public toggle() {
        if (!!this.opened) {
            this.close();
            return;
        }

        this.open();
    }

    private getDate(date: Date | { year: number, month: number, day: number }): Date {
        if (!date) {
            return null;
        }

        if (date instanceof Date) {
            return dateFns.startOfDay(date);
        }

        if (date instanceof Object && date.year && date.month && date.day) {
            return dateFns.startOfDay(new Date(date.year, date.month - 1, date.day));
        }

        return null;
    }
}
