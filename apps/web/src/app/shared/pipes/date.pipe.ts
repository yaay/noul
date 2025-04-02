import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getDate'
})
export class DatePipe implements PipeTransform {
  transform(dateString: Date): string {
    const date = new Date(dateString);
    const dateTransformed = date.getDate();
    // const minute = date.getMinutes();

    // // Format the hour and minute with leading zeros
    // const formattedHour = ('0' + hour).slice(-2);
    // const formattedMinute = ('0' + minute).slice(-2);

    return `${dateTransformed}`;
  }
}