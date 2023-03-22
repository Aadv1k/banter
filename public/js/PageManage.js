import {
  createElement as h,
  Component,
} from "https://unpkg.com/preact@latest?module";
import htm from "https://unpkg.com/htm@latest?module";


import ModalEpisode from "/js/ModalEpisode.js";
import Modal from "/js/Modal.js";
import { toast } from "/js/Toast.js";

const html = htm.bind(h);

export default class PageCreate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      podcasts: [],
      episodeID: null,
      podcastID: null,
      showEpisodeEditModal: false,
      showPodcastEditModal: false,
      showEpisodeDeleteModal: false,
    };
    this.handleEpisodeEditClick = this.handleEpisodeEditClick.bind(this);
    this.handleEpisodeDeleteClick = this.handleEpisodeDeleteClick.bind(this);
    this.handleEpisodeDelete = this.handleEpisodeDelete.bind(this);

    this.setEpisodeEditModal = this.setEpisodeEditModal.bind(this);
    this.setPodcastEditModal = this.setPodcastEditModal.bind(this);
    this.setEpisodeDeleteModal = this.setEpisodeDeleteModal.bind(this);
    this.setEpisodeDelete = this.setEpisodeDelete.bind(this);
  }

  setEpisodeDelete(o) {
    this.setState({deleteEpisode: o ?? true});
  }

  setEpisodeEditModal() {
    this.setState({showEpisodeEditModal: !this.state.showEpisodeEditModal});
  }

  setPodcastEditModal() {
    this.setState({showPodcastEditModal: !this.state.showPodcastEditModal});
  }

  setEpisodeDeleteModal() {
    this.setState({showEpisodeDeleteModal: !this.state.showEpisodeDeleteModal});
  }

  handleEpisodeDelete(episodeID, podcastID) {
    fetch(`/deleteEpisode?episodeID=${episodeID}&podcastID=${podcastID}`, {method: "DELETE"})
      .then(res => {
        if (res.status !== 200) {
          toast("was unable to delete the episode", "warn", "bi bi-exclamation-triangle");
          return;
        }
        window.location.reload(false);
      })
  }

  handleEpisodeDeleteClick(e) {
    const episodeID = e.currentTarget.parentElement.getAttribute('data-ep');
    const podcastID = e.currentTarget.parentElement.getAttribute('data-podcast');

    if (!episodeID || !podcastID) {
      toast("episode or podcast ID not found, try refreshing the page", "warn", "bi bi-exclamation-triangle");
      return;
    }

    this.setState({episodeID: episodeID, podcastID: podcastID})
    this.setEpisodeDeleteModal();
  }

  handleEpisodeEditClick(e) {
    const episodeID = e.currentTarget.parentElement.getAttribute('data-ep');
    const podcastID = e.currentTarget.parentElement.getAttribute('data-podcast');

    if (!episodeID || !podcastID) {
      toast("episode or podcast ID not found, try refreshing the page", "warn", "bi bi-exclamation-triangle");
      return;
    }

    let episode;

    for (let podcast of this.state.podcasts) {
      if (podcast.id !== podcastID) continue;
      episode = podcast.episodes.find(ep => ep.id === episodeID);
    } 

    if (!episode) {
      toast("unable to fetch the epsiodes at the moment", "warn");
      return;
    }

    this.setState({showEpisodeEditModal: true, defaultEpisodeData: episode, podcastID, });
  }

  componentDidMount() {
    fetch("/getPodcast")
      .then((d) => d.json())
      .then((data) => {
        const podcastData = data;
        if (Object.keys(podcastData).length != 0) {
          this.setState({
            podcasts: Object.keys(podcastData).map((e) => {
              return { id: e, ...podcastData[e] };
            }),
            hasPodcasts: true,
          });
        }
      }).catch(err => console.log(err));
  }

  render() {
    return html`

${this.state.showEpisodeDeleteModal && html`
<${Modal} setModal=${this.setEpisodeDeleteModal} delete=${this.handleEpisodeDelete} podcastID=${this.state.podcastID} episodeID=${this.state.episodeID}/>
` }

${this.state.showEpisodeEditModal && html`
<${ModalEpisode} setModal=${this.setEpisodeEditModal} isEditModal=${true} defaultEpisodeData=${this.state.defaultEpisodeData} podcastID=${this.state.podcastID} />
` }
      <section class="manage">
        ${this.state.podcasts.map((podcast) => {
          return html`<div class="manage__itm">
            <div class="itm__title">
              <h2>${podcast.title}</h2>
              <img class="title__bg" src=${podcast.cover}></img>
            </div>
            <ul class="itm__list">
              ${podcast?.episodes?.length > 0
                ? podcast.episodes.map((episode) => {
                    return html`
                      <li class="list__itm">
                        <div class="itm__content">
                          <strong>EP#${episode.number}: ${episode.title}</strong>
                          <p>${episode.description}</p>
                        </div>

                        <div class="itm__control"  data-ep=${episode.id} data-podcast=${podcast.id}>
                          <button class="btn btn--primary" onClick=${this.handleEpisodeEditClick}>
                            <i class="bi bi-pencil"></i>
                          </button>

                          <button class="btn btn--secondary" onClick=${this.handleEpisodeDeleteClick}>
                            <i class="bi bi-x-lg"></i>
                          </button>
                        </div>
                      </li>
                    `;
                  })
                : html`<li class="list__itm list__itm--disabled">
                    <p>No episode found!</p>
                  </li>`}
            </ul>
          </div>`;
        })}
      </section>
    `;
  }
}
