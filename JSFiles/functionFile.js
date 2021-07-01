const {Api, JsonRpc, RpcError } = require('eosjs');
const {JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const fetch = require('node-fetch');
const { TextEncoder, TextDecoder } = require('util');

const defaultPrivateKey = "5KM2DtmsLdp5VcMTxyUakVGBhRo9Yqi3Tzk2sQwwxsCLNQerxun";
const signatureProvider = new JsSignatureProvider([defaultPrivateKey]);

const rpc = new JsonRpc('http://127.0.0.1:8888',{fetch});
const api = new Api({rpc,signatureProvider,textDecoder:new TextDecoder(),textEncoder:new TextEncoder()});

const prompt = require('prompt');
prompt.start();


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
        			stake:result.stake,
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
        			name: result.user
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
        			name: result.company
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
        			name: result.user
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