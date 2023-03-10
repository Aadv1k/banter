import {
  createElement as h,
  Component,
} from "https://unpkg.com/preact@latest?module";
import htm from "https://unpkg.com/htm@latest?module";

import ModalForm from "/js/ModalForm.js";
import { toast } from "/js/Toast.js";

const html = htm.bind(h);

export default class PageCreate extends Component {
  constructor(props) {
    super(props);
    this.state = { modalOpen: false, hasPodcasts: false, toastOpen: false};
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    fetch("/userinfo")
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          this.setState({hasPodcasts: false});
          return;
        }
        this.setState({hasPodcasts: true});
      })

  }

  handleClick() {
    if (this.state.hasPodcasts) {
      this.setState({ modalOpen: !this.state.modalOpen });
      return;
    }

    if (!this.state.toastOpen) {
      this.setState({toastOpen: true});
    } else {
      this.setState({toastOpen: false});
    }
  }

  render() {
    return html`
      ${this.state.toastOpen
        ? html`<${Toast} varient="danger" text="No podcasts found!" icon="bi bi-exclamation-triangle"/>`
        : html``}

      ${this.state.modalOpen
        ? html`<${ModalForm} setModal=${this.handleClick} title="new episode" />`
        : html``}

      <section class="create">
        <button class="btn btn--primary" onClick=${this.handleClick}>
          <i class="bi bi-plus-lg"></i>
          <p>new episode</p>
        </button>

        <button class="btn btn--secondary">
          <i class="bi bi-mic"></i>
          <p>new podcast</p>
        </button>
      </section>
    `;
  }
}
