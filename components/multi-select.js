class MultiSelectElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.handleChange = this.handleChange.bind(this);
  }

  connectedCallback() {
    this.render();
  }

  static get observedAttributes() {
    return ['data-options', 'data-value', 'font-color'];
  }

  attributeChangedCallback() {
    this.render();
  }

  handleChange(event) {
    const value = event.target.value;
    let selectedValues = this.getParsedAttribute('data-value') || [];

    if (event.target.checked) {
      selectedValues.push(value);
    } else {
      selectedValues = selectedValues.filter((item) => item !== value);
    }

    this.setAttribute('data-value', JSON.stringify(selectedValues));
    this.dispatchEvent(new CustomEvent('change', { detail: selectedValues }));
  }

  getParsedAttribute(attrName) {
    try {
      return JSON.parse(this.getAttribute(attrName)) || [];
    } catch (e) {
      console.error(`Failed to parse ${attrName}:`, e);
      return [];
    }
  }

  render() {
    const options = this.getParsedAttribute('data-options');
    const selectedValues = this.getParsedAttribute('data-value');
    const fontColor = this.getAttribute('font-color') || 'black';

    this.shadowRoot.innerHTML = `
      <style>
        label {
          display: block;
          margin: 5px 0;
          color: ${fontColor};
        }
      </style>
      <div>
        ${options
          .map(
            (option) => `
            <label>
              <input type="checkbox" value="${option.value}" ${
              selectedValues.includes(option.value) ? 'checked' : ''
            }/>
              ${option.label}
            </label>
          `
          )
          .join('')}
      </div>
    `;

    // Attach event listeners to checkboxes
    this.shadowRoot.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      input.addEventListener('change', this.handleChange);
    });
  }
}

customElements.define('multi-select-element', MultiSelectElement);
