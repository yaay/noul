import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'textarea[autosize]'
})
export class AutosizeDirective {

  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event.target'])
  onInput(textArea: HTMLTextAreaElement): void {
    this.adjust();
  }

  adjust(): void {
    const textArea = this.el.nativeElement;
    textArea.style.overflow = 'hidden';
    textArea.style.height = 'auto';
    textArea.style.height = textArea.scrollHeight + 'px';
  }
}
