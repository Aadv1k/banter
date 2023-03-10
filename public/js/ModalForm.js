import {
  createElement as h,
  Component,
} from "https://unpkg.com/preact@latest?module";
import htm from "https://unpkg.com/htm@latest?module";

const html = htm.bind(h);
import { toast } from "/js/Toast.js";

export default class ModalForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      epNumber: [],
      numInvalid: false,
    }
    this.handleSubmit = this.handleSubmit.bind(this);
  }


  handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);

    const formSelect = document.getElementById("formSelect");
    const selectedPodcastName = formSelect.options?.[formSelect.selectedIndex]?.value;

    if (!selectedPodcastName) {
      toast("you need to select a podcast", "danger", "bi bi-exclamation-triangle-fill");
      return;
    }
    const selectedPodcastId = this.props.podcasts.find(e => e[0] === selectedPodcastName);
    console.log(selectedPodcastId);

    if (!Number(formProps.epNumber)) {
      toast("episode number invalid!", "danger", "bi bi-exclamation-triangle-fill");
      return;
    }

    if (formProps.epTitle.length > 64) {
      toast("Episode title can't exceed 64 characters", "danger", "bi bi-exclamation-triangle-fill");
      return;
    }

    if (formProps.epAudio.type != "audio/aac") {
      toast("Invalid audio file format; only aac accepted", "danger", "bi bi-exclamation-triangle-fill");
      return;
    }
  }

  render() {
    return html`
      <div class="episode-modal">
        <button class="btn modal__close" onClick=${this.props.setModal}>
          <i class="bi bi-x-lg"></i>
        </button>

        <h2 class="modal__title">${this.props.title}</h2>
        <div class="modal__content">
          <form action="" class="modal__form" onSubmit=${this.handleSubmit}>

            <div class="field select modal__select form__itm" >
              <select id="formSelect">
                ${this.props.podcasts.map(e => html`<option>${e[0]}</option>`)}
              </select>
            </div> 

            <div class="field">
              <p class="label" for="epTitle">Title</p>
              <input class="input" type="text" name="epTitle" required>
            </div> </div>

            <div class="field">
              <label class="label" for="epNumber">Episode number</label>
              <input class="input" type="tel" name="epNumber" required>
            </div> </div>

          <div class="field form__file">
            <label class="label" for="epAudio">Audio in <code>aac</code> format</label>
            <input type="file" name="epAudio">
          </div></div>

          <div class="field form__itm">
            <label class="label" for="epExplicit">Does the episode include use of profanity?</label>
            <input class="checkbox" type="checkbox" name="epExplicit" required>
          </div></div>

        

            <button class="btn btn--submit" type="submit">Submit</button>
          </form>
        </div>
      </div>
    `;
  }
}
