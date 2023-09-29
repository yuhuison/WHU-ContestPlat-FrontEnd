import store from "@/store";
import {getRequest} from "@/utils/api";

export function getUser() {
    // localStorage获取token
    if (localStorage.token) {
        getRequest("/current_user").then(res=>{
            // console.log(res);
            let data = res.data.user;
            console.log(data)
            if (data){
                store.state.uid = data._id["$oid"];
                store.state.name = data.name;
                store.state.gid = data.group_id;
                store.state.isAdmin = (data.group_id == "650c3b5d96974a84990eb2c1");
            }
        })
        return true;
        // 舍弃
        // let loginForm = {
        //     phone: localStorage.phone,
        //     email: localStorage.email,
        //     password: localStorage.password
        // }
        // postRequest("/automaticLogin", loginForm).then(res => {
        //     console.log(res);
        //     let token = res.data.data;
        //     localStorage.setItem("token",token)
        //     console.log(token);
        //
        //     if (data){
        //         store.state.uid = data.userId;
        //         store.state.name = data.name;
        //         store.state.gid = data.groupId;
        //     }
        // })
    } else {
        return false;
    }
}