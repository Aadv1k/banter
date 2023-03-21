import {
  createElement as h,
  Component,
} from "https://unpkg.com/preact@latest?module";
import htm from "https://unpkg.com/htm@latest?module";

const html = htm.bind(h);
import { toast } from "/js/Toast.js";

export default class ModalEpisode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      epNumber: [],
      numInvalid: false,
      showLoader: false,
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

    if (!Number(formProps.number)) {
      toast("episode number invalid!", "danger", "bi bi-exclamation-triangle-fill");
      return;
    }

    if (formProps.title.length > 64) {
      toast("Episode title can't exceed 64 characters", "danger", "bi bi-exclamation-triangle-fill");
      return;
    }

    if (formProps.audio.type.split('/').shift() != "audio") {
      toast("Invalid audio file format!", "danger", "bi bi-exclamation-triangle-fill");
      return;
    }

    this.setState({showLoader: true});

    const postFormData = new FormData();
    postFormData.append("audio", formProps.audio);
    postFormData.append("title", formProps.title);
    postFormData.append("number", formProps.number);
    postFormData.append("description", formProps.desc);
    postFormData.append("podcastID", selectedPodcastName);
    postFormData.append("explicit", formProps.epExplicit === "on");

    const res = await fetch("/createEpisode", {
      method: "POST",
      body: postFormData
    });
    if (res.status !== 200) {
      toast("Something went wrong", "danger", "bi bi-exclamation-triangle-fill");
      this.setState({showLoader: false});
      return;
    }

    const { data } = await res.json();
    toast(`Created episode with id ${data.id}`, "success", "bi bi-check-circle-fill");
    this.setState({showLoader: false});
  }

  render() {
    return html`
      <div class="modal episode-modal">
        <button class="btn modal__close" onClick=${this.props.setModal}>
          <i class="bi bi-x-lg"></i>
        </button>

        <h2 class="modal__title">new episode</h2>
        <div class="modal__content">
          <form action="" class="modal__form form" onSubmit=${this.handleSubmit}>

            <div class="form__itm form__select" >
              <select id="formSelect">
                <option selected disabled>Select your podcast</option>
                ${this.props.podcasts.map(e => html`<option value="${e[1]}">${e[0]}</option>`)}
              </select>
            </div> 

            <div class="form__itm">
              <label for="title">Title</label>
              <input  type="text" name="title" required>
            </div></div>


            <div class="form__itm">
              <label for="desc">Description</label>
              <input class="input" type="text" name="desc" required>
            </div></div>

            <div class="form__itm">
              <label class="label" for="number">Episode number</label>
              <input class="input" type="tel" name="number" required>
            </div> </div>

          <div class="form__itm form__file">
            <label class="label" for="audio">
              Audio for your podcast
            </label>
            <p class="form__uploaded-name">${this.state.selectedFile}</p>
            <i class="bi bi-file-earmark-music"></i>
            <input type="file" name="audio" accept="audio/mp3, audio/mpeg, audio/aac" onChange=${this.handleFileInput}>
          </div></div>

          <div class="form__itm form__check">
            <label class="label" for="explicit">Does the episode include use of profanity?</label>
            <input class="checkbox" type="checkbox" name="explicit">
          </div></div>

            <button class="btn btn--submit btn--loader" type="submit" ${this.state.showLoader ? "disabled" : ""}>
            ${this.state.showLoader ? html`<span class="loader"></span>` : `Submit`}
            </button>
          </form>
        </div>
      </div>
    `;
  }
}
