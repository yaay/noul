import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hourMinute',
  standalone: true
})
export class HourMinutePipe implements PipeTransform {
  transform(dateString: Date): string {
    const date = new Date(dateString);
    const hour = date.getHours();
    const minute = date.getMinutes();

    // Format the hour and minute with leading zeros
    const formattedHour = ('0' + (hour % 12 || 12)).slice(-2); 
    const formattedMinute = ('0' + minute).slice(-2);
    const ampm = hour >= 12 ? 'PM' : 'AM';

    return `${formattedHour}:${formattedMinute} ${ampm}`;
  }
}