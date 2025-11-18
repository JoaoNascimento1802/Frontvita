import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import logoPetVita from './assets/images/Header/LogoPet_vita_Atualizado_-removebg-preview.png';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

document.title = 'Pet Vita';

const ensureLink = (rel) => {
  let link = document.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  return link;
};

const favicon = ensureLink('icon');
favicon.setAttribute('type', 'image/png');
favicon.setAttribute('sizes', '32x32');
favicon.setAttribute('href', logoPetVita);

const appleTouch = ensureLink('apple-touch-icon');
appleTouch.setAttribute('sizes', '180x180');
appleTouch.setAttribute('href', logoPetVita);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
