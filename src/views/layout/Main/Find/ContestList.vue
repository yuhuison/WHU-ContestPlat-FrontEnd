<template>
  <div>
    <el-card shadow="never" class="box-card">
      <template v-if="hidden">
        <div slot="header" class="clearfix">
          <span style="line-height: 28px;font-size: 20px">比赛列表</span>
        </div>
      </template>
      <div class="list">
        <el-row>
          <el-col v-for="item in lists" :span="9" :offset="2" style="margin-bottom: 30px">
            <el-card style="cursor: pointer;" :body-style="{ padding: '0' }">
              <router-link :to="{ name: 'find-detail', params: {contestId: item.id} }" custom
                           v-slot="{ navigate }">
                <div @click="navigate" @keypress.enter="navigate" role="link">
                  <img :src="item.url" class="image" alt="">
                  <div style="padding: 14px;">
                    <el-tooltip class="item" effect="dark" :content="item.contest_title" placement="top">
                  <span
                      style="display:inline-block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;">{{
                      item.contest_title
                    }}</span>
                    </el-tooltip>
                    <div>
                      <time class="time">{{ item.reg_start_time }}至{{ item.reg_end_time }}</time>
                    </div>
                  </div>
                </div>
              </router-link>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <template v-if="hidden">
        <router-link class="more-link" :to="{path:'/find'}">
          查看更多...
        </router-link>
      </template>
      <template v-else>
        <div style="text-align: center">
          <el-link @click="contestListListLoading" type="primary" :underline="false">{{ loadingText }}</el-link>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script>
import {getRequest,postRequest} from "@/utils/api";

export default {
  name: "Contest",
  data() {
    return {
      hidden: true,
      loader: true,
      loadingText: '加载更多',
      page: 1,
      lists: [],
    }
  },
  // computed: {
  //   noMore() {
  //     return this.count >= 20
  //   },
  //   disabled() {
  //     return this.loading || this.noMore
  //   }
  // },
  mounted() {
    //判断是否为find页面
    if (this.$route.path === "/find") this.hidden = false
    this.contestListListLoading()
  },
  methods: {
    contestListListLoading() {
      if (this.loader) {
        //获取比赛
        postRequest("/get_contest_by_index",{start:this.page*6-6,end:this.page*6}).then((resp) => {
          console.log(resp)
          if (resp.data){
            const data = resp.data.contests;
            if (data.length<6) {
              this.loader = false;
              this.loadingText = "没有更多了";
            } else {
              this.page++;
            }
            for (let i = 0; i < data.length; i++) {
              data[i].id = data[i]._id["$oid"];
              this.lists.push(data[i]);
            }
          }
        });
      }
    }
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

.time {
  font-size: 13px;
  color: #999;
}

.image {
  width: 100%;
  height: auto;
  display: block;
}

.clearfix:before, .clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both
}
</style>