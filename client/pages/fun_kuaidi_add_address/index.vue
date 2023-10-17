<template>
  <div class="container">
    <div class="card">
      <div class="card_item">
        <div class="left">栋号</div>
        <div class="right">
          <input v-model="userInfo_.numberPlate" type="text" maxlength="8" placeholder="栋号-门牌号">
        </div>
      </div>
      <div class="card_item">
        <div class="left">姓名</div>
        <div class="right">
          <input v-model="userInfo_.name" @input="updateUserInfoName" type="nickname" maxlength="7"
                 placeholder="称呼">
        </div>
      </div>
      <!--      <div class="card_item">-->
      <!--        <div class="left">性别</div>-->
      <!--        <u-radio-group-->
      <!--            v-model="userInfo_.sex"-->
      <!--            @change=""-->
      <!--        >-->
      <!--          <u-radio-->
      <!--              label="男"-->
      <!--              name="1"-->
      <!--          >-->
      <!--          </u-radio>-->
      <!--          <u-radio-->
      <!--              label="女"-->
      <!--              name="0"-->
      <!--          >-->
      <!--          </u-radio>-->
      <!--        </u-radio-group>-->
      <!--        <div class="right">-->

      <!--        </div>-->
      <!--      </div>-->
      <div class="card_item">
        <div class="left">手机号</div>
        <div class="right">
          <input v-model="userInfo_.phoneCode" type="number" maxlength="11" placeholder="用于联系到您的手机号">
        </div>
      </div>
    </div>
    <div class="button" @click='saveInfo'>
      {{ modify ? "修改" : "添加" }}
    </div>
  </div>
</template>

<script>
import {mapMutations, mapState} from 'vuex'

export default {
  data() {
    return {
      //  修改信息状态
      modify: false,
      modifyId: null,
      id: null,
      //  信息表单
      userInfo_: {
        //  门牌号
        numberPlate: '',
        //  名字
        name: '',
        //  电话号
        phoneCode: '',
        // sex: "男"
      }
    }
  },
  computed: {
    ...mapState('store_user', ['token', 'userInfo'])
  },
  methods: {
    ...mapMutations('store_user', ['add_address']),
    //  保存信息
    async saveInfo() {
      //  校验对象完整新
      for (const key in this.userInfo_) {
        //  没有值
        if (!this.userInfo_[key]) return uni.$showMsg(`${key} 值未填写`)
      }

      //  判定是修改还是新增
      if (this.modify) {
        // 发送数据
        const {data: {code, data, msg}} = await uni.$httpRequest({
          url: 'user/user_update_address',
          method: "post",
          header: {
            'Authorization': `Bearer ${this.token}`
          },
          data: {
            id: this.id,
            op: this.userInfo_
          }
        })
        //  校验code
        console.log(code, data, msg)
        let callback
        if (code) {
          //  修改数据 更替进来
          this.userInfo[this.modifyId] = this.userinfo_
          callback = () => {
            uni.$showMsg('修改失败，' + msg)
          }
        } else {
          //   返回上个页面并且提示信息
          callback = () => {
            uni.$showMsg('修改失败，' + msg)
          }
        }
        uni.navigateBack({
          success: callback
        })
      } else {
        //  校验这条数据是否存在
        this.add_address(this.userInfo_)
        //   告诉服务器我们新增地址
        const {data: addResult} = await uni.$httpRequest({
          url: 'kd/user_add_address',
          method: 'post',
          header: {
            'Authorization': `Bearer ${this.token}`
          },
          data: {
            address: this.userInfo_
          }
        })
        console.log('添加地址结果：', addResult)
        // 如果失败
        if (!addResult.code) {
          // 遍历this.userInfo.address 把元素转文本 然后和this.userInfo_转文本比较 如果是一样的那就删除
          this.userInfo.address.map((item, index) => {
            if (JSON.stringify(item) === JSON.stringify(this.userInfo_)) {
              this.userInfo.address.splice(index, 1)
            }
          })
          return uni.$showMsg(addResult.msg)
        }
        uni.$showMsg(addResult.msg)
      }

      // 返回上一页
      uni.navigateBack({
        success: () => {
          uni.$showMsg('保存成功')
        }
      })
    },
    //  更新用户名字。解决nickname兼容性问题
    updateUserInfoName(e) {
      //  根据
      this.userInfo_.name = e.detail.value
    }
  },
  onLoad(op) {
    //  没有参数
    if (!Object.keys(op).length) return
    const {modifyId, id} = op
    // 解析数据是否确实
    if (!modifyId || !id) {
      // 返回上个页面并且提示参数缺失
      uni.navigateBack({
        success: () => {
          uni.$showMsg('参数缺失')
        }
      })
    }
    console.log('进入修改')
    this.modify = true
    this.modifyId = modifyId
    this.id = id
    //  根据id来填充 userINfo_
    this.userInfo_ = this.userInfo.address[modifyId]

  },
  mounted() {
  }
}
</script>

<style scoped lang="scss">

//  收件信息
.button {
  padding: 10px;
  margin-top: 10px;
  text-align: center;
  background-color: dodgerblue;
  color: white;
  border-radius: 30px;
}
</style>
