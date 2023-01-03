class Element extends HTMLElement {
  static get observedAttributes() {
    return ["data-value"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const shadow = this.shadowRoot;

    const style = document.createElement("style");
    style.innerHTML = `
      * {
        margin: 0px;
        padding: 0px;
        font-family: 'Poppins', sans serif;
        font-size: 16px;
        height: min-content;
        border: 0px;
        box-sizing: border-box;
      }

      .box-list {
        min-height: min-content;
        border: solid 1px #000;
        border-radius: 16px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        background-color: #fff;
      }

      .input-search {
        padding: 12px 16px;
        border-radius: 8px;
        border: solid 1px #000;
      }

      .box-selected {
        display: flex;
        flex-wrap: wrap;
        max-width: 100%;
        gap: 8px;
        color: #fff;
        overflow: hidden;
      }

      .box-selected li {
        width: min-content;
        background-color: #0071bc;
        padding: 4px 8px;
        border-radius: 50px;
        display: flex;
        flex-direction: row;
        gap: 8px;
        align-items: center;
      }

      .box-selected p {
        font-size: 14px;
      }

      .deleteBtn {
        padding: 2px;
        transform: rotate(45deg)
      }

      .deleteBtn:hover {
        cursor: pointer;
        color: red;
      }

      .list-options {
        max-height: 100%;
        overflow-y: scroll;
        border: solid 1px #000;
        border-radius: 8px;
      }

      .list-options::-webkit-scrollbar {
        width: 8px;
      }
  
      .list-options::-webkit-scrollbar-track { 
        border-radius: 0px;
        border-left: 1px solid rgb(0,0,0,0.1);
      }
  
      .list-options::-webkit-scrollbar-thumb {
        background: #0071BC; 
        border-radius: 10px;
      }
  
      .list-options::-webkit-scrollbar-thumb:hover {
        background: #b30000; 
      }

      .box-item {
        width: 100%;
        padding: 8px 8px;
        display: flex;
        flex-direction: row;
        gap: 8px;
        align-items: center;
      }

      .box-item:hover {
        background-color: #f1f1f1;
      }

      .label-item {
        width: 100%;
      }

      .box-item:hover, .label-item:hover, .input-item:hover {
        cursor: pointer;
      }

      .input-item {
        width: 16px;
        height: 16px;
      }
    `;

    let divGlobal = document.createElement("div");
    divGlobal.id = this.getAttribute("data-id");
    divGlobal.className = "box-list";

    let input = document.createElement("input");
    input.id = `input-${this.getAttribute("data-id")}`;
    input.className = "input-search";
    input.type = "text";
    input.placeholder = this.getAttribute("data-placeholder");

    input.addEventListener("keydown", async (e) => {
      let data = [...shadow.querySelectorAll(".box-item")];

      data.map((i) => {
        let attr = i.getAttribute("data-label");

        if (
          attr.toLowerCase().includes(e.target.value) &&
          e.target.value !== ""
        ) {
          i.style = "display: flex;";
        } else {
          i.style = "display: none;";
        }

        return i;
      });
    });

    let ulSelected = document.createElement("ul");
    ulSelected.id = `selected-${this.getAttribute("data-id")}`;
    ulSelected.className = "box-selected";

    let ulListItems = document.createElement("ul");
    ulListItems.id = `ul-${this.getAttribute("data-id")}`;
    ulListItems.className = "list-options";

    function tagItem(data) {
      let div = document.createElement("li");
      div.className = "tag-item";
      div.setAttribute("data-value", data.value);
      div.setAttribute("data-label", data.label);

      let label = document.createElement("p");
      label.className = "tag-label";
      label.innerText = data.label;

      let deleteBtn = document.createElement("p");
      deleteBtn.innerText = "+";
      deleteBtn.className = "deleteBtn";
      deleteBtn.setAttribute("data-value", data.value);
      deleteBtn.setAttribute("data-label", data.label);

      deleteBtn.onclick = (e) => {
        removeItem({
          label: e.target.getAttribute("data-label"),
          value: e.target.getAttribute("data-value")
        });
      };

      div.appendChild(label);
      div.appendChild(deleteBtn);
      return div;
    }

    function optionItem(data) {
      let input = document.createElement("input");
      input.id = data.value;
      input.className = "input-item";
      input.type = "checkbox";
      input.setAttribute("data-value", data.value);
      input.setAttribute("data-label", data.label);

      let label = document.createElement("label");
      label.innerText = data.label;
      label.setAttribute("for", data.value);
      label.className = "label-item";

      let div = document.createElement("div");
      div.className = "box-item";
      div.setAttribute("data-label", data.label);

      div.onchange = (e) => {
        const item = {
          label: e.target.getAttribute("data-label"),
          value: e.target.getAttribute("data-value")
        };

        if (e.target.checked) {
          addItem(item);
        } else {
          removeItem(item);
        }
      };

      div.appendChild(input);
      div.appendChild(label);
      return div;
    }

    function addItem(data) {
      ulSelected.appendChild(tagItem(data));
      sendValues();
    }

    function removeItem(data) {
      let input = shadow.querySelector(`#${data.value}`);
      input.checked = false;

      let deleteBtn = shadow.querySelector(
        `.tag-item[data-value="${data.value}"]`
      );
      deleteBtn.remove();
      sendValues();
    }

    function sendValues() {
      let data = [...shadow.querySelectorAll(".tag-item")];

      let list = [];
      data.map((i) => {
        list.push({
          label: i.getAttribute("data-label"),
          value: i.getAttribute("data-value")
        });
        return i;
      });

      this.dispatchEvent(
        new CustomEvent("data-value", {
          detail: JSON.stringify(list)
        })
      );
    }

    if (this.getAttribute("data-options")) {
      let options = JSON.parse(this.getAttribute("data-options"));

      if (options.length > 0) {
        options.map((i) => {
          ulListItems.appendChild(optionItem(i));
          return null;
        });
      }
    }

    divGlobal.appendChild(input);
    divGlobal.appendChild(ulSelected);
    divGlobal.appendChild(ulListItems);
    shadow.appendChild(style);
    shadow.appendChild(divGlobal);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "data-value") {
      const shadow = this.shadowRoot;
      const data = JSON.parse(newValue);

      function tagItem(data) {
        let div = document.createElement("li");
        div.className = "tag-item";
        div.setAttribute("data-value", data.value);
        div.setAttribute("data-label", data.label);

        let label = document.createElement("p");
        label.className = "tag-label";
        label.innerText = data.label;

        let deleteBtn = document.createElement("p");
        deleteBtn.innerText = "+";
        deleteBtn.className = "deleteBtn";
        deleteBtn.setAttribute("data-value", data.value);
        deleteBtn.setAttribute("data-label", data.label);

        deleteBtn.onclick = (e) => {
          removeItem({
            label: e.target.getAttribute("data-label"),
            value: e.target.getAttribute("data-value")
          });
        };

        div.appendChild(label);
        div.appendChild(deleteBtn);
        return div;
      }

      function removeItem(data) {
        let input = shadow.querySelector(`#${data.value}`);
        input.checked = false;

        let deleteBtn = shadow.querySelector(
          `.tag-item[data-value="${data.value}"]`
        );
        deleteBtn.remove();
        sendValues();
      }

      function sendValues() {
        let data = [...shadow.querySelectorAll(".tag-item")];

        let list = [];
        data.map((i) => {
          list.push({
            label: i.getAttribute("data-label"),
            value: i.getAttribute("data-value")
          });
          return i;
        });

        this.dispatchEvent(
          new CustomEvent("data-value", {
            detail: JSON.stringify(list)
          })
        );
      }

      data.map((i) => {
        let input = shadow.querySelector(`#${i.value}`);
        input.checked = true;

        shadow
          .getElementById(`selected-${this.getAttribute("data-id")}`)
          .appendChild(tagItem(i));
        return i;
      });
    }
  }
}

customElements.define("multi-select", Element);
