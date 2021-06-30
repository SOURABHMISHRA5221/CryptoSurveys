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
        			memo: 'SURVEY'
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

createAccount();