import {
  createElement as h,
  Component,
} from "https://unpkg.com/preact@latest?module";
import htm from "https://unpkg.com/htm@latest?module";

import ModalEpisode from "/js/ModalEpisode.js";
import ModalPodcast from "/js/ModalPodcast.js";
import { toast } from "/js/Toast.js";

const html = htm.bind(h);

export default class PageShare extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      podcasts: [],
      user: {},
    };
  }

  componentDidMount() {
    Promise.all([
      new Promise((resolve, _) => {
        fetch("/getPodcast")
          .then(res => res.json())
          .then(data => resolve(data))
      }),

      new Promise((resolve, _) => {
        fetch("/userinfo")
          .then(res => res.json())
          .then(data => resolve(data))
      })
    ]).then(vals => {
      this.setState({
        podcasts: Object.keys(vals[0]).map(e => {
          return {
            e,
            ...vals[0][e]
          }
        }),
        user: vals[1]
      });

    })
  }


  render() {
    console.log(this.state);
    /*

    color: $text-clr-1;
    font-size: clamp(2.5rem, 10vw, 3.5rem);
    width: 100%;
    white-space: nowrap;
    */
    return html`

      <section class="share">

        <div class="share__itm">
          <div class="itm__title">hello</div>
        </div>
      </section>

    `;
  }
}
