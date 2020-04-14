import {
  Directive, Input, ElementRef,
  Renderer2, NgModule, Output, EventEmitter, Inject, LOCALE_ID, OnChanges, SimpleChanges
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, Validator, AbstractControl, ValidationErrors, NG_VALIDATORS, } from '@angular/forms';
import { CommonModule, formatDate, DOCUMENT } from '@angular/common';
import { IgxMaskDirective } from '../mask/mask.directive';
import { MaskParsingService } from '../mask/mask-parsing.service';
import { KEYS } from '../../core/utils';
import {
  DatePickerUtil
} from '../../date-picker/date-picker.utils';
import { IgxDateTimeEditorEventArgs, DatePartInfo, DatePart } from './date-time-editor.common';

/**
 * Date Time Editor provides a functionality to input, edit and format date and time.
 *
 * @igxModule IgxDateTimeEditorModule
 *
 * @igxParent IgxInputGroup
 *
 * @igxTheme igx-input-theme
 *
 * @igxKeywords date, time, editor
 *
 * @igxGroup Scheduling
 *
 * @remarks
 *
 * The Ignite UI Date Time Editor Directive makes it easy for developers to manipulate date/time user input.
 * It requires input in a specified or default input format which is visible in the input element as a placeholder.
 * It allows the input of only date (ex: 'dd/MM/yyyy'), only time (ex:'HH:mm tt') or both at once, if needed.
 * Supports display format that may differ from the input format.
 * Provides methods to increment and decrement any specific/targeted `DatePart`.
 *
 * @example
 * ```html
 * <igx-input-group>
 *   <input type="text" igxInput [igxDateTimeEditor]="'dd/MM/yyyy'" [displayFormat]="'shortDate'" [(ngModel)]="date"/>
 * </igx-input-group>
 * ```
 */
@Directive({
  selector: '[igxDateTimeEditor]',
  exportAs: 'igxDateTimeEditor',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: IgxDateTimeEditorDirective, multi: true },
    { provide: NG_VALIDATORS, useExisting: IgxDateTimeEditorDirective, multi: true }
  ]
})
export class IgxDateTimeEditorDirective extends IgxMaskDirective implements OnChanges, Validator, ControlValueAccessor {
  /**
   * An @Input property that allows you to set the locale settings used in `displayFormat`.
   * @example
   *```html
   * <input igxDateTimeEditor [locale]="'en'">
   *```
   */
  @Input()
  public locale: string;

  /**
   * An @Input property that allows you to set the minimum possible value the editor will allow.
   * @example
   *```html
   * <input igxDateTimeEditor [minValue]="minDate">
   *```
   */
  public get minValue(): string | Date {
    return this._minValue;
  }

  @Input()
  public set minValue(value: string | Date) {
    this._minValue = value;
    this.onValidatorChange();
  }

  /**
   * An @Input property that allows you to set the maximum possible value the editor will allow.
   * @example
   *```html
   * <input igxDateTimeEditor [maxValue]="maxDate">
   *```
   */
  public get maxValue(): string | Date {
    return this._maxValue;
  }

  @Input()
  public set maxValue(value: string | Date) {
    this._maxValue = value;
    this.onValidatorChange();
  }

  /**
   * An @Input property that allows you to specify if the currently spun date segment should loop over.
   * @example
   *```html
   * <input igxDateTimeEditor [isSpinLoop]="false">
   *```
   */
  @Input()
  public isSpinLoop = true;

  /**
   * An @Input property that allows you to set both pre-defined format options such as `shortDate` and `longDate`,
   * as well as constructed format string using characters supported by `DatePipe`, e.g. `EE/MM/yyyy`.
   * @example
   *```html
   * <input igxDateTimeEditor [displayFormat]="'shortDate'">
   *```
   */
  @Input()
  public displayFormat: string;

  /**
   * An @Input property that allows you to get/set the expected user input format(and placeholder).
   *  for the editor.
   * @example
   *```html
   * <input [igxDateTimeEditor]="'dd/MM/yyyy'">
   *```
   */
  @Input(`igxDateTimeEditor`)
  public set inputFormat(value: string) {
    if (value) {
      this._format = value;
    }
    const mask = this.inputFormat?.replace(/\w/g, '0');
    this.mask = value.indexOf('tt') !== -1 ? mask.substring(0, mask.length - 2) + 'LL' : mask;
  }

  public get inputFormat(): string {
    return this._format;
  }

  /**
   * An @Input property that gets/sets the component date value.
   * @example
   * ```html
   * <input igxDateTimeEditor [value]="date">
   * ```
   */
  @Input()
  public set value(value: Date) {
    this._value = value;
    this.updateMask();
  }

