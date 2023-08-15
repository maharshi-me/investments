import CAS from './utils/CAS';

function App() {
  const cas = CAS()

  console.log(cas)

  return (
    <>{JSON.stringify(cas)}</>
  )
}

export default App;
