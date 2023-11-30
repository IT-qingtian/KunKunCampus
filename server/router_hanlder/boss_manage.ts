// 引入multiparty
import * as fs from "fs";
// @ts-ignore
const path = require('path')

const multiparty = require('multiparty')
const {
    sendRes,
    sendErr,
    message_tempIds,
    emit_subscribe_msg,
    formatTime,
    db_query,
    db_update,
    TEMPORORAY_ADDRESS,
} = require('../function/public.js')


const order = require('../function/order.js')


// 获取店铺内商品数据
const get_goods = async (req, res) => {
    const {openid} = req
    if (!openid) return sendErr(res, '无法校验身份请重新登录')
    // 根据openid得到店铺id然后查询店铺信息
    const re_user = await db_query(`select * from users_boss where openid = '${openid}'`)
    if (!re_user.code) return sendErr(res, '无法获取用户信息')
    const shop_id = re_user.data.length && re_user.data[0].shop_id

    if (!shop_id) return sendErr(res, '无法获取店铺信息')


    // 查询商品sql语句
    const re_shop = await db_query(`select * from shop where id = '${shop_id}'`)
    if (!re_shop.code) return sendErr(res, '无法获取店铺信息')

    const goods = re_shop.data[0].goods

    sendRes(res, {goods})
}

// 增加分组
const add_group = async (req, res) => {
    const {openid, body: params} = req
    if (!openid) return sendErr(res, '无法校验身份请重新登录')
    // 参数校验
    const {title} = params
    if (!title) return sendErr(res, '请输入分组名称！')
    // 根据openid得到店铺id然后查询店铺信息
    const re_user = await db_query(`select * from users_boss where openid = '${openid}'`)
    if (!re_user.code) return sendErr(res, '无法获取用户信息')

    const shop_id = re_user.data.length && re_user.data[0].shop_id
    if (!shop_id) return sendErr(res, '无法获取店铺信息')

    // 查询商品sql语句
    const re_shop = await db_query(`select * from shop where id = '${shop_id}'`)
    if (!re_shop.code) return sendErr(res, '无法获取店铺信息')

    const {goods} = re_shop.data[0]

    goods.push({
        goods: [],
        title
    })

//     更新数据库
    const sql = `update shop set goods = ? where id = ?`
    const result_update_goods = await db_update(sql, [JSON.stringify(goods), shop_id])
    const {code, err} = result_update_goods

    if (!code) return sendErr(res, err)
    sendRes(res, {title}, '分组添加成功')

}

// 切换上下架
const change_off_state = async (req, res) => {
    const {openid, body: params} = req
    if (!openid) return sendErr(res, '无法校验身份请重新登录')
    // 参数校验
    const {group_id, goods_id} = params
    if (group_id === undefined) return sendErr(res, '无分组id！')
    if (goods_id === undefined) return sendErr(res, '无商品id！')
    // 根据openid得到店铺id然后查询店铺信息
    const re_user = await db_query(`select * from users_boss where openid = '${openid}'`)
    if (!re_user.code) return sendErr(res, '无法获取用户信息')
    const shop_id = re_user.data.length && re_user.data[0].shop_id
    if (!shop_id) return sendErr(res, '无法获取店铺信息')

    // 查询商品sql语句
    const re_shop = await db_query(`select * from shop where id = '${shop_id}'`)
    if (!re_shop.code) return sendErr(res, '无法获取店铺信息')

    //  获取goods信息
    const {goods} = re_shop.data[0]

    let isEnd = false

    for (let index = 0; index < goods[group_id].goods.length; index++) {
        const item = goods[group_id].goods[index];
        if (item.id === goods_id) {
            //  找到对应商品，打破循环。
            isEnd = true
            console.log(goods[group_id].goods[index].isOff, 'before')
            item.isOff = !item.isOff
            console.log(goods[group_id].goods[index].isOff, 'after')
            // 更新数据库
            const sql = `update shop set goods = ? where id = ?`
            const re_ = await db_update(sql, [JSON.stringify(goods), shop_id])
            if (!re_.code) sendErr(res, re_.err)
            return sendRes(res, {isOff: item.isOff}, '切换成功')
        }
    }

    if (!isEnd) return sendErr(res, '无法找到对应商品！')

    // 切换状态


    sendRes(res, {}, '切换成功')
    // 遍历出商品所属goods内goods里的下标


}