  public get value() {
    return this._value;
  }

  /**
   * Emitted when the editor's value has changed.
   * @example
   * ```html
   * <input igxDateTimeEditor (valueChanged)="onValueChanged($event)"/>
   * ```
   */
  @Output()
  public valueChange = new EventEmitter<IgxDateTimeEditorEventArgs>();

  /**
   * Emitted when the editor is not within a specified range.
   * @example
   * ```html
   * <input igxDateTimeEditor [minValue]="minDate" [maxValue]="maxDate" (validationFailed)="onValidationFailed($event)"/>
   * ```
   */
  @Output()
  public validationFail = new EventEmitter<IgxDateTimeEditorEventArgs>();

  private _value: Date;
  private _format: string;
  private _document: Document;
  private _isFocused: boolean;
  private _minValue: string | Date;
  private _maxValue: string | Date;
  private _oldValue: Date | string;
  private _inputDateParts: DatePartInfo[];
  private onTouchCallback = (...args: any[]) => { };
  private onChangeCallback = (...args: any[]) => { };
  private onValidatorChange = (...args: any[]) => { };

  private get emptyMask(): string {
    return this.maskParser.applyMask(this.inputFormat, this.maskOptions);
  }

  private get targetDatePart(): DatePart {
    if (this._document.activeElement === this.nativeElement) {
      return this._inputDateParts
        .find(p => p.start <= this.selectionStart && this.selectionStart <= p.end && p.type !== DatePart.Literal)?.type;
    } else {
      if (this._inputDateParts.some(p => p.type === DatePart.Date)) {
        return DatePart.Date;
      } else if (this._inputDateParts.some(p => p.type === DatePart.Hours)) {
        return DatePart.Hours;
      }
    }
  }

  constructor(
    protected renderer: Renderer2,
    protected elementRef: ElementRef,
    protected maskParser: MaskParsingService,
    @Inject(DOCUMENT) private document: any,
    @Inject(LOCALE_ID) private _locale) {
    super(elementRef, maskParser, renderer);
    this._document = this.document as Document;
    this.locale = this.locale || this._locale;
  }

  /** @hidden @internal */
  public ngOnChanges(changes: SimpleChanges) {
    if (changes['inputFormat'] || changes['locale']) {
      this._inputDateParts = DatePickerUtil.parseDateTimeFormat(this.inputFormat);
      this.inputFormat = this._inputDateParts.map(p => p.format).join('');;
      if (!this.nativeElement.placeholder) {
        this.renderer.setAttribute(this.nativeElement, 'placeholder', this.inputFormat);
      }
      this.updateMask();
    }
  }

  /**
   * Clear the input element value.
   */
  public clear(): void {
    this.updateValue(null);
    this.updateMask();
  }

  /**
  * Increment specified DatePart.
  * @param datePart The optional DatePart to increment. Defaults to Date or Hours(when Date is absent from the inputFormat - ex:'HH:mm').
  */
  public increment(datePart?: DatePart): void {
    const targetDatePart = this.targetDatePart;
    if (!targetDatePart) { return; }
    const newValue = datePart
      ? this.spinValue(datePart, 1)
      : this.spinValue(targetDatePart, 1);
    this.updateValue(newValue ? newValue : new Date());
    this.updateMask();
  }

  /**
  * Decrement specified DatePart.
  *
  * @param datePart The optional DatePart to decrement. Defaults to Date or Hours(when Date is absent from the inputFormat - ex:'HH:mm').
  */
  public decrement(datePart?: DatePart): void {
    const targetDatePart = this.targetDatePart;
    if (!targetDatePart) { return; }
    const newValue = datePart
      ? this.spinValue(datePart, -1)
      : this.spinValue(targetDatePart, -1);
    this.updateValue(newValue ? newValue : new Date());
    this.updateMask();
  }

  /** @hidden @internal */
  public writeValue(value: any): void {
    this.value = value;
  }

  /** @hidden @internal */
  public validate(control: AbstractControl): ValidationErrors | null {
    if (this.minValue && !this.valueInRange(control.value)) {
      return { 'minValue': true };
    }
    if (this.maxValue && !this.valueInRange(control.value)) {
      return { 'maxValue': true };
    }

    return null;
  }

  /** @hidden @internal */
  public registerOnValidatorChange?(fn: () => void): void { this.onValidatorChange = fn; }

  /** @hidden @internal */
  public registerOnChange(fn: any): void { this.onChangeCallback = fn; }

  /** @hidden @internal */
  public registerOnTouched(fn: any): void { this.onTouchCallback = fn; }

