import React, { Component } from 'react';
import { Button,InputGroup, FormControl, Modal, Card} from 'react-bootstrap';
import './App.css';
import Web3 from 'web3';
import { erc20abi , abi } from './abi';
import { MDBDataTableV5 } from 'mdbreact';
import { database,  } from './firebase/firebase';
import { FiMonitor , FiPlus , FiCloudLightning , FiUserPlus   } from "react-icons/fi";
import { BsClockHistory, BsTable } from "react-icons/bs"
import { GiReceiveMoney } from "react-icons/gi"
import { ethers } from 'ethers';

const web3                 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"));
const uniswap_address      = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
const sushi_address        = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F'
const defiswap_address     = '0xCeB90E4C17d626BE0fACd78b79c9c87d7ca181b3'
const Eth_address          = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
//kyber_address = 0x1c87257F5e8609940Bc751a07BB085Bb7f8cDBE6

var intervalvar
class Display extends Component {
    constructor(props){
      super(props)
      this.state={
        // capture parameter
        uni_buy : 0,
        uni_sell : 0,
        sushi_buy : 0,
        sushi_sell : 0,
        defi_buy   : 0,
        defi_sell  : 0,
        profit_rate : 0,
        tableDatas : [],
        tableData : [],
        // input token
        inputAddress : "",
        tokenAddresses : [],
        // trading parameter
        tradeToken : '',
        tradebuyprice : 0,
        tradesellprice : 0,
        traderate       : 0,
        log : '',
        loanTokenAddress : '',
        loanAmount : '',
        logTimestamp : '',
        logList : '',
        firstDex : '',
        secondDex  : '',
        // auto start
        modalShowState :  false,
        autoProfit : 0.1,
        autoAmount : 1,
        autoTime   : 30000,
        autoSlippage  : 100,
        autoGasLimit  : 500000,
        autoGasValue  : '40',
        autoExcuteButtonState : false,
        ownerAddress : '',
        ownerPrivateKey : '',
        autoModeState : false,
        walletBalance : '',
        logs :[],
        contractAddress : ''
      }
    }

    async componentWillMount() {
        await this.loadLog()
        await this.loadAddresses()
    }

    async getPriceData() {
        await this.loadLog()
        await this.loadAddresses()
        await this.start()
    }

    async loadAddresses(){
      console.log("load address")
      let snapshot = await database.ref('TokenAddress/').get();
        if (snapshot.exists) {
            var walletList = [];
            const newArray = snapshot.val();
            if (newArray) {
                Object.keys(newArray).map((key) => {
                    const value = newArray[key];
                    walletList.push({
                            Address : web3.utils.toChecksumAddress(value.Address),
                    })
                })
            }
            this.setState({
              tokenAddresses : walletList
            })
        }
    }

    async loadLog(){
      console.log("start load log")
      database.ref('log/').get().then((snapshot) => {
          if (snapshot.exists) {
            var logs = [];
              const newArray = snapshot.val();
              
              if (newArray) {
                  Object.keys(newArray).map((key, index) => {
                      
                    const value = newArray[key];
                      logs.unshift({
                          timeStamp  : value.timeStamp,
                          tradeToken : value.tradeToken,
                          loanAmount : value.loanAmount,
                          firstDex     : value.firstDex,
                          secondDex    : value.secondDex,
                          tradeRate  : value.tradeRate,
                      })
                  })
              }
              this.setState({
              logs : logs
            })
          }
      });
    }


