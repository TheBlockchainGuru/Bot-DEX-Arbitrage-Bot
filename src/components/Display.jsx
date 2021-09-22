import React, { Component } from 'react';
import { Button,InputGroup, FormControl, Modal, Card} from 'react-bootstrap';
import './App.css';
import Web3 from 'web3';
import { erc20abi , abi } from './abi';
import { MDBDataTableV5 } from 'mdbreact';
import { database,  } from './firebase/firebase';
import { FiMonitor , FiPlus , FiCloudLightning , FiUserPlus   } from "react-icons/fi";
import { BsClockHistory } from "react-icons/bs"
import LoanContract from '../contracts/artifacts/FlashloanV1.json';

const smartContractAddress = "";

// const options = {
//   timeout: 30000,
//   clientConfig: {
//       maxReceivedFrameSize:   100000000,
//       maxReceivedMessageSize: 100000000,
//   },
//   reconnect: {
//       auto: true,
//       delay: 5000,
//       maxAttempts: 15,
//       onTimeout: false,
//   },
// };
// const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://purple-wispy-flower.quiknode.pro/a2ae460515f061ce64f526edcb10eda275f62585/', options));
const web3    = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"));
const uniswap_address = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
const sushi_address = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F'
const Eth_address   = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

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
        uni2sushiRate : 0,
        sushi2uniRate : 0,
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
        direction : 1,
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
        // await this.sleep(5000)
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
                          direction  : value.direction,
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

    async start (){
      console.log("update table")

      for (let index = 0; index < this.state.tokenAddresses.length; index++) {
        console.log(index)
      try{
        let tokenContract= new web3.eth.Contract(erc20abi,this.state.tokenAddresses[index]["Address"]);
        let tokenName    = await tokenContract.methods.symbol().call().then(function(res) {  return res;  })
        let tokenDecimal = await tokenContract.methods.decimals().call()
        let uni_buy , uni_sell,sushi_buy, sushi_sell
        if(tokenDecimal > 15 || tokenDecimal == 15 ){
          let mycontract1  = new web3.eth.Contract(abi, uniswap_address)
          uni_buy      = await mycontract1.methods.getAmountsOut(Math.pow(10, 15),[Eth_address,this.state.tokenAddresses[index]["Address"]]).call();
          uni_sell     = await mycontract1.methods.getAmountsOut(Math.pow(10, 15), [this.state.tokenAddresses[index]["Address"],Eth_address]).call();
          let mycontract2  = new web3.eth.Contract(abi, sushi_address)
          sushi_buy      = await mycontract2.methods.getAmountsOut(Math.pow(10, 15),[Eth_address,this.state.tokenAddresses[index]["Address"]]).call();
          sushi_sell     = await mycontract2.methods.getAmountsOut(Math.pow(10, 15) ,[this.state.tokenAddresses[index]["Address"],Eth_address]).call();

          uni_buy          = Math.round(uni_buy[1] / Math.pow(10, tokenDecimal - 6 )) / 1000
          sushi_buy        = Math.round(sushi_buy[1] / Math.pow(10, tokenDecimal - 6 )) / 1000
          uni_sell         = Math.round( Math.pow(10, 36 - tokenDecimal) / uni_sell[1] ) /1000
          sushi_sell       = Math.round( Math.pow(10, 36 - tokenDecimal)  / sushi_sell[1] ) /1000
        }
        else if (tokenDecimal < 15 ){
          let mycontract1  = new web3.eth.Contract(abi, uniswap_address)
          uni_buy      = await mycontract1.methods.getAmountsOut(Math.pow(10, 15),[Eth_address,this.state.tokenAddresses[index]["Address"]]).call();
          uni_sell     = await mycontract1.methods.getAmountsOut(Math.pow(10, tokenDecimal), [this.state.tokenAddresses[index]["Address"],Eth_address]).call();
          let mycontract2  = new web3.eth.Contract(abi, sushi_address)
          sushi_buy      = await mycontract2.methods.getAmountsOut(Math.pow(10, 15),[Eth_address,this.state.tokenAddresses[index]["Address"]]).call();
          sushi_sell     = await mycontract2.methods.getAmountsOut(Math.pow(10, tokenDecimal) , [this.state.tokenAddresses[index]["Address"],Eth_address]).call();

          uni_buy          = Math.round(uni_buy[1]   / Math.pow(10, tokenDecimal - 6)) / 1000
          sushi_buy        = Math.round(sushi_buy[1] / Math.pow(10, tokenDecimal - 6)) / 1000
          uni_sell         = Math.round( Math.pow(10, 21)  /   uni_sell[1]  ) /1000
          sushi_sell       = Math.round( Math.pow(10, 21)  / sushi_sell[1] ) /1000
        }
        let uni2sushiRate = Math.round((uni_buy-sushi_sell) * 10000/sushi_sell)  /100 
        let sushi2uniRate = Math.round((sushi_buy-uni_sell) * 10000/uni_sell)    /100
        if(uni_sell == 0){
          sushi2uniRate = 0
        }
        if(sushi_sell == 0){
          uni2sushiRate = 0
        }
        let uni2sushiRateStyle 
        let sushi2uniRateStyle

        if (uni2sushiRate >= 0){
           uni2sushiRateStyle     = <a className='text-success'> {uni2sushiRate} </a>
           if(uni2sushiRate > this.state.traderate){
            this.setState({
              tradeTokenAddress : this.state.tokenAddresses[index]["Address"],
              tradeToken : tokenName,
              tradebuyprice : uni_buy,
              tradesellprice : sushi_sell,
              traderate : uni2sushiRate,
              direction : 1
            })
           }
        }


        else if (uni2sushiRate < 0){
           uni2sushiRateStyle     = <a className='text-danger'> {uni2sushiRate} </a>
        }


        if (sushi2uniRate >= 0){
           sushi2uniRateStyle     = <a className='text-success'> {sushi2uniRate} </a>
           if(sushi2uniRate > this.state.traderate){
            this.setState({
              tradeTokenAddress : this.state.tokenAddresses[index]["Address"],
              tradeToken : tokenName,
              tradebuyprice : sushi_buy,
              tradesellprice : uni_sell,
              traderate : sushi2uniRate,
              direction : 2
            })
           }
        }


        else if (sushi2uniRate < 0){
           sushi2uniRateStyle     = <a className='text-danger'> {sushi2uniRate} </a>
        }

        if (this.state.tradeToken == tokenName){
          if (this.state.direction == 1){
            this.setState({
              traderate : uni2sushiRate
            })
          }
          else if(this.state.direction == 2){
            this.setState({
              traderate : sushi2uniRate
            })
          }

        }


        let tableData = {
          tokenName     : tokenName,
          tokenDecimal  : tokenDecimal,
          uni_buy      : uni_buy,
          uni_sell      : uni_sell,
          sushi_buy    : sushi_buy,
          sushi_sell    : sushi_sell,
          uni2sushiRate : uni2sushiRate ,
          sushi2uniRate : sushi2uniRate ,
          uni2sushiRateStyle : uni2sushiRateStyle,
          sushi2uniRateStyle : sushi2uniRateStyle
        }
        let tableDatas = this.state.tableDatas
        tableDatas[index] = tableData
        this.setState({
          tableDatas : tableDatas
        })

        }catch(err){
          console.log(err)
          index  =  index
        }
        if (index ==  this.state.tokenAddresses.length - 1){
          this.start()
        }
      }
    }

    async addAddress(){
      if(this.state.inputAddress==""){
        alert("Please check  Address")
        return
      }
      for (let index = 0; index < this.state.tokenAddresses.length; index++) {
        if(this.state.tokenAddresses[index]["Address"] == web3.utils.toChecksumAddress(this.state.inputAddress)){
          
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
      console.log("send transaction")

      let loanContract  = await web3.eth.Contract(LoanContract.abi, smartContractAddress);

      let nonce = await web3.eth.getTransactionCount(this.state.ownerAddress)
      console.log(nonce,this.state.ownerAddress, this.state.autoAmount, this.state.tradeToken , this.state.direction)
      console.log(this.state.autoGasLimit, this.state.autoGasValue)
      let tx = {
        from : this.state.ownerAddress,
        to   : smartContractAddress,
        data : loanContract.methods.flashloan(this.state.autoAmount, this.state.tradeTokenAddress, this.state.direction).encodeABI(),
        gasValue : web3.utils.toWei(this.state.autoGasValue, 'Gwei'),
        gas      : this.state.autoGasLimit,
        nonce    : nonce
      }
        const promise = await web3.eth.accounts.signTransaction(tx, this.state.ownerPrivateKey)
        await web3.eth.sendSignedTransaction(promise.rawTransaction).once('confirmation', () => {
          console.log('successful')
          const logList= {
            timeStamp  : new Date().toISOString(),
            loanAmount : this.state.autoAmount,
            tradeToken : this.state.tradeToken,
            tradeRate  : this.state.traderate,
            direction  : this.state.direction,
          }
          var userListRef = database.ref('log')
          var newUserRef = userListRef.push();
          newUserRef.set(logList);
          let buffer = ''
          this.setState({logList : buffer})
          this.loadlog()
        })
        .once('error', (e) => {
            console.log(e)
        })
    }

    autoExcute(){
      if (this.state.ownerAddress == '' || this.state.ownerPrivateKey == ''){
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

    async sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
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
                label : 'Uni buy Eth/Token',
                field : 'uni_buy',
            },
            {
                label : 'sushi sell Eth/Token',
                field : 'sushi_sell',
            },
            {
                label : 'Profit Rate',
                field : 'uni2sushiRateStyle',
            },
            {
                label : 'sushi buy Eth/Token',
                field : 'sushi_buy',
            },
            {
                label : 'uni sell Eth/Token',
                field : 'uni_sell',
            },
            {
                label : 'Profit Rate',
                field : 'sushi2uniRateStyle',
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
                label: 'direction',
              field: 'direction',
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

        const handleLoanAmount = (e) => {
          let addLabel  = e.target.value
          this.setState({
            loanAmount : addLabel
          })
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
        
        const handleContractAddress = (e) => {
          let addLabel  = e.target.value
          this.setState({
            contractAddress : addLabel
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
                          </div><br/><br/><br/><br/>

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
                      Flash Amount 
                    </InputGroup.Text>
                    <FormControl id="basic-url" aria-describedby="basic-addon3" type="text"   defaultValue = {this.state.autoAmount} 
                    onChange={handleAutoAmount}
                    placeholder="Loan Amount  X ETH X is integer"  />
                    <InputGroup.Text id="basic-addon2">ETH</InputGroup.Text>
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
