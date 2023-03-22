import {
  createElement as h,
  Component,
} from "https://unpkg.com/preact@latest?module";
import htm from "https://unpkg.com/htm@latest?module";

import ModalEpisode from "/js/ModalEpisode.js";
import { toast } from "/js/Toast.js";

const html = htm.bind(h);

export default class PageCreate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      podcasts: [],
      episodeID: null,
      podcastID: null,
      showEditModal: false,
    };
    this.handleEditClick = this.handleEditClick.bind(this);
    this.setEditModal = this.setEditModal.bind(this);
  }

  setEditModal() {
    console.log(this.state.showEditModal);
    this.setState({showEditModal: !this.state.showEditModal});
  }


  handleEditClick(e) {
    console.log(e.currentTarget)
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
    this.setState({showEditModal: true, defaultEpisodeData: episode, podcastID, });
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
            podcasts: Object.keys(podcastData).map((e) => {
              return { id: e, ...podcastData[e] };
            }),
          });
        }
      }).catch(err => console.log("shit"));
  }

  render() {
    return html`

${this.state.showEditModal ? html`
<${ModalEpisode} setModal=${this.setEditModal} isEditModal=${true} defaultEpisodeData=${this.state.defaultEpisodeData} podcastID=${this.state.podcastID} />
` : ``}

      <section class="manage">
        ${this.state.podcasts.map((podcast) => {
          return html`<div class="manage__itm">
            <h2 class="itm__title">${podcast.title}</h2>
            <ul class="itm__list">
              ${podcast?.episodes?.length > 0
                ? podcast.episodes.map((episode) => {
                    return html`
                      <li class="list__itm">
                        <p>${episode.title}</p>
                        <div class="itm__control"  data-ep=${episode.id} data-podcast=${podcast.id}>
                          <button class="btn btn--primary" onClick=${this.handleEditClick}>
                            <i class="bi bi-pencil-fill"></i>
                          </button>

                          <button class="btn btn--secondary">
                            <i class="bi bi-trash-fill"></i>
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
