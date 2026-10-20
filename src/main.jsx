import {createRoot} from 'react-dom/client';
import './styles.css';
import App from './App.jsx';
import {loadRelease} from './release.js';

loadRelease().finally(()=>createRoot(document.getElementById('root')).render(<App/>));