    async start(){
      if(autoAmount != this.state.autoAmount){
        this.setState({
           tabledatas : []
        })
      }

      let autoAmount =  this.state.autoAmount;
      console.log("loan amount " , this.state.autoAmount)
      for (let index = 0; index < this.state.tokenAddresses.length; index++) {
        console.log(index)
        let uni_buy , uni_sell,sushi_buy, sushi_sell, defi_buy, defi_sell, max_buy, max_sell, profit_rate, profit_rate_style, firstDex, secondDex, tokenName, tokenDecimal, max_buy_style, max_sell_style

      try{

        try{
          let tokenContract= new web3.eth.Contract(erc20abi,this.state.tokenAddresses[index]["Address"]);
          tokenName    = await tokenContract.methods.symbol().call().then(function(res) {  return res;  })
          tokenDecimal = await tokenContract.methods.decimals().call()
        }catch(err){}
        
        
        try{
          let mycontract1  = new web3.eth.Contract(abi, uniswap_address)
          uni_buy       = await mycontract1.methods.getAmountsOut( ethers.BigNumber.from((Math.pow(10, 18) * autoAmount) + ''), [Eth_address,this.state.tokenAddresses[index]["Address"]]).call();
          uni_sell      = await mycontract1.methods.getAmountsIn ( ethers.BigNumber.from((Math.pow(10, 18) * autoAmount) + ''), [this.state.tokenAddresses[index]["Address"],Eth_address]).call();
          uni_buy          = Math.round( uni_buy[1]     / Math.pow(10, tokenDecimal - 5 )) / 100000
          uni_sell         = Math.round( uni_sell[0]    / Math.pow(10, tokenDecimal - 5 )) / 100000
        }catch(err){
          uni_buy = 0
          uni_sell = 0
        }
        try{
          let mycontract2  = new web3.eth.Contract(abi, sushi_address)
          sushi_buy      = await mycontract2.methods.getAmountsOut( ethers.BigNumber.from((Math.pow(10, 18) * autoAmount) + '') ,[Eth_address, this.state.tokenAddresses[index]["Address"]]).call();
          sushi_sell     = await mycontract2.methods.getAmountsIn ( ethers.BigNumber.from((Math.pow(10, 18) * autoAmount) + '') ,[this.state.tokenAddresses[index]["Address"],Eth_address]).call();
          sushi_buy        = Math.round( sushi_buy[1]   / Math.pow(10, tokenDecimal - 5 )) / 100000
          sushi_sell       = Math.round( sushi_sell[0]  / Math.pow(10, tokenDecimal - 5 )) / 100000
        }catch(err){
          sushi_buy =0
          sushi_sell =0
        }

        try{
          let mycontract3  = new web3.eth.Contract(abi, defiswap_address)
          defi_buy      = await mycontract3.methods.getAmountsOut( ethers.BigNumber.from((Math.pow(10, 18) * autoAmount) + '') ,[Eth_address, this.state.tokenAddresses[index]["Address"]]).call();
          defi_sell     = await mycontract3.methods.getAmountsIn ( ethers.BigNumber.from((Math.pow(10, 18) * autoAmount) + '') ,[this.state.tokenAddresses[index]["Address"],Eth_address]).call();
          defi_buy         = Math.round( defi_buy[1]    / Math.pow(10, tokenDecimal - 5 )) / 100000
          defi_sell        = Math.round( defi_sell[0]   / Math.pow(10, tokenDecimal - 5 )) / 100000
        }catch(err){
          defi_buy = 0
          defi_sell = 0
        }

        max_buy = Math.max.apply(null,[uni_buy,sushi_buy, defi_buy])
        
        if (max_buy === uni_buy ){
          firstDex = uniswap_address;
        }

        else if (max_buy === sushi_buy){
          firstDex = sushi_address
        }
        
        else {
          firstDex = defiswap_address
        }

        max_sell= Math.min.apply(null,[uni_sell,sushi_sell,defi_sell]) 

        if (max_sell === uni_sell ){
          secondDex = uniswap_address;
        }
        else if (max_sell === sushi_sell){
          secondDex = sushi_address
        }
        else {
          secondDex = defiswap_address
        }

        profit_rate =  Math.round((max_buy - max_sell)/max_buy * 1000000) / 10000


        if (profit_rate > 0 ){
          profit_rate_style =  <a className='text-success'> {profit_rate} </a>
          if (this.state.traderate < profit_rate){
            this.setState({
              tradeTokenAddress : this.state.tokenAddresses[index]["Address"],
              tradeToken : tokenName,
              tradebuyprice : max_buy,
              tradesellprice : max_sell,
              traderate : profit_rate,
              firstDex : firstDex,
              secondDex: secondDex
            })
          }
        }
        else if (profit_rate <= 0){
          profit_rate_style =  <a className='text-danger'> {profit_rate} </a>
        }

        if (this.state.tradeToken === this.state.tokenAddresses[index]["Address"] ){
          this.setState({
            tradeTokenAddress : this.state.tokenAddresses[index]["Address"],
            tradeToken : tokenName,
            tradebuyprice : max_buy,
            tradesellprice : max_sell,
            traderate : profit_rate,
            firstDex : firstDex,
            secondDex: secondDex
          })
        }
        let tableData = {
          tokenName     : tokenName,
          tokenDecimal  : tokenDecimal,
          uni_buy       : uni_buy,
          uni_sell      : uni_sell,
          sushi_buy     : sushi_buy,
          sushi_sell    : sushi_sell,
          defi_buy      : defi_buy,
          defi_sell     : defi_sell,
          profit_rate   : profit_rate,
          profit_rate_style : profit_rate_style, 
        }
        let tableDatas = this.state.tableDatas
        tableDatas[index] = tableData
        this.setState({
          tableDatas : tableDatas
        })
        }catch(err){
           let tableDatas = this.state.tableDatas
            tableDatas[index] = []
            this.setState({
              tableDatas : tableDatas
            })
          console.log(err)
          index  =  index
        }
        if (index ==  this.state.tokenAddresses.length - 1){
          this.start()
        }
      }
    }

