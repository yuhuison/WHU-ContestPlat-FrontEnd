<template>
  <div>
    <el-card class="box-card" shadow="never" style="margin-bottom: 20px;">
      <div slot="header" class="clearfix">
        <span style="line-height: 28px;font-size: 20px">已评审的比赛</span>
      </div>
      <div v-for="item in contests" :key="item.scoresId" class="text item">
        <el-link @click="$router.push({name:'find-score',params: {scoresId:item.scoresId}})">{{ item.contestTitle }}
        </el-link>
      </div>
      <div v-if="contests.length===0 && contestsUnfinished.length===0" class="text item">
        <el-link>您还没有报名任何比赛哦</el-link>
      </div>
    </el-card>
    <el-card class="box-card" shadow="never">
      <div slot="header" class="clearfix">
        <span style="line-height: 28px;font-size: 20px">未评审的比赛</span>
      </div>
      <div v-for="item in contestsUnfinished" class="text item">
        <el-link @click="$message.info('该比赛还未进行评审！')">{{ item.contestTitle }}</el-link>
      </div>
      <div v-if="contests.length===0 && contestsUnfinished.length===0" class="text item">
        <el-link>您还没有报名任何比赛哦</el-link>
      </div>
    </el-card>
  </div>
</template>

<script>
import {postRequest} from "@/utils/api";

export default {
  name: "Contest",
  data() {
    return {
      contests: [],
      contestsUnfinished: []
    }
  },
  mounted() {
      postRequest("/get_scores_by_uid_and_status",{uid:this.$store.state.uid,status:true}).then((res) => {
        const data = res.data.scores;
        if (data) {
          this.contests = data;
        }
      });
      postRequest("/get_scores_by_uid_and_status",{uid:this.$store.state.uid,status:false}).then((res) => {
        const data = res.data.scores;
        if (data) {
          this.contestsUnfinished = data;
        }
      });
  },
  methods: {}
}
</script>

<style lang="less" scoped>

</style>