// 更改商品数据
const update_goods_data = async (req, res) => {
    const {openid, body: params} = req
    if (!openid) return sendErr(res, '无法校验身份请重新登录')
    // 参数校验
    const {group_id, goods_id, data} = params
    if (group_id === undefined) return sendErr(res, '无分组id！')
    if (goods_id === undefined) return sendErr(res, '无商品id！')
    if (!data) return sendErr(res, '数据未传入！')
    if (!(data?.price > 0 && typeof data.price === 'number')) return sendErr(res, '必传参数price类型错误！')
    if (!(data?.inventory > 0 && data.inventory && typeof data.inventory === 'number')) return sendErr(res, '必传参数inventory类型错误！')

    // 根据openid得到店铺id然后查询店铺信息
    const re_user = await db_query(`select * from users_boss where openid = '${openid}'`)
    if (!re_user.code) return sendErr(res, '无法获取用户信息')
    const shop_id = re_user.data.length && re_user.data[0].shop_id
    if (!shop_id) return sendErr(res, '无法获取店铺信息')
    // 根据shop_id查询店铺信息
    const re_shop = await db_query(`select * from shop where id = '${shop_id}'`)
    if (!re_shop.code) return sendErr(res, '无法获取店铺信息')
    const {goods} = re_shop.data[0]
    // 遍历出商品所属goods内goods里的下标
    const goods_index = goods[group_id].goods.findIndex(item => item.id === goods_id)
    if (goods_index === -1) return sendErr(res, '无法找到对应商品！')
    // 更新数据
    const goods_accurate = goods[group_id].goods[goods_index]
    goods_accurate.price = data.price
    goods_accurate.inventory = data.inventory
    const sql = `update shop set goods = ? where id = ?`
    const re_ = await db_update(sql, [JSON.stringify(goods), shop_id])
    if (!re_.code) sendErr(res, re_.err, {group_id, goods_id})
    sendRes(res, '更新成功')

}

// 删除商品
const delete_goods = async (req, res) => {
    const {openid, body: params} = req
    if (!openid) return sendErr(res, '无法校验身份请重新登录')
// 参数校验
    const {group_id, goods_id} = params
    if (group_id === undefined) return sendErr(res, '无分组id！')
    if (goods_id === undefined) return sendErr(res, '无商品id！')
// 根据openid得到店铺id然后查询店铺信息
    const re_user = await db_query(`select * from users_boss where openid = '${openid}'`)
    if (!re_user.code) return sendErr(res, '无法获取用户信息')
    const shop_id = re_user.data.length && re_user.data[0].shop_id
    if (!shop_id) return sendErr(res, '无法获取店铺信息')
// 根据shop_id查询店铺信息
    const re_shop = await db_query(`select * from shop where id = '${shop_id}'`)
    if (!re_shop.code) return sendErr(res, '无法获取店铺信息')
    const {goods} = re_shop.data[0]
// 遍历出商品所属goods内goods里的下标
    const goods_index = goods[group_id].goods.findIndex(item => item.id === goods_id)
    if (goods_index === -1) return sendErr(res, '无法找到对应商品！')
//     删除数据
    goods[group_id].goods.splice(goods_index, 1)
    const sql = `update shop set goods = ? where id = ?`
    const re_ = await db_update(sql, [JSON.stringify(goods), shop_id])
    if (!re_.code) sendErr(res, re_.err, {group_id, goods_id})
    sendRes(res, '删除成功')
}

