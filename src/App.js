import './App.css'
import Web3 from 'web3'
import { useCallback, useEffect, useState } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import {loadContract} from './utils/load-contract'
 
function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null,
  })

  const [account, setAccount] = useState(null)
  const [balance, setBalance] = useState(null)

  const [shouldReload, reload] = useState(false)
  const reloadEffect = () => reload(!shouldReload)


  useEffect(()=>{
  const loadProvider = async ()=>{
    const provider = await detectEthereumProvider();
    const contract = await loadContract('Faucet', provider)

    if(provider){
      setWeb3Api({
        web3: new Web3(provider),
        provider,
        contract
      })
    }else{
      console.error("Please, Install Metamask");
    }
  }
  loadProvider()
  }, [])

  useEffect(()=>{
    const getAccount = async ()=>{
      const accounts = await web3Api.web3.eth.getAccounts();
      setAccount(accounts[0])
    }
    web3Api.web3 && getAccount()
  }, [web3Api.web3])

useEffect(()=>{
  const loadBalance = async ()=>{
    const {contract, web3} = web3Api
    const balance = await web3.eth.getBalance(contract.address)
    setBalance(web3.utils.fromWei(balance, 'ether'))
  }
  web3Api.contract && loadBalance()
},[web3Api, shouldReload])

const addFunds = useCallback(async ()=>{
  const {contract, web3} = web3Api
  await contract.addFunds({from: account, value: web3.utils.toWei('1','ether')})
  reloadEffect()
}, [web3Api, account])

const withdraw = useCallback(async ()=>{
  const {contract, web3} = web3Api;
  const withdrawAmount = web3.utils.toWei('0.5','ether')
  await contract.withdraw(withdrawAmount,{
    from: account
  })
  reloadEffect()
})

  return (
    <div className="faucet-wrapper">
      <div className="faucet">
        <div className="balance-view is-size-2">
          Current Balance: <strong>{balance} ETH</strong>
        </div>
        <button className="button is-primary mr-5" onClick={addFunds}>Donate</button>
        <button className="button is-danger mr-5" onClick={withdraw}>Withdraw</button>
        <button className="button is-link" onClick={()=>{web3Api.provider.request({method: 'eth_requestAccounts'})}}>Connect Wallets</button>
        <span>
          <p>
            <strong>Accounts address:</strong>
            {
              account ? account : 'Accounts Denied'
            } 
          </p>
        </span>
      </div>
    </div>
  );
}

export default App;
