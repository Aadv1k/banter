import { createElement as h, render } from "https://unpkg.com/preact@latest?module";
import htm from "https://unpkg.com/htm@latest?module";
import App from "/js/App.js";
import { toast } from "/js/Toast.js";

const page = document.getElementById("page");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

if (page) {
  const html = htm.bind(h);
  render(html`<${App} />`, page);
}

for (let form of [
  [loginForm, "/login"],
  [signupForm, "/signup"]
]) {
  if (form[0] === null) {
    continue;
  }

  form[0].addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    const formKeys = Object.keys(formProps);

    if (!formKeys.every((e) => formProps[e] ?? false)) {
      toast("you need to fill all the data", "warn", "bi bi-exclamation-triangle-fill");
      return;
    }

    const postData = new FormData();

    for (let i = 0; i < formKeys.length; i++) {
      postData.append(formKeys[i], formProps[formKeys[i]]);
    }

    const response = await fetch(`${form[1]}`, {
      method: "POST",
      body: postData
    });

    if (response.status !== 200) {
      const data = await response.json();
      toast(data.message, "danger", "bi bi-exclamation-triangle");
      return;
    }

    const url = response.url;
    window.location.replace(url);
  });
}
