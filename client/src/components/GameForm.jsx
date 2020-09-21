import React from 'react';

class GameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPlayer: 0,
      bet: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ bet: event.target.value });
  }

  handleSubmit(event) {
    this.props.submitBet(this.state.bet);
    event.preventDefault();
  }

  render() {
    return (
      <div>
        <div>Current Player: {this.props.players[this.props.currentPlayer]}</div>
        <div>Your Balance: ${this.props.balances[this.props.currentPlayer]}</div>
        <div>Your Cards: {this.props.playerCards[this.props.currentPlayer]}</div>
        <form onSubmit={this.handleSubmit}>
          <label>
            Your Bet: $
          <input value={this.state.bet} onChange={this.handleChange} />
          </label>
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

export default GameForm;