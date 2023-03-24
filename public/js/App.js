import { createElement as h, Component } from "https://unpkg.com/preact@latest?module";
import htm from "https://unpkg.com/htm@latest?module";
import { Router } from "https://unpkg.com/preact-router@3.0.0?module";

import PageCreate from "/js/PageCreate.js";
import PageManage from "/js/PageManage.js";
import PageShare from "/js/PageShare.js";

const html = htm.bind(h);

export default class App extends Component {
  render() {
    return html`  
    <${Router}> 
      <${PageCreate} default path="/dashboard/create" />
      <${PageManage} path="/dashboard/manage" />
      <${PageShare} path="/dashboard/share" />
    </${Router}>
    `;
  }
}
