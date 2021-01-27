import { Component, ViewChild, ElementRef, EventEmitter, QueryList, Renderer2, DebugElement } from '@angular/core';
import { fakeAsync, TestBed, tick, flush, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { FormsModule, FormGroup, FormBuilder, ReactiveFormsModule, Validators, NgControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxDatePickerComponent, IgxDatePickerModule } from './date-picker.component';
import { IgxLabelDirective } from '../directives/label/label.directive';
import { IgxInputDirective, IgxInputState } from '../directives/input/input.directive';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';
import { IgxInputGroupModule, IgxInputGroupComponent } from '../input-group/public_api';
import { IgxTextSelectionModule } from '../directives/text-selection/text-selection.directive';
import { configureTestSuite } from '../test-utils/configure-suite';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxCalendarModule } from '../calendar/public_api';
import { InteractionMode } from '../core/enums';
import { DateRangeType } from '../core/dates/dateRange';
import { IgxIconModule } from '../icon/public_api';
import {
    IgxOverlayService,
    OverlayCancelableEventArgs,
    OverlayClosingEventArgs,
    OverlayEventArgs
} from '../services/public_api';

const CSS_CLASS_DATE_PICKER = 'igx-date-picker';
const CSS_CLASS_INPUTGROUP = 'igx-input-group';
const CSS_CLASS_INPUT = '.igx-input-group__input';
const CSS_CLASS_INPUTGROUP_DISABLED = 'igx-input-group--disabled';
const CSS_CLASS_INPUT_DATE = '.igx-date-picker__input-date';
const CSS_CLASS_OVERLAY_MODAL_WRAPPER = 'igx-overlay__wrapper--modal';
const CSS_CLASS_OVERLAY_CONTENT = 'igx-overlay__content';
const CSS_CLASS_CALENDAR_CONTAINER = 'igx-calendar-container';
const CSS_CLASS_CALENDAR_PICKER_DATE = 'igx-calendar-picker__date';
const CSS_CLASS_CALENDAR_PICKER_SELECTED_DATE = 'igx-calendar__date--selected';
const CSS_CLASS_CALENDAR_YEAR = 'igx-calendar__year';
const CSS_CLASS_CALENDAR_MONTH = 'igx-calendar__month';
const CSS_CLASS_DATE_PICKER_DROPDOWN = 'igx-date-picker--dropdown';
const CSS_CLASS_PREFIX = 'igx-prefix';
const CSS_CLASS_SUFFIX = 'igx-suffix';
const CSS_CLASS_ICON = '.igx-icon';