// 删除分组
const delete_group = async (req, res) => {
    const {openid, body: params} = req
    if (!openid) return sendErr(res, '无法校验身份请重新登录')
    // 参数校验
    const {group_id} = params
    if (group_id === undefined) return sendErr(res, '无分组id！')
    // 根据openid得到店铺id然后查询店铺信息
    const re_user = await db_query(`select * from users_boss where openid = '${openid}'`)
    if (!re_user.code) return sendErr(res, '无法获取用户信息')
    const shop_id = re_user.data.length && re_user.data[0].shop_id
    if (!shop_id) return sendErr(res, '无法获取店铺信息')
    // 根据shop_id查询店铺信息
    const re_shop = await db_query(`select * from shop where id = '${shop_id}'`)
    if (!re_shop.code) return sendErr(res, '无法获取店铺信息')
    const {goods} = re_shop.data[0]
    // group_id是否允许被删除。
    if (group_id > goods.length || group_id < 0) return sendErr(res, '分组错误！')
    //     删除数据
    goods.splice(group_id, 1)
    const sql = `update shop set goods = ? where id = ?`
    const re_ = await db_update(sql, [JSON.stringify(goods), shop_id])
    if (!re_.code) sendErr(res, re_.err, {group_id})
    sendRes(res, '删除成功')
}
// 修改信息
const update_shop_data = async (req, res) => {
    // 身份验证
    const {openid} = req

    // 获取商户信息的sql
    const sql = 'select * from users_boss where openid = ?'
    const result_users_boss = await db_query(sql, [openid])
    if (!result_users_boss.code) return sendErr(res, '身份验证失败！' + result_users_boss.err)

    // 解析表单
    const form = new multiparty.Form({uploadDir: TEMPORORAY_ADDRESS.shop_show, maxFilesSize: 1024 * 1024 * 8})
    form.parse(req, async (err, fields, files) => {
        if (err) {
            const {code} = err
            switch (code) {
                case 'ETOOBIG':
                    return sendErr(res, '错误！图片超过最大尺寸。')
                case "ENOENT":
                    return sendErr(res, '文件上传到服务器失败无效，请联系管理员')
                default :
                    return sendErr(res, '未知上传错误！')
            }
        }
        // 参数解析
        const params = JSON.parse(fields.params[0])

        const imgFiles = files

        const new_img_address = []
        // 遍历files，查看是否有文件不属于图片类这个范畴 如果有 就打断循环！
        for (let key in imgFiles) {
            if (!imgFiles[key][0].headers['content-type'].includes('image')) return sendErr(res, '错误！请上传图片！')
            const path = imgFiles[key][0].path
            new_img_address.push(path)
        }

        // 信息解码
        let {
            reserve_imgs,
            // 上班周天
            trade_time,
            // 店铺名
            title,
            // 公告
            notice,
            // 类型
            type,
            // 标签
            tags,
            // 电话
            phone_number,
            // 最低起送价
            mdp,
            // 地址
            address,
            // 上班时间
            start_time,
            // 下班时间
            end_time,
            // 店铺激活状态
            active,
        } = params

        // 查看必要信息是否被填写\
        mdp = Number(Number(mdp).toFixed(2))
        if (!(mdp > 0.1 && mdp < 99999)) return sendErr(res, '请保证最低起送价在0.1~99999之间')
        if (!title || !(title.length >= 2) && !(title.length <= 10)) sendErr(res, '店铺名长度必须在2~10字符')
        if (!phone_number) sendErr(res, '必须留下电话号码')
        if (!address || address.length > 20) sendErr(res, '必须留下店铺位置，并且位置最多不超过100字')
        if (notice && notice.length > 50) sendErr(res, '公告过长！')
        if (trade_time?.length !== 7) sendErr(res, "异常的工作时间")

        // 从数据库里获取店铺信息
        const shop_id = result_users_boss.data[0].shop_id
        const r_shop = await db_query(`select * from shop where id = '${shop_id}'`)
        if (!r_shop.code) return sendErr(res, '获取店铺失败！')

        // 需要删除的
        const del = r_shop.data[0].img_address.filter(item => !reserve_imgs.includes(item))
        // 保留的
        const reserve = r_shop.data[0].img_address.filter(item => reserve_imgs.includes(item))
        del.forEach((router) => {
            //  删除图片
            fs.unlink(path.join(__dirname, '..', TEMPORORAY_ADDRESS.shop_show, router.split('\\').reverse()[0]), err => {
                if (err) console.log('重大错误！删除文件失败！')
            })
        })

        // 追加图片
        new_img_address.unshift(...reserve)

        // 更新数据库
        const sql = `UPDATE shop SET 
            title=?, 
            start_time=?, 
            end_time=?, 
            trade_time=?, 
            active=?, 
            mdp=?, 
            tags=?, 
            type=?, 
            img_address=?, 
            phone_number=?, 
            address=?, 
            notice=?
        WHERE id=${shop_id}`;
        const p = [
            // 标题
            title,
            // 营业时间
            start_time,
            // 打烊时间
            end_time,
            // 营业周期
            JSON.stringify(trade_time),
            // 营业状态
            active,
            // 配送起步价
            mdp,
            // 标签
            JSON.stringify(tags),
            // 店铺类型
            type,
            // 图片组
            JSON.stringify(new_img_address),
            // 电话
            phone_number,
            // 地址
            address,
            // 公告
            notice
        ]
        const update_shop = await db_update(sql, p)
        update_shop.code ? sendRes(res) : sendErr(res, update_shop.err)
    })
}
export default {
    get_goods,
    add_group,
    change_off_state,
    update_goods_data,
    delete_goods,
    delete_group,
    update_shop_data
}