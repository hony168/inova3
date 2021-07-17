import request from '../utils/request';

//查询生产订单信息
export const selectPdOrder = (query) => {
    return request({
        url: '/erpv9/Pd/selectPdOrder',
        method: 'post',
        data: query
    })
};

//增加生产订单信息
export const addPdOrder = (query) => {
    return request({
        url: '/erpv9/Pd/addPdOrder',
        method: 'post',
        data: query
    })
};

//删除生产订单信息
export const delOrder = (query) => {
    return request({
        url: '/erpv9/Pd/delOrder',
        method: 'post',
        data: query
    })
};



