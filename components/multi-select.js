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
    let x = this.getAttribute('data-value')
    let selectedValues = x ? JSON.parse(x) : [];

    if (event.target.checked) {
      selectedValues.push(value);
    } else {
      selectedValues = selectedValues.filter((item) => item !== value);
    }

    this.setAttribute('data-value', JSON.stringify(selectedValues));
    this.dispatchEvent(new CustomEvent('change', { detail: selectedValues }));
  }

  render() {
    const options = JSON.parse(this.getAttribute('data-options')) || [];
    const selectedValues = JSON.parse(this.getAttribute('data-value')) || [];
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

customElements.define('multi-select', MultiSelectElement);
