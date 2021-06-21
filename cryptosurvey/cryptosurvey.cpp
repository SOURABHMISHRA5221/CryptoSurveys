#include <eosio/eosio.hpp>

using namespace eosio;
using namespace std;

CONTRACT cryptosurvey : public contract{
	public:
        
        TABLE users{
           name user;
           auto primary_key() const {return user.value;}
        };
       
        typedef multi_index<name("users"),users> userTable;
        
        using contract::contract;
        ACTION adduser( name user){
           require_auth(user);
           userTable _userTable(get_self(),get_self().value);
           auto itr = _userTable.find(user.value);
           
           if ( itr != _userTable.end()){
             _userTable.emplace(user,[&](auto& newRecord){
                newRecord.user =user;
             });
           }
           else{
             _userTable.modify(itr,user,[&]( auto& record){
                 record.user = user;
             });
           }
           
        }

};
