import CAS from './utils/CAS';

function App() {
  const cas = CAS()

  return (
    <>{JSON.stringify(cas)}</>
  )
}

export default App;
