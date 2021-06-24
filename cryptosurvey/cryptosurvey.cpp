#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>

using namespace eosio;
using namespace std;

#define ON_TRANSFER

CONTRACT cryptosurvey : public contract{
	public:
        
        cryptosurvey(
           name reciver,
           name code,
           datastream<const char *> ds
         ):contract(reciver,code,ds),
           myToken("ORE",4){}

        using contract::contract;

        TABLE users{
           name user;
           auto primary_key() const {return user.value;}
        };
       
        typedef multi_index<name("users"),users> userTable;
        
   private:
      const symbol myToken;

};
