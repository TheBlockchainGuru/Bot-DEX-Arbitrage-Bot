import React, {Component} from 'react';
import { database} from './firebase/firebase';
import { MDBDataTableV5 } from 'mdbreact';



class WalletList extends Component {
    constructor(props) {
        super(props)
        this.state = {
          log : [],
          logs :[],
        }
    }

    async componentWillMount() {
      await this.Load()
    }
    Load(){
        database.ref('log/').get().then((snapshot) => {
            if (snapshot.exists) {
              var logs = [];
                const newArray = snapshot.val();
                
                if (newArray) {
                    Object.keys(newArray).map((key, index) => {
                        
                      const value = newArray[key];
                        logs.push({
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

    render () {

      const rows = this.state.logs
      // const rows = this.state.walletLists.map((walletList) => {
      //   walletList.Actions =  <div>
      //                              <Button variant="outline-primary"  size = "sm" onClick={()=>this.editWalletList(walletList.key, walletList.Label, walletList.Address)}> Edits</Button>{' '}
      //                              <Button variant="outline-danger"  size = "sm" onClick= {()=>this.deleteWalletList(walletList.key)}> Delete</Button>{' '}
      //                         </div>
      //   return walletList
      // })
          const data = {
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
            rows : rows
          };

      
        return (
            <div>
                <h2>MY WALLET LIST</h2>
                <hr/><br/><br/>
                <br/><br/>
                <MDBDataTableV5 hover entriesOptions={[5, 20, 25]} entries={5} pagesAmount={4} data={data} />
            </div>
        );
    }
  }
export default WalletList;


