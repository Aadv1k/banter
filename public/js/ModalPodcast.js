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
      showLoader: false,
      selectedFile: "No file selected",
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFileInput = this.handleFileInput.bind(this);

    this.languageMap = new Map([
      ["English", "en-us"],
      ["British English", "en-gb"],
      ["Spanish (Spain)", "es-es"],
      ["Spanish (Mexico)", "es-mx"],
      ["French (France)", "fr-fr"],
      ["French (Canada)", "fr-ca"],
      ["German", "de-de"],
      ["Portuguese (Brazil)", "pt-br"],
      ["Portuguese (Portugal)", "pt-pt"],
      ["Italian", "it-it"],
      ["Japanese", "ja-jp"],
      ["Korean", "ko-kr"],
      ["Chinese (Simplified)", "zh-cn"],
      ["Chinese (Traditional)", "zh-tw"],
      ["Arabic (Saudi Arabia)", "ar-sa"],
      ["Russian", "ru-ru"],
      ["Turkish", "tr-tr"],
      ["Polish", "pl-pl"],
      ["Dutch", "nl-nl"],
      ["Swedish", "sv-se"],
      ["Finnish", "fi-fi"],
      ["Danish", "da-dk"],
      ["Norwegian", "no-no"],
    ]);
  }

  handleFileInput(e) {
    const filename = e.target.value.split("\\").pop();
    this.setState({ selectedFile: filename });

    const file = e.target.files[0];
    if (file) {
      const fr = new FileReader();
      fr.readAsDataURL(file);
      fr.addEventListener("load", () => {
        this.setState({ selectedCover: fr.result });
      });
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    let formSelect, selectedLanguage;

    if (!this.props.isEditModal) {
      if (formProps.cover.type.split("/").shift() != "image") {
        toast(
          "Invalid image file format!",
          "danger",
          "bi bi-exclamation-triangle-fill"
        );
        return;
      }

      formSelect = document.getElementById("formSelect");
      selectedLanguage =
        formSelect.options?.[formSelect.selectedIndex]?.value;
      if (!selectedLanguage) {
        toast(
          "you need to select a language for your podcast",
          "danger",
          "bi bi-exclamation-triangle-fill"
        );
        return;
      }
    }

    if (formProps.title.length > 64) {
      toast(
        "Podcast title can't exceed 64 characters",
        "danger",
        "bi bi-exclamation-triangle-fill"
      );
      return;
    }
    this.setState({ showLoader: true });

    const postFormData = new FormData();
    for (let formItm in formProps) {
      if (formProps[formItm] === "undefined") continue;
      postFormData.append(formItm, formProps[formItm]);
    }

    postFormData.append("explicit", formProps.explicit === "on");

    let res;
    if (this.props.isEditModal) {
      postFormData.append("podcastID", this.props.podcastID);

      console.log("hello, I was initiated");

      res = await fetch("/updatePodcast", {
        method: "PUT",
        body: postFormData,
      });

    } else {
      res = await fetch("/createPodcast", {
        method: "POST",
        body: postFormData,
      });
    }

    if (res.status !== 200) {
      toast(
        "Something went wrong",
        "danger",
        "bi bi-exclamation-triangle-fill"
      );
      this.setState({ showLoader: false });
      return;
    }

    const { data } = await res.json();
    console.log(data);
    toast(
      this.props.isEditModal
        ? `Updated new podcast with id ${data.podcastID}`
        : `Created new podcast with id ${data.id}`,
      "success",
      "bi bi-check-circle-fill"
    );
    this.setState({ showLoader: false });
    window.location.reload(false)
    this.props.setModal();
  }

  render() {
    return html`
      <div class="modal podcast-modal">
        <button class="btn modal__close" onClick=${this.props.setModal}>
          <i class="bi bi-x-lg"></i>
        </button>


        <h2 class="modal__title">${
          this.props.isEditModal ? "Update podcast" : "new podcast"
        }</h2>
        
        <div class="modal__content">
          <form action="" class="modal__form form" onSubmit=${
            this.handleSubmit
          }>



        ${
          this.props.isEditModal
            ? ""
            : html`
                <div class="form__itm form__select modal__select">
                  <select
                    name="language"
                    default="Choose a language for your podcast"
                    id="formSelect"
                  >
                    <option value="" disabled selected>
                      Select your language
                    </option>
                    ${Array.from(this.languageMap).map(
                      (e) => html`<option value="${e[1]}">${e[0]}</option>`
                    )}
                  </select>
                </div>
              `
        }

            <div class="form__itm">
              <label for="title">Title</label>
              <input value=${
                this.props.isEditModal && this.props?.defaultPodcastData?.title
              } type="text" name="title" required>
            </div> </div>


            <div class="form__itm">
              <label for="description">Description</label>
              <input value=${this.props.isEditModal && this.props?.defaultPodcastData?.description} class="input" type="text" name="description" required>
            </div></div>

            <div class="form__itm">
              <label for="category">Category</label>
              <input value=${
                this.props.isEditModal &&
                this.props?.defaultPodcastData?.category
              } class="input" type="text" name="description" required>
            </div> </div>

${
  this.props.isEditModal ??
  html`
          <div class="form__itm form__file">
            <label class="label" for="cover">
              Cover for your podcast
            </label>
            <span class="form__uploaded-bg">
            ${
              this.state.selectedCover
                ? html`<img src="${this.state.selectedCover}" />`
                : ""
            }
            </span>
            <p class="form__uploaded-name">${this.state.selectedFile}</p>
            <input type="file" name="cover" accept="image/jpeg, image/png" onChange=${
              this.handleFileInput
            }>
          </div></div>
`
}

          <div class="form__itm form__check">
            <label class="label" for="explicit">Does your podcast include profanity?</label>
            <input class="checkbox" type="checkbox" name="explicit" checked=${
              this.props?.defaultPodcastData?.explicit
            }>
          </div></div>

            <button class="btn btn--submit btn--loader" type="submit">
            ${
              this.state.showLoader
                ? html`<span class="loader"></span>`
                : `Submit`
            }
            </button>
          </form>
        </div>
      </div>
    `;
  }
}
