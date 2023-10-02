<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="16" :offset="4">
        <!--返回上页-->
        <button class="btn" @click="$router.go(-1);" style="cursor: pointer;"><i class="fa fa-circle-arrow-left"></i>&nbsp;返回
        </button>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12" :offset="4">
        <!--左侧信息-->
        <el-card :body-style="{ padding: '0' ,backgroundColor: 'rgb(251, 251, 251)'}">
          <div style="font-size: 24px;color: #303133;text-align: center;width: 100%;padding-top: 20px">
            {{ contestTitle }}
          </div>
          <el-divider></el-divider>
          <el-card v-if="score!=undefined"  style="margin: 20px;">
            <el-button type="primary" @click="update_info" plain>保存参赛信息</el-button>
          <el-descriptions style="margin: 20px;" class="margin-top" title="报名作品信息" :column="3"  border>
            <el-descriptions-item>
              <template slot="label">
                <i class="el-icon-user"></i>
                队伍名称            
              </template>
              {{team_name}}
              <el-button @click="edit('team_name')" style="margin: 10px;" type="primary" icon="el-icon-edit" circle></el-button>
            </el-descriptions-item>
            <el-descriptions-item>
              <template slot="label">
                <i class="el-icon-mobile-phone"></i>
                作品名称
              </template>
              {{art_name}}
              <el-button @click="edit('art_name')" style="margin: 10px;" type="primary" icon="el-icon-edit" circle></el-button>
            </el-descriptions-item>
            
            <el-descriptions-item>
              <template slot="label">
                <i class="el-icon-office-building"></i>
                上传附件
              </template>
              <input type="file" @change="upload_file"/>
              <el-button v-if="file_url!=''" style="margin: 6px;" @click="download_file"  type="primary" icon="el-icon-file">下载已上传文件：{{ file_name }}</el-button>
            </el-descriptions-item>
            <el-descriptions-item>
              <template slot="label">
                <i class="el-icon-tickets"></i>
                作品描述
              </template>
              {{art_desc}}
              <el-button @click="edit('art_desc')" style="margin: 10px;" type="primary" icon="el-icon-edit" circle></el-button>
            </el-descriptions-item>

          </el-descriptions>
          报名参赛成员信息（包含队长）
          <br/>
          <br/>
          <el-form :inline="true" :model="form_add" class="demo-form-inline">
          <el-form-item label="学校">
            <el-input v-model="form_add.school" placeholder="学校"></el-input>
          </el-form-item>
          <el-form-item label="学号">
            <el-input v-model="form_add.code" placeholder="学号"></el-input>
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="form_add.name" placeholder="姓名"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="on_add_member">添加</el-button>
          </el-form-item>
        </el-form>
          <el-table
                :data="members"
                style="width: 100%;margin: 20px;">
                <el-table-column
                  prop="school"
                  label="学校"
                  width="180">
                </el-table-column>
                <el-table-column
                  prop="code"
                  label="学号"
                  width="180">
                </el-table-column>
                <el-table-column
                  prop="name"
                  label="姓名">
                </el-table-column>
                <el-table-column
                fixed="right"
                label="操作"
                width="120">
                <template slot-scope="scope">
                  <el-button
                    @click.native.prevent="deleteRow(scope.$index, members)"
                    type="text"
                    size="small">
                    移除
                  </el-button>
                </template>
              </el-table-column>
              </el-table>
        </el-card>
          <mdEditor v-model="contest_text" :ishljs="true" :subfield="false" :toolbars="{}" defaultOpen="preview"
                    style="min-height: 600px" :toolbarsFlag="false"/>
        </el-card>
      </el-col>
      <!--右侧信息-->
      <el-col :span="4">
        <el-card>
          <div class="block">
            <el-timeline>
              <el-timeline-item v-for="(activity, index) in activities" :key="index" :icon="activity.icon"
                                :type="activity.type" :color="activity.color" :size="activity.size"
                                :timestamp="activity.timestamp">
                {{ activity.content }}
              </el-timeline-item>
            </el-timeline>
          </div>
          <el-divider></el-divider>
          <div class="text item">
            发布人：<samp class="itemRight">{{ name }}</samp>
          </div>
          <div class="text item">
            所属组：<samp class="itemRight">{{ groupName }}</samp>
          </div>
          <div style="text-align: center" >
            <el-button type="primary" round v-if="btnHidden" @click="submit">{{ btnText }}</el-button>
            <el-button type="danger" round disabled v-else>{{ btnText }}</el-button>
          </div>
        </el-card>
        <br/>

      </el-col>
    </el-row>
  </div>
