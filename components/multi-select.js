class MultiSelect extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const { value, checked } = event.target;
    const { onChange } = this.props;

    let updatedSelection = [...this.props.value];

    if (checked) {
      updatedSelection.push(value);
    } else {
      updatedSelection = updatedSelection.filter((item) => item !== value);
    }

    if (onChange) {
      onChange(updatedSelection);
    }
  }

  render() {
    const { options, value, fontColor } = this.props;
    console.log('comp', value)

    return (
      <div className="multi-select" style={{ color: fontColor }}>
        <ul className="box-list">
          {options.map((option) => (
            <li key={option.value} className="box-item">
              <input
                type="checkbox"
                id={option.value}
                value={option.value}
                checked={value.includes(option.value)}
                onChange={this.handleChange}
                className="input-item"
              />
              <label htmlFor={option.value} className="label-item">
                {option.label}
              </label>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

class CustomElement extends HTMLElement {
  constructor() {
    super();
    this.clearSelection = this.clearSelection.bind(this);
  }

  connectedCallback() {
    const options = JSON.parse(this.getAttribute("data-options"));
    const fontColor = this.getAttribute("fontColor");
    this.selectedValues = JSON.parse(this.getAttribute("data-value")) || [];

    const renderComponent = () => {
      ReactDOM.render(
        <div>
          <button onClick={this.clearSelection}>Clear Selection</button>
          <MultiSelect
            options={options}
            value={this.selectedValues}
            fontColor={fontColor}
            onChange={(newValues) => {
              this.selectedValues = newValues;
              this.setAttribute("data-value", JSON.stringify(newValues));
              renderComponent();
            }}
          />
        </div>,
        this
      );
    };

    this.renderComponent = renderComponent;
    renderComponent();
  }

  clearSelection() {
    this.selectedValues = [];
    this.setAttribute("data-value", JSON.stringify(this.selectedValues));
    this.renderComponent();
  }
}

customElements.define("tags-in-repeater", CustomElement);