  /** @hidden @internal */
  public setDisabledState?(isDisabled: boolean): void { }

  /** @hidden @internal */
  public onKeyDown(event: KeyboardEvent): void {
    super.onKeyDown(event);
    if (event.altKey) { return; }
    if (event.key === KEYS.UP_ARROW || event.key === KEYS.UP_ARROW_IE ||
      event.key === KEYS.DOWN_ARROW || event.key === KEYS.DOWN_ARROW_IE) {
      this.spin(event);
      return;
    }

    if (event.ctrlKey && event.key === KEYS.SEMICOLON) {
      this.updateValue(new Date());
      this.updateMask();
    }

    this.moveCursor(event);
  }

  /** @hidden @internal */
  public onFocus(): void {
    this._isFocused = true;
    this.onTouchCallback();
    this.updateMask();
    super.onFocus();
  }

  /** @hidden @internal */
  public onBlur(event): void {
    this._isFocused = false;

    if (this.inputValue === this.emptyMask) {
      this.updateValue(null);
      this.inputValue = '';
      return;
    }

    const parsedDate = this.parseDate(this.inputValue);
    if (this.isValidDate(parsedDate)) {
      this.updateValue(parsedDate);
    } else {
      const oldValue = new Date(this.value.getTime());
      const args = { oldValue: oldValue, newValue: parsedDate, userInput: this.inputValue };
      this.validationFail.emit(args);
      if (args.newValue?.getTime && args.newValue.getTime() !== oldValue.getTime()) {
        this.updateValue(args.newValue);
      } else {
        this.updateValue(null);
      }
    }

    this.updateMask();
    this.onTouchCallback();
    super.onBlur(event);
  }

  /** @hidden @internal */
  public updateMask(): void {
    if (!this.value || !this.isValidDate(this.value)) {
      this.inputValue = this.emptyMask;
      return;
    }
    if (this._isFocused) {
      const cursor = this.selectionEnd;
      let mask = this.emptyMask;
      for (const part of this._inputDateParts) {
        if (part.type === DatePart.Literal) { continue; }

        const partLength = part.format.length;
        let targetValue = this.getPartValue(part.type, partLength);
        if (part.type === DatePart.Month) {
          targetValue = this.prependValue(
            parseInt(targetValue.replace(new RegExp(this.promptChar, 'g'), '0'), 10) + 1, partLength, '0');
        }
        if (part.type === DatePart.Hours && part.format.indexOf('h') !== -1) {
          targetValue = this.prependValue(this.toTwelveHourFormat(targetValue), partLength, '0');
        }
        if (part.type === DatePart.Year && partLength === 2) {
          targetValue = this.prependValue(parseInt(targetValue.slice(-2), 10), partLength, '0');
        }

        mask = this.maskParser.replaceInMask(mask, targetValue, this.maskOptions, part.start, part.end).value;
      }

      this.inputValue = mask;
      this.setSelectionRange(cursor);
    } else {
      const format = this.displayFormat || this.inputFormat;
      this.inputValue = formatDate(this.value, format.replace('tt', 'aa'), this.locale);
    }
  }

  private isDate(value: any): value is Date {
    return value instanceof Date && typeof value === 'object';
  }

  private valueInRange(value: Date): boolean {
    if (!value) { return false; }
    const maxValueAsDate = this.isDate(this.maxValue) ? this.maxValue : this.parseDate(this.maxValue);
    const minValueAsDate = this.isDate(this.minValue) ? this.minValue : this.parseDate(this.minValue);
    if (maxValueAsDate && minValueAsDate) {
      return value.getTime() <= maxValueAsDate.getTime() &&
        minValueAsDate.getTime() <= value.getTime();
    }

    return maxValueAsDate && value.getTime() <= maxValueAsDate.getTime() ||
      minValueAsDate && minValueAsDate.getTime() <= value.getTime();
  }

  private spinValue(datePart: DatePart, delta: number): Date {
    if (!this.value || !this.isValidDate(this.value)) { return null; }
    const newDate = new Date(this.value.getTime());
    switch (datePart) {
      case DatePart.Date:
        return DatePickerUtil.spinDate(delta, newDate, this.isSpinLoop);
      case DatePart.Month:
        return DatePickerUtil.spinMonth(delta, newDate, this.isSpinLoop);
      case DatePart.Year:
        return DatePickerUtil.spinYear(delta, newDate);
      case DatePart.Hours:
        return DatePickerUtil.spinHours(delta, newDate, this.isSpinLoop);
      case DatePart.Minutes:
        return DatePickerUtil.spinMinutes(delta, newDate, this.isSpinLoop);
      case DatePart.Seconds:
        return DatePickerUtil.spinSeconds(delta, newDate, this.isSpinLoop);
      case DatePart.AmPm:
        const formatPart = this._inputDateParts.find(dp => dp.type === DatePart.AmPm);
        const amPmFromMask = this.inputValue.substring(formatPart.start, formatPart.end);
        return DatePickerUtil.spinAmPm(newDate, this.value, amPmFromMask);
    }
  }

