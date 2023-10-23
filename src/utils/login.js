import store from "@/store";
import {getRequest} from "@/utils/api";

export function getUser() {
    // localStorage获取token
    if (localStorage.token) {
        getRequest("/current_user").then(res=>{
            // console.log(res);
            let data = res.data;
            console.log(data)
            if (data){
                store.state.uid = data.user._id["$oid"];
                store.state.name = data.user.name;
                store.state.gid = data.user.group_id;
                console.log("current_user",data)
                store.state.isAdmin = (data.user_group_order == 0);
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