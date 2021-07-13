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
        
	/*This table stores details of all the active company
	  keeps two attributes for a perticular data
	  1) companys account name whose data is being stored
	  2) amount of the token they own */
        TABLE surveydata{
            name company;
            int64_t balance;
            auto primary_key() const {return company.value;}
        };

        typedef multi_index<name("surveytbl"),surveydata> surveydatas;
        
	/*This table stores details of all the active participants
	  keeps three attributes for a perticular data
	  1) name of the account whose data is being stored
	  2) amount of the token he owns
	  3) his/her current credibility score*/
        TABLE userdetail{
           name user;
           int64_t balance;
           int64_t score;
           auto primary_key() const {return user.value;}
        };

        typedef multi_index<name("usertbl"),userdetail> userdetails;
        
	/*This table stores details of all the pending refund
	  keeps two attributes for a perticular data
	  1) name of the account whose data is being stored
	  2) amount of the token he/she wants to get refunded */
        TABLE refunddetail{
           name user;
           int64_t balance;
           auto primary_key() const {return user.value;}
        };

        typedef multi_index<name("refundtbl"),refunddetail> refunddetails;
         
        using contract::contract;
        /*This function helps performing various action based on the memo provided*/
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
        
	
	/*This action helps in adding score of a user can only be called by active permission of cryptosurvey acccount
	  arguments required:
	  name user = name of user/participant
	  int64_t score = score to add
	  asset stake   = token to add
	  string company = name of the company whose survey was responded by the participant
	*/
        ACTION insertscore(name user,int64_t score,asset stake,string company){
           require_auth(name("cryptosurvey"));
           check(stake.symbol == myToken,"Not our token");
           addScore(user,score,stake.amount,name(company));
        }
        
	/* This function helps in clear the data of company mentioned in company argument from the surveytbl
           and at the same time transfers the amount of token left of that company to that account. Can only be called by active permission of
	   cryptosurvey account */
        ACTION rmcompany(name company){
           require_auth(name("cryptosurvey"));
           delCompany(company);
        }
        
	/* This function helps in clear the data of user mentioned in user argument from the usertbl
           and at the same time transfers the amount of token left of that user to his/her account. Can only be called by active permission of
	   cryptosurvey account */
        ACTION clearuser(name user){
           require_auth(name("cryptosurvey"));
           delUser(user);
        }
        
	/* This function helps in clearing data of the user mentioned in user argument from the refund table. Can only be called by active permission
	   of cryptosurvey account*/
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
