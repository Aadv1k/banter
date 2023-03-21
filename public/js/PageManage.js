import {
  createElement as h,
  Component,
} from "https://unpkg.com/preact@latest?module";
import htm from "https://unpkg.com/htm@latest?module";

import ModalEpisode from "/js/ModalEpisode.js";
import ModalPodcast from "/js/ModalPodcast.js";
import { toast } from "/js/Toast.js";

const html = htm.bind(h);

export default class PageCreate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      podcasts: [],
      episodeID: null,
      showEpisodeModal: false,
    };
    this.handleEditClick = this.handleEditClick.bind(this);
  }

  handleEditClick(e) {
    const epid = e.target.parentElement.parentElement.getAttribute('data-ep');

    if (!epid) {
      toast("episode id not found, try refreshing the page", "warning", "bi bi-exclamation-triangle");
      return;
    }

    this.setState({episodeiID: epid, showEditModal: true});
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
                        <!--
                        <div class="itm__control"  data-ep=${episode.id}>
                          <button class="btn btn--primary" onClick=${this.handleEditClick}>
                            <i class="bi bi-pencil-fill"></i>
                          </button>

                          <button class="btn btn--secondary">
                            <i class="bi bi-trash-fill"></i>
                          </button>
                        </div>
                        -->
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
