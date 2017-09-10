(function () {
    'use strict';

    const PageSeparator = '<br><br>==================== PAGE ====================<br><br>';

    const pdfInput = document.querySelector('input[type=file]#pdf');
    const previewWrapper = document.querySelector('section.pdf-preview');
    const pdfResult = document.querySelector('section.pdf-result');

    let pdfLoader = new PDFLoader(pdfInput, previewWrapper);

    pdfInput.onchange = e => pdfLoader.loadFile(e).then(processPages);

    function processPages(pages) {
        console.log(`preview of ${pages.length} pages done. Starting OCR`);
        let lang = document.querySelector('#langsel').value;
        let ocrPromises = pages.map(page => OCR.process(page, lang));
        Promise.all(ocrPromises)
            .then(pageResults => {
                console.log(pageResults);
                pdfResult.innerHTML = pageResults.map(p => p.text).join(PageSeparator)
            });
    }
})();