describe('IgxDatePicker', () => {
    let fixture: ComponentFixture<any>;
    let datePicker: IgxDatePickerComponent;
    let input: DebugElement;
    let overlayWrapper: Element;

    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxDatePickerTestComponent,
                IgxDatePickerWithWeekStartComponent,
                IgxDatePickerWithPassedDateComponent,
                IgxDatePickerWIthLocaleComponent,
                IgxDatePickerNgModelComponent,
                IgxDatePickerRetemplatedComponent,
                IgxDatePickerEditableComponent,
                IgxDatePickerCustomizedComponent,
                IgxDropDownDatePickerRetemplatedComponent,
                IgxDatePickerOpeningComponent,
                IgxDatePickerReactiveFormComponent,
                // IgxDatePickerDropdownButtonsComponents
            ],
            imports: [IgxDatePickerModule, FormsModule, ReactiveFormsModule, NoopAnimationsModule, IgxInputGroupModule, IgxCalendarModule,
                IgxButtonModule, IgxTextSelectionModule, IgxIconModule]
        })
            .compileComponents();
    }));

    afterEach(() => {
        UIInteractions.clearOverlay();
    });

    describe('Unit tests: ', () => {
        let ngModel;
        let overlay;
        let element;
        let cdr;
        let moduleRef;
        let injector;
        let inputGroup: IgxInputGroupComponent;
        let renderer2: Renderer2;

        function customFormatter(date: Date) {
            return `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`;
        }

        it('should emit onSelection and valueChange on selection', () => {
            element = {};
            datePicker = new IgxDatePickerComponent(null, element, null, null, null, null);
            spyOn(datePicker.onSelection, 'emit');
            spyOn(datePicker.valueChange, 'emit');
            const newDate: Date = new Date(2016, 4, 6);
            datePicker.selectDate(newDate);

            expect(datePicker.onSelection.emit).toHaveBeenCalledTimes(1);
            expect(datePicker.valueChange.emit).toHaveBeenCalledTimes(1);
            expect(datePicker.valueChange.emit).toHaveBeenCalledWith(newDate);
            expect(datePicker.value).toBe(newDate);
        });

        it('should clear value and emit valueChange with deselectDate()', () => {
            element = {};
            datePicker = new IgxDatePickerComponent(null, element, null, null, null, null);
            spyOn(datePicker.valueChange, 'emit');

            const date = new Date(Date.now());
            datePicker.selectDate(date);

            expect(datePicker.value).toBe(date);
            expect(datePicker.valueChange.emit).toHaveBeenCalledTimes(1);

            datePicker.deselectDate();
            expect(datePicker.value).toBe(null);
            expect(datePicker.valueChange.emit).toHaveBeenCalledTimes(2);
        });


        it('should set locale correctly', () => {
            element = {};
            datePicker = new IgxDatePickerComponent(null, element, null, null, null, null);
            const date = new Date(2017, 7, 7);
            datePicker.value = date;
            const locale = 'de-DE';
            datePicker.locale = (locale as any);

            const dateConvertedToDeLocale = date.toLocaleDateString('de-DE');
            expect(datePicker.displayData).toBe(dateConvertedToDeLocale);
        });

        it('should set custom formatter correctly', () => {
            element = {};
            datePicker = new IgxDatePickerComponent(null, element, null, null, null, null);

            const date = new Date(2017, 7, 7);
            const formattedDate = customFormatter(date);

            datePicker.value = date;
            datePicker.formatter = (_: Date) => (
                `${_.getFullYear()}/${_.getMonth()}/${_.getDate()}`
            );
            expect(datePicker.displayData).toEqual(formattedDate);
        });

        it('should be able to de/select date-API methods', () => {
            element = {};
            datePicker = new IgxDatePickerComponent(null, element, null, null, null, null);

            const date = new Date(Date.now());
            datePicker.selectDate(date);

            expect(datePicker.value).toBe(date);

            datePicker.deselectDate();
            expect(datePicker.value).toBe(null);
        });

        it('should show/hide overlay on opening/closing', () => {
            const mockOverlayService = jasmine.createSpyObj('IgxOverlayService', ['attach', 'show', 'hide']);
            element = {};
            datePicker = new IgxDatePickerComponent(mockOverlayService, element, null, null, null, null);
            spyOn(mockOverlayService, 'attach');
            spyOn(mockOverlayService, 'show');
            spyOn(mockOverlayService, 'hide');

            datePicker.openDialog();
            expect(mockOverlayService.attach).toHaveBeenCalled();
            expect(mockOverlayService.show).toHaveBeenCalled();

            datePicker.closeCalendar();
            expect(mockOverlayService.hide).toHaveBeenCalled();
        });

        describe('Control value accessor unit tests', () => {
            beforeEach(() => {
                ngModel = {
                    control: { touched: false, dirty: false, validator: null },
                    valid: false,
                    statusChanges: new EventEmitter(),
                };
                overlay = {
                    onOpening: new EventEmitter<OverlayCancelableEventArgs>(),
                    onOpened: new EventEmitter<OverlayEventArgs>(),
                    onClosed: new EventEmitter<OverlayEventArgs>(),
                    onClosing: new EventEmitter<OverlayClosingEventArgs>()
                };
                element = {};
                cdr = {
                    markForCheck: () => { },
                    detectChanges: () => { },
                    detach: () => { },
                    reattach: () => { }
                };
                moduleRef = {};
                injector = { get: () => ngModel };
                inputGroup = new IgxInputGroupComponent(null, null, null, document);
                renderer2 = jasmine.createSpyObj('Renderer2', ['setAttribute'], [{}, 'aria-labelledby', 'test-label-id-1']);
                spyOn(renderer2, 'setAttribute').and.callFake(() => {
                });
            });

            it('should initialize date picker with required correctly', () => {
                datePicker = new IgxDatePickerComponent(overlay, element, cdr, moduleRef, injector, renderer2);
                datePicker['_inputGroup'] = inputGroup;
                datePicker['_inputDirectiveUserTemplates'] = new QueryList();
                spyOnProperty(datePicker, 'inputGroupElement').and.returnValue(null);
                ngModel.control.validator = () => ({ required: true });
                datePicker.ngOnInit();
                datePicker.ngAfterViewInit();
                datePicker.ngAfterViewChecked();

                expect(datePicker).toBeDefined();
                expect(inputGroup.isRequired).toBeTruthy();
            });

            it('should initialize date picker with required correctly with user template input-group', () => {
                datePicker = new IgxDatePickerComponent(overlay, element, cdr, moduleRef, injector, renderer2);
                datePicker['_inputGroupUserTemplate'] = inputGroup;
                datePicker['_inputDirectiveUserTemplates'] = new QueryList();
                spyOnProperty(datePicker, 'inputGroupElement').and.returnValue(null);
                ngModel.control.validator = () => ({ required: true });
                datePicker.ngOnInit();
                datePicker.ngAfterViewInit();
                datePicker.ngAfterViewChecked();

                expect(datePicker).toBeDefined();
                expect(inputGroup.isRequired).toBeTruthy();
            });

            it('should update inputGroup isRequired correctly', () => {
                datePicker = new IgxDatePickerComponent(overlay, element, cdr, moduleRef, injector, renderer2);
                datePicker['_inputGroup'] = inputGroup;
                datePicker['_inputDirectiveUserTemplates'] = new QueryList();
                spyOnProperty(datePicker, 'inputGroupElement').and.returnValue(null);
                datePicker.ngOnInit();
                datePicker.ngAfterViewInit();
                datePicker.ngAfterViewChecked();

                expect(datePicker).toBeDefined();
                expect(inputGroup.isRequired).toBeFalsy();

                ngModel.control.validator = () => ({ required: true });
                ngModel.statusChanges.emit();
                expect(inputGroup.isRequired).toBeTruthy();

                ngModel.control.validator = () => ({ required: false });
                ngModel.statusChanges.emit();
                expect(inputGroup.isRequired).toBeFalsy();
            });
        });
    });

    describe('General tests: ', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxDatePickerTestComponent
                ],
                imports: [
                    IgxDatePickerModule
                ]
            }).compileComponents();
        }));
        beforeEach(() => {
            fixture = TestBed.createComponent(IgxDatePickerTestComponent);
            fixture.detectChanges();
            datePicker = fixture.componentInstance.datePicker;
            input = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUTGROUP}`));
        });

        it('should emit open/close events', fakeAsync(() => {
            spyOn(datePicker.onOpened, 'emit');
            spyOn(datePicker.onClosed, 'emit');

            input.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            tick();
            fixture.detectChanges();

            expect(datePicker.onOpened.emit).toHaveBeenCalled();
            expect(datePicker.onOpened.emit).toHaveBeenCalledWith(datePicker);

            overlayWrapper = document.getElementsByClassName(CSS_CLASS_OVERLAY_MODAL_WRAPPER)[0];
            UIInteractions.simulateClickEvent(overlayWrapper);
            tick();
            fixture.detectChanges();

            expect(datePicker.onClosed.emit).toHaveBeenCalled();
            expect(datePicker.onClosed.emit).toHaveBeenCalledWith(datePicker);
        }));

        it('should be able to toggle labelVisibility', () => {
            let label = fixture.debugElement.query(By.directive(IgxLabelDirective));
            expect(label).not.toBeNull();

            fixture.componentInstance.labelVisibility = false;
            fixture.detectChanges();

            label = fixture.debugElement.query(By.directive(IgxLabelDirective));
            expect(label).toBeNull();

            fixture.componentInstance.labelVisibility = true;
            fixture.detectChanges();
            expect(label).not.toBeNull();

        });

        it('should display default and custom label', () => {
            let label = fixture.debugElement.query(By.directive(IgxLabelDirective)).nativeElement;
            expect(label.innerText).toEqual('Date');

            fixture.componentInstance.customLabelVisibility = true;
            fixture.detectChanges();

            label = fixture.debugElement.query(By.directive(IgxLabelDirective)).nativeElement;
            expect(label.innerText).toEqual(fixture.componentInstance.customLabel);

            fixture.componentInstance.labelVisibility = false;
            fixture.componentInstance.customLabelVisibility = false;
            fixture.detectChanges();
            label = fixture.debugElement.query(By.directive(IgxLabelDirective));
            expect(label).toBeNull();

            fixture.componentInstance.customLabelVisibility = true;
            fixture.detectChanges();
            label = fixture.debugElement.query(By.directive(IgxLabelDirective)).nativeElement;
            expect(label.innerText).toEqual(fixture.componentInstance.customLabel);
        });

        it('should be able to set editorTabIndex', () => {
            datePicker.editorTabIndex = 3;
            fixture.detectChanges();
            input = fixture.debugElement.query(By.css(CSS_CLASS_INPUT));
            expect(input.nativeElement.tabIndex).toBe(3);
        });

        it('should set weekStart correctly', () => {
            datePicker.weekStart = 1;

            datePicker.openDialog();
            fixture.detectChanges();

            const firstWeekDayValue = (document.getElementsByClassName('igx-calendar__label')[0] as HTMLElement).innerText.trim();
            const expectedResult = 'Mon';

            expect(firstWeekDayValue).toBe(expectedResult);
        });

        it('should not alter hours, minutes, seconds and milliseconds when changing date.', () => {
            const date = new Date(2030, 1, 1, 15, 16, 17, 18);
            datePicker.value = date;
            fixture.detectChanges();

            datePicker.openDialog();
            fixture.detectChanges();

            const targetDay = 15;
            const fromDate = datePicker.calendar.daysView.dates.filter(
                d => d.date.date.getDate() === targetDay)[0];
            fromDate.nativeElement.click();
            fixture.detectChanges();

            expect(datePicker.value.getFullYear()).toBe(date.getFullYear());
            expect(datePicker.value.getMonth()).toBe(date.getMonth());
            expect(datePicker.value.getDate()).toBe(targetDay);
            expect(datePicker.value.getHours()).toBe(date.getHours());
            expect(datePicker.value.getMinutes()).toBe(date.getMinutes());
            expect(datePicker.value.getSeconds()).toBe(date.getSeconds());
            expect(datePicker.value.getMilliseconds()).toBe(date.getMilliseconds());
        });

        it('#3595 - should be able to select year', fakeAsync(() => {
            datePicker.openDialog();
            fixture.detectChanges();

            let year = document.getElementsByClassName(CSS_CLASS_CALENDAR_PICKER_DATE)[1];
            year.dispatchEvent(UIInteractions.getMouseEvent('click'));
            tick();
            fixture.detectChanges();

            const firstYear = document.getElementsByClassName(CSS_CLASS_CALENDAR_YEAR)[1];
            const expectedResult = (firstYear as HTMLElement).innerText.trim();
            firstYear.dispatchEvent(UIInteractions.getMouseEvent('click'));
            tick();
            fixture.detectChanges();

            year = document.getElementsByClassName(CSS_CLASS_CALENDAR_PICKER_DATE)[1];
            expect((year as HTMLElement).innerText).toBe(expectedResult);
        }));

        it('#3595 - should be able to select month', fakeAsync(() => {
            datePicker.value = new Date(2019, 2, 10);
            tick();
            fixture.detectChanges();

            datePicker.openDialog();
            fixture.detectChanges();
            tick(350);

            let month = document.getElementsByClassName(CSS_CLASS_CALENDAR_PICKER_DATE)[0];
            month.dispatchEvent(UIInteractions.getMouseEvent('click'));
            tick();
            fixture.detectChanges();

            const firstMonth = document.getElementsByClassName(CSS_CLASS_CALENDAR_MONTH)[0];
            const expectedResult = (firstMonth as HTMLElement).innerText;

            firstMonth.dispatchEvent(UIInteractions.getMouseEvent('click'));
            tick();
            fixture.detectChanges();

            month = document.getElementsByClassName(CSS_CLASS_CALENDAR_PICKER_DATE)[0];
            expect((month as HTMLElement).innerText.trim()).toBe(expectedResult.trim());
        }));

        it('should get edit element correctly', () => {
            const editElement = fixture.debugElement.query(By.css(CSS_CLASS_INPUT_DATE)).nativeElement;
            expect(datePicker.getEditElement()).toBe(editElement);
        });

        it('should be able to set component id', () => {
            const domDatePicker = fixture.debugElement.query(By.css(CSS_CLASS_DATE_PICKER)).nativeElement;

            expect(datePicker.id).toContain('igx-date-picker-');
            expect(domDatePicker.id).toContain('igx-date-picker-');

            const customId = 'customDatePicker';
            datePicker.id = customId;
            fixture.detectChanges();

            expect(datePicker.id).toBe(customId);
            expect(domDatePicker.id).toBe(customId);
        });

    });

    describe('Initialization and rendering tests: ', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxDatePickerTestComponent
                ],
                imports: [
                    IgxDatePickerModule
                ]
            }).compileComponents();
        }));
        beforeEach(() => {
            fixture = TestBed.createComponent(IgxDatePickerTestComponent);
            fixture.detectChanges();
            datePicker = fixture.componentInstance.datePicker;
            input = fixture.debugElement.query(By.css(`.${CSS_CLASS_INPUTGROUP}`));
        });

        xit('Handling keyboard navigation with `space`(open) and `esc`(close) buttons', fakeAsync(() => {
            const datePickerDom = fixture.debugElement.query(By.css('igx-date-picker'));
            UIInteractions.triggerKeyDownEvtUponElem('space', datePickerDom.nativeElement, false);
            fixture.detectChanges();
            // console.log(datePickerDom);

            // debugger;
            // datePickerDom.triggerEventHandler('keydown', { key: 'space' });

            // //UIInteractions.triggerEventHandlerKeyDown('Space', datePickerDom);
            // //tick();
            // fixture.detectChanges();

            expect(datePicker.collapsed).toBeFalse();


            // const overlayDiv = document.getElementsByClassName('igx-overlay__wrapper--modal')[0];
            // expect(overlayDiv).toBeDefined();
            // expect(overlayDiv.classList.contains('igx-overlay__wrapper--modal')).toBeTruthy();

            // UIInteractions.triggerKeyDownEvtUponElem('Escape', overlayDiv, true);
            // flush();
            // fixture.detectChanges();

            // const overlays = document.getElementsByClassName('igx-overlay__wrapper--modal');
            // expect(overlays.length).toEqual(0);
        }));


        describe('Dialog mode: ', () => {
            it('should show/hide overlay modal on opening/closing', fakeAsync(() => {
                datePicker.openDialog();
                fixture.detectChanges();
                expect(datePicker.collapsed).toBeFalse();

                overlayWrapper = document.getElementsByClassName(CSS_CLASS_OVERLAY_MODAL_WRAPPER)[0];
                let calendar = document.getElementsByTagName(CSS_CLASS_CALENDAR_CONTAINER)[0];
                expect(overlayWrapper).toBeDefined();
                expect(calendar).toBeDefined();

                UIInteractions.triggerKeyDownEvtUponElem('Escape', overlayWrapper, true);
                tick();
                fixture.detectChanges();

                overlayWrapper = document.getElementsByClassName(CSS_CLASS_OVERLAY_MODAL_WRAPPER)[0];
                calendar = document.getElementsByTagName(CSS_CLASS_CALENDAR_CONTAINER)[0];
                expect(overlayWrapper).toBeUndefined();
                expect(calendar).toBeUndefined();
            }));

            it('should focus the today date', fakeAsync(() => {
                datePicker.openDialog();
                fixture.detectChanges();
                tick(200);

                const todayDate = datePicker.calendar.daysView.dates.find(d => d.isToday);
                expect(document.activeElement).toEqual(todayDate.nativeElement);
            }));

            it('should retain focus on the input when modal date picker has been closed via `Escape` key', () => {
                datePicker.openDialog();
                fixture.detectChanges();
                expect(datePicker.collapsed).toBeFalse();

                overlayWrapper = document.getElementsByClassName(CSS_CLASS_OVERLAY_MODAL_WRAPPER)[0];
                UIInteractions.triggerKeyDownEvtUponElem('Escape', overlayWrapper, true);
                fixture.detectChanges();

                input = fixture.debugElement.query(By.directive(IgxInputDirective));
                overlayWrapper = document.getElementsByClassName(CSS_CLASS_OVERLAY_MODAL_WRAPPER)[0];
                expect(overlayWrapper).toBeUndefined();
                expect(input.nativeElement).toEqual(document.activeElement);
            });

            it('should retain focus on the input when modal date picker has been closed with outside click', () => {
                datePicker.openDialog();
                fixture.detectChanges();
                expect(datePicker.collapsed).toBeFalse();

                overlayWrapper = document.getElementsByClassName(CSS_CLASS_OVERLAY_MODAL_WRAPPER)[0];
                UIInteractions.simulateClickAndSelectEvent(overlayWrapper);
                fixture.detectChanges();

                input = fixture.debugElement.query(By.directive(IgxInputDirective));
                overlayWrapper = document.getElementsByClassName(CSS_CLASS_OVERLAY_MODAL_WRAPPER)[0];
                expect(overlayWrapper).toBeUndefined();
                expect(input.nativeElement).toEqual(document.activeElement);
            });

            it('should retain focus on the input after a date has been selected', fakeAsync(() => {
                datePicker.openDialog();
                fixture.detectChanges();
                expect(datePicker.collapsed).toBeFalse();

                const dateElemToSelect = document.getElementsByClassName('igx-calendar__date-content')[10];
                UIInteractions.simulateClickAndSelectEvent(dateElemToSelect);
                tick(350);
                fixture.detectChanges();

                input = fixture.debugElement.query(By.directive(IgxInputDirective));
                expect(datePicker.collapsed).toBeTrue();
                expect(input.nativeElement).toEqual(document.activeElement);
            }));

        });

        describe('Dropdown mode: ', () => {
            beforeEach(() => {
                datePicker.mode = InteractionMode.DropDown;
                fixture.detectChanges();
            });

            it('should open dropdown below the input by default if there is enough space', () => {
                const inputGroup = document.getElementsByTagName(CSS_CLASS_INPUTGROUP);
                const inputGroupRect = inputGroup[0].getBoundingClientRect() as DOMRect;
                const inputGroupTop = inputGroupRect.top;

                datePicker.openDialog();
                fixture.detectChanges();

                const calendar = document.getElementsByTagName(CSS_CLASS_CALENDAR_CONTAINER);
                const calendarRect = calendar[0].getBoundingClientRect() as DOMRect;
                const calendarTop = calendarRect.top;

                expect(inputGroupTop).toBeLessThan(calendarTop);
            });

            it('should open dropdwn above the input when there is not enough space below', () => {
                datePicker.element.nativeElement.style = 'position: fixed; bottom: 150px';
                fixture.detectChanges();

                const inputGroup = document.getElementsByTagName(CSS_CLASS_INPUTGROUP);
                const inputGroupRect = inputGroup[0].getBoundingClientRect() as DOMRect;
                const inputGroupTop = inputGroupRect.top;

                datePicker.openDialog();
                fixture.detectChanges();

                const calendar = document.getElementsByTagName(CSS_CLASS_CALENDAR_CONTAINER);
                const calendarRect = calendar[0].getBoundingClientRect() as DOMRect;
                const calendarTop = calendarRect.top;

                expect(inputGroupTop).toBeGreaterThan(calendarTop);
            });

            it('should show/hide overlay dropdown on opening/closing', fakeAsync(() => {
                datePicker.openDialog();
                fixture.detectChanges();

                const overlayDiv = document.getElementsByClassName(CSS_CLASS_OVERLAY_CONTENT)[0];
                expect(overlayDiv).toBeDefined();

                const dropDown = document.getElementsByClassName(CSS_CLASS_DATE_PICKER_DROPDOWN);
                expect(dropDown.length).toBe(1);
                expect(dropDown[0]).not.toBeNull();

                UIInteractions.triggerKeyDownEvtUponElem('Escape', dropDown[0], false);
                tick();
                fixture.detectChanges();

                const overlays = document.getElementsByClassName(CSS_CLASS_OVERLAY_CONTENT);
                expect(overlays.length).toEqual(0);
            }));

            it('should apply properly disabled class to the input', () => {
                const dom = fixture.debugElement;
                const inputGroup = dom.query(By.css(`.${CSS_CLASS_INPUTGROUP}`));
                expect(inputGroup.nativeElement.classList.contains(CSS_CLASS_INPUTGROUP_DISABLED)).toBeFalsy();

                datePicker.disabled = true;
                fixture.detectChanges();
                expect(inputGroup.nativeElement.classList.contains(CSS_CLASS_INPUTGROUP_DISABLED)).toBeTruthy();
            });

        });
    });

    describe('Dropdown mode: ', () => {
        configureTestSuite();
        beforeAll(waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [
                    IgxDatePickerTestComponent
                ],
                imports: [
                    IgxDatePickerModule
                ]
            }).compileComponents();
        }));
        beforeEach(() => {
            fixture = TestBed.createComponent(IgxDatePickerTestComponent);
            fixture.detectChanges();
            datePicker = fixture.componentInstance.datePicker;
            input = fixture.debugElement.query(By.css(CSS_CLASS_INPUTGROUP));

            datePicker.mode = InteractionMode.DropDown;
            fixture.detectChanges();
        });

        it('should open/close drop-down with `space`/`esc` keys', fakeAsync(() => {
            datePicker.onSpaceClick(UIInteractions.getKeyboardEvent('keydown', 'space'));
            fixture.detectChanges();

            expect(datePicker.collapsed).toBeFalsy();

            const dropDown = document.getElementsByClassName(CSS_CLASS_DATE_PICKER_DROPDOWN)[0];
            UIInteractions.triggerKeyDownEvtUponElem('Escape', dropDown, false);
            tick();
            fixture.detectChanges();

            expect(datePicker.collapsed).toBeTruthy();
        }));

        it('should open/close drop-down with `alt + down`/up` keys', fakeAsync(() => {
            datePicker.onKeyDown(UIInteractions.getKeyboardEvent('keydown', 'ArrowDown', true));
            fixture.detectChanges();

            expect(datePicker.collapsed).toBeFalsy();

            const dropDown = document.getElementsByClassName(CSS_CLASS_DATE_PICKER_DROPDOWN)[0];
            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', dropDown, false, true);
            tick();
            fixture.detectChanges();

            expect(datePicker.collapsed).toBeTruthy();
        }));

        it('should open the dropdown on date icon click', () => {
            const dateIcon = fixture.debugElement.query(By.css(CSS_CLASS_PREFIX));
            dateIcon.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            fixture.detectChanges();

            expect(datePicker.collapsed).toBeFalsy();
        });

        it('should reset value on clear button click', () => {
            datePicker.value = new Date();
            fixture.detectChanges();

            spyOn(datePicker.valueChange, 'emit');
            input = fixture.debugElement.query(By.directive(IgxInputDirective));
            const clearIcon = fixture.debugElement.query(By.css(CSS_CLASS_SUFFIX));
            clearIcon.triggerEventHandler('click', UIInteractions.getMouseEvent('click'));
            fixture.detectChanges();

            expect(datePicker.valueChange.emit).toHaveBeenCalled();
            expect(datePicker.valueChange.emit).toHaveBeenCalledWith(null);
            expect(datePicker.value).toEqual(null);
            expect(input.nativeElement.innerText).toEqual('');
        });

        it('should select date in calendar correctly when value is set', () => {
            const date = new Date(2011, 9, 20);
            datePicker.value = date;
            fixture.detectChanges();
            datePicker.openDialog();
            fixture.detectChanges();

            const selectedSpans = document.getElementsByClassName(CSS_CLASS_CALENDAR_PICKER_SELECTED_DATE);
            expect(selectedSpans.length).toBe(1);
            expect((selectedSpans[0] as HTMLElement).innerText.trim()).toBe(date.getDate().toString());

            const dateHeader = document.getElementsByClassName(CSS_CLASS_CALENDAR_PICKER_DATE);
            expect(dateHeader.length).toBe(2);
            const month = dateHeader[0].innerHTML.trim();
            const year = dateHeader[1].innerHTML.trim();
            expect(month).toBe(date.toLocaleString('default', { month: 'short' }));
            expect(year).toBe(date.getFullYear().toString());
        });

    });




    describe('Base Tests', () => {
        // configureTestSuite();
        let fixture: ComponentFixture<IgxDatePickerTestComponent>;
        let datePicker: IgxDatePickerComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxDatePickerTestComponent);
            datePicker = fixture.componentInstance.datePicker;
            fixture.detectChanges();
        });


        it('should not be able to toggle & clear when disabled', () => {
            const date = new Date();
            datePicker.value = date;
            datePicker.disabled = true;
            fixture.detectChanges();
            expect(datePicker.collapsed).toBeTruthy();

            datePicker.openDialog();
            fixture.detectChanges();
            expect(datePicker.collapsed).toBeTruthy();

            datePicker.clear();
            fixture.detectChanges();
            expect(datePicker.value).toEqual(date);
        });


        it('Handling keyboard navigation with `space`(open) and `esc`(close) buttons', fakeAsync(() => {
            const datePickerDom = fixture.debugElement.query(By.css('igx-date-picker'));
            UIInteractions.triggerKeyDownEvtUponElem('space', datePickerDom.nativeElement, false);
            fixture.detectChanges();

            const overlayDiv = document.getElementsByClassName('igx-overlay__wrapper--modal')[0];
            expect(overlayDiv).toBeDefined();
            expect(overlayDiv.classList.contains('igx-overlay__wrapper--modal')).toBeTruthy();

            UIInteractions.triggerKeyDownEvtUponElem('Escape', overlayDiv, true);
            flush();
            fixture.detectChanges();

            const overlays = document.getElementsByClassName('igx-overlay__wrapper--modal');
            expect(overlays.length).toEqual(0);
        }));








    });

    describe('ARIA Tests', () => {
        let labelID: string;
        let inputLabelledBy: string;
        let dom: DebugElement;

        it('ARIA Test for a picker with an input group template', () => {
            const fixture = TestBed.createComponent(IgxDatePickerRetemplatedComponent);
            fixture.detectChanges();
            dom = fixture.debugElement;

            labelID = dom.query(By.directive(IgxLabelDirective)).nativeElement.id;
            inputLabelledBy = dom.query(By.directive(IgxInputDirective)).nativeElement.getAttribute('aria-labelledby');
            expect(inputLabelledBy).toEqual(labelID);
        });

        it('ARIA Test for picker with a dialog mode', () => {
            const fixture = TestBed.createComponent(IgxDatePickerTestComponent);
            fixture.detectChanges();
            dom = fixture.debugElement;

            labelID = dom.query(By.directive(IgxLabelDirective)).nativeElement.id;
            inputLabelledBy = dom.query(By.directive(IgxInputDirective)).nativeElement.getAttribute('aria-labelledby');
            expect(inputLabelledBy).toEqual(labelID);
        });


        it('ARIA Test for picker with a dropdown mode', () => {
            const fixture = TestBed.createComponent(IgxDatePickerOpeningComponent);
            fixture.detectChanges();
            dom = fixture.debugElement;

            labelID = dom.query(By.directive(IgxLabelDirective)).nativeElement.id;
            inputLabelledBy = dom.query(By.directive(IgxInputDirective)).nativeElement.getAttribute('aria-labelledby');
            expect(inputLabelledBy).toEqual(labelID);
        });
    });

    describe('DatePicker with passed date', () => {
        // configureTestSuite();
        let fixture: ComponentFixture<IgxDatePickerWithPassedDateComponent>;
        let datePicker: IgxDatePickerComponent;
        let inputTarget;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxDatePickerWithPassedDateComponent);
            datePicker = fixture.componentInstance.datePicker;
            fixture.detectChanges();
            inputTarget = fixture.debugElement.query(By.css('.igx-date-picker__input-date')).nativeElement;

        });

        it('@Input properties', () => {
            expect(datePicker.value).toEqual(new Date(2017, 7, 7));
        });

        it('Datepicker DOM input value', () => {
            const today = new Date(2017, 7, 7);
            const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

            expect(inputTarget.value).toEqual(formattedDate);
        });

        it('Datepicker custom locale(EN) date format', () => {
            const todayToEnLocale = new Date(2017, 7, 7).toLocaleDateString('en');
            expect(inputTarget.value).toEqual(todayToEnLocale);
        });

        it('Set formatOptions for month to be numeric', () => {
            const getMonthFromPickerDate = fixture.componentInstance.date.getMonth() + 1;
            inputTarget.dispatchEvent(new Event('click', { bubbles: true }));
            fixture.detectChanges();

            const headerDate = document.getElementsByClassName('igx-calendar__header-date')[0];
            const getMonthFromCalendarHeader = (headerDate.children[1] as HTMLElement).innerText.substring(0, 1);

            expect(parseInt(getMonthFromCalendarHeader, 10)).toBe(getMonthFromPickerDate);
        });
    });

    it('When datepicker in "dropdown" mode is closed via outside click, the input should not receive focus',
        fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDatePickerDropdownButtonsComponent);
            fixture.detectChanges();

            const datePickerDom = fixture.debugElement.query(By.css('igx-date-picker'));
            const input = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
            let overlayToggle = document.getElementsByClassName('igx-overlay__wrapper');

            expect(overlayToggle.length).toEqual(0);

            UIInteractions.triggerKeyDownEvtUponElem('space', datePickerDom.nativeElement, false);
            flush();
            fixture.detectChanges();

            overlayToggle = document.getElementsByClassName('igx-overlay__wrapper');
            expect(overlayToggle[0]).not.toBeNull();
            expect(overlayToggle[0]).not.toBeUndefined();

            const dummyInput = fixture.componentInstance.dummyInput.nativeElement;
            dummyInput.focus();
            dummyInput.click();
            tick();
            fixture.detectChanges();

            overlayToggle = document.getElementsByClassName('igx-overlay__wrapper');
            expect(overlayToggle[0]).toEqual(undefined);
            expect(input).not.toEqual(document.activeElement);
            expect(dummyInput).toEqual(document.activeElement);
        }));

    it('When datepicker in "dropdown" mode, should focus input on user interaction with Today btn, Cancel btn, Enter Key, Escape key',
        fakeAsync(() => {
            const fixture = TestBed.createComponent(IgxDatePickerDropdownButtonsComponent);
            fixture.detectChanges();
            const datePickerDom = fixture.debugElement.query(By.css('igx-date-picker'));
            const input = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
            let overlayToggle = document.getElementsByClassName('igx-overlay__wrapper');
            expect(overlayToggle.length).toEqual(0);

            UIInteractions.triggerKeyDownEvtUponElem('space', datePickerDom.nativeElement, false);
            flush();
            fixture.detectChanges();
            const buttons = document.getElementsByClassName('igx-button--flat');
            expect(buttons.length).toEqual(2);

            // Today btn
            const todayBtn = buttons[1] as HTMLElement;
            expect(todayBtn.innerText).toBe('Today');
            todayBtn.click();
            tick();
            fixture.detectChanges();
            overlayToggle = document.getElementsByClassName('igx-overlay__wrapper');
            expect(overlayToggle[0]).toEqual(undefined);
            expect(input).toEqual(document.activeElement);

            // Cancel btn
            UIInteractions.triggerKeyDownEvtUponElem('space', datePickerDom.nativeElement, false);
            flush();
            fixture.detectChanges();
            const cancelBtn = buttons[0] as HTMLElement;
            expect(cancelBtn.innerText).toBe('Cancel');
            cancelBtn.click();
            tick();
            fixture.detectChanges();
            overlayToggle = document.getElementsByClassName('igx-overlay__wrapper');
            expect(overlayToggle[0]).toEqual(undefined);
            expect(input).toEqual(document.activeElement);

            // Enter key
            UIInteractions.triggerKeyDownEvtUponElem('space', datePickerDom.nativeElement, false);
            flush();
            fixture.detectChanges();
            document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            tick();
            fixture.detectChanges();
            overlayToggle = document.getElementsByClassName('igx-overlay__wrapper');
            expect(overlayToggle[0]).toEqual(undefined);
            expect(input).toEqual(document.activeElement);

            // Esc key
            UIInteractions.triggerKeyDownEvtUponElem('space', datePickerDom.nativeElement, false);
            flush();
            fixture.detectChanges();
            document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            tick();
            fixture.detectChanges();

            overlayToggle = document.getElementsByClassName('igx-overlay__wrapper');
            expect(overlayToggle[0]).toEqual(undefined);
            expect(input).toEqual(document.activeElement);
        }));

    it('Retemplated calendar in date picker', () => {
        const fixture = TestBed.createComponent(IgxDatePickerCustomizedComponent);
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const datePickerTarget = dom.query(By.css('.igx-date-picker__input-date'));

        UIInteractions.simulateClickAndSelectEvent(datePickerTarget);
        fixture.detectChanges();

        const formattedHeaderDate = document.getElementsByClassName('igx-calendar__header-date')[0];
        const formattedHeaderText = (formattedHeaderDate as HTMLElement).innerText;
        expect(formattedHeaderText).toBe('10/20/19');

        const picker = document.getElementsByClassName('igx-calendar-picker');
        const formattedSubHeaderText = picker[0].querySelector('.igx-calendar-picker__dates').textContent.trim();

        expect(formattedSubHeaderText).toBe('2019/Oct');

        const buttons = document.getElementsByClassName('igx-button--flat');
        expect(buttons.length).toEqual(1);
        expect((buttons[0] as HTMLElement).innerText).toBe('TEST');
    });

    it('Retemplated calendar in date picker - dropdown mode', () => {
        const fixture = TestBed.createComponent(IgxDatePickerCustomizedComponent);
        const datePicker = fixture.componentInstance.customizedDatePicker;
        datePicker.mode = InteractionMode.DropDown;
        fixture.detectChanges();

        const dom = fixture.debugElement;
        const iconDate = dom.query(By.css('.igx-icon'));
        expect(iconDate).toBeDefined();

        UIInteractions.simulateClickAndSelectEvent(iconDate);
        fixture.detectChanges();

        const picker = document.getElementsByClassName('igx-calendar-picker');
        const formattedSubHeaderText = picker[0].querySelector('.igx-calendar-picker__dates').textContent.trim();
        expect(formattedSubHeaderText).toBe('2019/Oct');

        const buttons = document.getElementsByClassName('igx-button--flat');
        expect(buttons.length).toEqual(1);
        expect((buttons[0] as HTMLElement).innerText).toBe('TEST');
    });

    it('Value should respond when is bound through ngModel and selection through selectDate method is made.', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxDatePickerNgModelComponent);
        const datePicker = fix.componentInstance.datePicker;
        let expectedRes = new Date(2011, 11, 11);
        fix.detectChanges();
        flush();

        expect(datePicker.value).toEqual(expectedRes);
        expectedRes = new Date(Date.now());
        datePicker.selectDate(expectedRes);

        tick();
        expect(datePicker.value).toEqual(expectedRes);

        const boundValue = fix.componentInstance.val;
        expect(boundValue).toEqual(expectedRes);
    }));

    it('Retemplate a DatePicker input group', fakeAsync(() => {
        const fix = TestBed.createComponent(IgxDatePickerRetemplatedComponent);
        tick();
        fix.detectChanges();

        const dom = fix.debugElement;
        const inputGroup = dom.query(By.css('.igx-input-group'));
        expect(inputGroup).not.toBeNull();
        expect(dom.query(By.css('.igx-icon'))).toBeNull();
        expect(inputGroup.nativeElement.classList.contains('igx-input-group--invalid')).toBe(false);
    }));

    describe('Drop-down Retemplated Date Picker', () => {
        // configureTestSuite();
        let fixture: ComponentFixture<IgxDropDownDatePickerRetemplatedComponent>;
        let datePicker: IgxDatePickerComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxDropDownDatePickerRetemplatedComponent);
            datePicker = fixture.componentInstance.datePicker;
            fixture.detectChanges();
        });

        it('Retemplate dropdown date picker - dropdown mode', () => {
            const dom = fixture.debugElement;

            const input = dom.query(By.css('.igx-input-group__input'));
            expect(input).not.toBeNull();
            expect(input.nativeElement.value).toBe('10/20/2020');

            const button = dom.query(By.css('.igx-button--flat'));
            UIInteractions.simulateClickAndSelectEvent(button);
            fixture.detectChanges();

            const dropdown = document.getElementsByClassName('igx-date-picker--dropdown');
            expect(dropdown.length).toBe(1);
            expect(dropdown[0]).not.toBeNull();
        });

        it('Drop-down should open below the input by default if there is enough space - retemplated dropdown mode', () => {
            const dom = fixture.debugElement;

            const input = dom.query(By.css('.igx-input-group__input'));
            const inputRect = input.nativeElement.getBoundingClientRect() as DOMRect;
            const inputTop = inputRect.top;

            const button = dom.query(By.css('.igx-button--flat'));
            UIInteractions.simulateClickAndSelectEvent(button);
            fixture.detectChanges();

            const calendar = document.getElementsByTagName('igx-calendar-container');
            const calendarRect = calendar[0].getBoundingClientRect() as DOMRect;
            const calendarTop = calendarRect.top;

            expect(inputTop).toBeLessThan(calendarTop);
        });

        it('Drop-down should open above the input when there is no enough space below - retemplated dropdown mode', () => {
            const dom = fixture.debugElement;

            // check if drop down is opened above the input if there is no space below
            datePicker.element.nativeElement.style = 'position: fixed; bottom: 150px';
            fixture.detectChanges();

            const input = dom.query(By.css('.igx-input-group__input'));
            const inputRect = input.nativeElement.getBoundingClientRect() as DOMRect;
            const inputTop = inputRect.top;

            const button = dom.query(By.css('.igx-button--flat'));
            UIInteractions.simulateClickAndSelectEvent(button);
            fixture.detectChanges();

            const calendar = document.getElementsByTagName('igx-calendar-container');
            const calendarRect = calendar[0].getBoundingClientRect() as DOMRect;
            const calendarTop = calendarRect.top;

            expect(inputTop).toBeGreaterThan(calendarTop);
        });
    });

    describe('Drop-down mode', () => {
        // configureTestSuite();
        let fixture: ComponentFixture<IgxDatePickerEditableComponent>;
        let datePicker: IgxDatePickerComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxDatePickerEditableComponent);
            datePicker = fixture.componentInstance.datePicker;
            fixture.detectChanges();
        });

        it('Editable Datepicker open/close event - dropdown mode', async () => {
            const dom = fixture.debugElement;
            const iconDate = dom.query(By.css('.igx-icon'));
            expect(iconDate).not.toBeNull();

            spyOn(datePicker.onOpened, 'emit');
            spyOn(datePicker.onClosed, 'emit');

            UIInteractions.simulateClickAndSelectEvent(iconDate);
            fixture.detectChanges();
            await wait();

            expect(datePicker.onOpened.emit).toHaveBeenCalled();
            expect(datePicker.onOpened.emit).toHaveBeenCalledWith(datePicker);

            const dropDown = document.getElementsByClassName('igx-date-picker--dropdown');
            expect(dropDown.length).toBe(1);
            expect(dropDown[0]).not.toBeNull();

            dom.nativeElement.dispatchEvent(new Event('click'));

            fixture.detectChanges();
            await wait();

            expect(datePicker.onClosed.emit).toHaveBeenCalled();
            expect(datePicker.onClosed.emit).toHaveBeenCalledWith(datePicker);
        });





       
        it('should be able to apply display format - dropdown mode', async () => {
            const input = fixture.debugElement.query(By.directive(IgxInputDirective));
            expect(input).toBeDefined();

            input.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();
            await wait();

            expect(input.nativeElement.value).toBe('20.10.2011');
        });

        it('should be able to apply editor mask - dropdown mode', (() => {
            const input = fixture.debugElement.query(By.directive(IgxInputDirective));
            input.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('20-10-11');

            // Check for formatted empty value on blur - placeholder is displayed
            datePicker.deselectDate();
            fixture.detectChanges();

            input.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();

            expect(input.nativeNode.placeholder).toBe('dd-MM-yy');
        }));


        it('should increase date parts using arrows - dropdown mode', fakeAsync(() => {
            const input = fixture.debugElement.query(By.directive(IgxInputDirective));
            expect(input).toBeDefined();
            input.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();
            expect(input.nativeElement.value).toBe('20-10-11');

            // initial input value is 20-10-11 / dd-MM-yy
            // focus the day part, position the caret at the beginning
            input.nativeElement.setSelectionRange(0, 0);

            // press arrow up
            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, false);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('21-10-11', 'ArrowUp on day failed');

            // test month part
            // position caret at the month part
            input.nativeElement.setSelectionRange(3, 3);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, false);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('21-11-11', 'ArrowUp on month failed');

            // test year part
            // position caret at the year part
            input.nativeElement.setSelectionRange(7, 7);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowUp', input.nativeElement, false);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('21-11-12', 'ArrowUp on year failed');

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();
            tick(100);

            // format dd.MM.y
            expect(input.nativeElement.value).toBe('21.11.2012');
        }));

        it('should decrease date parts using arrows - dropdown mode', fakeAsync(() => {
            const input = fixture.debugElement.query(By.directive(IgxInputDirective));
            expect(input).toBeDefined();
            input.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();
            expect(input.nativeElement.value).toBe('20-10-11');

            // initial input value is 20-10-11 / dd-MM-yy
            // focus the day part, position the caret at the beginning
            input.nativeElement.setSelectionRange(0, 0);

            // press arrow down
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, false);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('19-10-11', 'ArrowDown on day failed');

            // press arrow down
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, false);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('18-10-11', 'ArrowDown on day failed on the second try');

            // test month part
            // position caret at the month part
            input.nativeElement.setSelectionRange(3, 3);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, false);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('18-09-11', 'ArrowDown on month failed');

            // test year part
            // position caret at the year part
            input.nativeElement.setSelectionRange(7, 7);
            UIInteractions.triggerKeyDownEvtUponElem('ArrowDown', input.nativeElement, false);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('18-09-10', 'ArrowDown on year failed');

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();
            tick(100);

            // format dd.MM.y
            expect(input.nativeElement.value).toBe('18.09.2010');
        }));

        it('should increase/decrease date parts using mouse wheel - dropdown mode', fakeAsync(() => {
            const input = fixture.debugElement.query(By.directive(IgxInputDirective));
            expect(input).toBeDefined();
            input.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();
            expect(input.nativeElement.value).toBe('20-10-11');

            // initial input value is 20-10-11 / dd-MM-yy
            // focus the day part, position the caret at the beginning
            input.nativeElement.setSelectionRange(0, 0);

            // up
            UIInteractions.simulateWheelEvent(input.nativeElement, 0, -100);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('21-10-11', 'MouseWheel Up on day failed.');

            input.nativeElement.setSelectionRange(3, 3);
            // down
            UIInteractions.simulateWheelEvent(input.nativeElement, 0, 100);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('21-09-11', 'MouseWheel down on month part failed.');

            // test year part
            // position caret at the year part
            input.nativeElement.setSelectionRange(7, 7);
            UIInteractions.simulateWheelEvent(input.nativeElement, 0, -100);
            tick(100);
            fixture.detectChanges();

            UIInteractions.simulateWheelEvent(input.nativeElement, 0, -100);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('21-09-13', 'MouseWheel Up on year failed');

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();
            tick(100);

            // format dd.MM.y
            expect(input.nativeElement.value).toBe('21.09.2013');
        }));


        it('should emit onValidationFailed event when entered invalid date - dropdown mode', () => {
            const input = fixture.debugElement.query(By.directive(IgxInputDirective));
            spyOn(datePicker.onValidationFailed, 'emit');

            input.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();
            expect(input.nativeElement.value).toBe('20-10-11');

            UIInteractions.clickAndSendInputElementValue(input, '28-02-19');
            fixture.detectChanges();

            UIInteractions.clickAndSendInputElementValue(input, '29-02-19');
            fixture.detectChanges();

            // invalid date
            expect(input.nativeElement.value).toBe('29-02-19');
            expect(datePicker.onValidationFailed.emit).toHaveBeenCalledTimes(1);
        });

        it('should emit onDisabledDate event when entered disabled date - dropdown mode', fakeAsync(() => {
            const input = fixture.debugElement.query(By.directive(IgxInputDirective));
            spyOn(datePicker.onDisabledDate, 'emit');

            datePicker.disabledDates = [{
                type: DateRangeType.Between, dateRange: [
                    new Date(2018, 8, 2),
                    new Date(2018, 8, 8)
                ]
            }];

            input.nativeElement.dispatchEvent(new Event('focus'));
            fixture.detectChanges();
            expect(input.nativeElement.value).toBe('20-10-11');

            UIInteractions.clickAndSendInputElementValue(input, '03-05-19');
            fixture.detectChanges();

            // disabled date
            UIInteractions.clickAndSendInputElementValue(input, '03-09-18');
            fixture.detectChanges();
            expect(input.nativeElement.value).toBe('03-09-18');

            UIInteractions.clickAndSendInputElementValue(input, '07-09-18');
            fixture.detectChanges();
            expect(input.nativeElement.value).toBe('07-09-18');

            expect(datePicker.onDisabledDate.emit).toHaveBeenCalledTimes(2);
        }));


        it('should stop spinning on max/min when isSpinLoop is set to false - dropdown mode', fakeAsync(() => {
            const input = fixture.debugElement.query(By.directive(IgxInputDirective));
            expect(input).toBeDefined();
            datePicker.isSpinLoop = false;

            input.triggerEventHandler('focus', {});
            fixture.detectChanges(); // bound transformedDate assign
            UIInteractions.clickAndSendInputElementValue(input, '31-03-19');
            expect(input.nativeElement.value).toBe('31-03-19');

            input.nativeElement.focus();
            input.nativeElement.setSelectionRange(0, 0);

            // check max day
            UIInteractions.simulateWheelEvent(input.nativeElement, 0, -100);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('31-03-19');

            input.nativeElement.focus();
            UIInteractions.clickAndSendInputElementValue(input, '01-03-19');
            expect(input.nativeElement.value).toBe('01-03-19');

            input.nativeElement.focus();
            input.nativeElement.setSelectionRange(0, 0);

            // check min day
            UIInteractions.simulateWheelEvent(input.nativeElement, 0, 100);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('01-03-19');

            // check min month
            input.nativeElement.focus();
            UIInteractions.clickAndSendInputElementValue(input, '15-01-19');
            expect(input.nativeElement.value).toBe('15-01-19');

            input.nativeElement.setSelectionRange(3, 3);
            UIInteractions.simulateWheelEvent(input.nativeElement, 0, 100);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('15-01-19');

            // check max month
            input.nativeElement.focus();
            UIInteractions.clickAndSendInputElementValue(input, '31-12-19');
            expect(input.nativeElement.value).toBe('31-12-19');

            input.nativeElement.setSelectionRange(3, 3);
            UIInteractions.simulateWheelEvent(input.nativeElement, 0, -100);
            tick(100);
            fixture.detectChanges();

            expect(input.nativeElement.value).toBe('31-12-19');

            input.nativeElement.dispatchEvent(new Event('blur'));
            fixture.detectChanges();
            tick(100);

            // format dd.MM.y
            expect(input.nativeElement.value).toBe('31.12.2019');
        }));
    });

    describe('Drop-down mode select all text on focus', () => {
        let fixture: ComponentFixture<IgxDatePickerEditableComponent>;
        let datePicker: IgxDatePickerComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxDatePickerEditableComponent);
            datePicker = fixture.componentInstance.datePicker;
            fixture.detectChanges();
        });

        it('Should select all input text on input focus', fakeAsync(() => {
            const input = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
            input.focus();
            fixture.detectChanges();
            tick(100);

            expect(input).toEqual(document.activeElement);
            expect(input.selectionEnd).toEqual(input.value.length);
            expect(input.selectionStart).toEqual(0);
            expect(input.value.substring(input.selectionStart, input.selectionEnd)).toEqual(input.value);
        }));
    });

    describe('Reactive form', () => {
        let fixture: ComponentFixture<IgxDatePickerReactiveFormComponent>;
        let datePickerOnChangeComponent: IgxDatePickerComponent;
        let datePickerOnBlurComponent: IgxDatePickerComponent;
        let datePickerTemplateIGComponent: IgxDatePickerComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxDatePickerReactiveFormComponent);
            datePickerOnChangeComponent = fixture.componentInstance.datePickerOnChangeComponent;
            datePickerOnBlurComponent = fixture.componentInstance.datePickerOnBlurComponent;
            datePickerTemplateIGComponent = fixture.componentInstance.datePickerTemplateIGComponent;
            fixture.detectChanges();
        });

        it('Should set date picker status to invalid when it is required and has no value', fakeAsync(() => {
            const inputGroupsElements = fixture.debugElement.queryAll(By.directive(IgxInputDirective));
            const inputGroupElement = inputGroupsElements.find(d => d.componentInstance === datePickerOnChangeComponent);
            const inputDirective = inputGroupElement.injector.get(IgxInputDirective) as IgxInputDirective;

            expect(inputDirective.valid).toEqual(IgxInputState.INITIAL);

            datePickerOnChangeComponent.value = null;
            fixture.detectChanges();

            expect(inputDirective.valid).toEqual(IgxInputState.INVALID);
        }));

        it('Should set date picker status to invalid when it is required and has no value onBlur', fakeAsync(() => {
            datePickerOnBlurComponent.mode = InteractionMode.DropDown;
            datePickerOnBlurComponent.mask = 'dd/mm/yyyy';
            datePickerOnBlurComponent.inputMask = 'dd/mm/yyyy';
            fixture.detectChanges();

            const inputDirectiveElements = fixture.debugElement.queryAll(By.directive(IgxInputDirective));
            const inputDirectiveElement = inputDirectiveElements.find(d => d.componentInstance === datePickerOnBlurComponent);
            const inputDirective = inputDirectiveElement.injector.get(IgxInputDirective) as IgxInputDirective;

            expect(inputDirective.valid).toEqual(IgxInputState.INITIAL);

            inputDirectiveElement.triggerEventHandler('focus', {});
            fixture.detectChanges();

            expect(inputDirective.valid).toEqual(IgxInputState.INITIAL);

            datePickerOnBlurComponent.value = null;
            fixture.detectChanges();
            expect(inputDirective.valid).toEqual(IgxInputState.INITIAL);

            inputDirectiveElement.triggerEventHandler('blur', { target: { value: '' } });
            fixture.detectChanges();

            expect(inputDirective.valid).toEqual(IgxInputState.INVALID);
        }));

        it('Should set date picker status to invalid when date is disabled', fakeAsync(() => {
            datePickerOnChangeComponent.disabledDates = [{ type: DateRangeType.Before, dateRange: [new Date()] }];
            const inputGroupsElements = fixture.debugElement.queryAll(By.directive(IgxInputDirective));
            const inputGroupElement = inputGroupsElements.find(d => d.componentInstance === datePickerOnChangeComponent);
            const inputDirective = inputGroupElement.injector.get(IgxInputDirective) as IgxInputDirective;

            const today = new Date();
            datePickerOnChangeComponent.value = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
            fixture.detectChanges();
            expect(inputDirective.valid).toEqual(IgxInputState.INVALID);

            datePickerOnChangeComponent.value = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            fixture.detectChanges();
            expect(inputDirective.valid).toEqual(IgxInputState.INITIAL);

            datePickerOnChangeComponent.disabledDates = [{
                type: DateRangeType.Before,
                dateRange: [new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)]
            }];
            fixture.detectChanges();
            expect(inputDirective.valid).toEqual(IgxInputState.INVALID);
        }));

        it('Should set date picker status to invalid if date is included in disabledDates range and user pass a template', fakeAsync(() => {
            datePickerTemplateIGComponent.disabledDates = [{ type: DateRangeType.Before, dateRange: [new Date()] }];
            const inputDirective = datePickerTemplateIGComponent.inputDirective;

            const today = new Date();
            datePickerTemplateIGComponent.value = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
            fixture.detectChanges();
            expect(inputDirective.valid).toEqual(IgxInputState.INVALID);

            datePickerTemplateIGComponent.value = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            fixture.detectChanges();
            expect(inputDirective.valid).toEqual(IgxInputState.INITIAL);

            datePickerTemplateIGComponent.disabledDates = [{
                type: DateRangeType.Before,
                dateRange: [new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)]
            }];
            fixture.detectChanges();
            expect(inputDirective.valid).toEqual(IgxInputState.INVALID);
        }));

        it('Should set date picker status to invalid on blur when pass or change a template', fakeAsync(() => {
            datePickerTemplateIGComponent.disabledDates = [{ type: DateRangeType.Before, dateRange: [new Date()] }];
            const templateInputDirective = datePickerTemplateIGComponent.inputDirective;
            const templateInput = templateInputDirective.nativeElement;
            templateInput.dispatchEvent(new Event('blur'));
            fixture.detectChanges();
            expect(templateInputDirective.valid).toEqual(IgxInputState.INVALID);

            fixture.componentInstance.useCustomTemplate = false;
            fixture.detectChanges();
            // obtain the default template input directive & input
            const inputDirective = datePickerTemplateIGComponent.inputDirective;
            const input = inputDirective.nativeElement;
            expect(inputDirective.valid).toEqual(IgxInputState.INITIAL);

            input.dispatchEvent(new Event('blur'));
            fixture.detectChanges();
            expect(inputDirective.valid).toEqual(IgxInputState.INVALID);
        }));

        // Bug #6025 Date picker does not disable in reactive form
        it('Should disable when form is disabled', () => {
            const formGroup: FormGroup = fixture.componentInstance.reactiveForm;
            const inputGroupsElements = fixture.debugElement.queryAll(By.directive(IgxInputDirective));
            const inputGroupElement = inputGroupsElements.find(d => d.componentInstance === datePickerOnBlurComponent);
            const inputDirective = inputGroupElement.injector.get(IgxInputDirective) as IgxInputDirective;
            expect(inputDirective.disabled).toBeFalsy();

            formGroup.disable();
            fixture.detectChanges();
            expect(inputDirective.disabled).toBeTruthy();
        });
    });
});

