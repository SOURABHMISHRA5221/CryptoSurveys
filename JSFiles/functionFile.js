const {Api, JsonRpc, RpcError } = require('eosjs');
const {JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const fetch = require('node-fetch');
const { TextEncoder, TextDecoder } = require('util');

const defaultPrivateKey = "5KM2DtmsLdp5VcMTxyUakVGBhRo9Yqi3Tzk2sQwwxsCLNQerxun"; // edit this key
const signatureProvider = new JsSignatureProvider([defaultPrivateKey]);

const rpc = new JsonRpc('http://127.0.0.1:8888',{fetch});
const api = new Api({rpc,signatureProvider,textDecoder:new TextDecoder(),textEncoder:new TextEncoder()});

const prompt = require('prompt');
prompt.start();

/*This function helps in inserting score for a participants 
  argument required : 
  participant : Name of the participant
  score: The score to add (can be negative)
  stake: The amount of token to add ( always greater than 0)
  company: The name of the company whos survey was responded by the participant */
function insertscore(){
	prompt.get(['participant','score','stake','company'], (err,result)=>{
	if (err){return onErr(err);}
    try{
         (async () => {
  			const resu = await api.transact({
   				actions:[{
  	  				account: 'cryptosurvey',
  	  				name: 'insertscore',
  	  				authorization:[{
  	  					actor:'cryptosurvey',
  	  					permission:'active',
  	  			}],
  	   			data:{
        			user: result.participant,
        			score:Number(result.score),
        			stake:result.stake,
        			company: result.company,
  	   			},
  			}]},{
  		blocksBehind: 3,
  		expireSeconds: 30,
		});
  		console.dir(resu);
		})();
	}catch(e){
		console.log('Caught: \n'+e);
		if ( e instanceof RpcError){
			console.log(JSON.stringify(e.json,null,2));
		}
	}
	
});
	
	
}

/*This function helps in getting table from any contract
  arguments required: 
  code : name of the contract where the code is located
  scope: name of the contract/symbol/account under whose scope you want to see the table
  table: name of the table */
function gettable(){
	prompt.get(['code','scope','table'],(err,result) => {
	try{
		(async () =>{
       	const resu = await rpc.get_table_rows({
       		json:true,
       		code: result.code,
       		scope: result.scope,
       		table: result.table,
       		limit: 10

       	});
     
       	
       	console.log(resu['rows']);
	})();
	}
	catch(e){
		console.log('Caught: \n'+e);
		if ( e instanceof RpcError){
			console.log(JSON.stringify(e.json,null,2));
		}
	}
	});
}

/* This function helps in getting the account information 
   requires only one argument name of the person whose account details are required
*/
function getaccount(){
	prompt.get(['name'],(err,result)=>{
		try{
			( async () =>{
				const resu = await rpc.get_account(
					result.name
				);
                    console.log(resu);
			})();			
		}catch(e){
			if (e instanceof RpcError){
				console.log(JSON.stringify(e.json,null,2));
			}
		}

	});
}

/* This function helps in inserting data for the survey company
   arguments required:
   to: name of the company
   stake: amount of token bought by the company
*/
function insertSurveyCompany(){
	prompt.get(['to','stake'],(err,result)=>{
		try{
              ( async ()=>{
              	  const resu = await api.transact({
              	  	actions:[{
  	  				account: 'eosio.token',
  	  				name: 'transfer',
  	  				authorization:[{
  	  					actor:'cryptosurvey',
  	  					permission:'active',
  	  			}],
  	   			data:{
        			from: 'cryptosurvey',
        			to:result.to,
        			quantity:result.stake,
        			memo: 'COMPANY'
  	   			},
  			}]},{
  		     blocksBehind: 3,
  		     expireSeconds: 30,
		
              	  });
              	  console.log(resu);
              })();
		}
		catch(e){
             if ( e instanceof RpcError){
             	 console.log(JSON.stringify(e.json,null,2));
             }
		}
	});
}

/*This function helps in creating a new account
  requires only one argument and that is the name by which you want to create account.
  makesure that name is made up of only this characters : abcdefghijklmnopqrstuvwxyz12345
  and is not longer than 12 letters */
function createAccount(){
	prompt.get( ['name'],(err,result)=>{
		try{
             (async () => {
             		const resu  = await api.transact({
             			actions: [{
      					account: 'eosio',
      					name: 'newaccount',
      					authorization: [{
        					actor: 'cryptosurvey',
        					permission: 'active',
      				}],
      				data:{
        			      	creator: 'cryptosurvey',
       				 	name: result.name,
        					owner: {
          					threshold: 1,
          					keys: [{
           						 key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
           						 weight: 1
          						}],
          					accounts: [],
          					waits: []
       					 },
        					active: {
          					threshold: 1,
          					keys: [{
            						key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
           					 	weight: 1
         					 	}],
          					accounts: [],
          					waits: []
        					},
  	   					},
  					}]},{
  		   				  blocksBehind: 3,
  		     			  expireSeconds: 30,
		 });
              	console.log(resu);
          })();
		}catch(e){
			if ( e instanceof RpcError){
                  console.log(JSON.stringify(e.json,null,2));
			}
		}

	});
}

/* !!!One of the most important function available in this file
   Performs transfer action on behalf of cryptosurvey account
   arguments required: 
   to: name of the account to get the token
   stake: token to transfer
   memo: 4 choices are available for this 
     a) USER : if memo contains USER keyword then it will insert the account name 
*/
function transfer(){
	prompt.get(['to','stake','memo'], (err,result)=>{
	if (err){return onErr(err);}
    try{
         (async () => {
  			const resu = await api.transact({
   				actions:[{
  	  				account: 'eosio.token',
  	  				name: 'transfer',
  	  				authorization:[{
  	  					actor:'cryptosurvey',
  	  					permission:'active',
  	  			}],
  	   			data:{
        			from: "cryptosurvey",
        			to:result.to,
        			quantity:result.stake,
        			memo: result.memo,
  	   			},
  			}]},{
  		blocksBehind: 3,
  		expireSeconds: 30,
		});
  		console.dir(resu);
		})();
	}catch(e){
		console.log('Caught: \n'+e);
		if ( e instanceof RpcError){
			console.log(JSON.stringify(e.json,null,2));
		}
	}
	
});
}

function clearRefund(){
	prompt.get(['user'], (err,result)=>{
	if (err){return onErr(err);}
    try{
         (async () => {
  			const resu = await api.transact({
   				actions:[{
  	  				account: 'cryptosurvey',
  	  				name: 'clearrefund',
  	  				authorization:[{
  	  					actor:'cryptosurvey',
  	  					permission:'active',
  	  			}],
  	   			data:{
        			user: result.user
  	   			},
  			}]},{
  		blocksBehind: 3,
  		expireSeconds: 30,
		});
  		console.dir(resu);
		})();
	}catch(e){
		console.log('Caught: \n'+e);
		if ( e instanceof RpcError){
			console.log(JSON.stringify(e.json,null,2));
		}
	}
	
});
}

function rmCompany(){
	prompt.get(['company'], (err,result)=>{
	if (err){return onErr(err);}
    try{
         (async () => {
  			const resu = await api.transact({
   				actions:[{
  	  				account: 'cryptosurvey',
  	  				name: 'rmcompany',
  	  				authorization:[{
  	  					actor:'cryptosurvey',
  	  					permission:'active',
  	  			}],
  	   			data:{
        			company: result.company
  	   			},
  			}]},{
  		blocksBehind: 3,
  		expireSeconds: 30,
		});
  		console.dir(resu);
		})();
	}catch(e){
		console.log('Caught: \n'+e);
		if ( e instanceof RpcError){
			console.log(JSON.stringify(e.json,null,2));
		}
	}
	
});
}

function clearUser(){
	prompt.get(['user'], (err,result)=>{
	if (err){return onErr(err);}
    try{
         (async () => {
  			const resu = await api.transact({
   				actions:[{
  	  				account: 'cryptosurvey',
  	  				name: 'clearuser',
  	  				authorization:[{
  	  					actor:'cryptosurvey',
  	  					permission:'active',
  	  			}],
  	   			data:{
        			user: result.user
  	   			},
  			}]},{
  		blocksBehind: 3,
  		expireSeconds: 30,
		});
  		console.dir(resu);
		})();
	}catch(e){
		console.log('Caught: \n'+e);
		if ( e instanceof RpcError){
			console.log(JSON.stringify(e.json,null,2));
		}
	}
	
});
}

prompt.get(['function_name'],(err,result)=>{
	if ( result.function_name == "insertscore"){
		insertscore();
	}
	else if ( result.function_name == "gettable"){
		gettable();
	}
	else if ( result.function_name == "getaccount"){
		getaccount();
	}
	else if ( result.function_name == "insertSurveyCompany"){
		insertSurveyCompany();
	}
	else if ( result.function_name == "createaccount"){
		createAccount();
	}
	else if ( result.function_name == "transfer"){
		transfer();
	}
	else if ( result.function_name == "clearRefund"){
		clearRefund();
	}
	else if ( result.function_name == "rmCompany"){
		rmCompany();
	}
	else if ( result.function_name == "clearUser"){
		clearUser();
	}
	else {
		console.log("invalid function");
	}
})
