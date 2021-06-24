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

        TABLE surveydata{
            name company;
            int64_t balance;
            auto primary_key() const {return company.value;}
        };

        typedef multi_index<name("surveydata"),surveydata> surveydatas;

        TABLE userdetail{
           name user;
           int64_t balance;
           int64_t score;
           auto primary_key() const {return user.value;}
        };

        typedef multi_index<name("userdetail"),userdetail> userdetails;
         
        using contract::contract;

        ACTION insertscore(name user,int score,asset stake,name company){
           require_auth(name("cryptosurvey"));
           check(stake.symbol == myToken,"Not our token");
           addScore(user,score,stake.amount);
        }

        ACTION clearuser(name user){
           require_auth(name("cryptosurvey"));
           delUser(user);
        }

        ON_TRANSFER
        void addsurveydata(name storer,name reciver,asset stake,string data){
          check(data==string("SURVEY"),"SURVEY");

        }
                
   private:
      const symbol myToken;

      void addScore(name user,int64_t score,int64_t balance){
         userdetails _userdetails(get_self(),get_self().value);
         auto itr = _userdetails.find(user.value);
         if ( itr == _userdetails.end()){
            addNewUser(user,score,balance);
         }
         else{
            _userdetails.modify(itr,get_self(),[&](auto& olduser){
                      olduser.score   += score;
                      olduser.balance += balance;
            });
         }
      }

      void addNewUser(name user,int64_t value,int64_t balance){
         userdetails _userdetails(get_self(),get_self().value);
         _userdetails.emplace(get_self(),[&](auto& newUser){
              newUser.user = user;
              newUser.score = value;
              newUser.balance = balance;
         });
      }

      void delUser(name user){
         userdetails _userdetails(get_self(),get_self().value);
         auto itr = _userdetails.find(user.value);
         check(itr != _userdetails.end(),"USER DOES'NT EXIST");
         _userdetails.erase(itr);
      }

      void addsurvey(name s,name t,int64_t bal){
         surveydatas _surveydatas(get_self(),get_self().value);
         auto itr = _surveydatas.find(s.value);
         if ( itr == _surveydatas.end()){
           _surveydatas.emplace(get_self(),[&](auto& nw){
                nw.company = s;
                nw.balance = bal;
           });
         }
         else{
           _surveydatas.find(itr,get_self(),[&](auto& old){
               old.balance += bal;
           });
         }
      }

};
