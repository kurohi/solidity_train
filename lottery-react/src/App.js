import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import web3 from './web3.js';
import lottery from './lottery.js';

class App extends Component {
    state = {
        manager: '',
        players: [],
        balance: '',
        value: ''
    };

    async componentDidMount(){
        const manager = await lottery.methods.manager().call();
        const players = await lottery.methods.getPlayers().call();
        const balance = await web3.eth.getBalance(lottery.options.address);
        this.setState({manager, players, balance});
    }
    render() {
        return (
            <div className="App">
                <h2>Lottery Contract</h2>
                <p>This contract is managed by {this.state.manager} </p>
                <p>There are currently {this.state.players.length} players competing to win {web3.utils.fromWei(this.state.balance)} ether. </p>
            <hr />
            <form>
                <h4>With how much do you want to try?</h4>
                <div>
                    <label>Amount of ether to enter </label>
                    <input value={this.state.value} onChange={event => this.setState({value: event.target.value})}/>
                </div>
                <button>Enter</button>
            </form>
            </div>
        );
    }
}

export default App;
