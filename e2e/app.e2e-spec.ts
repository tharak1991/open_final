import { OpenmoneyPage } from './app.po';

describe('openmoney App', () => {
  let page: OpenmoneyPage;

  beforeEach(() => {
    page = new OpenmoneyPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