  private updateValue(newDate: Date): void {
    this._oldValue = this.value;
    this.value = newDate;
    this.onChangeCallback(this.value);
    if (!this.valueInRange(this.value)) {
      this.validationFail.emit({ oldValue: this._oldValue, newValue: this.value, userInput: this.inputValue });
    }
    if (this.inputIsComplete() || this.inputValue === this.emptyMask) {
      this.valueChange.emit({ oldValue: this._oldValue, newValue: this.value, userInput: this.inputValue });
    }
  }

  private toTwelveHourFormat(value: string): number {
    let hour = parseInt(value.replace(new RegExp(this.promptChar, 'g'), '0'), 10);
    if (hour > 12) {
      hour -= 12;
    } else if (hour === 0) {
      hour = 12;
    }

    return hour;
  }

  private getPartValue(datePart: DatePart, partLength: number): string {
    let maskedValue;
    switch (datePart) {
      case DatePart.Date:
        maskedValue = this.value.getDate();
        break;
      case DatePart.Month:
        maskedValue = this.value.getMonth();
        break;
      case DatePart.Year:
        maskedValue = this.value.getFullYear();
        break;
      case DatePart.Hours:
        maskedValue = this.value.getHours();
        break;
      case DatePart.Minutes:
        maskedValue = this.value.getMinutes();
        break;
      case DatePart.Seconds:
        maskedValue = this.value.getSeconds();
        break;
      case DatePart.AmPm:
        maskedValue = this.value.getHours() >= 12 ? 'PM' : 'AM';
        break;
    }

    if (datePart !== DatePart.AmPm) {
      return this.prependValue(maskedValue, partLength, '0');
    }

    return maskedValue;
  }

  private prependValue(value: number, partLength: number, prependChar: string): string {
    return (prependChar + value.toString()).slice(-partLength);
  }

  private spin(event: KeyboardEvent): void {
    event.preventDefault();
    switch (event.key) {
      case KEYS.UP_ARROW:
      case KEYS.UP_ARROW_IE:
        this.increment();
        break;
      case KEYS.DOWN_ARROW:
      case KEYS.DOWN_ARROW_IE:
        this.decrement();
        break;
    }
  }

  private inputIsComplete(): boolean {
    return this.inputValue.indexOf(this.promptChar) === -1;
  }

  private isValidDate(date: Date): boolean {
    return date && date.getTime && !isNaN(date.getTime());
  }

  private parseDate(val: string): Date | null {
    if (!val) { return null; }
    return DatePickerUtil.parseDateFromMask(val, this._inputDateParts);
  }

  private moveCursor(event: KeyboardEvent): void {
    const value = (event.target as HTMLInputElement).value;
    switch (event.key) {
      case KEYS.LEFT_ARROW:
      case KEYS.LEFT_ARROW_IE:
        if (event.ctrlKey) {
          event.preventDefault();
          this.setSelectionRange(this.getNewPosition(value));
        }
        break;
      case KEYS.RIGHT_ARROW:
      case KEYS.RIGHT_ARROW_IE:
        if (event.ctrlKey) {
          event.preventDefault();
          this.setSelectionRange(this.getNewPosition(value, 1));
        }
        break;
    }
  }

  /**
   * Move the cursor in a specific direction until it reaches a date/time separator.
   * Then return its index.
   *
   * @param value The string it operates on.
   * @param direction 0 is left, 1 is right. Default is 0.
   */
  private getNewPosition(value: string, direction = 0): number {
    const literals = this._inputDateParts.filter(l => l.type === DatePart.Literal);
    let cursorPos = this.selectionStart;
    if (!direction) {
      do {
        cursorPos = cursorPos > 0 ? --cursorPos : cursorPos;
      } while (!literals.some(l => l.end === cursorPos) && cursorPos > 0);
      return cursorPos;
    } else {
      do {
        cursorPos++;
      } while (!literals.some(l => l.start === cursorPos) && cursorPos < value.length);
      return cursorPos;
    }
  }
}

@NgModule({
  declarations: [IgxDateTimeEditorDirective],
  exports: [IgxDateTimeEditorDirective],
  imports: [CommonModule]
})
export class IgxDateTimeEditorModule { }
