import { browser, by, element, WebElementPromise, promise, WebElement, ElementFinder } from 'protractor';

export class GridPage {
    getGrid(): ElementFinder {
        return element(by.css('igx-grid'));
    }

    getAllRows() {
        const grid = this.getGrid();
        grid.all(by.css('igx-grid-row'));
    }

    getRow(index: number): ElementFinder {
        const grid = this.getGrid();
        return grid.all(by.css('igx-grid-row')).get(index);
    }

    getCell(rowIndex: number, cellIndex: number): ElementFinder {
        const row = this.getRow(rowIndex);
        return row.all(by.css('igx-grid-cell')).get(cellIndex);
    }

    verifyCellSelected(cell: ElementFinder) {
        expect(cell.getAttribute('class')).toContain('igx-grid__td--selected');
    }

    verifyCellsRegionSelected(startRowIndex, endRowIndex, startColumnIndex, endColumnIndex) {
        const startRow = startRowIndex < endRowIndex ? startRowIndex : endRowIndex;
        const endRow = startRowIndex < endRowIndex ? endRowIndex : startRowIndex;
        const startCol = startColumnIndex < endColumnIndex ? startColumnIndex : endColumnIndex;
        const endCol = startColumnIndex < endColumnIndex ? endColumnIndex : startColumnIndex;
        for (let i = startCol; i <= endCol; i++) {
            for (let j = startRow; j <= endRow; j++) {
                const cell = this.getCell(j, i);
                this.verifyCellSelected(cell);
            }
        }
    }

    selectCellsRange(startCell, endCell) {
        browser.driver.actions()
        .mouseDown(startCell)
        .mouseMove(endCell)
        .mouseUp()
        .perform();
        browser.debugger();
    }

}
