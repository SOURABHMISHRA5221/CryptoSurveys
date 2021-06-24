#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>

using namespace eosio;
using namespace std;

#define ON_TRANSFER [[eosio::on_notify("eosio.token::transfer")]]

CONTRACT cryptosurvey : public contract{
	public:
        
        cryptosurvey(
           name reciver,
           name code,
           datastream<const char *> ds
         ):contract(reciver,code,ds),
           myToken("ORE",4)
           {}

        using contract::contract;

        TABLE credscrore{
           name user;
           int score;
           auto primary_key() const {return user.value;}
        };

        typedef multi_index<name("credscore"),credscrore> credscrores;

        ACTION insertscore(name user,int score){
           require_auth(name("cryptosurvey"));
           addScore(user,score);
        }

        ACTION deleteuser(name user){
           require_auth(name("cryptosurvey"));
           delUser(user);
        }

       


        
   private:
      const symbol myToken;
      
      
      void addScore(name user,int score){
         credscrores _credscore(get_self(),get_self().value);
         auto itr = _credscore.find(user.value);
         if ( itr == _credscore.end()){
            addNewUser(user,score);
         }
         else{
            _credscore.modify(itr,get_self(),[&](auto& olduser){
                      olduser.score += score;
            });
         }
      }

      void addNewUser(name user,int value){
         credscrores _credscore(get_self(),get_self().value);
         _credscore.emplace(get_self(),[&](auto& newUser){
              newUser.user = user;
              newUser.score = value;
         });
      }

      void delUser(name user){
         credscrores _credscore(get_self(),get_self().value);
         auto itr = _credscore.find(user.value);
         check(itr != _credscore.end(),"USER DOES'T EXIST");
         _credscore.erase(itr);
      }

      

};