</template>

<script>
import {getRequest, postRequest} from "@/utils/api";
import 'mavon-editor/dist/css/index.css'
import COS from 'cos-js-sdk-v5';

let cos = new COS({
    // getAuthorization 必选参数
    getAuthorization: function (options, callback) {
        // 初始化时不会调用，只有调用 cos 方法（例如 cos.putObject）时才会进入
        // 异步获取临时密钥
        // 服务端 JS 和 PHP 例子：https://github.com/tencentyun/cos-js-sdk-v5/blob/master/server/
        // 服务端其他语言参考 COS STS SDK ：https://github.com/tencentyun/qcloud-cos-sts-sdk
        // STS 详细文档指引看：https://cloud.tencent.com/document/product/436/14048
        postRequest("/auth_files").then((res)=>{
          if(res.data){
            let data = res.data.data
            console.log(data)
            callback({
              TmpSecretId: data.credentials.tmpSecretId,
              TmpSecretKey: data.credentials.tmpSecretKey,
              SecurityToken: data.credentials.sessionToken,
              // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
              StartTime: data.startTime, // 时间戳，单位秒，如：1580000000
              ExpiredTime: data.expiredTime, // 时间戳，单位秒，如：1580000000
          });
          }
        })

    }
});




const mdEditor = require('mavon-editor')