@Component({
    template: `
        <igx-date-picker [value]="date" [weekStart]="1"></igx-date-picker>
    `
})
export class IgxDatePickerWithWeekStartComponent {
    public date: Date = new Date(2017, 6, 8);
    @ViewChild(IgxDatePickerComponent, { static: true }) public datePicker: IgxDatePickerComponent;
}

@Component({
    template: `
        <igx-date-picker [labelVisibility]="labelVisibility">
            <label igxLabel *ngIf="customLabelVisibility">{{ customLabel }}</label>
        </igx-date-picker>
    `
})
export class IgxDatePickerTestComponent {
    @ViewChild(IgxDatePickerComponent, { static: true }) public datePicker: IgxDatePickerComponent;

    public labelVisibility = true;
    public customLabel = 'Custom label';
    public customLabelVisibility = false;
}
@Component({
    template: `
        <igx-date-picker [value]="date" [formatOptions]="formatOptions"></igx-date-picker>
    `
})
export class IgxDatePickerWithPassedDateComponent {
    public date: Date = new Date(2017, 7, 7);
    public formatOptions = {
        day: 'numeric',
        month: 'numeric',
        weekday: 'short',
        year: 'numeric'
    };
    @ViewChild(IgxDatePickerComponent, { static: true }) public datePicker: IgxDatePickerComponent;
}

