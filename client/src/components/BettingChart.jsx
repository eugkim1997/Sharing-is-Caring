import React from 'react';

var BettingChart = (props) => {
  return (
    <div>
      <div class='labels'>
        <div id='l1'>Balances</div>
        <div class='labelItem'>Round 1</div>
        <div class='labelItem'>Round 2</div>
        <div class='labelItem'>Round 3</div>
      </div>
      <div class='values'>
        <div class='playerContainer'>
          {props.players.map((item) => {
            return (<div>{item}</div>);
          })}
        </div>
        <div class='balanceContainer'>
          {props.balances.map((item) => {
            return (<div>${item}</div>);
          })}
        </div>
        <div class='betContainer'>
          {props.bets.map((item) => {
            return (<div>${item}</div>);
          })}
        </div>
        <button onClick={props.bettingChartOff}>Next</button>
      </div>
    </div>
  );
}

export default BettingChart