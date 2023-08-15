import { useEffect, useState } from 'react';
import getJsonFromTxt from './getJsonFromTxt';

function CAS() {
  const [ cas, setCas ] = useState()

  useEffect(() => {
    fetch('/CAS.txt')
    .then((r) => r.text())
    .then(t  => {
      const casJson = getJsonFromTxt(t)
      setCas(casJson)
    })
  }, [])

  return cas
}

export default CAS;
