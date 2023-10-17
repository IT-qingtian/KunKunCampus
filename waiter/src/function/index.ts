// 格式化金额（ x分钱转 x.xx元）
const formatMoney = (money: number): string => {
    return (money / 100).toFixed(2)
}

export {
    formatMoney
}