<template>
  <div>
    <!--表单-->
    <el-form ref="contestForm" :model="contestForm" label-width="80px" label-position="top" :rules="rules">
      <!--输入比赛名称-->
      <el-row :gutter="20">
        <el-col :span="16" :offset="4">
          <el-card shadow="never">
            <el-form-item label="比赛名称" prop="contest_title">
              <el-input v-model="contestForm.contest_title" maxlength="50" show-word-limit
                        placeholder="输入比赛名称"></el-input>
            </el-form-item>
            <el-form-item label="图片url" prop="url">
              <el-input v-model="contestForm.url" maxlength="255" show-word-limit
                        placeholder="输入图片的地址，例如：https://pic.imgdb.cn/item/61e95e482ab3f51d91903853.jpg"></el-input>
            </el-form-item>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <!--左侧编辑内容-->
        <el-col :span="12" :offset="4">
          <el-card shadow="never" :body-style="{ padding: '0'}">
            <mdEditor v-model="contestForm.contest_text" :ishljs="true" style="min-height: 600px"/>
          </el-card>
        </el-col>
        <!--右侧输入其他信息-->
        <el-col :span="4">
          <el-card shadow="never" style="min-height: 600px">
            <el-form-item label="报名开始时间" prop="reg_start_time">
              <el-date-picker v-model="reg_start_time" type="datetime" placeholder="选择日期时间"
                              default-time="08:00:00" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
            </el-form-item>
            <el-form-item label="报名结束时间" prop="reg_end_time">
              <el-date-picker v-model="reg_end_time" type="datetime" placeholder="选择日期时间"
                              default-time="23:59:59" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
            </el-form-item>
            <el-form-item label="比赛开始时间" prop="start_time">
              <el-date-picker v-model="start_time" type="datetime" placeholder="选择日期时间"
                              default-time="08:00:00" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
            </el-form-item>
            <el-form-item label="比赛结束时间" prop="end_time">
              <el-date-picker v-model="end_time" type="datetime" placeholder="选择日期时间"
                              default-time="23:59:59" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
            </el-form-item>
            <el-form-item style="float: right;padding-top: 60px">
              <el-button @click="resetForm('ruleForm')">重置</el-button>
              <el-button type="primary" @click="submitForm">{{ btnText }}</el-button>
            </el-form-item>
          </el-card>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import {getRequest, postRequest, putRequest} from "@/utils/api";

import 'mavon-editor/dist/css/index.css'

const mdEditor = require('mavon-editor')

export default {
  name: "Contest",
  components: {
    'mdEditor': mdEditor.mavonEditor
  },
  data() {
    const regEndTimeCheckout = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('报名结束时间不能为空'));
      } else if (value < this.contestForm.regStartTime) {
        callback(new Error('报名结束时间不能小于报名开始时间'));
      } else {
        callback();
      }
    };
    const startTimeCheckout = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('报名结束时间不能为空'));
      } else if (value < this.contestForm.regEndTime) {
        callback(new Error('比赛开始时间不能小于报名结束时间'));
      } else {
        callback();
      }
    };
    const endTimeCheckout = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('报名结束时间不能为空'));
      } else if (value < this.contestForm.startTime) {
        callback(new Error('比赛结束时间不能小于比赛开始时间'));
      } else {
        callback();
      }
    };
    return {
      addOrUpdate: true,
      btnText: '立即发布',
      reg_start_time: '',
        reg_end_time: '',
        start_time: '',
        end_time: '',
      contestForm: {
        contest_title: '',
        contest_text: '## 请输入比赛内容\n',
        url: '',
        reg_start_time: '',
        reg_end_time: '',
        start_time: '',
        end_time: '',
        contest_id:''
      },
      rules: {
        contestTitle: [{required: true, message: '请输入比赛名称', trigger: 'blur'}],
        url: [{required: true, message: '请输入图片地址', trigger: 'blur'}],
        regStartTime: [{required: true, message: '报名开始时间不能为空', trigger: 'blur'}],
        regEndTime: [{required: true, validator: regEndTimeCheckout, trigger: 'blur'}],
        startTime: [{required: true, validator: startTimeCheckout, trigger: 'blur'}],
        endTime: [{required: true, validator: endTimeCheckout, trigger: 'blur'}]
      }
    };
  },
  mounted() {
    const gid = this.$store.state.gid;
    const uid = this.$store.state.uid;
    if (gid === undefined && uid === undefined) {
      this.$message.error('获取用户信息失败！');
      this.$router.push("/404");
    } else {
      this.contestForm.groupId = gid;
      this.contestForm.promulgator = uid;
    }
    // 判断是否存在contestId，存在则是修改，否则是新增
    if (this.$route.params.contest_id) {
      this.addOrUpdate = false;
      this.btnText = '立即修改';
      document.title = '修改比赛';
      postRequest("/get_contest_by_id" ,{oid:this.$route.params.contest_id}).then((res) => {
        const data = res.data.contest;
        if (data) {
          this.contestForm.contest_id = this.$route.params.contest_id;
          this.contestForm.contest_title = data.contest_title;
          this.contestForm.contest_text = data.contest_text;
          this.contestForm.url = data.url;
          this.reg_start_time = this.parseCustomStringToDate(data.reg_start_time);
          this.reg_end_time = this.parseCustomStringToDate(data.reg_end_time);
          this.start_time = this.parseCustomStringToDate(data.start_time);
          this.end_time = this.parseCustomStringToDate(data.end_time);
        } else {
          this.$router.push("/404");
        }
      });
    } else {
      document.title = '发布比赛';
    }
  },
  methods: {
    formatDateToCustomString(date) {
      if(date == ''){
        return ''
      }
      if(typeof date === 'string'){
        return date
      }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
},parseCustomStringToDate(dateString) {
  if(dateString==''){
    return new Date(1970, 10 - 1, 1, 0, 0, 0);
  }
  const [datePart, timePart] = dateString.split(' ');
  const [year, month, day] = datePart.split('-');
  const [hours, minutes, seconds] = timePart.split(':');

  return new Date(year, month - 1, day, hours, minutes, seconds);
},

    // 提交
    submitForm() {
      this.$refs.contestForm.validate((valid) => {
        if (valid) {
          if (this.addOrUpdate) {
          } else {
            console.log(this.contestForm)
            this.contestForm.reg_start_time = this.formatDateToCustomString(this.reg_start_time);
          this.contestForm.reg_end_time = this.formatDateToCustomString(this.reg_end_time);
          this.contestForm.start_time = this.formatDateToCustomString(this.start_time);
          this.contestForm.end_time = this.formatDateToCustomString(this.end_time);
            // 修改
            postRequest("/add_or_update_contest", this.contestForm).then(res => {
              if (res.data.status) {
                this.$message.success('修改成功!');
              } else {
                this.$message.error('修改失败！');
              }
              this.$router.push("/manage");
            })
          }
        } else {
          this.$message.error("请修改错误项！")
          return false;
        }
      });
    },
    // 重置
    resetForm() {
      this.$refs.contestForm.resetFields();
    }
  }
}
</script>

<style lang="less" scoped>
.el-row {
  margin-bottom: 20px;
}

.el-date-editor.el-input {
  width: 100%;
}
</style>