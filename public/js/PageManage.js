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
      podcasts: []
    };
  }

  componentDidMount() {
    fetch("/getPodcast")
      .then(d => d.json())
      .then(data => {
        const podcastData = data;
        if (Object.keys(podcastData).length != 0) {
          this.setState({hasPodcasts: true});
          this.setState({
            podcasts: Object.keys(podcastData).map(e => {
              return { id: e, ...podcastData[e]}
            })
          })
        }})

    console.log(this.state.podcasts);
  }


  render() {
    return html`

    <section class="manage">


${this.state.podcasts.map(podcast => {
  return html`

    <div class="manage__itm">
    <h2 class="itm__title">${podcast.title}</h2>
    <ul class="itm__list">
      ${podcast?.episodes?.map(episode => {
        return html`
      <li class="list__itm">
        <p class="itm__title">${episode.title}</p>
      </li>
        `
      })}
    </ul>
  </div>`

})} 



    </section>


    <h1>Hello world</h1>
    `;
  }
}
