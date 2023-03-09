import { createElement as h, Component, } from "https://unpkg.com/preact@latest?module";
import htm from "https://unpkg.com/htm@latest?module";

const html = htm.bind(h);

export default class ModalForm extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return html`
      <div class="modal episode-modal">

        <button class="btn modal__close" onClick=${this.props.setModal}>
          <i class="bi bi-x-lg"></i>
        </button>

        <div class="modal__content">
          <h2 class="modal__title">${this.props.title}</h2>

          <form action="" class="form">
            <div class="form__itm">
              <label for="epTitle">Title</label>
              <input type="text" name="epTitle">
            </div> </div>

            <div class="form__itm">
              <label for="epNumber">Episode Number</label>
              <input type="number" name="epNumber">
          </div> </div>

            <div class="form__itm">
              <label for="epExplicit">Explicit</label>
              <input type="checkbox" name="epExplicit">
          </div> </div>

            <div class="form__itm">
              <label for="epAudio">Audio</label>
              <input type="file" name="epAudio">
          </div> </div>


          </form>
        </div>
      </div>
    `;
  }
}
