import { useEffect, useState } from 'react';
import getJsonFromTxt from './getJsonFromTxt';
import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.js`;

function CAS() {
  const [ cas, setCas ] = useState()

  useEffect(() => {
    extractTextFromPDF({
      url: process.env.REACT_APP_PDF_PATH,
      password: process.env.REACT_APP_PDF_PASSWORD
    })
      .then(text => {
        const casJson = getJsonFromTxt(text)
        setCas(casJson)
      })

  }, [])

  return cas
}

async function extractTextFromPDF(pdfPath) {
  const loadingTask = getDocument(pdfPath);
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  let text = '';

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const pageText = await page.getTextContent();
    pageText.items.forEach(item => {
      text += item.str;
      if (item.hasEOL) {
        text += '\n'
      }
    });
  }

  return text;
}

export default CAS;
