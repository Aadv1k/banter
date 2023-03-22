import {
  createElement as h,
  Component,
} from "https://unpkg.com/preact@latest?module";
import htm from "https://unpkg.com/htm@latest?module";

import { toast } from "/js/Toast.js"

const html = htm.bind(h);

export default class PageShare extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      podcasts: [],
      user: {},
      rss: null,
    };
    this.handleEditorClick = this.handleEditorClick.bind(this);
    this.handleClipboardClick = this.handleClipboardClick.bind(this);
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
            id: e,
            ...vals[0][e]
          }
        }),
        user: vals[1]
      });

    })
  }


  handleClipboardClick(e) {
    const url = new URL(window.location.href);
    const rssURL = `${url.protocol}//${url.host}${e.currentTarget.getAttribute("data-url")}`
    navigator.clipboard.writeText(rssURL);
    toast("RSS url copied to your clipboard", "success");
  }

  handleEditorClick(e) {
    const podcastID =  e.currentTarget.parentElement.parentElement.getAttribute("data-podcast");
    const userID = this.state.user.id;


    let rssBlob = this.state.rss ?? {};
    fetch(`/rss?userID=${userID}&podcastID=${podcastID}`)
      .then(res => res.text())
      .then(data => {
        rssBlob[podcastID] = [data, `/rss?userID=${userID}&podcastID=${podcastID}`];
        this.setState({rss: rssBlob});
      })
  }

  render() {
    return html`
        <section class="share">

      ${this.state.podcasts.map(podcast => {
        return html`
          <div class="share__itm">

            <div class="itm__title">
              <h2> ${podcast.title} </h2>
              <img class="title__bg" src=${podcast.cover} />
            </div>

            <div class="editor itm__editor " data-podcast=${podcast.id}>
              <div class="editor__header">
                <button class="btn editor__btn" onClick=${this.handleEditorClick}>
                  Generate
                </button>
                ${this.state.rss?.[podcast.id]?.[0] && html`
               <div class="editor__url">${this.state.rss?.[podcast.id]?.[1]}</div>
                <button class="btn editor__btn" data-url=${this.state.rss?.[podcast.id]?.[1]} onClick=${this.handleClipboardClick}>
                  <i class="bi bi-clipboard2"></i>
                </button>
                `}
              </div>

              <pre class="editor__code">
                <code>
                ${this.state.rss?.[podcast.id]?.[0] ?? "Nothing to see here yet."}
                </code>
              </pre>
            </div>
          
          </div>
          `
      })}

          </section>

    `;
  }
}
