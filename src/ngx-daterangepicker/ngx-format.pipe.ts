import { Pipe, PipeTransform } from '@angular/core';
import * as dateFns from 'date-fns';
import {locales} from './constants';

@Pipe({
  name: 'ngxFormat'
})
export class NgxFormatPipe implements PipeTransform {

  transform(value: Date, ...args: Array<any>): any {
    let options: any = {};
    if (args && args[1] && locales.hasOwnProperty(args[1])) {
      options.locale = locales[args[1]];
    }

    return dateFns.format(value, args[0] || "DD-MM-YYYY", options);
  }
}
