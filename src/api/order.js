import request from '../utils/request';

//查询订单信息
export const orders = (query) => {
    return request({
        url: '/erp/Orders/Orders',
        method: 'post',
        data: query
    })
};

//增加订单信息
export const addOrders = (query) => {
    return request({
        url: '/erp/Orders/addOrders',
        method: 'post',
        data: query
    })
};

//修改订单信息
export const eidtOrder = (query) => {
    return request({
        url: '/erp/Orders/eidtOrder',
        method: 'post',
        data: query
    })
};

//查询订单状态信息
export const getOrderState = (query) => {
    return request({
        url: '/erp/Orders/getOrderState',
        method: 'post',
        data: query
    })
};



//删除订单状态信息
export const batchDelorder = (query) => {
    return request({
        url: '/erp/Orders/batchDelorder',
        method: 'post',
        data: query
    })
};

//增加订单审信息
export const addAudit = (query) => {
    return request({
        url: '/erp/Orders/addAudit',
        method: 'post',
        data: query
    })
};

//查询订单审信息
export const Orders_audit = (query) => {
    return request({
        url: '/erp/Orders/Orders_audit',
        method: 'post',
        data: query
    })
};



