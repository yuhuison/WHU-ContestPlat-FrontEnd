<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="16" :offset="4">
        <el-card>
          <div slot="header" class="clearfix">
            <span style="line-height: 28px;font-size: 20px">查看报名信息:{{ contest_title }}</span>

            <div style="float: right" >


            <el-button size="mini" type="primary" round @click="save_to_excel()">
              导出为excel表
            </el-button>

            <el-button size="mini" type="primary" round @click="$router.push('/manage')">
              返回
            </el-button>

            <el-button style="margin-left: 10px;margin-right: 10px;" size="mini" type="primary" round @click="fetch_data()">
              刷新
            </el-button>
            </div>

          </div>
          <el-table :data="data" fit>
            <el-table-column prop="team_code" label="报名编号" align="center"></el-table-column>
            <el-table-column prop="team_name" label="队伍名称" align="center"></el-table-column>
            <el-table-column prop="art_name" label="作品名称" align="center"></el-table-column>
            <el-table-column prop="members_text" label="参赛成员" align="center"></el-table-column>
            <el-table-column prop="file_url" label="上传文件" align="center">
              <template v-slot="scope">
                <!--<el-tag :type="scope.row.status ? 'danger' : 'success'" disable-transitions>-->
                <!--  {{ scope.row.status ? '已评审' : '未评审' }}-->
                <!--</el-tag>-->
                <!--<el-button v-if="scope.row.status" slot="reference" type="danger" size="mini"  round>{{ scope.row.status ? '已评审' : '未评审' }}</el-button>-->
                <!--<el-button v-else slot="reference" type="success" size="mini" round>未评审</el-button>-->
                <el-button slot="reference" type="text" size="mini" :style=" scope.row.file_url=='' ? 'color: red;':''" 
                           @click="download_file(scope.row.file_url,scope.row.file_name)">{{ scope.row.file_url=="" ? '还未上传' : ('下载文件：\n'+scope.row.file_name )}}
                </el-button>

              </template>
            </el-table-column>
            <el-table-column prop="status" label="评审状态" align="center">
              <template v-slot="scope">
                <!--<el-tag :type="scope.row.status ? 'danger' : 'success'" disable-transitions>-->
                <!--  {{ scope.row.status ? '已评审' : '未评审' }}-->
                <!--</el-tag>-->
                <!--<el-button v-if="scope.row.status" slot="reference" type="danger" size="mini"  round>{{ scope.row.status ? '已评审' : '未评审' }}</el-button>-->
                <!--<el-button v-else slot="reference" type="success" size="mini" round>未评审</el-button>-->
                <el-button slot="reference" :type="scope.row.judge_status ? 'danger' : 'success'" size="mini" round
                           >{{ scope.row.judge_status ? '你已评审' : '你未评审' }}
                </el-button>

              </template>
            </el-table-column>
            <el-table-column prop="score_list.length" label="已评审人数" align="center"></el-table-column>
            <el-table-column prop="score_avg" label="平均分数" align="center"></el-table-column>
            <el-table-column fixed="right" label="操作" width="400%" align="center">
              <template v-slot="scope">
                <el-button type="info" size="small" @click="loadScore(scope.row.contestant_user_id)">
                  查看/编辑报名表
                </el-button>
                <el-button type="info" size="small" @click="loadScoreValueList(scope.row)">
                  查看/修改分数
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog title="查看评分信息" :visible.sync="dialogScoreVisible" width="30%">
      <el-form :inline="true" :model="form_add_score" class="demo-form-inline">
          <el-form-item label="你的分数">
            <el-input       type="number"
      :min="1"
      :max="99" v-model="form_add_score.score_value" placeholder="分数大于0，小于100"></el-input>
          </el-form-item>
          <el-form-item label="评语">
            <el-input v-model="form_add_score.score_text" placeholder="评语可以为空"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="on_add_score">提交分数</el-button>
          </el-form-item>
        </el-form>
        <el-table
                :data="score_use_values.score_list"
                style="width: 100%;margin: 20px;">
                <el-table-column
                  prop="judge_name"
                  label="评分人"
                  width="180">
                </el-table-column>
                <el-table-column
                  prop="score_value"
                  label="分数"
                  width="180">
                </el-table-column>
                <el-table-column
                  prop="score_text"
                  label="评语"
                  width="360">
                </el-table-column>
              </el-table>
    </el-dialog>
    <el-dialog title="查看报名表" :visible.sync="dialogVisible" width="30%">
      <el-card  style="margin: 20px;">
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
    </el-dialog>
  </div>
