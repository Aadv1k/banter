import { createElement as h, render } from "https://unpkg.com/preact@latest?module";
import htm from "https://unpkg.com/htm@latest?module";
import App from "/js/App.js";

const html = htm.bind(h);
render(html`<${App} />`, document.getElementById("page"));
