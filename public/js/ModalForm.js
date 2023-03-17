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
      selectedFile: "No file selected",
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFileInput = this.handleFileInput.bind(this);
  }

  handleFileInput(e) {
    const filename = e.target.value.split('\\').pop();
    this.setState({selectedFile: filename});
  }


  async handleSubmit(e) {
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

    if (!Number(formProps.epNumber)) {
      toast("episode number invalid!", "danger", "bi bi-exclamation-triangle-fill");
      return;
    }

    if (formProps.epTitle.length > 64) {
      toast("Episode title can't exceed 64 characters", "danger", "bi bi-exclamation-triangle-fill");
      return;
    }

    if (formProps.epAudio.type.split('/').shift() != "audio") {
      toast("Invalid audio file format!", "danger", "bi bi-exclamation-triangle-fill");
      return;
    }


    const postFormData = new FormData();
    postFormData.append("audio", formProps.epAudio);
    postFormData.append("title", formProps.epTitle);
    postFormData.append("number", formProps.epNumber);
    postFormData.append("description", formProps.epDescription);
    postFormData.append("podcastID", selectedPodcastName);
    postFormData.append("explicit", formProps.epExplicit === "on");

    const res = await fetch("/createEpisode", {
      method: "POST",
      body: postFormData
    });
    const data = await res.json();
    console.log(data);
  }



  render() {
    return html`
      <div class="episode-modal">
        <button class="btn modal__close" onClick=${this.props.setModal}>
          <i class="bi bi-x-lg"></i>
        </button>

        <h2 class="modal__title">${this.props.title}</h2>
        <div class="modal__content">
          <form action="" class="modal__form form" onSubmit=${this.handleSubmit}>

            <div class="form__itm form__select" >
              <select id="formSelect">
                ${this.props.podcasts.map(e => html`<option>${e[0]}</option>`)}
              </select>
            </div> 

            <div class="form__itm">
              <label for="epTitle">Title</label>
              <input  type="text" name="epTitle" required>
            </div> </div>


            <div class="form__itm">
              <label for="epDesc">Description</label>
              <input class="input" type="text" name="epDesc" required>
            </div> </div>

            <div class="form__itm">
              <label class="label" for="epNumber">Episode number</label>
              <input class="input" type="tel" name="epNumber" required>
            </div> </div>

          <div class="form__itm form__file">
            <label class="label" for="epAudio">
              Audio for your podcast
            </label>
            <p class="form__uploaded-name">${this.state.selectedFile}</p>
            <i class="bi bi-file-earmark-music"></i>
            <input type="file" name="epAudio" accept="audio/mp3, audio/mpeg, audio/aac" onChange=${this.handleFileInput}>
          </div></div>

          <div class="form__itm form__check">
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
