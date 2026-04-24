#include <bits/stdc++.h>
using namespace std;
#define int long long

signed main(){
    ios_base::sync_with_stdio(0);
    cout.tie(0);
    cin.tie(0);

    vector<string> data;

    string temp;

    while(getline(cin, temp)){
        data.push_back(temp);
    }
    
    cout << "INSERT INTO cursos (nome) VALUES ";

    for(auto &x : data){
        cout << "('" << x << "')";
        if(x != data.back()) cout << ", ";
    }
    cout << ";";
}

