<template>
  <el-card class="box-card" shadow="never" style="height: 500px">
    <el-descriptions title="用户信息" :column="1" border :labelStyle="{'text-align': 'center'}">
      <template slot="extra" v-if="inputDisabled">
        <el-button type="warning" @click="upDateGroup" size="small" round> 修改用户组</el-button>
        <el-button type="primary" @click="update" size="small" round>修改信息</el-button>
      </template>
      <template slot="extra" v-else>
        <el-button type="success" @click="submit" size="small" round>保存修改</el-button>
        <el-button type="danger" @click="cancel" size="small" round>取消修改</el-button>
      </template>
      <el-descriptions-item label="姓名">
        <input :disabled="inputDisabled" v-model="fromData.name"/>
      </el-descriptions-item>
      <el-descriptions-item label="用户组" :contentStyle="{backgroundColor:inputDisabled?'#fff':'#fafafa'}">
        <div :style="{backgroundColor:inputDisabled?'#fff':'#fafafa'}">
          {{ groupName }}
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="性别" :contentStyle="{backgroundColor:inputDisabled?'#fff':'#fafafa'}">
        <div :style="{backgroundColor:inputDisabled?'#fff':'#fafafa'}"> {{ sex }}</div>
      </el-descriptions-item>
      <el-descriptions-item label="学校">
        <input :disabled="inputDisabled" v-model="fromData.school"></input>
      </el-descriptions-item>
      <el-descriptions-item label="手机号" :contentStyle="{backgroundColor:inputDisabled?'#fff':'#fafafa'}">
        <div :style="{backgroundColor:inputDisabled?'#fff':'#fafafa'}"> {{ phone }}</div>
      </el-descriptions-item>
      <el-descriptions-item label="邮箱" :contentStyle="{backgroundColor:inputDisabled?'#fff':'#fafafa'}">
        <div :style="{backgroundColor:inputDisabled?'#fff':'#fafafa'}"> {{ email }}</div>
      </el-descriptions-item>
      <el-descriptions-item label="地址">
        <textarea :disabled="inputDisabled" v-model="fromData.address"></textarea>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<script>
import {getRequest, putRequest,postRequest} from "@/utils/api";

export default {
  name: "information",
  data() {
    return {
      inputDisabled: true,
      fromData: {
        userId: '',
        name: '',
        birthday: '',
        school: '',
        address: ''
      },
      sex: '',
      groupName: '',
      phone: '',
      email: ''
    }
  },
  mounted() {
    const uid = this.fromData.userId = this.$store.state.uid;
    getRequest("/current_user").then((res) => {
      const data = res.data;
      if (data) {
        this.fromData.name = data.user.name;
        data.sex ? this.sex = '男' : this.sex = '女';
        this.fromData.school = data.user.school;
        this.fromData.address = data.user.address;
        this.phone = data.user.phone;
        this.email = data.user.email;
        this.groupName = data.user_group_order == 0 ? "管理员组" : (data.user_group_order == 1 ? "老师组":"学生组" )
      }
    });
  },
  methods: {
    update() {
      this.inputDisabled = false;
    },
    submit() {
      if (this.fromData.name.trim() === ''  || this.fromData.address.trim() === '' || this.fromData.school.trim() === '') {
        this.$message.error("不允许为空");
      } else {
        this.$message.error("修改功能正在开发中");
      }
    },
    cancel() {
      this.inputDisabled = true;
    },
    upDateGroup() {
      this.$prompt('请输入用户组标识码', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        }).then(({ value }) => {
          postRequest("/update_user_group",{group_id:value}).then((res)=>{
            const data = res.data;
            if (data) {
              this.$message.info(data.msg);
            }
          })
        })
    }
  }
}
</script>

<style lang="less" scoped>
input, textarea {
  border: none;
  outline: none;
  width: 100%;
  background-color: #fff;
  resize: none;
}
</style>