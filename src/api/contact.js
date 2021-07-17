import request from '../utils/request';


//查询供应商分类信息
export const getContactTree = (query) => {
    return request({
        url: '/erpv9/Contact/getContactTree',
        method: 'post',
        data: query
    })
};

//增加供应商信息
export const addContact = (query) => {
    return request({
        url: '/erpv9/Contact/addContact',
        method: 'post',
        data: query
    })
};

//编辑供应商信息
export const eidtContact = (query) => {
    return request({
        url: '/erpv9/Contact/eidtContact',
        method: 'post',
        data: query
    })
};

//删除供应商信息
export const delContact = (query) => {
    return request({
        url: '/erpv9/Contact/delContact',
        method: 'post',
        data: query
    })
};

//查询某一供应商分类下信息
export const getContactData = (query) => {
    return request({
        url: '/erpv9/Contact/getContactData',
        method: 'post',
        data: query
    })
};

//修改待采购商品的供应商
export const eidtBuyGoodsContact = (query) => {
    return request({
        url: '/erpv9/Contact/eidtBuyGoodsContact',
        method: 'post',
        data: query
    })
};

//查询某一供应商采购订单中的商品
export const seaContactOrderGoods = (query) => {
    return request({
        url: '/erpv9/Contact/seaContactOrderGoods',
        method: 'post',
        data: query
    })
};

//生成供应商商品采购订单
export const createOrder = (query) => {
    return request({
        url: '/erpv9/Contact/createOrder',
        method: 'post',
        data: query
    })
};

//驳回采购订单
export const backOrder = (query) => {
    return request({
        url: '/erpv9/Contact/backOrder',
        method: 'post',
        data: query
    })
};

//驳回采购订单
export const seaSupplierInfo = (query) => {
    return request({
        url: '/erpv9/Contact/seaSupplierInfo',
        method: 'post',
        data: query
    })
};

//查询供应商一级分类
export const contactClassify = (query) => {
    return request({
        url: '/erpv9/Contact/contactClassify',
        method: 'post',
        data: query
    })
};

//查询所有供应商
export const contactAllList = (query) => {
    return request({
        url: '/erpv9/Contact/contactAllList',
        method: 'post',
        data: query
    })
};


