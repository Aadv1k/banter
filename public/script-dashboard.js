import { createElement as h, render, Component } from 'https://unpkg.com/preact@latest?module';
import htm from 'https://unpkg.com/htm@latest?module';
import { Router } from 'https://unpkg.com/preact-router@3.0.0?module';

const html = htm.bind(h);

function PageCreate(_) {
  return html`this is page create lemao`
}

function PageManage(_) {
  return html`this is page manage lemao`
}

function PagePost(_) {
  return html`this is page post lemao`
}

function App() {
  return html`
    <${Router}> 
      <${PageCreate} path="/dashboard/create" />
      <${PagePost} path="/dashboard/post" />
      <${PageManage} path="/dashboard/manage" />
    </${Router}>
    `
}

render(html`<${App}/>`, document.getElementById('page'));
