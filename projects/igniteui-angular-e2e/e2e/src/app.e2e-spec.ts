import { AppPage } from './app.po';
import { browser, logging, element, by } from 'protractor';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('test cells selection', () => {
    page.navigateTo();
    browser.wait(function () {
      return element(by.css('igx-grid')).isPresent();
    });
    const cell = page.getCell(0, 0);
    expect(cell.getText()).toEqual('1');
    cell.click();
    expect(cell.getAttribute('class')).toContain('igx-grid__td--selected');

    const cell2 = page.getCell(2, 2);
    browser.driver.actions()
      .mouseDown(cell)
      .mouseMove(cell2)
      .mouseUp()
      .perform();
      browser.debugger();
    expect(cell2.getAttribute('class')).toContain('igx-grid__td--selected');
    browser.driver.sleep(5000);
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
