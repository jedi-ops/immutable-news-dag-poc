import 'regenerator-runtime/runtime';
import { Buffer } from 'buffer';
import process from 'process';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

window.Buffer = Buffer;
window.process = process;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);