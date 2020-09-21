import React from 'react';
import axios from 'axios';
import EntryForm from './EntryForm.jsx';
import GameForm from './GameForm.jsx';
import BettingChart from './BettingChart.jsx';
import WinnerPage from './WinnerPage.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      players: ['Player 1', 'Player 2', 'Player 3', 'Player 4'],
      hands: [[], [], [], []],
      balances: [],
      round: 1,
      bets: [],
      allBets: [],
      currentPlayer: 0,
      pot: 0,
      deckID: '',
      bettingChartOn: false,
      gameWinner: -1
    }
  }

  createDeck() {
    //use deck of cards api to set new deck
    axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/')
      .then((response) => {
        console.log(response.data);
        this.setState({ deckID: response.data.deck_id }, () => {
          console.log('got new deck');
          this.deal();
        })
      })
      .catch((error) => {
        console.log('error getting new deck: ', error);
      });
  }

  configureGame(startingBalance) {
    //set players
    var startingBalance = Number(startingBalance);
    var startingBalances = [];
    for (var i = 0; i < this.state.players.length; i++) {
      startingBalances.push(startingBalance);
    }
    this.setState({ balances: startingBalances }, () => {
      console.log('game configured')
      this.createDeck();
    });
  }

  deal() {
    var dealtCards = this.state.hands;
    //first draw
    axios.get(`https://deckofcardsapi.com/api/deck/${this.state.deckID}/draw/?count=1`)
      .then((response) => {
        dealtCards[0].push(response.data.cards[0].code)
        //second draw
        axios.get(`https://deckofcardsapi.com/api/deck/${this.state.deckID}/draw/?count=2`)
          .then((response) => {
            dealtCards[1].push(response.data.cards[0].code)
            //third draw
            axios.get(`https://deckofcardsapi.com/api/deck/${this.state.deckID}/draw/?count=2`)
              .then((response) => {
                dealtCards[2].push(response.data.cards[0].code)
                //fourth draw
                axios.get(`https://deckofcardsapi.com/api/deck/${this.state.deckID}/draw/?count=2`)
                  .then((response) => {
                    dealtCards[3].push(response.data.cards[0].code)
                    this.setState({ hands: dealtCards }, () => { console.log('cards have been dealt') });
                  })
                  .catch((error) => {
                    console.log('error drawing cards: ', error)
                  });
              })
              .catch((error) => {
                console.log('error drawing cards: ', error)
              });
          })
          .catch((error) => {
            console.log('error drawing cards: ', error);
          });
      })
      .catch((error) => {
        console.log('error drawing cards: ', error)
      });
  }

  submitBet(bet) {
    this.setState({ bettingChartOn: !this.state.bettingChartOn }, () => {
      console.log('showing betting chart');
      this.setState({
        allBets: [...this.state.allBets, Number(bet)]
      }, () => {
        this.setState({
          bets: [...this.state.bets, Number(bet)]
        }, () => {
          console.log('bet set');
          if (this.state.bets.length === this.state.players.length) {
            console.log('all bets in')
            this.handleBets();
          } else {
            this.setState({ currentPlayer: this.state.currentPlayer + 1 }, () => {
              console.log('player changed')
            });
          }
        });
      })
    })
  }

  bettingChartOff() {
    this.setState({ bettingChartOn: !this.state.bettingChartOn }, () => {
      console.log('not showing betting chart');
    })
  }

  handleBets() {
    var totalBets = 0;
    for (var i = 0; i < this.state.bets.length; i++) {
      totalBets += this.state.bets[i];
    }
    this.setState({ pot: this.state.pot + totalBets }, () => {
      console.log('pot updated');
      var newBalances = [];
      for (var i = 0; i < this.state.balances.length; i++) {
        newBalances.push(this.state.balances[i] - this.state.bets[i])
      }
      this.setState({ balances: newBalances }, () => {
        // game reset
        this.roundReset();
      })
    })
  }

  roundReset() {
    this.setState({ currentPlayer: 0 }, () => {
      this.setState({ bets: [] }, () => {
        if (this.state.round === 3) {
          console.log('showdown');
          this.showdown();
        } else {
          this.setState({ round: this.state.round + 1 }, () => {
            console.log('next round');
            this.deal();
          })
        }
      })
    })
  }

  showdown() {
    var value1 = this.scoreCalculator(this.state.hands[0][0], this.state.hands[0][1], this.state.hands[0][2]);
    var value2 = this.scoreCalculator(this.state.hands[1][0], this.state.hands[1][1], this.state.hands[1][2]);
    var value3 = this.scoreCalculator(this.state.hands[2][0], this.state.hands[2][1], this.state.hands[2][2]);
    var value4 = this.scoreCalculator(this.state.hands[3][0], this.state.hands[3][1], this.state.hands[3][2]);
    console.log(value1, value2, value3, value4);
    var winner = this.getWinner([value1, value2, value3, value4]);
    console.log(winner);
    this.bigReset(winner);
  }

  scoreCalculator(v1, v2, v3) {
    console.log(v1[0], v2[0]);
    var cardValues = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '0': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    }
    return cardValues[v1[0]] + cardValues[v2[0]] + cardValues[v3[0]];
  }

  getWinner(arr) {
    var winner = 0;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] > arr[winner]) {
        winner = i;
      }
    }
    return winner;
    this.bigReset(winner);
  }

  bigReset(winner) {
    //update winner's balances
    var tempArr = this.state.balances;
    var added = Math.floor(this.state.pot / 3);
    for (var i = 0; i < this.state.players.length; i++) {
      if (i === winner) {
        continue;
      } else {
        tempArr[i] += added;
      }
    }
    this.setState({ balances: tempArr }, () => {
      console.log('balances updated');
      this.setState({ pot: 0 }, () => {
        console.log('pot updated');
        this.setState({ round: 1 }, () => {
          console.log('round updated')
          this.setState({ allBets: [] }, () => {
            console.log('all bets reset')
            this.setState({ hands: [[], [], [], []] }, () => {
              console.log('hands reset');
              this.checkGameWinner();
            })
          })
        })
      })
    })
    //check for 0 balances (3 0's = gameWinner)
    //reset pot & rounds
  }

  checkGameWinner() {
    console.log(this.state.balances)
    var winner = -1;
    for (var i = 0; i < this.state.balances.length; i++) {
      if (this.state.balances[i] === 0) {
        winner = i;
        break;
      }
    }
    console.log('winner:', winner)
    if (winner !== this.state.gameWinner) {
      this.setState({ gameWinner: winner }, () => {
        console.log('we have a winner')
      });
    } else {
      this.deal();
    }
  }

  componentDidMount() {

  }

  render() {
    if (this.state.gameWinner !== -1) {
      return (
        <div>
          <h1>Sharing is Caring</h1>
          <WinnerPage winner={this.state.players[this.state.gameWinner]} />
        </div>
      );
    } else if (this.state.hands[0].length === 0) {
      return (
        <div>
          <h1>Sharing is Caring</h1>
          <EntryForm configureGame={this.configureGame.bind(this)} />
        </div>
      );
    } else if (this.state.bettingChartOn) {
      return (
        <div>
          <h1>Sharing is Caring</h1>
          <BettingChart players={this.state.players}balances={this.state.balances} bets={this.state.allBets} bettingChartOff={this.bettingChartOff.bind(this)} />
        </div>
      );
    } else {
      return (
        <div>
          <h1>Sharing is Caring</h1>
          <GameForm currentPlayer={this.state.currentPlayer} players={this.state.players} balances={this.state.balances} playerCards={this.state.hands} submitBet={this.submitBet.bind(this)} />
        </div>
      );
    }
  }
}

export default App;