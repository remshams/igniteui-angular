import { browser, by, element, WebElementPromise, promise, WebElement, ElementFinder } from 'protractor';

export class AppPage {
  navigateTo(): Promise<unknown> {
    return browser.get('/cellEditing') as Promise<unknown>;
  }

  getGrid(): ElementFinder {
    return element(by.css('igx-grid'));
  }

  getAllRows() {
    const grid = this.getGrid();
    grid.all(by.css('igx-grid-row'));
  }

  getRow(index: number): ElementFinder{
    const grid = this.getGrid();
    return grid.all(by.css('igx-grid-row')).get(index);
  }

  getCell(rowIndex: number, cellIndex: number) {
    const row = this.getRow(rowIndex);
    return row.all(by.css('igx-grid-cell')).get(cellIndex);
  }

}
