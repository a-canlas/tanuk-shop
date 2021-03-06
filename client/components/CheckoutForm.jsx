import React from 'react';

const nameRegex = /^[a-zA-Z]{2,32}$/;
const creditCardRegex = /^\d{16}$/;
const cityRegex = /^[^0-9]{3,50}$/;
const zipRegex = /^\d{5}$/;
const cvvRegex = /^\d{3,4}$/;
const numRegex = /^[0-9\b]+$/;

class CheckoutForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      lastName: '',
      creditCard: '',
      month: '01',
      year: '2020',
      cvv: '',
      address: '',
      city: '',
      state: 'CA',
      zip: '',
      agree: false,
      errors: {
        name: '',
        lastName: '',
        address: '',
        city: '',
        zip: '',
        creditCard: '',
        cvv: ''
      }

    };
    this.handleInput = this.handleInput.bind(this);
    this.handleOrder = this.handleOrder.bind(this);
    this.validateInputs = this.validateInputs.bind(this);

  }

  handleInput(e) {
    const { name, value, checked } = e.target;
    const errors = this.state.errors;
    switch (name) {
      case 'name':
        errors.name = nameRegex.test(value) ? '' : 'First name must be between 2-32 characters';
        break;
      case 'lastName':
        errors.lastName = nameRegex.test(value) ? '' : 'Last name must be between 2-32 characters';
        break;
      case 'creditCard':
        if (value === '' || numRegex.test(value)) {
          this.setState({ [name]: value });
        }
        errors.creditCard = creditCardRegex.test(value) ? '' : 'Invalid Credit Card number';
        break;
      case 'address':
        errors.address = value.length >= 6 ? '' : 'Address should be between 6 and 42 characters';
        break;
      case 'city':
        errors.city = cityRegex.test(value) ? '' : 'Invalid City Name';
        break;
      case 'zip':
        if (value === '' || numRegex.test(value)) {
          this.setState({ [name]: value });
        }
        errors.zip = zipRegex.test(value) ? '' : 'Invalid Zip';
        break;
      case 'cvv':
        if (value === '' || numRegex.test(value)) {
          this.setState({ [name]: value });
        }
        errors.cvv = cvvRegex.test(value) ? '' : 'Invalid CVV';
        break;
      case 'agree':
        this.setState({ agree: checked });
        break;
    }
    if (name !== 'agree' && name !== 'creditCard' && name !== 'zip' && name !== 'cvv') {
      this.setState({ errors, [name]: value });
    }

  }

  validateInputs() {
    const { errors } = this.state;
    if (errors.name || errors.lastName || errors.creditCard || errors.address || errors.city || errors.zip || errors.cvv) {
      return false;
    }
    return true;

  }

  handleOrder(e) {
    e.preventDefault();
    if (this.validateInputs()) {
      const orderToBeSent = {};
      orderToBeSent.name = this.state.name;
      orderToBeSent.lastName = this.state.lastName;
      orderToBeSent.shippingAddress = this.state.address;
      orderToBeSent.city = this.state.city;
      orderToBeSent.state = this.state.state;
      orderToBeSent.zip = this.state.zip;
      orderToBeSent.creditCard = this.state.creditCard;
      orderToBeSent.ccMonth = this.state.month;
      orderToBeSent.ccYear = this.state.year;
      orderToBeSent.ccCVV = this.state.cvv;

      this.props.placeOrder(orderToBeSent);
    }
  }

  render() {
    let submitButton = <button className="btn btn-success" disabled>Submit</button>;
    if (this.state.name && this.state.lastName && this.state.address && this.state.city && this.state.zip && this.state.creditCard && this.state.cvv && this.state.agree) {
      submitButton = <button className="btn btn-success">Submit</button>;

    }
    return (
      <React.Fragment>
        <div className="container">
          <div className="row">
            <div className="col-10">
              <form onSubmit={ this.handleOrder } noValidate>
                <div className="form-row">
                  <h2>Checkout Form</h2>
                </div>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="name">First Name</label>
                    <input type="text" name="name" className="form-control" id="name" value={this.state.name} maxLength="32" onChange={this.handleInput} noValidate />
                    <small className="form-text">{this.state.errors.name}</small>
                  </div>
                  <div className="form-group col-md-6">
                    <label htmlFor="lastName">Last Name</label>
                    <input type="text" name="lastName" className="form-control" id="lastName" value={this.state.lastName} maxLength="32" onChange={this.handleInput} noValidate />
                    <small className="form-text">{this.state.errors.lastName}</small>
                  </div>
                  <div className="form-group col-md-12">
                    <label htmlFor="address">Address</label>
                    <input type="text" name="address" className="form-control" id="address" value={this.state.address} maxLength="42" onChange={this.handleInput} noValidate />
                    <small className="form-text">{this.state.errors.address}</small>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="city">City</label>
                    <input type="text" name="city" className="form-control" id="city" value={this.state.city} maxLength="50" onChange={this.handleInput} noValidate />
                    <small className="form-text">{this.state.errors.city}</small>
                  </div>
                  <div className="form-group col-md-4">
                    <label htmlFor="state">State</label>
                    <select name="state" className="form-control" value={this.state.state} id="state" onChange={this.handleInput} noValidate >
                      <option value="CA">CA</option>
                      <option value="NV">NV</option>
                    </select>
                    <small className="form-text">{this.state.errors.state}</small>
                  </div>
                  <div className="form-group col-md-2">
                    <label htmlFor="zip">Zip</label>
                    <input type="text" name="zip" className="form-control" id="zip" value={this.state.zip} maxLength="5" onChange={this.handleInput} noValidate />
                    <small className="form-text">{this.state.errors.zip}</small>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="creditCard">Credit Card</label>
                    <input type="text" name="creditCard" className="form-control" maxLength="16" id="creditCard" placeholder="XXXXXXXXXXXXXXXX" value={this.state.creditCard} onChange={this.handleInput} noValidate />
                    <small className="form-text">{this.state.errors.creditCard}</small>
                  </div>
                  <div className="form-group col-md-2">
                    <label htmlFor="month">Month</label>
                    <select name="month" className="form-control" value={this.state.month} id="month" onChange={this.handleInput} noValidate >
                      <option value="01">01</option>
                      <option value="02">02</option>
                      <option value="03">03</option>
                      <option value="04">04</option>
                      <option value="05">05</option>
                      <option value="06">06</option>
                      <option value="07">07</option>
                      <option value="08">08</option>
                      <option value="09">09</option>
                      <option value="10">10</option>
                      <option value="11">11</option>
                      <option value="12">12</option>
                    </select>
                    <small className="form-text">{this.state.errors.month}</small>
                  </div>
                  <div className="form-group col-md-2">
                    <label htmlFor="year">Year</label>
                    <select name="year" className="form-control" id="year" value={this.state.year} onChange={this.handleInput} noValidate >
                      <option value="2020">2020</option>
                      <option value="2021">2021</option>
                      <option value="2022">2022</option>
                      <option value="2023">2023</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                    </select>
                    <small className="form-text">{this.state.errors.year}</small>
                  </div>
                  <div className="form-group col-md-2">
                    <label htmlFor="cvv">CVV</label>
                    <input type="text" name="cvv" className="form-control" maxLength="4" id="cvv" value={this.state.cvv} onChange={this.handleInput} noValidate />
                    <small className="form-text">{this.state.errors.cvv}</small>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group col-md-12">
                    <div className="form-check">
                      <input type="checkbox" name="agree" className="form-check-input" id="agree" checked={this.state.agree} onChange={this.handleInput} noValidate/>
                      <label htmlFor="agree"> I understand that this site is only for demonstration purposes and have not used real contact and/or credit card information. I do not hold the developer of this site responsible if real contact and/or credit card information was used </label>
                      <small className="form-text">{this.state.errors.agree}</small>
                    </div>
                  </div>
                  {submitButton}
                </div>

              </form>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <br />
              <p className="text-muted" onClick={() => this.props.setView('catalog', {})}>{'< Continue Shopping'}</p>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default CheckoutForm;
