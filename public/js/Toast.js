import {
  createElement as h,
  Component,
} from "https://unpkg.com/preact@latest?module";
import htm from "https://unpkg.com/htm@latest?module";

const html = htm.bind(h);

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
      <div class="toast ${this.props.varient ? "toast--" + this.props.varient : "toast--info"} ${this.state.toastOpen ? "toast--open" : "toast--close"}" >
        <button class="btn toast__btn" onClick=${this.toggleToast}>
          <i class="bi bi-x"></i>
        </button>

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