    async addAddress(){
      if(this.state.inputAddress===""){
        alert("Please check  Address")
        return
      }
      for (let index = 0; index < this.state.tokenAddresses.length; index++) {
        if(this.state.tokenAddresses[index]["Address"] === web3.utils.toChecksumAddress(this.state.inputAddress)){
          
          let buffer = ''
          this.setState({inputAddress : buffer})
          alert("Aleady exist")
          return
        } 
      }

      const tokenAddressList= {
        Address   : web3.utils.toChecksumAddress(this.state.inputAddress),
      }
      var userListRef = database.ref('TokenAddress')
      var newUserRef = userListRef.push();
      newUserRef.set(tokenAddressList);
      let buffer = ''
      this.setState({inputAddress : buffer})
      alert("input successfuly")
      this.loadAddresses();
    }


    async manualExcute(){
      if(this.state.traderate < this.state.autoProfit){
        console.log("faild profit")
        return
      }
      let first_value =  web3.eth.getBalance(this.state.ownerAddress).call()

      if (first_value - 10000000000000000 < this.state.autoAmount * 1000000000000000000 ){
        console.log("error : there is no enought eth value for trading")
      }
      else {
        console.log("start with :",this.state.tradeToken,this.state.tradeTokenAddress, this.state.autoAmount, this.state.firstDex, this.state.secondDex)
      let firstDexContract   = await web3.eth.Contract(abi, this.state.firstDex);
      let tx = {
        from : this.state.ownerAddress,
        to   : this.state.firstDex,
        data : firstDexContract.methods.swapExactETHForTokens(0, [Eth_address, this.state.tradeTokenAddress],this.state.ownerAddress, Date.now() + 1000 * 60 * 10).encodeABI(),
        gasPrice : web3.utils.toWei(this.state.autoGasValue, 'Gwei'),
        gas      : this.state.autoGasLimit,
        nonce    : await web3.eth.getTransactionCount(this.state.ownerAddress),
        value    : ethers.BigNumber.from((this.state.autoAmount * 1000000000000000000)+ '')
      }
        const promise = await web3.eth.accounts.signTransaction(tx, this.state.ownerPrivateKey)
        await web3.eth.sendSignedTransaction(promise.rawTransaction).once('confirmation', async() => {
          let secondDexContract   = await  web3.eth.Contract(abi, this.state.secondDex);
          let tokenContract       = await  web3.eth.Contract(erc20abi, this.state.tradeTokenAddress);
          let tokenBalance        = await  tokenContract.methods.balanceOf(this.state.ownerAddress);
          let tx = {
            from : this.state.ownerAddress,
            to   : this.state.secondDex,
            data : secondDexContract.methods.swapExactTokensForETH(await ethers.BigNumber.from((tokenBalance)+''),0, [this.state.tradeTokenAddress,Eth_address ],this.state.ownerAddress, Date.now() + 1000 * 60 * 10).encodeABI(),
            gasPrice : web3.utils.toWei(this.state.autoGasValue, 'Gwei'),
            gas      : this.state.autoGasLimit,
            nonce    : await web3.eth.getTransactionCount(this.state.ownerAddress),
          }
            const promise = await web3.eth.accounts.signTransaction(tx, this.state.ownerPrivateKey)
            await web3.eth.sendSignedTransaction(promise.rawTransaction).once('confirmation', async() => {
              console.log('successful')
              const logList= {
                timeStamp  : new Date().toISOString(),
                loanAmount : this.state.autoAmount,
                tradeToken : this.state.tradeToken,
                tradeRate  : this.state.traderate,
                firstDex     : this.state.firstDex,
                secondDex    : this.state.secondDex,
              }
              var userListRef = database.ref('log')
              var newUserRef = userListRef.push();
              newUserRef.set(logList);
              let buffer = ''
              this.setState({logList : buffer})
              this.loadlog()
              let secondValue = web3.eth.getBalance(this.state.ownerAddress).call()
              console.log("profit is :", first_value-secondValue);
            })
        })
        .once('error', (e) => {
            console.log(e)
        })
      }  
    }


