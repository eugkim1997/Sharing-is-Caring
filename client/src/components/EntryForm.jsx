import React from 'react';

class EntryForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playerCount: '',
      startingBalance: ''
    };

    this.handlePlayerCount = this.handlePlayerCount.bind(this);
    this.handleStartingBalance = this.handleStartingBalance.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handlePlayerCount(event) {
    this.setState({playerCount: event.target.value});
  }

  handleStartingBalance(event) {
    this.setState({startingBalance: event.target.value});
  }

  handleSubmit(event) {
    this.props.configureGame(this.state.startingBalance);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        {/* <label>
          Number of Players:
          <input value={this.state.playerCount} onChange={this.handlePlayerCount} required/>
        </label> */}
        <label>
          Starting Balance: $
          <input value={this.state.startingBalance} onChange={this.handleStartingBalance} required/>
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

export default EntryForm;