import request from '../utils/request';


//查询销售订单
export const selectOrders = (query) => {
    return request({
        url: '/erpv9/Orders/selectOrders',
        method: 'post',
        data: query
    })
};

//查询入库订单信息（1.0）
export const seaRKBill = (query) => {
    return request({
        url: '/erpv9/Orders/seaRKBill',
        method: 'post',
        data: query
    })
};

//查询入库订单信息（1.0）
export const seallBill = (query) => {
    return request({
        url: '/erpv9/Orders/seallBill',
        method: 'post',
        data: query
    })
};

//查询销售订单信息（1.0）
export const selectSO = (query) => {
    return request({
        url: '/erpv9/Orders/selectSO',
        method: 'post',
        data: query
    })
};

//增加订单(1.0)
export const addSO = (query) => {
    return request({
        url: '/erpv9/Orders/addSO',
        method: 'post',
        data: query
    })
};

//增加订单
export const addOrder = (query) => {
    return request({
        url: '/erpv9/Orders/addOrder',
        method: 'post',
        data: query
    })
};

//查询订单商品信息
export const seaBillGodds = (query) => {
    return request({
        url: '/erpv9/orders/seaBillGodds',
        method: 'post',
        data: query
    })
};

//查询打印采购订单商品
export const seaPrintCGBillGodds = (query) => {
    return request({
        url: '/erpv9/orders/seaPrintCGBillGodds',
        method: 'post',
        data: query
    })
};

//查询订单商品信息（1.0）
export const seaSOBillGodds = (query) => {
    return request({
        url: '/erpv9/orders/seaSOBillGodds',
        method: 'post',
        data: query
    })
};

//修改订单状态
export const eidtOrderState = (query) => {
    return request({
        url: '/erpv9/orders/eidtOrderState',
        method: 'post',
        data: query
    })
};

//修改销售订单信息
export const eidtSOOrder = (query) => {
    return request({
        url: '/erpv9/orders/eidtSOOrder',
        method: 'post',
        data: query
    })
};

//修改销售订单状态及修改人信息
export const eidtSOState = (query) => {
    return request({
        url: '/erpv9/orders/eidtSOState',
        method: 'post',
        data: query
    })
};

//修改领料单状态及修改人信息
export const eidtllState = (query) => {
    return request({
        url: '/erpv9/orders/eidtllState',
        method: 'post',
        data: query
    })
};

//修改生产订单信息及状态
export const eidtOrderInfoState = (query) => {
    return request({
        url: '/erpv9/orders/eidtOrderInfoState',
        method: 'post',
        data: query
    })
};

//批量删除订单
export const batchDelOrders = (query) => {
    return request({
        url: '/erpv9/Orders/batchDelOrders',
        method: 'post',
        data: query
    })
};

//删除信息(通用)
export const batchDel = (query) => {
    return request({
        url: '/erpv9/Orders/batchDel',
        method: 'post',
        data: query
    })
};


//修改订单模板ID
export const eidtOrderBOMId = (query) => {
    return request({
        url: '/erpv9/Orders/eidtOrderBOMId',
        method: 'post',
        data: query
    })
};

//查询生产订单可领取商品信息
export const seaPDBilleARNumGodds = (query) => {
    return request({
        url: '/erpv9/Orders/seaPDBilleARNumGodds',
        method: 'post',
        data: query
    })
};

//查询生产订单商品信息
export const seaPDBillGodds = (query) => {
    return request({
        url: '/erpv9/Orders/seaPDBillGodds',
        method: 'post',
        data: query
    })
};

//查询采购订单商品信息
export const selectCGOrders = (query) => {
    return request({
        url: '/erpv9/Orders/selectCGOrders',
        method: 'post',
        data: query
    })
};

//查询某一采购订单商品信息
export const seaCGBillGodds = (query) => {
    return request({
        url: '/erpv9/Orders/seaCGBillGodds',
        method: 'post',
        data: query
    })
};

//修改采购订单状态
export const editCGBillstate = (query) => {
    return request({
        url: '/erpv9/Orders/editCGBillstate',
        method: 'post',
        data: query
    })
};

//查询生产订单往返记录
export const selecturnoverList = (query) => {
    return request({
        url: '/erpv9/Orders/selecturnoverList',
        method: 'post',
        data: query
    })
};

//查询生产订单领料单
export const seaMaterialOrder = (query) => {
    return request({
        url: '/erpv9/Orders/seaMaterialOrder',
        method: 'post',
        data: query
    })
};

//修改出库订单状态
export const editCKOrderTate = (query) => {
    return request({
        url: '/erpv9/Orders/editCKOrderTate',
        method: 'post',
        data: query
    })
};

//修改出库订单状态
export const aa = (query) => {
    return request({
        url: 'http://www.dqrcp.com/frontend/v1/login',
        method: 'post',
        data: query
    })
};