@Component({
    template: `
        <igx-date-picker [value]="date" [locale]="'de-DE'"></igx-date-picker>
    `
})
export class IgxDatePickerWIthLocaleComponent {
    public date: Date = new Date(2017, 7, 7);
    @ViewChild(IgxDatePickerComponent, { static: true }) public datePicker: IgxDatePickerComponent;
}

@Component({
    template: `
        <igx-date-picker [(ngModel)]="val"></igx-date-picker>
    `
})
export class IgxDatePickerNgModelComponent {
    public val: Date = new Date(2011, 11, 11);
    @ViewChild(IgxDatePickerComponent, { static: true }) public datePicker: IgxDatePickerComponent;
}

@Component({
    template: `
<igx-date-picker>
    <ng-template igxDatePickerTemplate let-displayData="displayData">
        <igx-input-group>
            <label igxLabel>Custom Date Label</label>
            <input igxInput [value]="displayData" required />
        </igx-input-group>
    </ng-template>
</igx-date-picker>
    `
})
export class IgxDatePickerRetemplatedComponent {
    @ViewChild(IgxDatePickerComponent, { static: true }) public datePicker: IgxDatePickerComponent;
}

@Component({
    template: `
    <igx-date-picker [value]="date" mode="dropdown">
        <ng-template igxDatePickerTemplate let-openDialog="openDialog" let-value="value"
            let-displayData="displayData">
            <igx-input-group>
            <input #dropDownTarget class="igx-date-picker__input-date" igxInput [value]="displayData"/>
            </igx-input-group>
            <button igxButton="flat" (click)="openDialog(dropDownTarget)">Select Date</button>
        </ng-template>
    </igx-date-picker>
    `
})
export class IgxDropDownDatePickerRetemplatedComponent {
    public date: Date = new Date(2020, 9, 20);
    @ViewChild(IgxDatePickerComponent, { static: true }) public datePicker: IgxDatePickerComponent;
}

