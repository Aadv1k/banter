import { createElement as h, Component } from "https://unpkg.com/preact@latest?module";
import htm from "https://unpkg.com/htm@latest?module";

const html = htm.bind(h);

export function toast(text, varient, icon, interval) {
  document.getElementById("toastElem")?.remove();
  interval = interval ?? 3000;
  toast;
  const t = document.createElement("div");
  t.setAttribute("id", "toastElem");
  t.classList.add("toast");
  t.classList.add("toast--show");
  t.classList.add(varient ? "toast--" + varient : "toast--info");

  const btn = document.createElement("button");
  btn.classList.add("btn");
  btn.classList.add("toast__btn");
  btn.innerHTML = '<i class="bi bi-x"></i>';

  t.appendChild(btn);

  const toastIcon = document.createElement("div");
  toastIcon.classList.add("toast__icon");
  toastIcon.innerHTML = `<i class="${icon ?? ""}"></i>`;

  t.appendChild(toastIcon);

  const toastContent = document.createElement("p");
  toastContent.innerText = text;

  t.appendChild(toastContent);

  setTimeout(() => {
    t?.classList.add("toast--hide");
    setTimeout(() => {
      t?.remove();
    }, 500);
  }, interval);

  btn.addEventListener("click", () => {
    document.getElementById("toastElem")?.classList.add("toast--hide");
  });

  document.body.insertAdjacentElement("afterbegin", t);
}

export default class Toast extends Component {
  constructor(props) {
    super(props);
    this.state = { toastOpen: true };
    this.toggleToast = this.toggleToast.bind(this);

    setTimeout(() => {
      this.setState({ toastOpen: false });
    }, this.props.interval ?? 3000);
  }

  toggleToast() {
    this.setState({ toastOpen: !this.state.toastOpen });
  }

  render() {
    return html`
      <div
        class="toast ${this.props.varient ? "toast--" + this.props.varient : "toast--info"} ${this
          .state.toastOpen
          ? "toast--open"
          : "toast--close"}"
      >
        <button class="btn toast__btn" onClick=${this.toggleToast}></button>

        ${this.props.icon
          ? html`
              <div class="toast__icon">
                <i class=${this.props.icon}></i>
              </div>
            `
          : ``}
        <p class="toast__content">${this.props.text}</p>
      </div>
    `;
  }
}
