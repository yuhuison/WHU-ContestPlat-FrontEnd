<template>
  <div>
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span style="line-height: 28px;font-size: 20px">公告通知</span>
      </div>
      <div v-for="item in list" :key="item.id" class="text item">
        <el-link @click="$router.push({name:'messages-detail',params: {messageId:item.id}})">
          {{ item.title }}
        </el-link>
      </div>
      <router-link v-if="list" class="more-link" :to="{name:'announcement'}">
        查看更多...
      </router-link>
      <div v-else>暂无数据</div>
    </el-card>
  </div>
</template>

<script>
import {getRequest,postRequest} from "@/utils/api";

export default {
  name: "AnnouncementList",
  data() {
    return {
      // 虚假数据
      list: []
    }
  },
  mounted() {
    // 获取公告
    postRequest("/get_message_by_index",{start:0,end:10}).then((res) => {
      if (res.data){
        this.list = res.data.messages;
        for(let i of this.list){
          i.id = i._id["$oid"];
        }
      }
    });
  }
}
</script>

<style lang="less" scoped>
.more-link {
  padding-top: 10px;
  display: block;
  text-align: center;
  font-size: 16px;
  letter-spacing: 3px;
  font-weight: 500;
  color: #659fdc;
  text-decoration: none;
}
</style>