</template>

<script>
import {getRequest, postRequest} from "@/utils/api";
import COS from 'cos-js-sdk-v5';
import * as XLSX from 'xlsx/xlsx.mjs'
console.log(XLSX.utils)
import { saveAs } from 'file-saver';
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


export default {
  name: "Message",
  data() {
    return {
      params: {},
      // contestId:'',
      // contestTitle:'',
      data: [],
      multipleSelection: [],
      title: '',
      text: '',
      score:undefined,
      form_add:{
        school:"",
        name:"",
        code:""
      },
      score_use_values:"",
      team_name:"",
      art_name:"",
      art_desc:"",
      file_name:"",
      file_url:"",
      members:[],
      dialogVisible:false,
      dialogScoreVisible:false,
      contest_id : "",
      contest_title:"",
      score:  {},
      contestant_user_id:"",
      form_add_score:{
        score_text:"",
        score_value:0
      }
    }
  },
  mounted() {
    this.fetch_data()
  },
  methods: {
    keepLastScores(scores) {
          // 按照时间戳对评分数据进行排序
          scores.sort((a, b) => a.timestamp - b.timestamp);

          const resultMap = {};

          // 遍历评分数据数组
          for (const scoreData of scores) {
            const judgeId = scoreData.judge_uid;

            // 将当前评分数据覆盖之前的评分数据，以保留最后一次评分
            resultMap[judgeId] = scoreData;
          }

          // 将结果对象转换为数组
          const resultArray = Object.values(resultMap);

          return resultArray;
    },
    calculateAverageScore(scores) {
  if (scores.length === 0) {
    return 0; // 如果数组为空，返回平均分为0
  }

  let totalScore = 0;

  // 遍历评分数据数组，累加分数
  for (const scoreData of scores) {
    totalScore += scoreData.score_value;
  }

  const averageScore = totalScore / scores.length;

  return averageScore;
},getScoreByJudgeId(scores, judgeId) {
  for (const scoreData of scores) {
    if (scoreData.judge_uid === judgeId) {
      return scoreData; // 如果找到指定裁判 ID 的评分，则返回该评分数据
    }
  }

  return null; // 如果未找到指定裁判 ID 的评分，则返回 null
},
    fetch_data(){
      this.params = this.$route.params;
    console.log(this.params)
    if (this.params.contest_id) {
      this.contest_id = this.params.contest_id;
      this.contest_title = this.params.contest_title;
      postRequest("/get_score_by_contest_id", {contest_id: this.params.contest_id,start:0,end:0}).then((res) => {
        // console.log(res.data.data);
        this.data = res.data.scores.reverse().map((value,index)=>{
          value["team_code"] = index
          return value
        }).filter((value)=>value.team_name!="");
        this.data = this.data.map((value)=>{
          if(value.members){
            value["members_text"] = value.members.length.toString() +" 位成员";
          }else{
            value["members_text"] = "0 位成员";
          }
          value["is_upload_file"] = value.file_url == "" ? "否" : "是";
          
          value["score_list"] = this.keepLastScores(value["score_list"])
          value["score_avg"] = this.calculateAverageScore(value["score_list"])
          value["judge_status"] = (this.getScoreByJudgeId(value["score_list"],this.$store.state.uid) != null)
          return value
        })
        this.$message.info("刷新完毕！")
        console.log("scores",this.data)
      })

    }
    },
    on_add_score(){
      postRequest("/append_score_value", {score_id: this.score_use_values["_id"]["$oid"],judge_uid:this.$store.state.uid,judge_name:this.$store.state.name,score_value:this.form_add_score.score_value,score_text:this.form_add_score.score_text}).then((res) => {
        // console.log(res.data.data);
        if(res.data.status){
          this.$message.success("提交成功！")
          this.fetch_data()
        }else{
          this.$message.error("提交失败！")
        }
        this.dialogScoreVisible = false
      })
    },
    loadScoreValueList(score) {
      console.log(score)
      this.score_use_values = score
      let thisvalue = this.getScoreByJudgeId(score.score_list,this.$store.state.uid) 
      if(thisvalue!=null){
        this.form_add_score.score_text = thisvalue.score_text
        this.form_add_score.score_value = thisvalue.score_value
      }
      this.dialogScoreVisible = true
      
    },
    loadScore(user_id) {
      this.contestId = this.$route.params.contestId;
        // 查询当前用户是否已报名此比赛
        postRequest("/get_score_by_contest_id_and_user_id",{user_id:user_id,contest_id:this.contest_id}).then((res) => {
          if (res.data.score) {
              this.score = res.data.score;
              this.team_name = this.score["team_name"];
              this.art_name = this.score["art_name"];
              this.art_desc = this.score["art_desc"];
              this.members = this.score["members"];
              this.file_name = this.score["file_name"];
              this.file_url = this.score["file_url"];
              this.contestant_user_id = user_id;
              this.dialogVisible = true

            } 
        });
      
    },
    edit(name){
      this.$prompt('请输入', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        }).then(({ value }) => {
          this[name] = value
        })
    },
    handleSelectionChange(val) {
      this.multipleSelection = [];
      const sender = this.$store.state.uid;
      val.forEach((val) => {
        this.multipleSelection.push({recipient: val.userId, sender: sender});
      });
    },
    send() {
      let length = this.multipleSelection.length
      if (length && this.title.trim() !== '' && this.text.trim() !== '') {
        for (let i = 0; i < length; i++) {
          this.$set(this.multipleSelection[i], 'title', this.title);
          this.$set(this.multipleSelection[i], 'text', this.text);
        }
        // console.log(this.multipleSelection);
        postRequest("/messages/save", this.multipleSelection).then((res) => {
          // console.log(res.data.data);
          if (res.data.status) {
            this.$message.success("发送成功。")
          } else {
            this.$message.error("发送失败！")
          }
        });
      } else {
        this.$message.warning("请在左侧勾选学生或检测标题内容是否为空！")
      }
    },
    go(data) {

    },
    upload_file_i(file){
      cos.uploadFile({
            Bucket: 'contests-plat-1259460701', /* 填写自己的 bucket，必须字段 */
            Region: 'ap-nanjing',     /* 存储桶所在地域，必须字段 */
            Key: 'files/'+this.contest_id+"/"+this.contestant_user_id+".file",              /* 存储在桶里的对象键（例如:1.jpg，a/b/test.txt，图片.jpg）支持中文，必须字段 */
            Body: file, // 上传文件对象
            SliceSize: 1024 * 1024 * 5,     
            onProgress: (progressData)=> {
              this.$message.info('上传中。。。上传进度：'+progressData.percent*100 + "%");
              console.log(JSON.stringify(progressData));
            }
        }, (err, data)=> {
            if (err) {
              this.$message.error('上传失败', err);
            } else {
              this.file_url = 'files/'+this.contest_id+"/"+this.contestant_user_id+".file";
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
              Key: 'files/'+this.contest_id+"/"+this.contestant_user_id+".file",      
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
    save_to_excel(){

      let export_data = this.data.map((value,index)=>{
        let members = ""
        value["members"].map((value)=>{
            members += value.school+","+value.code+","+value.name +";\n"
        })
        let scores = ""
        value["score_list"].map((value)=>{
            scores += value.judge_name+","+value.score_value.toString()+","+value.score_text+";\n"
        })
        return {
          "队伍报名序号":value["team_code"],
          "队伍名称":value["team_name"],
          "作品名称":value["art_name"],
          "作品描述":value["art_desc"],
          "文件名称":value["file_name"],
          "队伍成员":members,
          "收到评分":scores,
          "平均分":value["score_avg"]
        }
      })
      const workbook = XLSX.utils.book_new();

      // 创建一个工作表
      const worksheet = XLSX.utils.json_to_sheet(export_data);

      // 将工作表添加到工作簿
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // 将工作簿保存为Excel文件
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      // 将Excel文件保存到本地
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, this.$route.params.contest_title+'.xlsx');

    },
    download_file(path,file_name){
      cos.getObjectUrl({
              Bucket: 'contests-plat-1259460701', /* 填写自己的 bucket，必须字段 */
              Region: 'ap-nanjing',     /* 存储桶所在地域，必须字段 */
              Key: path,    
      }, (err, data)=> {
          if (err) return console.log(err);
          var downloadUrl = data.Url + (data.Url.indexOf('?') > -1 ? '&' : '?') + 'response-content-disposition=attachment';
           downloadUrl += ';filename='+file_name; 
          window.open(downloadUrl);
      });

    },
    update_info(){
      postRequest("/update_score_info",{user_id:this.contestant_user_id,contest_id:this.contest_id,info:{team_name:this.team_name,art_name:this.art_name,art_desc:this.art_desc,members:this.members,file_name:this.file_name,file_url:this.file_url}}).then((res) => {
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
      this.members.push({name:this.form_add.name,school:this.form_add.school,code:this.form_add.code})
    },
  }
}
</script>

<style lang="less" scoped>

</style>