import React, {Component} from 'react';
import TopNav from './TopNav.js';
import Display from './Display.jsx';
import './App.css'
import Web3 from 'web3';




class App extends Component {
    
    async componentWillMount() {
        if(window.ethereum) {
            window.web3 = new Web3(window.ethereum)
        } else if(window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
        } else {
            window.alert('Non-Ethereum browser detected. Your should consider trying MetaMask!')
        }     
    }

    render () {
        return (
            <div>
                <TopNav/><br/><br/>
                <div className= "row">
                    <div className = "col-1"></div>
                    <div className = "col-10">
                    <Display/>
                    </div>
                    <div className = "col-1"></div>
                </div>

            </div>
        );
    }
}
export default App;