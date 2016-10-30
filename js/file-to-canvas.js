class PDFLoader {
    constructor(inputElement, previewWrapper) {
        //TODO: Verify if it is really necessary to disable this
        // PDFJS.disableWorker = true;

        this.inputElement = inputElement;
        this.previewWrapper = previewWrapper;
    }
    loadFile(ev) {
        return new Promise((resolve, reject) => {
            console.info('PDF Input Change');
            let file = this.inputElement.files[0];
            if (file) {
                console.info('PDF Input File Available');
                let fileReader = new FileReader();
                fileReader.onload = (ev) => this.process(fileReader).then(resolve, reject);
                fileReader.readAsArrayBuffer(file);
            } else console.info('PDF Input File Unavailable');
        });
    }
    process(fileReader) {
        console.info(`Processing FileReader result`);

        return PDFJS.getDocument(fileReader.result)
            .then(loadPDF.bind(this))
            .then(previewPages.bind(this));

        function loadPDF(pdf) {
            console.info(`PDFJS File parsed with ${pdf.numPages} pages`);
            return new Promise((resolve, reject) => {
                let pagePromises = [];
                let canvasElements = [];

                for (let i = 1; i <= pdf.numPages; i++) {
                    pagePromises.push(pdf.getPage(i));
                    let canvasPreview = document.createElement('canvas');
                    canvasPreview.classList.add('canvas-preview');
                    canvasPreview.setAttribute('page', `${i}`);
                    canvasElements.push(canvasPreview);
                }

                Promise.all(pagePromises).then(pages => {
                    resolve({pages, canvasElements});
                }, reject);
            });
        }

        function previewPages(data) {
            let {pages, canvasElements} = data;
            return new Promise((resolve, reject) => {
                console.info('Start page preview');
                let scale = 2.5;

                let pagePromises = pages.map((p, i) => {
                    let viewport = p.getViewport(scale);
                    let canvas = canvasElements[i];
                    let canvasContext = canvas.getContext('2d');

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    let task = p.render({ canvasContext, viewport });

                    return task.promise;
                });

                Promise.all(pagePromises).then(() => {
                    canvasElements.forEach(e => this.previewWrapper.append(e));
                    let imageData = canvasElements.map(e => e.toDataURL('image/jpeg'));
                    resolve(imageData);
                }, reject);
            });
        }
    }
}
