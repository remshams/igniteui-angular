import { browser, by, element, WebElementPromise, promise, WebElement, ElementFinder } from 'protractor';
import { GridPage } from './gridPage.po';

export class AppPage extends GridPage {
  navigateTo(): Promise<unknown> {
    return browser.get('/cellEditing') as Promise<unknown>;
  }

}
