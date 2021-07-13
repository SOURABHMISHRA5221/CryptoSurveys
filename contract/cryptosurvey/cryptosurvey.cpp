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
           myToken("SOM",4)
           {}

        TABLE surveydata{
            name company;
            int64_t balance;
            auto primary_key() const {return company.value;}
        };

        typedef multi_index<name("surveytbl"),surveydata> surveydatas;

        TABLE userdetail{
           name user;
           int64_t balance;
           int64_t score;
           auto primary_key() const {return user.value;}
        };

        typedef multi_index<name("usertbl"),userdetail> userdetails;

        TABLE refunddetail{
           name user;
           int64_t balance;
           auto primary_key() const {return user.value;}
        };

        typedef multi_index<name("refundtbl"),refunddetail> refunddetails;
         
        using contract::contract;

        ON_TRANSFER
        void transferaction(name storer,name reciver,asset stake,string data){
          check( (data ==string("COMPANY") || data == string("USER") || data == string("REFUND") || data == string("REMOVED")),"Enter correct information in memo");
          check(stake.symbol == myToken,"Not our token");
          if ( data == string("COMPANY")) {
               addsurvey(reciver,stake.amount);
          }
          else if ( data == string("USER")){
               addNewUser(reciver,0,stake.amount);
          }
          else if ( data  == string("REFUND")){
              addToRefundTable(storer,stake.amount);
          }
          else{
              print("THANKS FOR INVESTING");
          }
        }

        ACTION insertscore(name user,int64_t score,asset stake,string company){
           require_auth(name("cryptosurvey"));
           check(stake.symbol == myToken,"Not our token");
           addScore(user,score,stake.amount,name(company));
        }

        ACTION rmcompany(name company){
           require_auth(name("cryptosurvey"));
           delCompany(company);
        }

        ACTION clearuser(name user){
           require_auth(name("cryptosurvey"));
           delUser(user);
        }

        ACTION clearrefund(name user){
           require_auth(name("cryptosurvey"));
           clearRefund(user);
        }
                        
   private:
      const symbol myToken;

      void addScore(name user,int64_t score,int64_t balance,name company){
         decreaseCompanyBalance(balance,company);
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
         double balance  = itr->balance*0.998;
         asset payoutasset(balance,myToken);
         action payoutaction = action(
            permission_level{get_self(),name("active")},
            name("eosio.token"),
            name("transfer"),
            make_tuple(get_self(),user,payoutasset,string("REMOVED"))
         );
         payoutaction.send();
         _userdetails.erase(itr);
      }

      void addsurvey(name s,int64_t bal){
         surveydatas _surveydatas(get_self(),get_self().value);
         auto itr = _surveydatas.find(s.value);
         if ( itr == _surveydatas.end()){
           _surveydatas.emplace(get_self(),[&](auto& nw){
                nw.company = s;
                nw.balance = bal;
           });
         }
         else{
           _surveydatas.modify(itr,get_self(),[&](auto& old){
               old.balance += bal;
           });
         }
      }

      void decreaseCompanyBalance(int64_t bal,name comp){
         surveydatas _surveydatas(get_self(),get_self().value);
         auto itr = _surveydatas.find(comp.value);
         _surveydatas.modify(itr,get_self(),[&](auto& data){
              data.balance -= bal;
         });
      }

      void delCompany(name company){
         surveydatas _surveydatas(get_self(),get_self().value);
         auto itr =  _surveydatas.find(company.value);
         double balance  = itr->balance*0.998;
         asset payoutasset(balance,myToken);
         action payoutaction = action(
            permission_level{get_self(),name("active")},
            name("eosio.token"),
            name("transfer"),
            make_tuple(get_self(),company,payoutasset,string("REMOVED"))
         );
         payoutaction.send();
         _surveydatas.erase(itr);

      }

      void addToRefundTable(name user,int64_t balance){
          refunddetails _refunddetails(get_self(),get_self().value);
          auto itr = _refunddetails.find(user.value);
          if ( itr == _refunddetails.end()){
              _refunddetails.emplace(get_self(),[&](auto& newUser){
                  newUser.user = user;
                  newUser.balance = balance;
              });
          }
          else{
             _refunddetails.modify(itr,get_self(),[&](auto& User){
                   User.balance += balance;
              });
          }
      }

      void clearRefund(name user){
          refunddetails _refunddetails(get_self(),get_self().value);
          auto itr  = _refunddetails.find(user.value);
          check(itr != _refunddetails.end(),"record DOES'NT exist");
          _refunddetails.erase(itr);
      }
};