@Component({
    template: `
        <igx-date-picker [value]="date" mode="dropdown" format="dd.MM.y" mask="dd-MM-yy"></igx-date-picker>
    `
})
export class IgxDatePickerEditableComponent {
    public date: Date = new Date(2011, 9, 20);
    @ViewChild(IgxDatePickerComponent, { static: true }) public datePicker: IgxDatePickerComponent;
}

@Component({
    template: `
    <igx-date-picker [value]="date">
        <ng-template igxCalendarHeader let-format>
            {{ format.date | date:'shortDate'}}
        </ng-template>
        <ng-template igxCalendarSubheader let-format>
            <span class="date__el" (click)="format.yearView()">{{ format.year.combined }}/</span>
            <span class="date__el" (click)="format.monthView()">{{ format.month.combined | titlecase }}</span>
        </ng-template>
        <ng-template igxDatePickerActions>
            <button igxButton="flat">TEST</button>
        </ng-template>
    </igx-date-picker>
    `
})
export class IgxDatePickerCustomizedComponent {
    public date: Date = new Date(2019, 9, 20);
    @ViewChild(IgxDatePickerComponent, { static: true }) public customizedDatePicker: IgxDatePickerComponent;
}

@Component({
    template:
        `
        <igx-date-picker mode="dropdown"></igx-date-picker>
        `
})
export class IgxDatePickerOpeningComponent {
    @ViewChild(IgxDatePickerComponent, { static: true }) public datePicker: IgxDatePickerComponent;
}

