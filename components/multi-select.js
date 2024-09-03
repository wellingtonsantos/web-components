class Element extends HTMLElement {
  static get observedAttributes() {
      return ["data-value", "data-options"];
  }

  constructor() {
      super();
      this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
      this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
      if (name === "data-value") {
          const parsedValue = JSON.parse(newValue || "[]");

          // Limpa os checkboxes antes de atualizar os itens selecionados
          this.clearCheckboxes();

          // Se `data-value` for um array vazio, rerenderiza o componente
          if (Array.isArray(parsedValue) && parsedValue.length === 0) {
              this.rerender();
          } else {
              this.updateSelectedItems(parsedValue);
          }
      }

      if (name === "data-options") {
          this.insertOptions(JSON.parse(newValue || "[]"));
      }
  }

  rerender() {
      // Limpa o conteúdo do shadow DOM e rerenderiza o componente
      this.shadowRoot.innerHTML = '';
      this.render();
  }

  render() {
      const shadow = this.shadowRoot;

      const style = document.createElement("style");
      style.innerHTML = `
        /* Estilos permanecem os mesmos */
      `;

      const divGlobal = document.createElement("div");
      divGlobal.id = this.getAttribute("data-id");
      divGlobal.className = "box-list";

      const input = document.createElement("input");
      input.id = `input-${this.getAttribute("data-id")}`;
      input.className = "input-search";
      input.type = "text";
      input.placeholder = this.getAttribute("data-placeholder");

      input.addEventListener("keydown", (e) => this.filterOptions(e.target.value));

      const ulSelected = document.createElement("ul");
      ulSelected.id = `selected-${this.getAttribute("data-id")}`;
      ulSelected.className = "box-selected";

      const ulListItems = document.createElement("ul");
      ulListItems.id = `ul-${this.getAttribute("data-id")}`;
      ulListItems.className = "list-options";

      divGlobal.appendChild(input);
      divGlobal.appendChild(ulSelected);
      divGlobal.appendChild(ulListItems);
      shadow.appendChild(style);
      shadow.appendChild(divGlobal);

      // Insere as opções e os itens selecionados se existirem
      this.insertOptions(JSON.parse(this.getAttribute("data-options") || "[]"));
      this.updateSelectedItems(JSON.parse(this.getAttribute("data-value") || "[]"));
  }

  filterOptions(query) {
      const shadow = this.shadowRoot;
      const items = [...shadow.querySelectorAll(".box-item")];

      items.forEach(item => {
          const label = item.getAttribute("data-label").toLowerCase();
          item.style.display = label.includes(query.toLowerCase()) ? "flex" : "none";
      });
  }

  updateSelectedItems(data) {
      const shadow = this.shadowRoot;
      const ulSelected = shadow.getElementById(`selected-${this.getAttribute("data-id")}`);
      
      // Remove todos os itens selecionados antes de adicionar novos
      ulSelected.innerHTML = "";

      // Atualiza a seleção atual
      data.forEach(item => {
          const checkbox = shadow.querySelector(`.input-item[data-value="${item.value}"]`);
          if (checkbox) {
              checkbox.checked = true;
          }
          ulSelected.appendChild(this.createTagItem(item));
      });

      this.sendValues();
  }

  insertOptions(options) {
      const shadow = this.shadowRoot;
      const ulListItems = shadow.getElementById(`ul-${this.getAttribute("data-id")}`);
      ulListItems.innerHTML = "";

      options.forEach(option => {
          ulListItems.appendChild(this.createOptionItem(option));
      });
  }

  createTagItem(data) {
      const li = document.createElement("li");
      li.className = "tag-item";
      li.setAttribute("data-value", data.value);
      li.setAttribute("data-label", data.label);

      const label = document.createElement("p");
      label.className = "tag-label";
      label.innerText = data.label;

      const deleteBtn = document.createElement("p");
      deleteBtn.innerText = "+";
      deleteBtn.className = "deleteBtn";
      deleteBtn.setAttribute("data-value", data.value);
      deleteBtn.setAttribute("data-label", data.label);

      deleteBtn.addEventListener("click", () => this.removeItem(data));

      li.appendChild(label);
      li.appendChild(deleteBtn);

      return li;
  }

  createOptionItem(data) {
      const div = document.createElement("div");
      div.className = "box-item";
      div.setAttribute("data-label", data.label);

      const input = document.createElement("input");
      input.id = data.value;
      input.className = "input-item";
      input.type = "checkbox";
      input.setAttribute("data-value", data.value);
      input.setAttribute("data-label", data.label);

      const label = document.createElement("label");
      label.innerText = data.label;
      label.setAttribute("for", data.value);
      label.className = "label-item";

      input.addEventListener("change", (e) => {
          if (e.target.checked) {
              this.addItem(data);
          } else {
              this.removeItem(data);
          }
      });

      div.appendChild(input);
      div.appendChild(label);

      return div;
  }

  clearCheckboxes() {
      const checkboxes = this.shadowRoot.querySelectorAll(".input-item");
      checkboxes.forEach(checkbox => {
          checkbox.checked = false;
      });
  }

  addItem(data) {
      const shadow = this.shadowRoot;
      const ulSelected = shadow.getElementById(`selected-${this.getAttribute("data-id")}`);
      ulSelected.appendChild(this.createTagItem(data));
      this.sendValues();
  }

  removeItem(data) {
      const shadow = this.shadowRoot;
      const ulSelected = shadow.getElementById(`selected-${this.getAttribute("data-id")}`);
      const itemToRemove = shadow.querySelector(`.tag-item[data-value="${data.value}"]`);
      if (itemToRemove) {
          itemToRemove.remove();
      }
      const checkbox = shadow.querySelector(`.input-item[data-value="${data.value}"]`);
      if (checkbox) {
          checkbox.checked = false;
      }
      this.sendValues();
  }

  sendValues() {
      const shadow = this.shadowRoot;
      const selectedItems = [...shadow.querySelectorAll(".tag-item")];
      const values = selectedItems.map(item => ({
          value: item.getAttribute("data-value"),
          label: item.getAttribute("data-label")
      }));

      this.dispatchEvent(new CustomEvent("data-value", {
          detail: JSON.stringify(values)
      }));
  }
}

customElements.define("multi-select", Element);
