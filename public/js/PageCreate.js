import {
  createElement as h,
  Component,
} from "https://unpkg.com/preact@latest?module";
import htm from "https://unpkg.com/htm@latest?module";

import ModalForm from "/js/ModalForm.js";
import ModalPodcast from "/js/ModalPodcast.js";
import { toast } from "/js/Toast.js";

const html = htm.bind(h);

export default class PageCreate extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      modalOpen: false, 
      podcastModalOpen: true,
      hasPodcasts: true, 
      podcasts: [],
    };
    this.setModal = this.setModal.bind(this);
    this.setPodcastModal = this.setPodcastModal.bind(this);
  }

  componentDidMount() {
    fetch("/getPodcast")
      .then(d => d.json())
      .then(data => {
        const podcastData = data;

        if (Object.keys(podcastData).length != 0) {
          this.setState({hasPodcasts: true});
          this.setState({podcasts: Object.keys(podcastData).map(e => [podcastData[e].name, e] )});
          return;
        }
      })

  }

  setPodcastModal() {
    this.setState({modalOpen: false, podcastModalOpen: !this.state.podcastModalOpen})
  }

  setModal() {
    if (!this.state.hasPodcasts) {
      toast("No podcasts found for the user", "danger", "bi bi-exclamation-circle");
      return;
    }
    this.setState({modalOpen: !this.state.modalOpen});
  }

  render() {
    return html`
     ${this.state.modalOpen
        ? html`<${ModalForm} setModal=${this.setModal} podcasts=${this.state.podcasts} title="new episode" />`
        : html``}

     ${this.state.podcastModalOpen
        ? html`<${ModalPodcast} setModal=${this.setPodcastModal} />`
        : html``}


      <section class="create">
        <button class="btn btn--primary" onClick=${this.setModal}>
          <i class="bi bi-plus-lg"></i>
          <p>new episode</p>
        </button>

        <button class="btn btn--secondary" onClick=${this.setPodcastModal}>
          <i class="bi bi-mic"></i>
          <p>new podcast</p>
        </button>
      </section>
    `;
  }
}