@Component({
    template: `
    <form [formGroup]="reactiveForm">
        <igx-date-picker formControlName="datePickerOnChange" #datePickerOnChangeComponent></igx-date-picker>
        <igx-date-picker formControlName="datePickerOnBlur" #datePickerOnBlurComponent></igx-date-picker>
        <igx-date-picker formControlName="datePickerIGTemplate" #datePickerTemplateIGComponent>
            <ng-template *ngIf="useCustomTemplate" igxDatePickerTemplate let-openDialog="openDialog" let-value="value"
                let-displayData="displayData">
                <igx-input-group>
                    <label igxLabel>Date</label>
                    <input igxInput [value]="displayData"/>
                    <igx-suffix>
                        <igx-icon>today</igx-icon>
                    </igx-suffix>
                </igx-input-group>
            </ng-template>
        </igx-date-picker>
    </form>
`
})
class IgxDatePickerReactiveFormComponent {
    @ViewChild('datePickerOnChangeComponent', { read: IgxDatePickerComponent, static: true })
    public datePickerOnChangeComponent: IgxDatePickerComponent;

    @ViewChild('datePickerOnBlurComponent', { read: IgxDatePickerComponent, static: true })
    public datePickerOnBlurComponent: IgxDatePickerComponent;

    @ViewChild('datePickerTemplateIGComponent', { read: IgxDatePickerComponent, static: true })
    public datePickerTemplateIGComponent: IgxDatePickerComponent;

    reactiveForm: FormGroup;
    public useCustomTemplate = true;
    constructor(fb: FormBuilder) {
        const date = new Date(2000, 10, 15);
        this.reactiveForm = fb.group({
            datePickerOnChange: [date, Validators.required],
            datePickerOnBlur: [date, { updateOn: 'blur', validators: Validators.required }],
            datePickerIGTemplate: [date, Validators.required]
        });
    }
}

@Component({
    template: `
    <input class="dummyInput" #dummyInput/>
    <igx-date-picker id="dropdownButtonsDatePicker"  mode="dropdown" cancelButtonLabel="Cancel" todayButtonLabel="Today" >
    </igx-date-picker>
`
})
class IgxDatePickerDropdownButtonsComponent {
    @ViewChild('dropdownButtonsDatePicker', { read: IgxDatePickerComponent, static: true })
    public datePicker: IgxDatePickerComponent;

    @ViewChild('dummyInput') public dummyInput: ElementRef;
}
