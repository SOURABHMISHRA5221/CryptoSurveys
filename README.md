# Cryptosurvey

## Follow below steps to run the code:


- Setup Nodeos,Cleos and Kesod <br />
          <pre>  Follow [this](https://developers.eos.io/welcome/latest/getting-started-guide/local-development-environment/index) tutorial for that </pre> <br />
- Create an account with name cryptosurvey using following command <br /><pre>
          `cleos create account eosio cryptosurvey (paste eosio public key here)  -p eosio@active` </pre> <br />
- Setting eosio.token contract<br /> <pre>
           Follow [this](https://developers.eos.io/manuals/eosio.contracts/latest/guides/how-to-create-issue-and-transfer-a-token) </pre> <br />
- Download the Source code from git <br />
- Go to folder Cryptosurvey in contracts <br />
- Compile the code with following command <br /> <pre>
      `eosio-cpp --abigen cryptosurvey.cpp -o cryptosurvey.wasm` </pre> <br /> 
- Set cryptosurvey contract <br /> <pre>
       `cleos set contract cryptosurvey . -p cryptosurvey@active` </pre> <br />

After completing the last step our cryptosurvey contract will get deployed in our local blockchain, Now to push function in our contract we can follow two ways <br />
- Using normal cleos cli command <br /> <pre>
    To get completely familiar with cleos it is recommanded to follow one of the smart contract course on [this](https://eos.io/training-certification/) site.</pre> <br />
- Using the functionFile.js in JSFiles folder. <br />
    

     