export default {
  inject: ['reload'],                                 //注入App里的reload方法
  components: {
    'mdEditor': mdEditor.mavonEditor
  },
  data() {
    return {
      btnHidden: false,
      btnText: '不可报名',
      promulgator: 0,
      contestTitle: '',
      contestId: '',
      name: '',
      contest_text:"",
      file_name:"",
      file_url:"",
      groupName: '',
      activities: [{
        content: '报名开始',
        timestamp: '2022-02-22 22:22',
        size: 'large',
        type: 'primary'
      }, {
        content: '报名结束',
        timestamp: '2022-02-22 22:22',
        size: 'large',
        type: 'success'
      }, {
        content: '比赛开始',
        timestamp: '2022-02-22 22:22',
        size: 'large',
        type: 'warning'
      }, {
        content: '比赛结束',
        timestamp: '2022-02-22 22:22',
        size: 'large',
        type: 'danger'
      }],
      score:undefined,
      form_add:{
        school:"",
        name:"",
        code:""
      },
      team_name:"",
      art_name:"",
      art_desc:"",
      members:[]
    }
  },
  mounted() {
    this.contestLoading();
  },
  watch: {
    '$store.state.uid'() {
      this.contestLoading();
    }
  },
  methods: {
    edit(name){
      this.$prompt('请输入', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        }).then(({ value }) => {
          this[name] = value
        })
    },
    upload_file_i(file){
      cos.uploadFile({
            Bucket: 'contests-plat-1259460701', /* 填写自己的 bucket，必须字段 */
            Region: 'ap-nanjing',     /* 存储桶所在地域，必须字段 */
            Key: 'files/'+this.$route.params.contestId+"/"+this.$store.state.uid+".file",              /* 存储在桶里的对象键（例如:1.jpg，a/b/test.txt，图片.jpg）支持中文，必须字段 */
            Body: file, // 上传文件对象
            onProgress: function(progressData) {
                console.log(JSON.stringify(progressData));
            }
        }, (err, data)=> {
            if (err) {
              this.$message.error('上传失败', err);
            } else {
              this.file_url = 'files/'+this.$route.params.contestId+"/"+this.$store.state.uid+".file";
              this.file_name = file.name;
              this.$message.success('上传成功');
            }
        });
    },
    upload_file(input){
      if(input.target.files && input.target.files.length>0){
          const files = input.target.files
          console.log(files)
          if (!files) {
            return;
          }
          const file = files[0];
          if (!file) {
            return;
          }
          if(this.file_url!=""){
            cos.deleteObject({
              Bucket: 'contests-plat-1259460701', /* 填写自己的 bucket，必须字段 */
              Region: 'ap-nanjing',     /* 存储桶所在地域，必须字段 */
              Key: 'files/'+this.$route.params.contestId+"/"+this.$store.state.uid+".file",      
          }, (err, data)=> {
            if (err) {
              this.$message.error('删除原有文件失败', err);
            } else {
              this.upload_file_i(file)
            }
            });
          }else{
            this.upload_file_i(file)
          }


      }
    },
    download_file(){
      cos.getObjectUrl({
              Bucket: 'contests-plat-1259460701', /* 填写自己的 bucket，必须字段 */
              Region: 'ap-nanjing',     /* 存储桶所在地域，必须字段 */
              Key: 'files/'+this.$route.params.contestId+"/"+this.$store.state.uid+".file",    
      }, (err, data)=> {
          if (err) return console.log(err);
          var downloadUrl = data.Url + (data.Url.indexOf('?') > -1 ? '&' : '?') + 'response-content-disposition=attachment';
           downloadUrl += ';filename='+this.file_name; 
          window.open(downloadUrl);
      });

    },
    update_info(){
      postRequest("/update_score_info",{user_id:this.$store.state.uid,contest_id:this.$route.params.contestId,info:{team_name:this.team_name,art_name:this.art_name,art_desc:this.art_desc,members:this.members,file_name:this.file_name,file_url:this.file_url}}).then((res) => {
          if (res.data.status) {
              this.$message.success("更新信息成功！")
            } else {
              this.$message.error(res.data.msg)
            }
        });
    },
    deleteRow(index, rows) {
      rows.splice(index, 1);
    },
    on_add_member(){
      this.members.push(this.form_add)
    },
    // 初始化
    contestLoading() {
      this.contestId = this.$route.params.contestId;
      
      if (this.$store.state.uid !== undefined) {
        // 查询当前用户是否已报名此比赛
        postRequest("/get_score_by_contest_id_and_user_id",{user_id:this.$store.state.uid,contest_id:this.$route.params.contestId}).then((res) => {
          if (res.data.score) {
              this.btnHidden = false;
              this.btnText = '已报名';
              this.score = res.data.score;
              this.team_name = this.score["team_name"];
              this.art_name = this.score["art_name"];
              this.art_desc = this.score["art_desc"];
              this.members = this.score["members"];
              this.file_name = this.score["file_name"];
              this.file_url = this.score["file_url"];
            } else {
              this.btnHidden = true;
              this.btnText = '立即报名';
            }
        });
      }
      
      // 查询id为this.$route.params.contestId的比赛并显示
      postRequest("/get_contest_by_id",{oid:this.$route.params.contestId}).then((res) => {
        console.log(res);
        const data = res.data.contest;
        if (data) {
          document.title = this.contestTitle = data.contest_title;
          this.contest_text = data.contest_text;
          this.name = data.promulgator_user_name;
          this.groupName = data.group_name;
          this.promulgator = data.promulgator_user_id;
          this.activities[0].timestamp = data.reg_start_time;
          this.activities[1].timestamp = data.reg_end_time;
          if (new Date() > new Date(data.reg_end_time)) {
            this.btnText = '报名时间已过';
            this.btnHidden = false;
          }
          this.activities[2].timestamp = data.start_time;
          this.activities[3].timestamp = data.end_time;
        } else {
          this.$router.push("/404");
        }
      });
    },
    /**
     * 点击报名按钮
     */
    submit() {
      postRequest("/add_score" ,{user_id:this.$store.state.uid,contest_id:this.contestId}).then((resp) => {

        if (resp.data.status) {
          this.$message.success("报名成功。")
          this.btnText = '已报名';
          this.btnHidden = false;
          this.contestLoading();
        } else {
          this.$message.error("报名失败！")
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.btn {
  padding: 5px;
  margin-bottom: 10px;
  color: #515a6e;
  background-color: transparent;
  border-color: transparent;

  &:hover {
    color: #F56C6C;
  }
}

.text {
  font-size: 16px;
}

.item {
  padding: 0 20px 15px;
}

.box-card {
  width: 480px;
}

.v-note-wrapper {
  box-shadow: none !important;
}

.itemRight {
  float: right;
}
</style>