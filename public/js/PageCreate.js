import { createElement as h, Component, } from "https://unpkg.com/preact@latest?module";
import htm from "https://unpkg.com/htm@latest?module";

import ModalForm from "/js/ModalForm.js";

const html = htm.bind(h);

export default class PageCreate extends Component {
  constructor(props) {
    super(props);
    this.state = { modalOpen: true };
    this.setModal = this.setModal.bind(this);
  }

  setModal() {
    if (this.state.modalOpen) {
      this.setState({ modalOpen: false });
      return;
    }
    this.setState({ modalOpen: true });
  };

  render() {
    return html`
      ${this.state.modalOpen
        ? html`<${ModalForm} setModal=${this.setModal} title="new episode"/>`
        : html``}

      <section class="create">
        <button class="btn btn--primary" onClick=${this.setModal}>
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
