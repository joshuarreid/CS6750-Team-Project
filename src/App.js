import './App.css';
import IPhoneFrame from './components/IPhoneFrame';
import PrototypeShell from './screens/PrototypeShell';

function App() {
  return (
    <div className="App">
      <IPhoneFrame title="CS6750 Prototype">
        <PrototypeShell />
      </IPhoneFrame>
    </div>
  );
}

export default App;
