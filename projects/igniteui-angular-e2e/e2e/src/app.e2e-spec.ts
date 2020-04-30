import { AppPage } from './app.po';
import { browser, logging, element, by } from 'protractor';

describe('Testing grid prof of concept', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('test scrolling grid down', () => {
    page.navigateTo();
    browser.wait(function () {
      return element(by.css('igx-grid')).isPresent();
    });
    let cell = page.getCell(0, 0);
    expect(cell.getText()).toEqual('1');

    page.moveVerticalScrollDown(400);
    browser.driver.sleep(1000);
    cell = page.getCell(1, 0);
    expect(cell.getText()).toEqual('9');
  });

  it('test cell selection', () => {
    page.navigateTo();
    browser.wait(function () {
      return element(by.css('igx-grid')).isPresent();
    });
    const cell1 = page.getCell(0, 0);
    const cell2 = page.getCell(3, 3);
    page.selectCellsRange(cell1, cell2);

    page.verifyCellsRegionSelected(0, 3, 0, 3);
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });


});

