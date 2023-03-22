import {
  createElement as h,
  Component,
} from "https://unpkg.com/preact@latest?module";
import htm from "https://unpkg.com/htm@latest?module";

const html = htm.bind(h);

export default class Modal extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return html`
      <div class="modal">
        <h2 class="modal__title-normal">
          Are you sure you want to delete this episode?
        </h2>
        <button class="btn modal__close" onClick=${this.props.setModal}>
          <i class="bi bi-x-lg"></i>
        </button>

        <div class="modal__control">
          <button class="btn btn--primary" onClick=${() => {
          this.props.delete(this.props.episodeID, this.props.podcastID)
          }}>
            yes
          </button>

          <button class="btn btn--secondary" onClick=${this.props.setModal}>
            no
          </button>
        </div>
      </div>
    `;
  }
}
