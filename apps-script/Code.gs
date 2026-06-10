function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Aplikasi Scan Wajah Real-Time')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
