import Game from "./components/Game";
import { useState, useEffect } from "react";
import { ImmortalStorage, CookieStore, LocalStorageStore } from "immortal-db";
import { ethers } from "ethers";
import "./App.css";

// CookieStore -> keys and values are stored in document.cookie
// IndexedDbStore -> keys and values are stored in window.indexedDB
// LocalStorageStore -> keys and values are stored in window.localStorage
// SessionStorageStore -> keys and values are stored in window.sessionStorage

// use cookie storage and local storage
const stores = [new CookieStore(), new LocalStorageStore()];
const db = new ImmortalStorage(stores);

function App() {
  const [keyData, setKeyData] = useState("");

  //Maintains JWT validity
  async function maintainJWT(newJWT) {
    let jwt = newJWT;
    if (jwt == undefined) {
      jwt = await getJWT();
    }

    if (jwt == undefined || shouldRenew(jwt)) {
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
    if ((await db.get("exWallet")) == undefined) {
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
    if (!walletStatus) {
      let etherWallet = await ethers.Wallet.createRandom();
      let wallet = {
        address: etherWallet.address,
        publicKey: etherWallet.publicKey,
        privateKey: etherWallet.privateKey,
        mnenomic: etherWallet.mnemonic,
      };
      await putWallet(wallet);
      etherWallet = null;
    }
    return;
  }

  //Begin Ethereum Wallet Transaction Listener
  useEffect(() => {
    const handleMsg = (event) => {
      if(event.data && event.data.type === 'button-click') {
        console.log("cost is: $" + event.data.message)
      }
    }
    window.addEventListener("message", handleMsg);

    return () => window.removeEventListener("message", handleMsg);
  }, [])

  // value can be json data
  // TODO: fetch JSON from cookies / localstorage and validate via JSON validation library
  // once user wallet is verified, user info stored as cookie
  // so they can proceed with application
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
          {/* <input placeholder='Enter User Id' onChange={(e) => {
          setKeyData(e.target.value);
        }}/> */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex flex-col items-center">
              <button
                className="bg-black text-white rounded-full px-6 py-2 font-semibold text-lg hover:bg-opacity-75"
                onClick={() => initWallet()}
              >
                Initialize Wallet
              </button>
              <label>Check cookies - wallet</label>
            </div>

            <div className="flex flex-col items-center">
              <button
                className="bg-black text-white rounded-full px-6 py-2 font-semibold text-lg hover:bg-opacity-75"
                onClick={() => setCookie(keyData)}
              >
                Store Cookies
              </button>
              <label>Check cookies when clicked</label>
            </div>

            <div className="flex flex-col items-center">
              <button
                className="bg-black text-white rounded-full px-6 py-2 font-semibold text-lg hover:bg-opacity-75"
                onClick={() => clearAllCookies()}
              >
                Clear all cookies
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
