import Game from "./components/Game";
import { useState, useEffect } from "react";
import { ImmortalStorage, CookieStore, LocalStorageStore } from "immortal-db";
import { ethers, parseUnits } from "ethers";
import "./App.css";
import axios from "axios";
import { useDispatch } from "react-redux";

// CookieStore -> keys and values are stored in document.cookie
// IndexedDbStore -> keys and values are stored in window.indexedDB
// LocalStorageStore -> keys and values are stored in window.localStorage
// SessionStorageStore -> keys and values are stored in window.sessionStorage

// use cookie storage and local storage
const stores = [new CookieStore(), new LocalStorageStore()];
const db = new ImmortalStorage(stores);

function App() {
  const [ethRate, setEthRate] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    axios
      .get(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
      )
      .then((response) => {
        setEthRate(response.data.ethereum.usd);
      })
      .catch((error) => {
        console.error("Error fetching ETH rate", error);
      });
  }, []);

  const convertUsdToEth = (usdAmount) => {
    if (!ethRate) return 0;
    return usdAmount / ethRate;
  };

  //Maintains JWT validity
  async function maintainJWT(newJWT) {
    let jwt = newJWT;
    if (jwt === undefined) {
      jwt = await getJWT();
    }

    if (jwt === undefined || shouldRenew(jwt)) {
      let baseURL = "http://127.0.0.1:4000"; //"https://auth.exilirate.com"
      console.log("Renewing JWT");
      const wallet = await getWallet();
      const address = wallet["address"];
      fetch(
        baseURL +
          "/getNonce?" +
          new URLSearchParams({
            address: address,
          }),
        { method: "POST" },
      )
        .then(async (response) => {
          console.log(response);
          response.json().then(async (resJson) => {
            const nonce = resJson.nonce;
            const fullWallet = new ethers.Wallet(wallet["privateKey"]);
            fullWallet.signMessage(nonce).then(async (sig) => {
              fetch(
                baseURL +
                  "/login?" +
                  new URLSearchParams({
                    address: address,
                    nonce: nonce,
                    signature: sig,
                  }),
                { method: "POST" },
              ).then(async (response) => {
                response.json().then((resJson) => {
                  jwt = resJson.JWT;
                  putJWT(jwt);
                  maintainJWT(jwt);
                });
              });
            });
          });
        })
        .catch(function (err) {
          // There was an error
          console.warn("Uhh oh: ", err);
        });
    }
  }

  //Checks if wallet should renew jwt
  function shouldRenew(jwt) {
    const decodedJWT = parseJwt(jwt);
    if (Date.now() + 60000 >= decodedJWT["exp"] * 1000) {
      return true;
    } else {
      return false;
    }
  }

  //Parse JWT into JSON Object
  function parseJwt(token) {
    try {
      let base64Url = token.split(".")[1];
      let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      let jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("JWT Parse Error: \n" + err);
    }
  }

  //Check if wallet exists
  async function walletExists() {
    if ((await db.get("exWallet")) === null) {
      return false;
    } else {
      return true;
    }
  }

  //Puts wallet into immortalDB
  async function putWallet(wallet) {
    await db.set("exWallet", btoa(JSON.stringify(wallet), "base64"));
  }
  //Gets wallet into immortalDB
  async function getWallet() {
    return JSON.parse(atob(await db.get("exWallet")));
  }

  //Puts wallet into immortalDB
  async function putJWT(jwt) {
    db.set("jwt", btoa(jwt, "base64"));
  }
  //Gets wallet into immortalDB
  async function getJWT() {
    let decoded = atob(await db.get("jwt"));
    if (decoded === "ée") {
      return null;
    }
    return decoded;
  }

  async function initWallet() {
    let walletStatus = await walletExists();
    console.log("wallet status validated");
    if (!walletStatus) {
      let etherWallet = await ethers.Wallet.createRandom();
      console.log("ether wallet does not exist; created random");

      let wallet = {
        address: etherWallet.address,
        publicKey: etherWallet.publicKey,
        privateKey: etherWallet.privateKey,
        mnenomic: etherWallet.mnemonic,
      };
      await putWallet(wallet);
      console.log("wallet put into storage");
      etherWallet = null;
    }
    return;
  }

  const wallet = {
    api: "wallet",
    op: "getPublicAddr",
    nonce: 3351783782,
    res: "ETHWALLETADDR",
  };

  const authenticatedUser = {
    name: "john smith",
    guid: "12345",
    wallet: wallet,
  };

  function setCookie(key) {
    db.set(key, JSON.stringify(authenticatedUser));
  }

  function clearAllCookies() {
    console.log(document.cookie);
    document.cookie.split(/; */).forEach(async (cookie) => {
      let keyToRemove = cookie;
      const immortalPrefix = cookie.indexOf("|");
      const IMMORTAL_PREFIX_OFFSET = 1;
      const equalsIndex = cookie.indexOf("=");
      keyToRemove = keyToRemove.slice(0, equalsIndex);
      keyToRemove = keyToRemove.slice(immortalPrefix + IMMORTAL_PREFIX_OFFSET);
      await db.remove(keyToRemove);
    });
  }

  // Fetch request to get JWT token
  async function receiveJWT(userWalletAddress) {
    let JWT = null;

    try {
      const response = await fetch(
        `http://localhost:5050/api/getNonce?address=${userWalletAddress}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      let jwtNonce = data.nonce;

      const jwtResponse = await fetch(
        `http://localhost:5050/api/login?address=${userWalletAddress}&nonce=${jwtNonce}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!jwtResponse.ok) {
        throw new Error(`Error: ${jwtResponse.status}`);
      }

      // Get JWT data from request
      const jwtData = await jwtResponse.json();

      JWT = jwtData.jwt;
    } catch (error) {
      console.error("Error fetching JWT:", error);
    }

    return JWT;
  }

  async function sendTransactionData(transactionData) {
    let transactionSuccess = null;
    try {
      const transactionResponse = await fetch(
        `http://73.252.161.250/send-transaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transactionData),
        },
      );

      if (!transactionResponse.ok) {
        throw new Error(`Error: ${transactionResponse.status}`);
      } else {
        const resData = await transactionResponse.json();

        transactionSuccess = resData.Transaction_Status;
      }
    } catch (error) {
      console.log(error);
    }
    return transactionSuccess;
  }

  //Initialize a wallet
  initWallet();

  //Begin Ethereum Wallet Transaction Listener
  useEffect(() => {
    const handleMsg = async (event) => {
      if (event.data && event.data.type === "button-click") {
        console.log("cost is: $" + event.data.message);

        // Validate wallet exists
        if (!walletExists()) {
          clearAllCookies();
          initWallet();
        }

        // TO-DO: set cookie
        // setCookie(...)

        let getUserWallet = await getWallet();
        let userWalletAddress = getUserWallet.address;

        // Get JWT token from auth server
        let JWTtoken = await receiveJWT(userWalletAddress);

        if (!JWTtoken) {
          console.log("JWT not received");
        } else {
          console.log("JWT received");

          // Validate JWT -- NOTE: maintainJWT not implemented
          /* if (shouldRenew(JWT)) {
          maintainJWT(JWT);
        }*/
          const usdAmount = parseFloat(event.data.message);
          const ethAmount = convertUsdToEth(usdAmount);

          // Create JSON to send to API Gateway
          let transactionCost = {
            transaction_amount: ethAmount,
            gas: 6721975,
            gas_price: 20,
            // from_address: userWalletAddress,  //client side generated address
            //sender_private_key: getUserWallet.privateKey,
            from_address: "0xae01BcD0bBAa2Bd3B1abE0b910ABe14A0Ea8f85d", //testing address (ganache generated address)
            sender_private_key:
              "0x574cd238aa3832123dad293925b351b2a7f8f6dd5bdbaee1c70c315e29affac9", //test address key
          };

          let transaction = await sendTransactionData(transactionCost);
          if (transaction !== null) {
            dispatch({
              type: "RESET_TRANSACTION_STATUS",
            });
            dispatch({
              type: "SET_TRANSACTION_SUCCESS",
              payload: { ...transaction },
              // payload: {...transaction, timestamp: new Date().getTime()}
            });
          }
        }
      }
    };
    window.addEventListener("message", handleMsg);
    return () => window.removeEventListener("message", handleMsg);
  });

  return (
    <main className="text-white">
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer"></a>
        <a href="https://react.dev" target="_blank" rel="noreferrer"></a>
      </div>
      <div className="flex justify-center items-center h-screen bg-gradient-to-bl from-purple-900 to-blue-500">
        <div className="flex flex-col items-center w-full">
          <div className="flex flex-col items-center mb-4">
            <Game />
          </div>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex flex-col items-center"></div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
