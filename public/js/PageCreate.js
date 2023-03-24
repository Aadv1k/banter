import { createElement as h, Component } from "https://unpkg.com/preact@latest?module";
import htm from "https://unpkg.com/htm@latest?module";

import ModalEpisode from "/js/ModalEpisode.js";
import ModalPodcast from "/js/ModalPodcast.js";
import { toast } from "/js/Toast.js";

const html = htm.bind(h);

export default class PageCreate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      episodeModalOpen: false,
      podcastModalOpen: false,
      hasPodcasts: false,
      podcasts: []
    };
    this.setEpisodeModal = this.setEpisodeModal.bind(this);
    this.setPodcastModal = this.setPodcastModal.bind(this);
  }

  setPodcastModal() {
    this.setState({
      modalOpen: false,
      podcastModalOpen: !this.state.podcastModalOpen
    });
  }

  componentDidMount() {
    fetch("/getPodcast", {
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    })
      .then((d) => d.json())
      .then((data) => {
        const podcastData = data;
        if (Object.keys(podcastData).length != 0) {
          this.setState({ hasPodcasts: true });
          this.setState({
            podcasts: Object.keys(podcastData).map((e) => [podcastData[e].title, e])
          });
          return;
        }
      })
      .catch((err) => console.log("shit"));
  }

  setEpisodeModal() {
    fetch("/getPodcast", {
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    })
      .then((d) => d.json())
      .then((data) => {
        const podcastData = data;
        if (Object.keys(podcastData).length != 0) {
          this.setState({ hasPodcasts: true });
          this.setState({
            podcasts: Object.keys(podcastData).map((e) => [podcastData[e].title, e])
          });
          return;
        }
      })
      .catch((err) => console.log("shit"));

    if (!this.state.hasPodcasts) {
      toast("No podcasts found for the user", "danger", "bi bi-exclamation-circle");
      return;
    }
    this.setState({ episodeModalOpen: !this.state.episodeModalOpen });
  }

  render() {
    return html`
      ${this.state.episodeModalOpen
        ? html`<${ModalEpisode} setModal=${this.setEpisodeModal} podcasts=${this.state.podcasts} />`
        : ``}
      ${this.state.podcastModalOpen
        ? html`<${ModalPodcast} setModal=${this.setPodcastModal} />`
        : ``}

      <section class="create">
        <button class="btn btn--primary" onClick=${this.setEpisodeModal}>
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
