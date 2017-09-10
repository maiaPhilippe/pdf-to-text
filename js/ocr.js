class OCR {
    static process(base64Image, lang) {
        return Tesseract.recognize(base64Image, {lang});
    }
}