    autoExcute(){
      if (this.state.ownerAddress === '' || this.state.ownerPrivateKey === ''){
          alert("please input address and privatekey")
          return
      }
        this.setState({
          modalShowState : true,
        })
    }


    autoExcuteStart(){
      this.setState({
        autoExcuteButtonState : true,
        modalShowState : false,
      })
      this.manualExcute()
      intervalvar  = setInterval(
        () => this.manualExcute(),
        this.state.autoTime
      );
    }
    

    closeModal(){
      this.setState({
        modalShowState : false,
        autoProfit : 0.1,
        autoAmount : 1,
        autoTime   : 30000,
        autoSlippage  : 100,
        autoGasLimit  : 500000,
        autoGasValue  : 40,
      })
    }

    stopAutoExcute(){
      this.setState({
        autoExcuteButtonState : false,
        autoProfit    : 0.1,
        autoAmount    : 1,
        autoTime      : 30000,
        autoSlippage  : 100,
        autoGasLimit  : 500000,
        autoGasValue  : 40,
        autoModeState : false,
      })
      console.log("stop excute")
      clearInterval(intervalvar)
    }
 
    render() {
        var rowstable = this.state.tableDatas
        const datatable = {
          columns : [
            {
                label : 'Token',
                field : 'tokenName',
            },
            {
                label : 'Uni Buy Amount',
                field : 'uni_buy',
            },
            {
              label : 'Sushi Buy Amount',
              field : 'sushi_buy',
            },
            {
              label : 'Defi Buy Amount',
              field : 'defi_buy',
            },
            {
              label : 'Uni Sell Amount',
              field : 'uni_sell',
            },
            {
              label : 'Sushi Sell Amount',
              field : 'sushi_sell',
            },
            {
              label : 'Defi Sell Amount',
              field : 'defi_sell',
            },
            {
              label : 'Profit Rate',
              field : 'profit_rate_style',
            },
          ],
          rows : rowstable,
        }

        const rowslog = this.state.logs
        const datalog = {
          columns: [
            {
              label: 'TimeStamp',
              field: 'timeStamp',
              sort: 'asc',
              width: 150
            },
            {
              label: 'Trade Token',
              field: 'tradeToken',
              sort: 'asc',
              width: 270
            },
            {
              label: 'Trade Amount',
              field: 'loanAmount',
              sort: 'asc',
              width: 200
            },
            {
              label: 'Buy Dex',
              field: 'firstDex',
              sort: 'asc',
              width: 100
            },
            {
              label: 'Sell Dex',
              field: 'secondDex',
              sort: 'asc',
              width: 100
            },
            {
              label: 'Trade Rate',
              field: 'tradeRate',
              sort: 'asc',
              width: 100
            }
          ],
          rows : rowslog
        };

        const handleInputAddress = (e) => {
          let addLabel  = e.target.value
          this.setState({
            inputAddress : addLabel
          })
          console.log(this.state.inputAddress)
        }

        const handleAutoProfit = (e) => {
          let addLabel  = e.target.value
          this.setState({
            autoProfit : addLabel
          })
        }

        const handleAutoAmount = (e) => {
          let addLabel  = e.target.value
          this.setState({
            autoAmount : addLabel
          })
        }

        const handleAutoTimepitch = (e) => {
          let addLabel  = e.target.value
          this.setState({
            autoTime : addLabel
          })
        }

        const handleAutoSlippage = (e) => {
          let addLabel  = e.target.value
          this.setState({
            autoSlippage : addLabel
          })
        }

        const handleAutoGasValue = (e) => {
          let addLabel  = e.target.value
          this.setState({
            autoGasValue : addLabel
          })
        }

        const handleAutoGasLimit = (e) => {
          let addLabel  = e.target.value
          this.setState({
            autoGasLimit : addLabel
          })
        }

        const handleOwnerAddress = (e) => {
          let addLabel  = e.target.value
          this.setState({
            ownerAddress : addLabel
            
          })
        }

        const handleOwnerPrivateKey = (e) => {
          let addLabel  = e.target.value
          this.setState({
            ownerPrivateKey : addLabel
          }) 
        }       
      
        return (
          <div>
            
                <div className= "row">
                    <div className = "col-7">
                    <Card  bg="light" style={{ height: '35rem' , overflow:'scroll'}} border="primary" overflow="scroll">
                      <Card.Body>
                        <Card.Title><h2> <FiMonitor/>  UniSwap SushiSwap Token Price Monitor</h2> <hr/></Card.Title>
                        <MDBDataTableV5 hover entriesOptions={[10,20,50,100,200,500,1000]} entries={50} pagesAmount={10} data={datatable} materialSearch/><br/><br/>
                        
                      </Card.Body>
                    </Card><br/>

                    <Card bg="light"  style={{ height: '30rem', overflow:'scroll' }} border="primary" >
                      <Card.Body>
                        <Card.Title><h2> <BsClockHistory/>  Trade Log</h2> <hr/></Card.Title>
                        <MDBDataTableV5 hover entriesOptions={[10,20,50,100,200,500,1000]} entries={50} pagesAmount={1000} data={datalog} />
                      </Card.Body>
                    </Card>
                    </div>
   
                    <div className = "col-5">

                    <Card bg="light"  style={{ height: '67rem', overflow:'scroll' }} border="primary">
                      <Card.Body>
                      
                      <h2> <GiReceiveMoney/>  Input Loan Amount</h2> <hr/><br/>
                      <div className = "row">
                        <div className = "col-1"></div>
                        <div className = "col-10">
                        <InputGroup className="mb-3">
                          <InputGroup.Text id="basic-addon3">
                            Flash Amount (Eth)
                          </InputGroup.Text>
                          <FormControl id="basic-url" aria-describedby="basic-addon3" type="text"   defaultValue = {this.state.autoAmount} 
                          onChange={handleAutoAmount}
                          placeholder="Loan Amount  X ETH X is integer"  />
                          <Button variant="primary" id="button-addon2"  onClick={()=>this.getPriceData()}>
                           <BsTable/> Get Price Data
                          </Button>
                           
                        </InputGroup>
                        </div>
                        <div className = "col-1"></div>
                      </div><br/><br/><br/>
                        <h2> <FiUserPlus/>  Input your Wallet Address and Private Key</h2> <hr/><br/>
                          <div className= "row">
                            <div className = "col-1"></div>
                            <div className = "col-10">
                              <InputGroup className="mb-3">
                                <FormControl
                                  placeholder="Wallet address"
                                  aria-label="Recipient's username"
                                  aria-describedby="basic-addon2"
                                  defaultValue = {this.state.ownerAddress}
                                  onChange={handleOwnerAddress}
                                />
                                
                                <FormControl
                                  placeholder="Private Key"
                                  aria-label="Recipient's username"
                                  aria-describedby="basic-addon2"
                                  defaultValue = {this.state.ownerPrivateKey}
                                  onChange={handleOwnerPrivateKey}
                                />

                              </InputGroup>
                              </div>
                            <div className = "col-1"></div>
                          </div><br/><br/><br/>

                          <h2> <FiPlus/>  Add Token Address</h2> <hr/><br/>
                          <div className= "row">
                            <div className = "col-1"></div>
                            <div className = "col-10">
                              <InputGroup className="mb-3">
                                <FormControl
                                  placeholder="Add Token address  "
                                  aria-label="Recipient's username"
                                  aria-describedby="basic-addon2"
                                  defaultValue = {this.state.inputAddress}
                                  onChange={handleInputAddress}
                                />
                                <Button variant="primary" id="button-addon2"  onClick={()=>this.addAddress()}>
                                <FiPlus/>  Add Token Address
                                </Button>
                              </InputGroup>
                              </div>
                            <div className = "col-1"></div>
                          </div>
                          <br/><br/><br/><br/>

                          <h2> <FiCloudLightning/>   Excution Trading</h2> <hr/><br/><br/>
                          <p  show = {this.state.showstate}>We can excute Flash Loan Excute on <b>{this.state.tradeToken}</b> Token, buy price is(Eth/Token) <b>{this.state.tradebuyprice}</b> , sell price is(Eth/Token) <b>{this.state.tradesellprice} </b>, profit rate is <b>{this.state.traderate} %</b> </p><br/><br/>
                          <div className= "row">
                          <div className = "col-1"></div>
                          <div className = "col-10">
                          <InputGroup className="mb-3">

                          <Button variant={this.state.autoExcuteButtonState ? "danger" : "success"} id="button-addon2"  onClick={this.state.autoExcuteButtonState ? ()=>this.stopAutoExcute(): ()=>this.autoExcute()}  style={{ width: '100%' }}>
                          <FiCloudLightning/>  {this.state.autoExcuteButtonState ? "Stop Auto Excute" : "Start Auto Excute"} 
                          </Button>
                          </InputGroup>
                          </div></div>
                          <br/><br/><br/>
                      </Card.Body>
                    </Card>
                     
                    </div>
                </div>
                <Modal show = {this.state.modalShowState}> 
                  <Modal.Header closeButton onClick={()=>this.closeModal()}>
                    <Modal.Title>Auto-Excute</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="basic-addon3">
                      Profit Rate
                    </InputGroup.Text>
                    <FormControl id="basic-url1" aria-describedby="basic-addon3"  type="text"  defaultValue = {this.state.autoProfit} 
                    onChange={handleAutoProfit}
                    placeholder="Profit Limit, unit : %"/>
                    <InputGroup.Text id="basic-addon2">%</InputGroup.Text>
                  </InputGroup>
                  
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="basic-addon3">
                      Interval 
                    </InputGroup.Text>
                    <FormControl id="basic-url" aria-describedby="basic-addon3" type="text"   defaultValue = {this.state.autoTime} 
                    onChange={handleAutoTimepitch}
                    placeholder="Interval  Unit : ms"  />
                    <InputGroup.Text id="basic-addon2">ms</InputGroup.Text>
                  </InputGroup>

                  <InputGroup className="mb-3">
                    <InputGroup.Text id="basic-addon3">
                      Slippage 
                    </InputGroup.Text>
                    <FormControl id="basic-url" aria-describedby="basic-addon3" type="text"   defaultValue = {this.state.autoSlippage} 
                    onChange={handleAutoSlippage}
                    placeholder="Slippage Unit : %"  />
                    <InputGroup.Text id="basic-addon2">%</InputGroup.Text>
                  </InputGroup>

                  <InputGroup className="mb-3">
                    <InputGroup.Text id="basic-addon3">
                      Gas value 
                    </InputGroup.Text>
                    <FormControl id="basic-url" aria-describedby="basic-addon3" type="text"   defaultValue = {this.state.autoGasValue} 
                    onChange={handleAutoGasValue}
                    placeholder="Gas Value Unit : gwei"  />
                    <InputGroup.Text id="basic-addon2">Gwei</InputGroup.Text>
                  </InputGroup>

                  <InputGroup className="mb-3">
                    <InputGroup.Text id="basic-addon3">
                      Gas Limit 
                    </InputGroup.Text>
                    <FormControl id="basic-url" aria-describedby="basic-addon3" type="text"   defaultValue = {this.state.autoGasLimit} 
                    onChange={handleAutoGasLimit}
                    placeholder="Gas Limit"  />
                  </InputGroup>

                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={()=>this.closeModal()}>
                      Close
                    </Button>
                    <Button variant="primary"   onClick={()=>this.autoExcuteStart()}>
                      Start
                    </Button>
                  </Modal.Footer>
                </Modal>
          </div>
        );
    }
}

export default Display;
